<?php
/**
 * Licensed under EUPL v1.1 (see http://ec.europa.eu/idabc/eupl).
 *
 * © European Union, 2008-2012
 *
 * Reuse is authorised, provided the source is acknowledged. The reuse policy of the European Commission is implemented by a Decision of 12 December 2011.
 *
 * The general principle of reuse can be subject to conditions which may be specified in individual copyright notices.
 * Therefore users are advised to refer to the copyright notices of the individual websites maintained under Europa and of the individual documents.
 * Reuse is not applicable to documents subject to intellectual property rights of third parties.
 */
require_once 'AbstractOGAMController.php';

/**
 * HarmonizationController is the controller that manages the data harmonization process (copy data from one schema to another).
 *
 * @package Application_Controller
 */
class HarmonizationController extends AbstractOGAMController {

	/**
	 * Initialise the controler.
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
		$this->metadataModel = new Application_Model_Metadata_Metadata();
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
		$user = $userSession->user;
		if (empty($user) || !$user->isAllowed('DATA_HARMONIZATION')) {
			throw new Zend_Auth_Exception('Permission denied for right : DATA_HARMONIZATION');
		}
	}

	/**
	 * The "index" action is the default action for all controllers.
	 */
	public function indexAction() {
		$this->logger->debug('Data harmonization index');

		$this->showHarmonizationPageAction();
	}

	/**
	 * Show the harmonization page.
	 *
	 * @return a View
	 */
	public function showHarmonizationPageAction() {
		$this->logger->debug('showHarmonizationPageAction');

		// Get the list of available harmonization (active submissions)
		$activeSubmissions = $this->submissionModel->getSubmissionsForHarmonization();

		$harmonisationProcesses = array();

		foreach ($activeSubmissions as $id => $activeSubmission) {

			// Get the status of the last process run
			$process = $this->harmonizationModel->getHarmonizationProcessInfo($activeSubmission);

			// Get the source submissions of this process
			$process = $this->harmonizationModel->getHarmonizationProcessSources($process);

			// Get the current status of the source data
			$submissionStatus = $this->translator->translate('VALIDATED');
			foreach ($process->submissionIDs as $submissionID) {
				$submission = $this->submissionModel->getSubmission($submissionID);
				if ($submission->step !== "VALIDATED") {
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
	 * Launch the harmonization process.
	 *
	 * @return a View
	 */
	public function launchHarmonizationAction() {
		$this->logger->debug('launchHarmonizationAction');

		$this->_launchHarmonization(false);
	}

	/**
	 * Remove the generated data.
	 *
	 * @return a View
	 */
	public function removeHarmonizationDataAction() {
		$this->logger->debug('removeHarmonizationDataAction');

		$this->_launchHarmonization(true);
	}

	/**
	 * Launch the harmonization process.
	 *
	 * @param Boolean $removeOnly
	 *        	If true then we remove the old data without copying new data.
	 * @return a View
	 */
	private function _launchHarmonization($removeOnly = false) {

		// Get the submission Id
		$providerId = $this->_getParam("PROVIDER_ID");
		$datasetId = $this->_getParam("DATASET_ID");

		// Send the cancel request to the integration server
		try {
			$this->harmonizationServiceModel->harmonizeData($providerId, $datasetId, $removeOnly);
		} catch (Exception $e) {
			$this->logger->err('Error during harmonization: ' . $e);
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

		// Get the submission Id
		$datasetId = $this->_getParam("DATASET_ID");
		$providerId = $this->_getParam("PROVIDER_ID");

		// Send the cancel request to the integration server
		try {
			$status = $this->harmonizationServiceModel->getStatus($datasetId, $providerId, 'HarmonizationServlet');

			// Echo the result as a JSON
			if ($status->status === "OK") {
				echo '{"success":true, "status":"' . $status->status . '"}';
			} else {
				echo '{"success":true, "status":"' . $status->status . '", "taskName":"' . $status->taskName . '"';
				if ($status->currentCount != null) {
					echo ', "currentCount":' . $status->currentCount;
				}
				if ($status->totalCount != null) {
					echo ', "totalCount":' . $status->totalCount;
				}
				echo '}';
			}
		} catch (Exception $e) {
			$this->logger->err('Error during get: ' . $e);
			$this->view->errorMessage = $e->getMessage();
			echo '{"success":false, "errorMsg":"' . $e->getMessage() . '"}';
		}

		// No View, we send directly the javascript
		$this->_helper->layout()->disableLayout();
		$this->_helper->viewRenderer->setNoRender();
	}
}
