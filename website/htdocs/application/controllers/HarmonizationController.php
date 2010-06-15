<?php
/**
 * © French National Forest Inventory 
 * Licensed under EUPL v1.1 (see http://ec.europa.eu/idabc/eupl).
 */ 
require_once 'AbstractEforestController.php';
require_once APPLICATION_PATH.'/models/metadata/Metadata.php';
require_once APPLICATION_PATH.'/models/harmonized_data/HarmonizationProcess.php';
require_once APPLICATION_PATH.'/models/harmonization_service/HarmonizationService.php';
require_once APPLICATION_PATH.'/models/raw_data/Submission.php';

/**
 * HarmonizationController is the controller that manages the data harmonization process.
 * @package controllers
 */
class HarmonizationController extends AbstractEforestController {

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
		$this->metadataModel = new Model_Metadata();
		$this->harmonizationModel = new Model_HarmonizationProcess();
		$this->harmonizationServiceModel = new Model_HarmonizationService();
		$this->submissionModel = new Model_Submission();

	}

	/**
	 * Check if the authorization is valid this controler.
	 */
	function preDispatch() {

		parent::preDispatch();

		$userSession = new Zend_Session_Namespace('user');
		$permissions = $userSession->permissions;
		if (empty($permissions) || !array_key_exists('DATA_HARMONIZATION', $permissions)) {
			$this->_redirector->gotoUrl('/');
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
	 * Display some statistics about the harmonization process.
	 *
	 * @return a View
	 */
	public function showHarmonizedHistoryAction() {
		$this->logger->debug('showHarmonizedStatisticsAction');

		$this->view->harmonizations = $this->harmonizationModel->getHarmonizationsHistory();

		$this->view->countries = $this->metadataModel->getModeFromUnit('COUNTRY_CODE');

		$this->render('show-harmonization-history-page');
	}

	/**
	 * Show the harmonization page.
	 *
	 * @return a View
	 */
	public function showHarmonizationPageAction() {
		$this->logger->debug('showHarmonizationPageAction');

		// Get the list of available harmonization (countries having done a submission)
		$harmonisationProcesses = $this->submissionModel->getCountrySubmissions();

		foreach ($harmonisationProcesses as $id => $harmonisationProcess) {

			// Get the status of the last process run
			$harmonisationProcesses[$id] = $this->harmonizationModel->getHarmonizationProcessInfo($harmonisationProcesses[$id]);

			// Get the source submissions of this process
			$harmonisationProcesses[$id] = $this->harmonizationModel->getHarmonizationProcessSources($harmonisationProcesses[$id]);

			// Get the current status of the source data
			$submissionStatus = "VALIDATED";
			foreach ($harmonisationProcesses[$id]->submissionIDs as $submissionID) {
				$submission = $this->submissionModel->getSubmission($submissionID);
				if ($submission->step != "VALIDATED") {
					$submissionStatus = "NOT_VALID";
				}
			}
			$harmonisationProcesses[$id]->submissionStatus = $submissionStatus;

		}

		// Send the data to the view
		$this->view->harmonizations = $harmonisationProcesses;

		// Get the label of the countries
		$this->view->countries = $this->metadataModel->getModeFromUnit('COUNTRY_CODE');

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
		$countryCode = $this->_getParam("COUNTRY_CODE");
		$datasetId = $this->_getParam("DATASET_ID");

		// Send the cancel request to the integration server
		try {
			$this->harmonizationServiceModel->harmonizeData($countryCode, $datasetId);
		} catch (Exception $e) {
			$this->logger->debug('Error during harmonization: '.$e);
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
		$countryCode = $this->_getParam("COUNTRY_CODE");

		// Send the cancel request to the integration server
		try {
			$status = $this->harmonizationServiceModel->getStatus($datasetId, $countryCode, 'HarmonizationServlet');

			// Echo the result as a JSON
			echo "{status:'".$status->status."', taskName:'".$status->taskName."', currentCount:'".$status->currentCount."', totalCount:'".$status->totalCount."'}";
		} catch (Exception $e) {
			$this->logger->debug('Error during get: '.$e);
			$this->view->errorMessage = $e->getMessage();
			return $this->render('show-data-error');
		}

		// No View, we send directly the javascript
		$this->_helper->layout()->disableLayout();
		$this->_helper->viewRenderer->setNoRender();
	}
}
