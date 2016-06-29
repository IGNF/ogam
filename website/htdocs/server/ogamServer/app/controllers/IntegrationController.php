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
 * IntegrationController is the controller that manages the data integration.
 *
 * @package Application_Controller
 */
class IntegrationController extends AbstractOGAMController {

	/**
	 * Redirector Helper.
	 *
	 * @var Zend_Controller_Action_Helper_Redirector
	 */
	protected $_redirector = null;

	/**
	 * Initialise the controler.
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
		$this->metadataModel = new Application_Model_Metadata_Metadata();
		$this->integrationServiceModel = new Application_Model_IntegrationService_IntegrationService();
		$this->submissionModel = new Application_Model_RawData_Submission();

		$configuration = Zend_Registry::get("configuration");
		$this->fileMaxSize = $configuration->getConfig('fileMaxSize', '100');
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
		if (empty($user) || !$user->isAllowed('DATA_INTEGRATION')) {
			throw new Zend_Auth_Exception('Permission denied for right : DATA_INTEGRATION');
		}
	}

	/**
	 * The "index" action is the default action for all controllers.
	 */
	public function indexAction() {
		$this->logger->debug('Data integration index');

		$this->showDataSubmissionPageAction();
	}

	/**
	 * Build and return the data submission form.
	 */
	private function _getDataSubmissionForm() {
		$form = new Application_Form_OGAMForm(array(
			'attribs' => array(
				'name' => ' data-submission-form',
				'action' => $this->baseUrl . '/integration/validate-create-data-submission'
			)
		));

		//
		// Add the dataset element
		//
		$requestElement = $form->createElement('select', 'DATASET_ID');
		$requestElement->setLabel('Dataset');
		$requestElement->setRequired(true);
		$datasets = $this->metadataModel->getDatasetsForUpload();
		$datasetIds = array();
		foreach ($datasets as $dataset) {
			$datasetIds[$dataset->id] = $dataset->label;
			if ($dataset->isDefault === '1') {
				$requestElement->setValue($dataset->id);
			}
		}
		$requestElement->setDisableTranslator(true);
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
	 *
	 * @param bool $showDetail
	 *        	show the list of expected fields in the form (description)
	 * @param bool $model
	 *        	link to a CSV model file
	 * @return Application_Form_OGAMForm
	 * @throws Zend_Form_Exception
	 */
	private function _getDataUploadForm($showDetail = false, $model = false) {
		$form = new Application_Form_OGAMForm(array(
			'attribs' => array(
				'name' => 'data-upload-form',
				'action' => $this->baseUrl . '/integration/validate-upload-data',
				'enctype' => 'multipart/form-data'
			)
		));

		// Get the submission Id from the session
		$dataSession = new Zend_Session_Namespace('submission');
		$submissionId = $dataSession->data->submissionId;

		$this->logger->debug('submissionId : ' . $submissionId);

		// Get the submission object from the database
		$submission = $this->submissionModel->getSubmission($submissionId);
		$requestedFiles = $this->metadataModel->getRequestedFiles($submission->datasetId);

		//
		// For each requested file, add a file upload element
		//
		foreach ($requestedFiles as $requestedFile) {

			$fileelement = $form->createElement('file', $requestedFile->format);

			$fileelement->setLabel($this->translator->translate($requestedFile->label . ': '));

			$fieldsDesc = '';

			// Show a link to dowload a model CSV file (header line with the names of the fields)
			if ($model) {
				$link = $this->_helper->url('export-file-model', 'integration', '') . '?fileFormat=' . $requestedFile->format;
				$icon = "<img src='/img/icon-csv.png'>";
				$anchor = $this->translator->translate('Download a file model for') . ' ' . $requestedFile->label;
				$fieldsDesc .= "<p class='align_images'>" . $icon . "<a href='" . $link . "'>" . $anchor . "</a></p>";
			}

			if ($showDetail) {
				// Get some more informations in the metadata base
				$fields = $this->metadataModel->getFileFields($requestedFile->format);
				$fieldsDesc .= '<span class="hint-title">';
				$fieldsDesc .= $this->translator->translate('The expected fields are:<br/>');
				$fieldsDesc .= '</span>';
				foreach ($fields as $field) {
					$fieldsDesc .= '<span title="';
					$fieldsDesc .= $field->definition; // the tooltip
					if (!empty($field->mask)) {
						$fieldsDesc .= ' : format = ' . $field->mask;
					}
					$fieldsDesc .= '"';
					if ($field->isMandatory == 1) {
						$fieldsDesc .= ' class="mandatory_field"';
					}
					$fieldsDesc .= '>';
					$fieldsDesc .= $field->label;
					if ($field->isMandatory == 1) {
						$fieldsDesc .= ' *';
					}

					$fieldsDesc .= '</span>';
					$fieldsDesc .= ';&nbsp;<br/>';
				}
				$fieldsDesc = substr($fieldsDesc, 0, -12); // remove last comma
			}

			$fileelement->setDescription($fieldsDesc);
			$fileelement->setDisableTranslator(true); // disable translation to avoid the file name translation
			$fileelement->addDecorator('Description', array(
				'escape' => false
			));
			$fileelement->addValidator('Count', false, 1); // ensure only 1 file
			$fileelement->addValidator('Size', false, $this->fileMaxSize * 1024 * 1000); // limit to 40 Mo
			                                                                             // $element->addValidator('Extension', false, 'csv'); // extension should be csv

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
	public function showDataSubmissionPageAction() {
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

		// Get the parameters from configuration file
		$configuration = Zend_Registry::get("configuration");

		$showDetail = ($configuration->getConfig('showUploadFileDetail', true) == 1);
		$showModel = ($configuration->getConfig('showUploadFileModel', true) == 1);

		$this->logger->debug('$showDetail : ' . $showDetail);

		// Get the submission object from the database, and the dataset id and name
		$dataSession = new Zend_Session_Namespace('submission');
		$submissionId = $dataSession->data->submissionId;
		$submission = $this->submissionModel->getSubmission($submissionId);
		$dataset = $this->metadataModel->getDataset($submission->datasetId);

		$this->view->dataset = $dataset;

		$this->view->form = $this->_getDataUploadForm($showDetail, $showModel);

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
		$providerId = $userSession->user->provider->id;
		$this->logger->debug('userLogin : ' . $userLogin);
		$this->logger->debug('providerId : ' . $providerId);

		// Send the request to the integration server
		try {
			$submissionId = $this->integrationServiceModel->newDataSubmission($providerId, $datasetId, $userLogin);
		} catch (Exception $e) {
			$this->logger->err('Error during upload: ' . $e);
			$this->view->errorMessage = $e->getMessage();
			return $this->render('show-data-error');
		}

		// Store the submission information in session
		$dataSubmission = new Application_Object_RawData_Submission();
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
			$this->logger->err('form is not a POST');
			return $this->_forward('index');
		}

		// Check the validity of the Form
		$form = $this->_getDataUploadForm();
		if (!$form->isValid($_POST)) {
			$this->logger->err('form is not valid');
			$this->view->form = $form;
			return $this->render('show-upload-data');
		}

		// Upload the files on Server
		$options = array(
			'ignoreNoFile' => TRUE
		);
		$upload = new Zend_File_Transfer_Adapter_Http();
		$upload->setOptions($options);

		if (!$upload->receive()) {
			$messages = $upload->getMessages();
			$this->logger->err('Download errors : ' . print_r($messages, true));
		}

		// Get the submission info
		$dataSession = new Zend_Session_Namespace('submission');
		$submission = $dataSession->data;

		// Get the user info
		$userSession = new Zend_Session_Namespace('user');
		$providerId = $userSession->user->provider->id;

		// Get the configuration info
		$configuration = Zend_Registry::get("configuration");
		$uploadDir = $configuration->getConfig('uploadDir', '/var/www/html/upload/');

		//
		// For each requested file
		//
		$dataSubmission = $this->submissionModel->getSubmission($submission->submissionId);
		$requestedFiles = $this->metadataModel->getRequestedFiles($dataSubmission->datasetId);

		foreach ($requestedFiles as $key => $requestedFile) {

			// Get the uploaded filename
			$filename = $upload->getFileName($requestedFile->format, false);
			$filepath = $upload->getFileName($requestedFile->format);

			$this->logger->debug('filepath ' . $filepath);

			// Print it only if it is not an array (ie: nothing has been selected by the user)
			if (!is_array($filename)) {
				$this->logger->debug('uploaded filename ' . $filename);
			}

			// Check that the file is present
			if (empty($filename)) {
				$this->logger->debug('File ' . $requestedFile->format . ' is missing, skipping');
				unset($requestedFiles[$key]);
			} else {
				// Move the file to the upload directory on the php server
				$this->logger->debug('move file : ' . $filename);
				$targetPath = $uploadDir . DIRECTORY_SEPARATOR . $submission->submissionId . DIRECTORY_SEPARATOR . $requestedFile->fileType;
				$targetName = $targetPath . DIRECTORY_SEPARATOR . $filename;
				@mkdir($uploadDir . DIRECTORY_SEPARATOR . $submission->submissionId); // create the submission dir
				@mkdir($targetPath);
				@rename($filepath, $targetName);

				$this->logger->debug('renamed to ' . $targetName);
				$requestedFile->filePath = $targetName;
			}
		}

		// Send the files to the integration server
		try {
			$this->integrationServiceModel->uploadData($submission->submissionId, $providerId, $requestedFiles);
		} catch (Exception $e) {
			$this->logger->err('Error during upload: ' . $e);
			$this->view->errorMessage = $e->getMessage();
			return $this->render('show-data-error');
		}

		// Redirect the user to the show plot location page
		// This ensure that the user will not resubmit the data by doing a refresh on the page
		$this->_redirector->gotoUrl('/integration/show-data-submission-page');
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

		// Get the submission Id
		$submissionId = $this->_getParam("submissionId");

		// Send the cancel request to the integration server
		try {
			$this->integrationServiceModel->cancelDataSubmission($submissionId);
		} catch (Exception $e) {
			$this->logger->err('Error during upload: ' . $e);
			$this->view->errorMessage = $e->getMessage();
			return $this->render('show-data-error');
		}

		// Forward the user to the next step
		$this->_redirector->gotoUrl('/integration/show-data-submission-page');
	}

	/**
	 * Check the submitted data.
	 *
	 * @return a View.
	 */
	public function checkSubmissionAction() {
		$this->logger->debug('checkSubmissionAction');

		// Get the submission Id
		$submissionId = $this->_getParam("submissionId");

		// Send the cancel request to the integration server
		try {
			$this->integrationServiceModel->checkDataSubmission($submissionId);
		} catch (Exception $e) {
			$this->logger->err('Error during upload: ' . $e);
			$this->view->errorMessage = $e->getMessage();
			return $this->render('show-data-error');
		}

		// Forward the user to the next step
		$submission = $this->submissionModel->getSubmission($submissionId);
		$this->_redirector->gotoUrl('/integration/show-data-submission-page');
	}

	/**
	 * Validate the data.
	 *
	 * @return a View.
	 */
	public function validateDataAction() {
		$this->logger->debug('validateDataAction');

		// Get the submission Id
		$submissionId = $this->_getParam("submissionId");

		// Send the cancel request to the integration server
		try {
			$this->integrationServiceModel->validateDataSubmission($submissionId);
		} catch (Exception $e) {
			$this->logger->err('Error during upload: ' . $e);
			$this->view->errorMessage = $e->getMessage();
			return $this->render('show-data-error');
		}

		// Forward the user to the next step
		$this->_redirector->gotoUrl('/integration/show-data-submission-page');
	}

	/**
	 * Gets the integration status.
	 *
	 * @param String $servletName
	 *        	the name of the servlet
	 * @return JSON the status of the process
	 */
	private function _getStatus($servletName) {
		$this->logger->debug('getStatusAction');

		// Send the cancel request to the integration server
		try {

			$submissionId = $this->_getParam("submissionId");

			$status = $this->integrationServiceModel->getStatus($submissionId, $servletName);

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

	/**
	 * Generate a CSV file, model for import files,
	 * with as first line (commented), the names of the expected fields, with mandatory fields (*) and date formats.
	 * Param : file format
	 *
	 * @throws Zend_Exception
	 */
	public function exportFileModelAction() {

		// TODO : add a permission for this action ?

		// -- Get the file
		$fileFormat = $this->_getParam("fileFormat");
		$datasetFile = $this->metadataModel->getFileFormat($fileFormat);

		// -- Get file infos and fields - ordered by position
		$fieldNames = array();

		$fields = $this->metadataModel->getFileFields($fileFormat);
		foreach ($fields as $field) {
			$fieldNames[] = $field->label . ((!empty($field->mask)) ? ' (' . $field->mask . ') ' : '') . (($field->isMandatory == 1) ? ' *' : '');
		}

		// -- Comment this line
		$fieldNames[0] = '// ' . $fieldNames[0];

		// -- Export results to a CSV file

		$configuration = Zend_Registry::get("configuration");
		$charset = $configuration->getConfig('csvExportCharset', 'UTF-8');

		// Define the header of the response
		$this->getResponse()->setHeader('Content-Type', 'text/csv;charset=' . $charset . ';application/force-download;', true);
		$this->getResponse()->setHeader('Content-disposition', 'attachment; filename=CSV_Model_' . $datasetFile->label . '_' . date('dmy_Hi') . '.csv', true);

		// Prepend the Byte Order Mask to inform Excel that the file is in UTF-8
		if ($charset == 'UTF-8') {
			echo (chr(0xEF));
			echo (chr(0xBB));
			echo (chr(0xBF));
		}

		// Opens the standard output as a file flux
		$out = fopen('php://output', 'w');
		fputcsv($out, $fieldNames, ';');
		fclose($out);

		$this->_helper->layout()->disableLayout();
		$this->_helper->viewRenderer->setNoRender();
	}
}
