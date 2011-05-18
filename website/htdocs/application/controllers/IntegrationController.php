<?php
/**
 * © French National Forest Inventory
 * Licensed under EUPL v1.1 (see http://ec.europa.eu/idabc/eupl).
 */
require_once 'AbstractOGAMController.php';

/**
 * IntegrationController is the controller that manages the data integration.
 * @package controllers
 */
class IntegrationController extends AbstractOGAMController {

	protected $_redirector = null;

	/**
	 * Initialise the controler
	 */
	public function init() {
		parent::init();

		// Set the current module name
		$websiteSession = new Zend_Session_Namespace('website');
		$websiteSession->module = "integration";
		$websiteSession->moduleLabel = "Data Integration";
		$websiteSession->moduleURL = "integration";

		// Load the redirector helper
		$this->_redirector = $this->_helper->getHelper('Redirector');

		// Initialise the model
		$this->metadataModel = new Genapp_Model_DbTable_Metadata_Metadata();
		$this->integrationServiceModel = new Application_Model_IntegrationService_IntegrationService();
		$this->submissionModel = new Application_Model_DbTable_RawData_Submission();

		$configuration = Zend_Registry::get("configuration");
		$this->fileMaxSize = $configuration->fileMaxSize;

	}

	/**
	 * Check if the authorization is valid this controler.
	 */
	function preDispatch() {

		parent::preDispatch();

		$userSession = new Zend_Session_Namespace('user');
		$permissions = $userSession->permissions;
		if (empty($permissions) || !array_key_exists('DATA_INTEGRATION', $permissions)) {
			$this->_redirector->gotoUrl('/');
		}
	}

	/**
	 * The "index" action is the default action for all controllers.
	 */
	public function indexAction() {
		$this->logger->debug('Data integration index');

		$this->render('index');
	}

	/**
	 * Build and return the data submission form.
	 */
	private function _getDataSubmissionForm() {

		$form = new Zend_Form();
		$form->setAction($this->baseUrl.'/integration/validate-create-data-submission');
		$form->setMethod('post');

		//
		// Add the dataset element
		//
		$requestElement = $form->createElement('select', 'DATASET_ID');
		$requestElement->setLabel('Dataset');
		$requestElement->setRequired(true);
		$requests = $this->metadataModel->getDatasetsForUpload();
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
	 * Build and return the pdata upload form.
	 */
	private function _getDataUploadForm($showDetail = false) {

		$form = new Zend_Form();
		$form->setAction($this->baseUrl.'/integration/validate-upload-data');
		$form->setAttrib('enctype', 'multipart/form-data');
		$form->setMethod('post');

		// Get the submission Id from the session
		$dataSession = new Zend_Session_Namespace('submission');
		$submissionId = $dataSession->data->submissionId;

		$this->logger->debug('submissionId : '.$submissionId);

		// Get the submission object from the database
		$submission = $this->submissionModel->getSubmission($submissionId);
		$requestedFiles = $this->metadataModel->getRequestedFiles($submission->datasetId);

		//
		// For each requested file, add a file upload element
		//
		foreach ($requestedFiles as $requestedFile) {

			$fileelement = new Zend_Form_Element_File($requestedFile->format);

			$fileelement->setLabel('Upload '.$requestedFile->label.': ');
			$fieldsDesc = '';
			if ($showDetail) {
				// Get some more informations in the metadata base
				$fields = $this->metadataModel->getFileFields($requestedFile->format);
				$fieldsDesc .= Zend_Registry::get('Zend_Translate')->translate('The expected fields are:');
				foreach ($fields as $field) {
					$fieldsDesc .= '<a href="#" title="';
					$fieldsDesc .= $field->definition; // the tooltip
					if (!empty($field->mask)) {
						$fieldsDesc .= ' : format = '.$field->mask;
					}
					$fieldsDesc .= '">';
					$fieldsDesc .= $field->label;
					if ($field->isMandatory == 1) {
						$fieldsDesc .= '*';
					}

					$fieldsDesc .= '</a>';
					$fieldsDesc .= ';&nbsp;';
				}
			}

			$fileelement->setDescription($fieldsDesc);
			$fileelement->addDecorator('Description', array('escape' => false));
			$fileelement->addValidator('Count', false, 1); // ensure only 1 file
			$fileelement->addValidator('Size', false, $this->fileMaxSize * 1024 * 1000); // limit to 40 Mo
			//$element->addValidator('Extension', false, 'csv'); // extension should be csv

			$form->addElement($fileelement);

		}

		//
		// Add the submit element
		//
		$submitElement = $form->createElement('submit', 'submit');
		$submitElement->setLabel('Submit');
		$form->addElement($submitElement);

		return $form;
	}

	/**
	 * Show the data submission page.
	 *
	 * @return the HTML view
	 */
	public function showDataPageAction() {
		$this->logger->debug('showDataPageAction');

		// Get some info about the user
		$userSession = new Zend_Session_Namespace('user');

		// Get the current data submissions
		$this->view->submissions = $this->submissionModel->getActiveSubmissions();

		$this->render('show-data-submission-page');
	}

	/**
	 * Show the create data submission page.
	 *
	 * @return the HTML view
	 */
	public function showCreateDataSubmissionAction() {
		$this->logger->debug('showCreateDataSubmissionAction');

		$this->view->form = $this->_getDataSubmissionForm();

		$this->render('show-create-data-submission');
	}

	/**
	 * Show the upload data page.
	 *
	 * @return the HTML view
	 */
	public function showUploadDataAction() {
		$this->logger->debug('showUploadDataAction');

		$this->view->form = $this->_getDataUploadForm(true);

		$this->render('show-upload-data');
	}

	/**
	 * Validate the create data submission page.
	 *
	 * @return the HTML view
	 */
	public function validateCreateDataSubmissionAction() {
		$this->logger->debug('validateCreateDataSubmissionAction');

		// Check the validity of the POST
		if (!$this->getRequest()->isPost()) {
			$this->logger->debug('form is not a POST');
			return $this->_forward('index');
		}

		// Check the validity of the Form
		$form = $this->_getDataSubmissionForm();
		if (!$form->isValid($_POST)) {
			$this->logger->debug('form is not valid');
			$this->view->form = $form;
			return $this->render('show-create-data-submission');
		}

		// Get the selected values
		$values = $form->getValues();
		$datasetId = $values['DATASET_ID'];

		$userSession = new Zend_Session_Namespace('user');
		$userLogin = $userSession->user->login;

		// In this demo project, the provider id is the country code of the connected user
		$providerId = $userSession->user->countryCode;

		// Send the request to the integration server
		try {
			$submissionId = $this->integrationServiceModel->newDataSubmission($providerId, $datasetId, $userLogin);
		} catch (Exception $e) {
			$this->logger->debug('Error during upload: '.$e);
			$this->view->errorMessage = $e->getMessage();
			return $this->render('show-data-error');
		}

		// Store the submission information in session
		$dataSubmission = new Application_Model_Rawdata_Submission();
		$dataSubmission->submissionId = $submissionId;
		$dataSubmission->providerId = $providerId;
		$dataSubmission->datasetId = $datasetId;
		$dataSubmission->userLogin = $userLogin;
		$dataSession = new Zend_Session_Namespace('submission');
		$dataSession->data = $dataSubmission;

		// Forward the user to the next step
		return $this->showUploadDataAction();
	}

	/**
	 * Validate the upload of one or more data file.
	 *
	 * @return the HTML view
	 */
	public function validateUploadDataAction() {
		$this->logger->debug('validateUploadDataAction');

		// Check the validity of the POST
		if (!$this->getRequest()->isPost()) {
			$this->logger->debug('form is not a POST');
			return $this->_forward('index');
		}

		// Check the validity of the From
		$form = $this->_getDataUploadForm();
		if (!$form->isValid($_POST)) {
			$this->logger->debug('form is not valid');
			$this->view->form = $form;
			return $this->render('show-upload-data');
		}

		// Upload the files on Server
		$upload = new Zend_File_Transfer_Adapter_Http();
		$upload->receive();

		// Get the submission info
		$dataSession = new Zend_Session_Namespace('submission');
		$submission = $dataSession->data;

		// Get the user info
		$userSession = new Zend_Session_Namespace('user');
		$providerId = $userSession->user->countryCode; // The provider identifier is the country code

		// Get the configuration info
		$configuration = Zend_Registry::get("configuration");
		$uploadDir = $configuration->uploadDir;

		//
		// For each requested file
		//
		$dataSubmission = $this->submissionModel->getSubmission($submission->submissionId);
		$requestedFiles = $this->metadataModel->getRequestedFiles($dataSubmission->datasetId);

		$allFilesUploaded = true;
		foreach ($requestedFiles as $requestedFile) {

			// Get the uploaded filename
			$filename = $upload->getFileName($requestedFile->format, false);
			$filepath = $upload->getFileName($requestedFile->format);
			$this->logger->debug('uploaded filename '.$filename);

			// Check that the file is present
			if (empty($filename)) {
				$this->logger->debug('empty');
				$allFilesUploaded = false;
			} else {
				// Move the file to the upload directory for archive
				$this->logger->debug('move file : '.$filename);
				$targetPath = $uploadDir.DIRECTORY_SEPARATOR.$submission->submissionId.DIRECTORY_SEPARATOR.$requestedFile->fileType;
				$targetName = $targetPath.DIRECTORY_SEPARATOR.$filename;
				@mkdir($uploadDir.DIRECTORY_SEPARATOR.$submission->submissionId); // create the submission dir
				@mkdir($targetPath);
				@rename($filepath, $targetName);

				$this->logger->debug('renamed to '.$targetName);
				$requestedFile->filePath = $targetName;
			}
		}

		// Check that all the files have been uploaded
		if (!$allFilesUploaded) {
			$this->view->errorMessage = 'You must select all files to upload';
			$this->view->form = $form;
			return $this->render('show-upload-data');
		} else {

			// Send the files to the integration server
			try {
				$this->integrationServiceModel->uploadData($submission->submissionId, $providerId, $requestedFiles);
			} catch (Exception $e) {
				$this->logger->debug('Error during upload: '.$e);
				$this->view->errorMessage = $e->getMessage();
				return $this->render('show-data-error');
			}

			// Redirect the user to the show plot location page
			// This ensure that the user will not resubmit the data by doing a refresh on the page
			$this->_redirector->gotoUrl('/integration/show-data-page');

		}
	}

	/**
	 * Cancel a data submission.
	 *
	 * @return the HTML view
	 */
	public function cancelDataSubmissionAction() {
		$this->logger->debug('cancelDataSubmissionAction');

		// Desactivate the timeout
		set_time_limit(0);

		// Get the submission  Id
		$submissionId = $this->_getParam("submissionId");

		// Send the cancel request to the integration server
		try {
			$this->integrationServiceModel->cancelDataSubmission($submissionId);
		} catch (Exception $e) {
			$this->logger->debug('Error during upload: '.$e);
			$this->view->errorMessage = $e->getMessage();
			return $this->render('show-data-error');
		}

		// Forward the user to the next step
		$this->_redirector->gotoUrl('/integration/show-data-page');
	}

	/**
	 * Check the submitted data.
	 *
	 * @return a View.
	 */
	public function checkSubmissionAction() {
		$this->logger->debug('checkSubmissionAction');

		// Get the submission  Id
		$submissionId = $this->_getParam("submissionId");

		// Send the cancel request to the integration server
		try {
			$this->integrationServiceModel->checkDataSubmission($submissionId);
		} catch (Exception $e) {
			$this->logger->debug('Error during upload: '.$e);
			$this->view->errorMessage = $e->getMessage();
			return $this->render('show-data-error');
		}

		// Forward the user to the next step
		$submission = $this->submissionModel->getSubmission($submissionId);
		if ($submission->type == 'LOCATION') {
			$this->_redirector->gotoUrl('/integration/show-plot-location-page');
		} else {
			$this->_redirector->gotoUrl('/integration/show-data-page');
		}
	}

	/**
	 * Validate the data.
	 *
	 * @return a View.
	 */
	public function validateDataAction() {
		$this->logger->debug('validateDataAction');

		// Get the submission  Id
		$submissionId = $this->_getParam("submissionId");

		// Send the cancel request to the integration server
		try {
			$this->integrationServiceModel->validateDataSubmission($submissionId);
		} catch (Exception $e) {
			$this->logger->debug('Error during upload: '.$e);
			$this->view->errorMessage = $e->getMessage();
			return $this->render('show-data-error');
		}

		// Forward the user to the next step
		$this->_redirector->gotoUrl('/integration/show-data-page');
	}

	/**
	 * Gets the integration status.
	 *
	 * @param String $servletName the name of the servlet
	 * @return JSON the status of the process
	 */
	private function _getStatus($servletName) {
		$this->logger->debug('getStatusAction');

		// Send the cancel request to the integration server
		try {

			$submissionId = $this->_getParam("submissionId");

			$status = $this->integrationServiceModel->getStatus($submissionId, $servletName);

			// Echo the result as a JSON
			echo '{success:true, status:\''.$status->status.'\', taskName:\''.$status->taskName.'\', currentCount:\''.$status->currentCount.'\', totalCount:\''.$status->totalCount.'\'}';
		} catch (Exception $e) {
			$this->logger->debug('Error during get: '.$e);
			$this->view->errorMessage = $e->getMessage();
			echo '{success:false, errorMsg: \'\'}';
		}

		// No View, we send directly the javascript
		$this->_helper->layout()->disableLayout();
		$this->_helper->viewRenderer->setNoRender();
	}

	/**
	 * Gets the data integration status.
	 */
	public function getDataStatusAction() {
		$this->_getStatus('DataServlet');
	}

	/**
	 * Gets the check status.
	 */
	public function getCheckStatusAction() {
		$this->_getStatus('CheckServlet');
	}

}
