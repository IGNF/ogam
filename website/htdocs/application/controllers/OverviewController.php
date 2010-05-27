<?php
require_once 'AbstractEforestController.php';
require_once APPLICATION_PATH.'/models/metadata/Metadata.php';
require_once APPLICATION_PATH.'/models/integration_service/IntegrationService.php';
require_once APPLICATION_PATH.'/models/raw_data/Submission.php';
require_once APPLICATION_PATH.'/models/raw_data/Location.php';

/**
 * OverviewController is the controller that show some statistics on the project.
 * @package controllers
 */
class OverviewController extends AbstractEforestController {

	protected $_redirector = null;

	/**
	 * Initialise the controler
	 */
	public function init() {
		parent::init();

		// Set the current module name
		$websiteSession = new Zend_Session_Namespace('website');
		$websiteSession->module = "overview";
		$websiteSession->moduleLabel = "Overview";
		$websiteSession->moduleURL = "overview";

		// Load the redirector helper
		$this->_redirector = $this->_helper->getHelper('Redirector');

		// Initialise the model
		$this->metadataModel = new Model_Metadata();
		$this->submissionModel = new Model_Submission();
		$this->locationModel = new Model_Location();

	}

	/**
	 * Check if the authorization is valid this controler.
	 */
	function preDispatch() {

		parent::preDispatch();

		$userSession = new Zend_Session_Namespace('user');
		$permissions = $userSession->permissions;
		$role = $userSession->role;
		if (empty($permissions) || !array_key_exists('OVERVIEW', $permissions)) {
			$this->_redirector->gotoUrl('/');
		}
	}

	/**
	 * The "index" action is the default action for all controllers.
	 */
	public function indexAction() {
		$this->logger->debug('Overview index');

		$this->showRawDataStatisticsAction();
	}

	/**
	 * Show raw data statistics.
	 *
	 * @return a view
	 */
	public function showRawDataStatisticsAction() {
		$this->logger->debug('showRawDataStatisticsAction');

		// Get some info about the user
		$userSession = new Zend_Session_Namespace('user');

		// If the user cannot see all countries we get back to the previous page
		if ($userSession->role->isEuropeLevel != '1') {
			return $this->indexAction();
		}

		// Get the label for the countries
		$this->view->countries = $this->metadataModel->getModeFromUnit('COUNTRY_CODE');

		// Get the number of plot locations per country
		$this->view->plotLocationsPerCountry = $this->locationModel->getLocationsPerCountry();

		// Get the list of datasets		
		$requests = $this->metadataModel->getDatasets();
		$datasetIds = array();
		foreach ($requests as $request) {
			$datasetIds[$request['id']] = $request['label'];
		}
		$this->view->datasetIds = $datasetIds;

		// Get the status of the submissions per country and dataset
		$this->view->submissionsPerCountry = $this->submissionModel->getSubmissionsStatistics();

		$this->render('show-raw-data-statistics-page');
	}

}
