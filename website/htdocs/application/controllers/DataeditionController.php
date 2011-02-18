<?php
/**
 * © French National Forest Inventory
 * Licensed under EUPL v1.1 (see http://ec.europa.eu/idabc/eupl).
 */
require_once 'AbstractEforestController.php';
require_once APPLICATION_PATH.'/models/metadata/Metadata.php';
require_once APPLICATION_PATH.'/models/raw_data/Generic.php';
require_once APPLICATION_PATH.'/classes/dataedition/DataObject.php';
require_once APPLICATION_PATH.'/classes/metadata/TableField.php';

/**
 * DataEditionController is the controller that allow the edition of simple data.
 * @package controllers
 */
class DataEditionController extends AbstractEforestController {

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
	 * @param Zend_Form $form a form
	 * @param TableField $field the descriptor
	 * @param Boolean $isKey is the field a primary key ?
	 */
	private function getFormElement($form, $field, $isKey = false) {

		// TODO : Tester sur le form_field type

		if ($field->type == "STRING") {
			$elem = $form->createElement('text', $field->data);

		} else if ($field->type == "INTEGER") {
			$elem = $form->createElement('text', $field->data);

		} else if ($field->type == "NUMERIC") {
			$elem = $form->createElement('text', $field->data);

		} else if ($field->type == "DATE") {
			$elem = $form->createElement('text', $field->data);

		} else if ($field->type == "COORDINATE") {
			$elem = $form->createElement('text', $field->data);

		} else if ($field->type == "RANGE") {
			$elem = $form->createElement('text', $field->data);

		} else if ($field->type == "CODE") {
			$elem = $form->createElement('select', $field->data);

		} else if ($field->type == "BOOLEAN") {
			$elem = $form->createElement('checkbox', $field->data);

		} else {
			// Default
			$elem = $form->createElement('text', $field->data);

		}

		$elem->setLabel($field->label);
		$elem->setDescription($field->definition);
		$elem->setValue($field->value);

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
	private function _getEditDataForm($data) {

		$form = new Zend_Form();
		$form->setAction($this->baseUrl.'/dataedition/validate-edit-data');
		$form->setMethod('post');

		// Dynamically build the form

		//
		// The key elements as labels
		//
		foreach ($data->primaryKeys as $primaryKey) {

			$elem = $this->getFormElement($form, $primaryKey, true);

			// Hardcoded value : We don't display the submission id (it's a technical element)
			if ($primaryKey->data != "SUBMISSION_ID") {
				$form->addElement($elem);
			} // L'ajouter aussi en tant que hidden ???

		}

		//
		// The key elements as labels
		//
		foreach ($data->fields as $field) {

			if ($field->data != "LINE_NUMBER") {
				$elem = $this->getFormElement($form, $field, false);
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
	 * Show the select of dataset page.
	 *
	 * @return the HTML view
	 */
	public function showSelectDatasetAction() {
		$this->logger->debug('showSelectDatasetAction');

		$this->view->form = $this->_getDatasetForm();

		$this->render('show-dataset');
	}

	/**
	 * Validate the selection of the dataset.
	 *
	 * @return the HTML view
	 */
	public function validateDatasetAction() {
		$this->logger->debug('showSelectDatasetAction');

		// Get the dataset Id
		$datasetId = $this->_getParam("DATASET_ID");

		// Store it in session
		$websiteSession = new Zend_Session_Namespace('website');
		$websiteSession->datasetID = $datasetId;

		// Forward the user to the next step
		$this->_redirector->gotoUrl('/dataedition/show-edit-data');
	}

	/**
	 * Edit a data.
	 *
	 * A data here is the content of a table, or if a dataset is selected the table filtrered with the dataset elements.
	 *
	 * @return the HTML view
	 */
	public function showEditDataAction() {
		$this->logger->debug('showEditDataAction');

		// Store it in session
		$websiteSession = new Zend_Session_Namespace('website');

		// Paramètres d'entrée :
		// DATASET_ID
		// FORMAT : Le nom de la table à éditer
		// CLE1
		// CLE2
		// ...

		$datasetId = $websiteSession->datasetID;
		$format = "PLOT_DATA";
		$provider_id = "1";
		$plot_code = "01575-14060-4-0T";
		$cycle = "5";

		$keyMap = array();
		$keyMap["FORMAT"] = $format;
		$keyMap["PROVIDER_ID"] = $provider_id;
		$keyMap["PLOT_CODE"] = $plot_code;
		$keyMap["CYCLE"] = $cycle;

		// Create an empty data object with the info in session
		$data = new DataObject();
		$data->datasetId = $datasetId;

		// Get the info about the format
		$tableFormat = $this->metadataModel->getTableFormat('RAW_DATA', $format);

		// Store it in the data object
		$data->tableFormat = $tableFormat;

		// Get all the description of the Table Fields corresponding to the format
		$tableFields = $this->metadataModel->getTableFields($data->datasetId, 'RAW_DATA', $data->tableFormat->format);

		// Separate the keys from other values
		foreach ($tableFields as $tableField) {
			if (in_array($tableField->data, $tableFormat->primaryKeys)) {
				$data->primaryKeys[] = $tableField;
			} else {
				$data->fields[] = $tableField;
			}
		}

		// Complete the primary key info with the session values
		foreach ($data->primaryKeys as $primaryKey) {

			if (!empty($keyMap[$primaryKey->data])) {
				$primaryKey->value = $keyMap[$primaryKey->data];
			}
		}

		// Complete the data object with the values from the database.
		$data = $this->genericModel->getData($data);

		// Zend_Registry::get("logger")->info('$data : '.print_r($data, true));

		// If the objet is not existing then we are in create mode instead of edit mode

		// Get the ancestors of the data objet from the database (to generate a summary)

		// Get the childs of the data objet from the database (to generate links)

		// Store the data descriptor in session
		$websiteSession = new Zend_Session_Namespace('website');
		$websiteSession->data = $data;

		// Generate dynamically the corresponding form
		$this->view->form = $this->_getEditDataForm($data);

		$this->render('edit-data');
	}

	/**
	 * Sauve the edited data in database.
	 *
	 * @return the HTML view
	 */
	public function validateEditDataAction() {
		$this->logger->debug('validateEditDataAction');

		// Get back info from the session
		$websiteSession = new Zend_Session_Namespace('website');
		$datasetId = $websiteSession->datasetID;
		$data = $websiteSession->data;

		// Update the data descriptor with the values submitted
		foreach ($data->fields as $field) {
			/* @var $value TableField */

			// TODO : Manage the case of the LINE_NUMBER
			$field->value = $this->_getParam($field->data);
		}

		// Zend_Registry::get("logger")->info('$newdata : '.print_r($data, true));

		$this->genericModel->updateData($data);

		// Forward the user to the next step
		$this->_redirector->gotoUrl('/dataedition');
	}

}
