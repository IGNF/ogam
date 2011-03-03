<?php
/**
 * © French National Forest Inventory
 * Licensed under EUPL v1.1 (see http://ec.europa.eu/idabc/eupl).
 */
require_once 'AbstractEforestController.php';
require_once LIBRARY_PATH.'/models/generic/Generic.php';
require_once LIBRARY_PATH.'/classes/generic/DataObject.php';
require_once APPLICATION_PATH.'/models/metadata/Metadata.php';
require_once APPLICATION_PATH.'/classes/metadata/TableField.php';

/**
 * DataEditionController is the controller that allow the edition of simple data.
 * @package controllers
 */
class DataEditionController extends AbstractEforestController {

	private $schema = 'RAW_DATA';

	protected $_redirector = null;

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
		$this->metadataModel = new Model_Metadata();
		$this->genericModel = new Model_Generic();

	}

	/**
	 * Check if the authorization is valid this controler.
	 */
	function preDispatch() {

		parent::preDispatch();

		$userSession = new Zend_Session_Namespace('user');
		$permissions = $userSession->permissions;
		$role = $userSession->role;
		if (empty($permissions) || !array_key_exists('DATA_EDITION', $permissions)) {
			$this->_redirector->gotoUrl('/');
		}
	}

	/**
	 * The "index" action is the default action for all controllers.
	 */
	public function indexAction() {
		$this->logger->debug('Data edition index');
	}

	/**
	 * Build and return the dataset form.
	 */
	private function _getDatasetForm() {

		$form = new Zend_Form();
		$form->setAction($this->baseUrl.'/dataedition/validate-dataset');
		$form->setMethod('post');

		//
		// Add the dataset element
		//
		$requestElement = $form->createElement('select', 'DATASET_ID');
		$requestElement->setLabel('Dataset');
		$requestElement->setRequired(true);
		$requests = $this->metadataModel->getDatasets(false);
		$datasetIds = array();
		$datasetIds[''] = 'No dataset filtering';
		foreach ($requests as $request) {
			$datasetIds[$request['id']] = $request['label'];
		}
		$requestElement->addMultiOptions($datasetIds);

		//
		// Add the submit element
		//
		$submitElement = $form->createElement('submit', 'submit');
		$submitElement->setLabel('Submit');

		// Add elements to form:
		$form->addElement($requestElement);
		$form->addElement($submitElement);

		return $form;
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

		$configuration = Zend_Registry::get("configuration");
		
		// Warning : $formField can be null if no mapping is defined with $tableField

		// TODO OGAM-73 : Manage all data types for edition (DATE, BOOLEAN, ...), with corresponding validators

		if ($tableField->type == "STRING") {
			$elem = $form->createElement('text', $tableField->data);

			// Add a regexp validator if a mask is present
			if ($formField != null && $formField->mask != null) {
				$validator = new Zend_Validate_Regex(array('pattern' => $formField->mask));
				$elem->addValidator($validator);
			}
		} else if ($tableField->type == "INTEGER") {
			$elem = $form->createElement('text', $tableField->data);
			$elem->addValidator(new Zend_Validate_Int());

		} else if ($tableField->type == "NUMERIC") {
			$elem = $form->createElement('text', $tableField->data);
			$elem->addValidator(new Zend_Validate_Float(array('locale' => $configuration->defaultLocale)));

		} else if ($tableField->type == "DATE") {
			$elem = $form->createElement('text', $tableField->data);
			// validate the date format
			if ($formField != null && $formField->mask != null) {
				$validator = new Zend_Validate_Date(array('format' => $formField->mask, 'locale' => $configuration->defaultLocale));
			} else {
				$validator = new Zend_Validate_Date(array('locale' => $configuration->defaultLocale));
			}
			$elem->addValidator($validator);

		} else if ($tableField->type == "COORDINATE") {
			$elem = $form->createElement('text', $tableField->data);

		} else if ($tableField->type == "RANGE") {
			$elem = $form->createElement('text', $tableField->data);
			$elem->addValidator(new Zend_Validate_Float(array('locale' => $configuration->defaultLocale)));

			// Check min and max
			$range = $this->metadataModel->getRange($tableField->data);
			$elem->addValidator(new Zend_Validate_LessThan(array('max' => $range->max)));
			$elem->addValidator(new Zend_Validate_GreaterThan(array('min' => $range->min)));

		} else if ($tableField->type == "CODE") {
			$modes = $this->metadataModel->getModes($tableField->unit);
			$elem = $form->createElement('select', $tableField->data);
			$elem->addMultiOptions($modes);
		} else if ($tableField->type == "BOOLEAN") {
			$elem = $form->createElement('checkbox', $tableField->data);

		} else {
			// Default
			$elem = $form->createElement('text', $tableField->data);

		}

		$elem->setLabel($tableField->label);
		$elem->setDescription($tableField->definition);
		$elem->setValue($tableField->value);

		if ($isKey) {
			$elem->disabled = 'disabled';
		}

		return $elem;
	}

	/**
	 * Build and return the data form.
	 *
	 * @param DataObject $data The descriptor of the expected data.
	 */
	private function _getEditDataForm($data, $mode) {

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

			// Hardcoded value : We don't display the submission id (it's a technical element)
			if ($tablefield->data != "SUBMISSION_ID") {
				$formField = $this->metadataModel->getTableToFormMapping($tablefield);

				$elem = $this->_getFormElement($form, $tablefield, $formField, true);
				$elem->class = 'dataedit_key';
				$form->addElement($elem);
			}

		}

		//
		// The key elements as labels
		//
		foreach ($data->editableFields as $tablefield) {

			// Hardcoded value : We don't edit the line number (it's a technical element)
			if ($tablefield->data != "LINE_NUMBER") {
				$formField = $this->metadataModel->getTableToFormMapping($tablefield);
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
	 * Edit a data.
	 *
	 * A data here is the content of a table, or if a dataset is selected the table filtrered with the dataset elements.
	 *
	 * @param DataObject $data The data to display (optional)
	 * @return the HTML view
	 */
	public function showEditDataAction($data = null, $message = '') {
		$this->logger->debug('showEditDataAction');

		$mode = 'EDIT';

		// If data is set then we don't need to read from database
		if ($data == null) {

			// Get back the dataset identifier
			$websiteSession = new Zend_Session_Namespace('website');
			$datasetId = $websiteSession->datasetID;

			// Declare our array of business keys
			$keyMap = array();

			// Get the parameters from the URL
			$request = $this->getRequest();
			$params = $request->getUserParams();

			if (sizeof($params) <= 3) { // default size = controller + action + module

				// Paramètres d'entrée :
				// DATASET_ID
				// FORMAT : Le nom de la table à éditer
				// CLE1
				// CLE2
				// ...

				// Test 1 : Plot data
				//		$keyMap["FORMAT"] = "PLOT_DATA";
				//		$keyMap["PROVIDER_ID"] = "1";
				//		$keyMap["PLOT_CODE"] = "01575-14060-4-0T";
				//		$keyMap["CYCLE"] = "5";

				// Test 2 : Species data
				//		$keyMap["FORMAT"] = "SPECIES_DATA";
				//		$keyMap["PROVIDER_ID"] = "1";
				//		$keyMap["PLOT_CODE"] = "01575-14060-4-0T";
				//		$keyMap["CYCLE"] = "5";
				//		$keyMap["SPECIES_CODE"] = "035.001.001";

				// Test 3 : Tree data (no dataset filtering)
				$keyMap["FORMAT"] = "TREE_DATA";
				$keyMap["PROVIDER_ID"] = "1";
				$keyMap["PLOT_CODE"] = "21573-F1000-6-6T";
				$keyMap["CYCLE"] = "5";
				$keyMap["TREE_ID"] = "246450";
			} else {
				$keyMap = $params;
			}

			$data = $this->genericModel->buildDataObject($this->schema, $keyMap["FORMAT"]);

			// Complete the primary key info with the session values
			foreach ($data->infoFields as $infoField) {
				if (!empty($keyMap[$infoField->data])) {
					$infoField->value = $keyMap[$infoField->data];
				}
			}

			// Complete the data object with the values from the database.
			$data = $this->genericModel->getDatum($data);

		}

		//Zend_Registry::get("logger")->info('$data : '.print_r($data, true));

		// If the objet is not existing then we are in create mode instead of edit mode

		// Get the ancestors of the data objet from the database (to generate a summary)
		$ancestors = $this->genericModel->getAncestors($data);

		// Get the childs of the data objet from the database (to generate links)
		$children = $this->genericModel->getChildren($this->schema, $data);

		//Zend_Registry::get("logger")->info('$children : '.print_r($children, true));

		// Store the data descriptor in session
		$websiteSession = new Zend_Session_Namespace('website');
		$websiteSession->data = $data;
		$websiteSession->ancestors = $ancestors;
		$websiteSession->children = $children;

		// Generate dynamically the corresponding form
		$this->view->form = $this->_getEditDataForm($data, $mode);
		$this->view->tableFormat = $data->tableFormat;
		$this->view->data = $data;
		$this->view->ancestors = $ancestors;
		$this->view->children = $children;
		$this->view->mode = $mode;
		$this->view->message = $message;

		$this->render('edit-data');
	}

	/**
	 * Save the edited data in database.
	 *
	 * @return the HTML view
	 */
	public function validateEditDataAction() {
		$this->logger->debug('validateEditDataAction');

		// Get back info from the session
		$websiteSession = new Zend_Session_Namespace('website');
		$datasetId = $websiteSession->datasetID;
		$data = $websiteSession->data;

		// Validate the form
		$form = $this->_getEditDataForm($data, 'EDIT');
		if (!$form->isValidPartial($_POST)) {

			// On réaffiche le formulaire avec les messages d'erreur
			$this->view->form = $form;
			$this->view->ancestors = $websiteSession->ancestors;
			$this->view->tableFormat = $data->tableFormat;
			$this->view->data = $data;
			$this->view->children = $websiteSession->children;
			$this->view->message = '';
			$this->view->mode = 'EDIT';

			return $this->render('edit-data');
		}

		// Update the data descriptor with the values submitted
		foreach ($data->editableFields as $field) {
			$field->value = $this->_getParam($field->data);
		}

		// Zend_Registry::get("logger")->info('$newdata : '.print_r($data, true));

		try {
			$this->genericModel->updateData($data);
		} catch (Exception $e) {
			return $this->showEditDataAction($data, $e->getMessage());
		}

		// Forward the user to the next step
		return $this->showEditDataAction($data, 'Data successfully edited');
	}

	/**
	 * Add the edited data in database.
	 *
	 * @return the HTML view
	 */
	public function validateAddDataAction() {
		$this->logger->debug('validateAddDataAction');

		// Get back info from the session
		$websiteSession = new Zend_Session_Namespace('website');
		$datasetId = $websiteSession->datasetID;
		$data = $websiteSession->data;

		// Validate the form
		$form = $this->_getEditDataForm($data, 'ADD');
		if (!$form->isValidPartial($_POST)) {

			// On réaffiche le formulaire avec les messages d'erreur
			$this->view->form = $form;
			$this->view->ancestors = $websiteSession->ancestors;
			$this->view->tableFormat = $data->tableFormat;
			$this->view->data = $data;
			$this->view->children = array(); // No children in edition mode
			$this->view->message = '';
			$this->view->mode = 'ADD';

			return $this->render('edit-data');
		}

		// Insert the data descriptor with the values submitted
		foreach ($data->editableFields as $field) {
			$field->value = $this->_getParam($field->data);
		}

		try {
			$this->genericModel->insertData($data);
		} catch (Exception $e) {
			return $this->showAddDataAction($data, $e->getMessage());
		}

		// Forward the user to the next step
		return $this->showEditDataAction($data, 'Data successfully inserted');
	}

	/**
	 * Add a new data.
	 *
	 * A data here is the content of a table, or if a dataset is selected the table filtrered with the dataset elements.
	 *
	 * @param DataObject $data The data to display (optional)
	 * @return the HTML view
	 */
	public function showAddDataAction($data = null, $message = '') {
		$this->logger->debug('showAddDataAction');

		$mode = 'ADD';

		// If data is set then we don't need to read from database
		if ($data == null) {

			// Get back the dataset identifier
			$websiteSession = new Zend_Session_Namespace('website');
			$datasetId = $websiteSession->datasetID;

			// Declare our array of business keys
			$keyMap = array();

			// Get the parameters from the URL
			$request = $this->getRequest();
			$params = $request->getUserParams();

			if (sizeof($params) <= 3) { // default size = controller + action + module

				// Paramètres d'entrée :
				// DATASET_ID
				// FORMAT : Le nom de la table à éditer
				// CLE1
				// CLE2
				// ...

				// Test 1 : Plot data
				//		$keyMap["FORMAT"] = "PLOT_DATA";
				//		$keyMap["PROVIDER_ID"] = "1";
				//		$keyMap["PLOT_CODE"] = "01575-14060-4-0T";
				//		$keyMap["CYCLE"] = "5";

				// Test 2 : Species data
				$keyMap["FORMAT"] = "SPECIES_DATA";
				$keyMap["PROVIDER_ID"] = "1";
				$keyMap["PLOT_CODE"] = "01575-14060-4-0T";
				$keyMap["CYCLE"] = "5";
				//$keyMap["SPECIES_CODE"] = "035.001.001";
				$keyMap["SUBMISSION_ID"] = "-1";
				$keyMap["LINE_NUMBER"] = "-1";

				// Test 3 : Tree data (no dataset filtering)
				/*
				 $keyMap["FORMAT"] = "TREE_DATA";
				 $keyMap["PROVIDER_ID"] = "1";
				 $keyMap["PLOT_CODE"] = "21573-F1000-6-6T";
				 $keyMap["CYCLE"] = "5";
				 $keyMap["SUBMISSION_ID"] = "-1";
				 $keyMap["LINE_NUMBER"] = "-1";*/
			} else {
				$keyMap = $params;
			}

			// Create an empty data object with the info in session
			$data = new DataObject();
			$data->datasetId = $datasetId;

			// Get the info about the format
			$tableFormat = $this->metadataModel->getTableFormat($this->schema, $keyMap["FORMAT"]);

			// Store it in the data object
			$data->tableFormat = $tableFormat;

			// Get all the description of the Table Fields corresponding to the format
			$tableFields = $this->metadataModel->getTableFields($data->datasetId, $this->schema, $data->tableFormat->format);

			// Separate the keys from other values
			foreach ($tableFields as $tableField) {
				if (in_array($tableField->data, $tableFormat->primaryKeys)) {
					// Primary keys are display as info when we have the value
					if (!empty($keyMap[$tableField->data])) {
						// Complete the primary key info with the session values
						$tableField->value = $keyMap[$tableField->data];
						$data->addInfoField($tableField);
					} else {
						// If the missing PK info is not calculated by trigger then it must be filled by the user
						if (!$tableField->isCalculated) {
							$this->logger->debug('adding field : '.$tableField->data.' as editable pk');
							$data->addEditableField($tableField);
						}
					}

				} else {
					if (!$tableField->isCalculated) {
						// Fields that are calculated by a trigger should not be edited
						$data->addEditableField($tableField);
					}
				}
			}

		}

		// Zend_Registry::get("logger")->info('$data : '.print_r($data, true));

		// If the objet is not existing then we are in create mode instead of edit mode

		// Get the ancestors of the data objet from the database (to generate a summary)
		$ancestors = $this->genericModel->getAncestors($data);

		// Get the childs of the data objet from the database (to generate links)

		// Store the data descriptor in session
		$websiteSession = new Zend_Session_Namespace('website');
		$websiteSession->data = $data;
		$websiteSession->ancestors = $ancestors;

		// Generate dynamically the corresponding form
		$this->view->form = $this->_getEditDataForm($data, $mode);
		$this->view->tableFormat = $data->tableFormat;
		$this->view->ancestors = $ancestors;
		$this->view->data = $data;
		$this->view->children = array(); // No children in edition mode
		$this->view->mode = $mode;
		$this->view->message = $message;

		$this->render('edit-data');
	}

}
