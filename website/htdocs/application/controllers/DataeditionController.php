<?php
/**
 * © French National Forest Inventory 
 * Licensed under EUPL v1.1 (see http://ec.europa.eu/idabc/eupl).
 */ 
require_once 'AbstractEforestController.php';
require_once APPLICATION_PATH.'/models/metadata/Metadata.php';

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
		$this->_redirector->gotoUrl('/dataedition/show-add-data');
	}

	/**
	 * Show the add page.
	 *
	 * @return the HTML view
	 */
	public function showAddDataAction() {
		$this->logger->debug('showAddDataAction');

		$this->view->form = $this->_getDatasetForm();

		$this->render('show-dataset');
	}

}
