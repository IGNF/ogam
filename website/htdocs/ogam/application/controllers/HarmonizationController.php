<?php
/**
 * © French National Forest Inventory
 * Licensed under EUPL v1.1 (see http://ec.europa.eu/idabc/eupl).
 */
require_once 'AbstractOGAMController.php';

/**
 * HarmonizationController is the controller that manages the data harmonization process.
 * @package controllers
 */
class HarmonizationController extends AbstractOGAMController {

	/**
	 * Initialise the controler
	 */
	public function init() {
		parent::init();

		// Set the current module name
		$websiteSession = new Zend_Session_Namespace('website');
		$websiteSession->module = "harmonization";
		$websiteSession->moduleLabel = "Data Harmonization";
		$websiteSession->moduleURL = "harmonization";

		// Load the redirector helper
		$this->_redirector = $this->_helper->getHelper('Redirector');

		// Initialise the model
		$this->metadataModel = new Genapp_Model_Metadata_Metadata();
		$this->harmonizationModel = new Application_Model_HarmonizedData_HarmonizationProcess();
		$this->harmonizationServiceModel = new Application_Model_HarmonizationService_HarmonizationService();
		$this->submissionModel = new Application_Model_RawData_Submission();

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
		if (empty($permissions) || !array_key_exists('DATA_HARMONIZATION', $permissions)) {
			throw new Zend_Auth_Exception('Permission denied for right : DATA_HARMONIZATION');
		}
	}

	/**
	 * The "index" action is the default action for all controllers.
	 */
	public function indexAction() {
		$this->logger->debug('Data harmonization index');

		$this->render('index');
	}

	/**
	 * Show the harmonization page.
	 *
	 * @return a View
	 */
	public function showHarmonizationPageAction() {
		$this->logger->debug('showHarmonizationPageAction');

		// Get the list of available harmonization (active submissions)
		$activeSubmissions = $this->submissionModel->getActiveSubmissions();

		$harmonisationProcesses = array();

		foreach ($activeSubmissions as $id => $activeSubmission) {

			// Get the status of the last process run
			$process = $this->harmonizationModel->getHarmonizationProcessInfo($activeSubmission);

			// Get the source submissions of this process
			$process = $this->harmonizationModel->getHarmonizationProcessSources($process);

			// Get the current status of the source data
			$submissionStatus = "VALIDATED";
			foreach ($process->submissionIDs as $submissionID) {
				$submission = $this->submissionModel->getSubmission($submissionID);
				if ($submission->step != "VALIDATED") {
					$submissionStatus = "NOT_VALID";
				}
			}

			$process->submissionStatus = $submissionStatus;

			$harmonisationProcesses[$id] = $process;

		}

		// Send the data to the view
		$this->view->harmonizations = $harmonisationProcesses;

		$this->render('show-harmonization-page');
	}

	/**
	 * Launch the harmonization process
	 *
	 * @return a View
	 */
	public function launchHarmonizationAction() {
		$this->logger->debug('launchHarmonizationAction');

		// Get the submission  Id
		$providerId = $this->_getParam("PROVIDER_ID");
		$datasetId = $this->_getParam("DATASET_ID");

		// Send the cancel request to the integration server
		try {
			$this->harmonizationServiceModel->harmonizeData($providerId, $datasetId);
		} catch (Exception $e) {
			$this->logger->err('Error during harmonization: '.$e);
			$this->view->errorMessage = $e->getMessage();
			return $this->render('show-harmonization-process-error');
		}

		// Forward the user to the next step
		$this->_redirector->gotoUrl('/harmonization/show-harmonization-page');
	}

	/**
	 * Gets the integration status.
	 *
	 * @return a View
	 */
	protected function getStatusAction() {
		$this->logger->debug('getStatusAction');

		// Get the submission  Id
		$datasetId = $this->_getParam("DATASET_ID");
		$providerId = $this->_getParam("PROVIDER_ID");

		// Send the cancel request to the integration server
		try {
			$status = $this->harmonizationServiceModel->getStatus($datasetId, $providerId, 'HarmonizationServlet');

			// Echo the result as a JSON
			echo "{status:'".$status->status."', taskName:'".$status->taskName."', currentCount:'".$status->currentCount."', totalCount:'".$status->totalCount."'}";
		} catch (Exception $e) {
			$this->logger->err('Error during get: '.$e);
			$this->view->errorMessage = $e->getMessage();
			return $this->render('show-data-error');
		}

		// No View, we send directly the javascript
		$this->_helper->layout()->disableLayout();
		$this->_helper->viewRenderer->setNoRender();
	}
}
