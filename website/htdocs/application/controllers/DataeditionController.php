<?php
/**
 * © French National Forest Inventory
 * Licensed under EUPL v1.1 (see http://ec.europa.eu/idabc/eupl).
 */
require_once 'AbstractEforestController.php';
require_once APPLICATION_PATH.'/models/metadata/Metadata.php';
require_once APPLICATION_PATH.'/classes/dataedition/DataObject.php';
require_once APPLICATION_PATH.'/classes/dataedition/Value.php';

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
	 * Validate the dataset selection.
	 *
	 * @return a View.
	 */
	public function validateDataAction() {
		$this->logger->debug('validateDataAction');

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

		// Paramètres d'entrée :
		// DATASET_ID
		// FORMAT : Le nom de la table à éditer
		// CLE1
		// CLE2
		// ...

		$datasetId = "REQUEST";
		$plot_code = "01575-14060-4-0T";
		$cycle = "5";
		$provider_id = "1";

		$data = new DataObject();
		$key1 = new Value("plot_code", $plot_code);
		$key2 = new Value("cycle", $cycle);
		$key3 = new Value("provider_id", $provider_id);
		$data->addPrimaryKey($key1);
		$data->addPrimaryKey($key2);
		$data->addPrimaryKey($key3);

		// Get the data objet from the database.
		// TODO : Eliminer automatiquement la colonne submission_id de la clé

		// If the objet is not existing then we are in create mode instead of edit mode

		// Get the ancestors of the data objet from the database

		// Get the childs of the data objet from the database

		$this->view->form = $this->_getDatasetForm();

		$this->render('edit-data');
	}

}
