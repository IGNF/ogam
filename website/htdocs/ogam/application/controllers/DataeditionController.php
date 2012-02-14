<?php
/**
 * © French National Forest Inventory
 * Licensed under EUPL v1.1 (see http://ec.europa.eu/idabc/eupl).
 */
require_once 'AbstractOGAMController.php';

/**
 * DataEditionController is the controller that allow the edition of simple data.
 * @package controllers
 */
class DataEditionController extends AbstractOGAMController {

	protected $_redirector = null;

	/**
	 * The models.
	 */
	private $metadataModel;
	private $genericModel;

	/**
	 * The generic service.
	 */
	private $genericService;

	/**
	 * The config.
	 */
	private $configuration;

	/**
	 * Initialise the controler
	 */
	public function init() {
		parent::init();

		// Set the current module name
		$websiteSession = new Zend_Session_Namespace('website');
		$websiteSession->module = "dataedition";
		$websiteSession->moduleLabel = "Data Edition";
		$websiteSession->moduleURL = "dataedition";

		// Load the redirector helper
		$this->_redirector = $this->_helper->getHelper('Redirector');

		// Initialise the model
		$this->metadataModel = new Genapp_Model_Metadata_Metadata();
		$this->genericModel = new Genapp_Model_Generic_Generic();

		// The generic service
		$this->genericService = new Genapp_Service_GenericService();

		// The config
		$this->configuration = Zend_Registry::get("configuration");


		// Check if the schema is specified in the request
		$websiteSession = new Zend_Session_Namespace('website');
		$schema = $this->_request->getParam("SCHEMA");
		if ($schema != null) {
			$websiteSession->schema = $schema;
		}

		$this->translator = Zend_Registry::get('Zend_Translate');

	}

	/**
	 * Check if the authorization is valid this controler.
	 *
	 * @throws an Exception if the user doesn't have the rights
	 */
	function preDispatch() {

		parent::preDispatch();

		$userSession = new Zend_Session_Namespace('user');
		$permissions = $userSession->permissions;
		if (empty($permissions) || !array_key_exists('DATA_EDITION', $permissions)) {
			throw new Zend_Auth_Exception('Permission denied for right : DATA_EDITION');
		}
	}

	/**
	 * The "index" action is the default action for all controllers.
	 *
	 * @return the index view
	 */
	public function indexAction() {
		return $this->showIndexAction();
	}

	/**
	 * Display the "index" page.
	 *
	 * @param String $message a message to be displayed on the page
	 */
	public function showIndexAction($message = '') {
		$this->logger->debug('Data edition index');

		$this->view->message = $message;

		$this->render('index');
	}

	/**
	 * Generate a Zend Form Element from a TableField description.
	 *
	 * @param Zend_Form $form the Zend form we want to update
	 * @param TableField $tableField the table descriptor of the data
	 * @param FormField $formField the form descriptor of the data
	 * @param Boolean $isKey is the field a primary key ?
	 */
	private function _getFormElement($form, $tableField, $formField, $isKey = false) {

		// Warning : $formField can be null if no mapping is defined with $tableField

		// TODO OGAM-73 : Manage all data types for edition (DATE, BOOLEAN, ...), with corresponding validators

		if ($tableField->type == "STRING") {

			// The field is a text field
			$elem = $form->createElement('text', $tableField->data);

			// Add a regexp validator if a mask is present
			if ($formField != null && $formField->mask != null) {
				$validator = new Zend_Validate_Regex(array('pattern' => $formField->mask));
				$elem->addValidator($validator);
			}
			$elem->setValue($tableField->value);

		} else if ($tableField->type == "INTEGER") {

			// The field is an integer
			$elem = $form->createElement('text', $tableField->data);
			$elem->addValidator(new Zend_Validate_Int());
			$elem->setValue($tableField->value);

		} else if ($tableField->type == "NUMERIC") {

			// The field is a numeric
			$elem = $form->createElement('text', $tableField->data);
			$elem->addValidator(new Zend_Validate_Float(array('locale' => 'en_EN'))); // The locale should correspond to the database config
			$elem->setValue($tableField->value);

		} else if ($tableField->type == "DATE") {

			// The field is a date
			$elem = $form->createElement('text', $tableField->data);
			// validate the date format
			if ($formField != null && $formField->mask != null) {
				$validator = new Zend_Validate_Date(array('format' => $formField->mask, 'locale' => 'en_EN'));
			} else {
				$validator = new Zend_Validate_Date(array('locale' => 'en_EN'));
			}
			$elem->addValidator($validator);
			$elem->setValue($tableField->value);

		} else if ($tableField->type == "COORDINATE") {

			// The field is a geometry info
			$elem = $form->createElement('text', $tableField->data);
			$elem->setValue($tableField->value);

		} else if ($tableField->type == "RANGE") {

			// The field is a range value
			$elem = $form->createElement('text', $tableField->data);
			$elem->addValidator(new Zend_Validate_Float(array('locale' => 'en_EN')));

			// Check min and max
			$range = $this->metadataModel->getRange($tableField->unit);
			$elem->addValidator(new Zend_Validate_LessThan(array('max' => $range->max)));
			$elem->addValidator(new Zend_Validate_GreaterThan(array('min' => $range->min)));
			$elem->setValue($tableField->value);

		} else if ($tableField->type == "CODE") {

			$elem = $form->createElement('select', $tableField->data);
			$elem->setValue($tableField->value);

		} else if ($tableField->type == "BOOLEAN") {

			// The field is a boolean
			$elem = $form->createElement('checkbox', $tableField->data);
			$elem->setValue($tableField->value);

		} else if ($tableField->type == "ARRAY") {

			// Build a multiple select box
			$elem = $form->createElement('multiselect', $tableField->data);
			$elem->setValue($tableField->value);

		} else {

			// TODO : Manage GEOM fields

			// Default
			$elem = $form->createElement('text', $tableField->data);
			$elem->setValue($tableField->value);

		}

		$elem->setLabel($tableField->label);
		$elem->setDescription($tableField->definition);

		if ($isKey) {
			$elem->disabled = 'disabled';
		}

		return $elem;
	}

	/**
	 * Build and return the data form.
	 *
	 * @param DataObject $data The descriptor of the expected data.
	 * @param String $mode ('ADD' or 'EDIT')
	 * @param Boolean $complete indicate if the function must generate all the list of codes
	 */
	private function _getEditDataForm($data, $mode) {

		$this->logger->debug('_getEditDataForm :  mode = '.$mode);

		$form = new Zend_Form();
		if ($mode == 'ADD') {
			$form->setAction($this->baseUrl.'/dataedition/validate-add-data');
		} else {
			$form->setAction($this->baseUrl.'/dataedition/validate-edit-data');
		}
		$form->setMethod('post');
		$form->setOptions(array('class' => 'editform'));

		// Dynamically build the form

		//
		// The key elements as labels
		//
		foreach ($data->infoFields as $tablefield) {

			$formField = $this->genericService->getTableToFormMapping($tablefield);

			$elem = $this->_getFormElement($form, $tablefield, $formField, true);
			$elem->class = 'dataedit_key';
			$form->addElement($elem);
		}

		//
		// The editable elements as form fields
		//
		foreach ($data->editableFields as $tablefield) {

			// Hardcoded value : We don't edit the line number (it's a technical element)
			if ($tablefield->data != "LINE_NUMBER") {
				$formField = $this->genericService->getTableToFormMapping($tablefield);
				$elem = $this->_getFormElement($form, $tablefield, $formField, false);
				$elem->class = 'dataedit_field';
				$form->addElement($elem);
			}

		}

		//
		// Add the submit element
		//
		$submitElement = $form->createElement('submit', 'submit');
		$submitElement->setLabel('Submit');

		// Add elements to form:
		$form->addElement($submitElement);

		return $form;
	}

	/**
	 * Parse request parameters and build the corresponding data object.
	 *
	 * @param Zend_Controller_Request_Abstract $request The request object.
	 * @return DataObject the data object
	 */
	private function _getDataFromRequest($request) {

		$params = $request->getUserParams();

		$schema = $params["SCHEMA"];
		$format = $params["FORMAT"];

		$data = $this->genericService->buildDataObject($schema, $format);

		// Complete the primary key info with the session values
		foreach ($data->infoFields as $infoField) {
			if (!empty($params[$infoField->data])) {
				$infoField->value = $params[$infoField->data];
			}
		}

		return $data;
	}

	/**
	 * Edit a data.
	 *
	 * A data here is the content of a table, or if a dataset is selected the table filtrered with the dataset elements.
	 *
	 * @param DataObject $data The data to display (optional)
	 * @param String $message a confirmation/warning message to display (optional)
	 * @return the HTML view
	 */
	public function showEditDataAction($data = null, $message = '') {
		$this->logger->debug('showEditDataAction');

		$mode = 'EDIT';

		// If data is set then we don't need to read from database
		if ($data == null) {

			// Get the parameters from the URL
			$request = $this->getRequest();

			$data = $this->_getDataFromRequest($request);

		}

		// If the object is not existing then we are in create mode instead of edit mode

		// Get the ancestors of the data objet from the database (to generate a summary)
		$ancestors = $this->genericModel->getAncestors($data);

		// Get the childs of the data objet from the database (to generate links)
		$children = $this->genericModel->getChildren($data);

		// Get the labels linked to the children table (to display the links)
		$childrenTableLabels = $this->metadataModel->getChildrenTableLabels($data->tableFormat);

		// Store the data descriptor in session
		$websiteSession = new Zend_Session_Namespace('website');
		$websiteSession->data = $data;
		$websiteSession->ancestors = $ancestors;
		$websiteSession->children = $children;

		// Generate dynamically the corresponding form
		$this->view->dataId = $this->genericService->getIdFromData($data);
		$this->view->tableFormat = $data->tableFormat;
		$this->view->data = $data;
		$this->view->ancestors = $ancestors;
		$this->view->children = $children;
		$this->view->mode = $mode;
		$this->view->message = $message;
		$this->view->childrenTableLabels = $childrenTableLabels;

		$this->render('edit-data');
	}

	/**
	 * Delete a data.
	 *
	 * @return the index view.
	 **/
	public function ajaxDeleteDataAction() {
		$this->logger->debug('ajaxDeleteDataAction');

		// Get the parameters from the URL
		$request = $this->getRequest();

		$data = $this->_getDataFromRequest($request);

		// Check if the data has children
		$children = $this->genericModel->getChildren($data);

		// Count the number of existing children (not only the table definitions)
		$childrenCount = 0;
		foreach ($children as $child) {
			$childrenCount += count($child);
		}

		// Get the ancestors
		$ancestors = $this->genericModel->getAncestors($data);

		if ($childrenCount > 0) {
			// Redirect to the index page
			$result = '{"success":false, "errorMessage":'.json_encode($this->translator->translate("Item cannot be deleted because it has children")).'}';
		} else {
			// Delete the data
			try {
				$this->genericModel->deleteData($data);
			} catch (Exception $e) {
				$this->logger->err($e->getMessage());
				$result = '{"success":false, "errorMessage":'.json_encode($this->translator->translate("Error while deleting data")).'}';
			}


			$result = '{"success":true';

			// Redirect to the index page by default
			$redirectURL = $this->view->baseUrl('dataedition/..');
			// If the data has an ancestor, we redirect to this ancestor
			if (!empty($ancestors)) {
				$parent = $ancestors[0];
				$redirectURL .= '/dataedition/show-edit-data/'.$this->genericService->getIdFromData($parent);
			}

			$result .= ', "redirectLink":'.json_encode($redirectURL);


			$result .= ', "message":'.json_encode($this->translator->translate("Data deleted")).'}';
		}

		echo $result;

		// No View, we send directly the JSON
		$this->_helper->layout()->disableLayout();
		$this->_helper->viewRenderer->setNoRender();
		$this->getResponse()->setHeader('Content-type', 'application/json');
	}


	/**
	 * Save the edited data in database.
	 *
	 * @return the HTML view
	 */
	public function ajaxValidateEditDataAction() {
		$this->logger->debug('ajaxValidateEditDataAction');

		// Get back info from the session
		$websiteSession = new Zend_Session_Namespace('website');
		$data = $websiteSession->data;

		// Get the mode
		$mode = $this->_getParam('MODE');

		// Validate the form
		$form = $this->_getEditDataForm($data, $mode);
		if (!$form->isValidPartial($_POST)) {

			// On réaffiche le formulaire avec les messages d'erreur
			$this->view->form = $form;
			$this->view->ancestors = $websiteSession->ancestors;
			$this->view->tableFormat = $data->tableFormat;
			$this->view->data = $data;
			$this->view->children = $websiteSession->children;
			$this->view->message = '';
			$this->view->mode = $mode;

			echo '{"success":false,"errorMessage":'.json_encode($this->translator->translate("Invalid form")).'}';
		}

		// Update the data descriptor with the values submitted
		foreach ($data->getFields() as $field) {
			$field->value = $this->_getParam($field->getName());
		}

		try {
			if ($mode == 'ADD') {
				$data = $this->genericModel->insertData($data);
			} else {
				$this->genericModel->updateData($data);
			}
			echo '{"success":true, ';
			if ($mode == 'ADD') {
				// Build the URL to link to the current item
				$redirectURL = $this->getRequest()->getBasePath().'/dataedition/show-edit-data/'.$this->genericService->getIdFromData($data);
				echo '"redirectLink":'.json_encode($redirectURL).',';
			}
			echo '"message":'.json_encode($this->translator->translate("Data saved"));
			echo '}';

		} catch (Exception $e) {
			$this->logger->err($e->getMessage());
			echo '{"success":false,"errorMessage":'.json_encode($e->getMessage()).'}';
		}

		// No View, we send directly the JSON
		$this->_helper->layout()->disableLayout();
		$this->_helper->viewRenderer->setNoRender();
		$this->getResponse()->setHeader('Content-type', 'application/json');
	}

	/**
	 * Add a new data.
	 *
	 * A data here is the content of a table, or if a dataset is selected the table filtrered with the dataset elements.
	 *
	 * @param DataObject $data The data to display (optional)
	 * @param String $message A confirmation/warning message to display
	 * @return the HTML view
	 */
	public function showAddDataAction($data = null, $message = '') {
		$this->logger->debug('showAddDataAction');

		$mode = 'ADD';

		// If data is set then we don't need to read from database
		if ($data == null) {

			// Get the parameters from the URL
			$request = $this->getRequest();

			$data = $this->_getDataFromRequest($request);
		}

		// If the objet is not existing then we are in create mode instead of edit mode

		// Get the ancestors of the data objet from the database (to generate a summary)
		$ancestors = $this->genericModel->getAncestors($data);

		// Get the labels linked to the children table (to display the links)
		$childrenTableLabels = $this->metadataModel->getChildrenTableLabels($data->tableFormat);

		// Store the data descriptor in session
		$websiteSession = new Zend_Session_Namespace('website');
		$websiteSession->data = $data;
		$websiteSession->ancestors = $ancestors;

		// Generate dynamically the corresponding form
		$this->view->dataId = $this->genericService->getIdFromData($data);
		$this->view->tableFormat = $data->tableFormat;
		$this->view->ancestors = $ancestors;
		$this->view->data = $data;
		$this->view->children = array(); // No children in add mode
		$this->view->childrenTableLabels = $childrenTableLabels;
		$this->view->mode = $mode;
		$this->view->message = $message;

		$this->render('edit-data');
	}

	/**
	 * AJAX function : Get the AJAX structure corresponding to the edition form
	 *
	 * @return JSON The list of forms
	 */
	public function ajaxGetEditFormAction() {

		$this->logger->debug('ajaxGetEditFormAction');

		// Get the parameters from the URL
		$request = $this->getRequest();
		$data = $this->_getDataFromRequest($request);

		// Complete the data object with the existing values from the database.
		$data = $this->genericModel->getDatum($data);

		// The service used to manage the query module
		$this->queryService = new Genapp_Service_QueryService($data->tableFormat->schemaCode);

		echo $this->queryService->getEditForm($data);

		// No View, we send directly the JSON
		$this->_helper->layout()->disableLayout();
		$this->_helper->viewRenderer->setNoRender();
		$this->getResponse()->setHeader('Content-type', 'application/json');
	}

	/**
	 * AJAX function : Get the AJAX structure corresponding to the add form
	 *
	 * @return JSON The list of forms
	 */
	public function ajaxGetAddFormAction() {

		$this->logger->debug('ajaxGetAddFormAction');


		// Get the parameters from the URL
		$request = $this->getRequest();
		$data = $this->_getDataFromRequest($request);

		// The service used to manage the query module
		$this->queryService = new Genapp_Service_QueryService($data->tableFormat->schemaCode);

		echo $this->queryService->getEditForm($data);

		// No View, we send directly the JSON
		$this->_helper->layout()->disableLayout();
		$this->_helper->viewRenderer->setNoRender();
		$this->getResponse()->setHeader('Content-type', 'application/json');
	}

	/**
	 * Get the parameters.
	 */
	public function getparametersAction() {
		$this->logger->debug('getparametersAction');

		$userSession = new Zend_Session_Namespace('user');
		$permissions = $userSession->permissions;
		$this->view->checkEditionRights = 'false'; // By default, we don't check for rights on the data

		$this->view->userProviderId = $userSession->user->providerId;

		if (!empty($permissions)) {
			if (!array_key_exists('DATA_EDITION_OTHER_PROVIDER', $permissions)) {
				$this->view->checkEditionRights = 'true';
			}

		}
		$this->_helper->layout()->disableLayout();
		$this->render('edit-parameters');
		$this->getResponse()->setHeader('Content-type', 'application/javascript');
	}

	/**
	 * Upload an image and store it on the disk.
	 *
	 * @return JSON
	 */
	public function imageuploadAction() {

		$this->logger->debug('imageuploadAction');

		$adapter = new Zend_File_Transfer_Adapter_Http();

		// Get upload directory from the config
		$uploadDir = $this->configuration->image_upload_dir;

		$formData = $this->_request->getPost();

		// Get the identifier of the data
		$id = $formData['id'];

		// Set the destination directory
		$destination = $uploadDir.'/'.$id;

		// Create the directory and set the rights
		$this->_deleteDirectory($destination);
		mkdir($destination, $this->configuration->image_dir_rights, true);

		// Receive the file
		$adapter->setDestination($destination);
		if (!$adapter->receive()) {
			$messages = $adapter->getMessages();
			$this->logger->err(implode("\n", $messages));
			echo '{"success":false, "errors":'.json_encode($messages).'}';
		} else {
			echo '{"success":true}';
		}
		// No View, we send directly the JSON
		$this->_helper->layout()->disableLayout();
		$this->_helper->viewRenderer->setNoRender();
		$this->getResponse()->setHeader('Content-type', 'application/json');
	}

	/**
	 * Delete a directory and its content recursively.
	 *
	 * @param String $dir
	 * @return boolean
	 */
	private	function _deleteDirectory($dir) {
		if (!file_exists($dir)) return true;
		if (!is_dir($dir) || is_link($dir)) return unlink($dir);
		foreach (scandir($dir) as $item) {
			if ($item == '.' || $item == '..') continue;
			if (!$this->_deleteDirectory($dir . "/" . $item)) {
				chmod($dir . "/" . $item, $this->configuration->image_dir_rights);
				if (!$this->_deleteDirectory($dir . "/" . $item)) return false;
			};
		}
		return rmdir($dir);
	}

}
