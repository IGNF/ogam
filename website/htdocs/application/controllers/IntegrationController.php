<?php
require_once 'AbstractEforestController.php';
require_once APPLICATION_PATH.'/models/metadata/Metadata.php';
require_once APPLICATION_PATH.'/models/integration_service/IntegrationService.php';
require_once APPLICATION_PATH.'/models/raw_data/Submission.php';
require_once APPLICATION_PATH.'/models/raw_data/Location.php';

/**
 * IntegrationController is the controller that manages the data integration.
 * @package controllers
 */
class IntegrationController extends AbstractEforestController {

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
		$this->metadataModel = new Model_Metadata();
		$this->integrationServiceModel = new Model_IntegrationService();
		$this->submissionModel = new Model_Submission();
		$this->locationModel = new Model_Location();
		
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
		$role = $userSession->role;
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
	 * Build and return the plot location submission form.
	 */
	private function _getPlotLocationSubmissionForm() {

		$form = new Zend_Form();
		$form->setAction($this->baseUrl.'/integration/validate-create-plot-location-submission');
		$form->setMethod('post');

		//
		// Add the country element
		//
		$countryElement = $form->createElement('select', 'COUNTRY_CODE');
		$countryElement->setLabel('Country');
		$countryElement->setRequired(true);

		$userSession = new Zend_Session_Namespace('user');
		$role = $userSession->role;
		$this->logger->debug('role->isEuropeLevel : '.$role->isEuropeLevel);
		if ($role->isEuropeLevel == '1') {
			$countries = $this->metadataModel->getModeFromUnit('COUNTRY_CODE');
			$countryElement->addMultiOptions($countries);
		} else {
			$countries = $this->metadataModel->getMode('COUNTRY_CODE', $userSession->user->countryCode);
			$countryElement->addMultiOptions($countries);
		}
		$countryElement->setValue($userSession->user->countryCode);

		//
		// Add the submit element
		//
		$submitElement = $form->createElement('submit', 'submit');
		$submitElement->setLabel('Submit');

		// Add elements to form:
		$form->addElement($countryElement);
		$form->addElement($submitElement);

		return $form;
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
		$requests = $this->metadataModel->getDatasets();
		$datasetIds = array();
		foreach ($requests as $request) {
			$datasetIds[$request['id']] = $request['label'];
		}
		$requestElement->addMultiOptions($datasetIds);

		//
		// Add the country element:
		//
		$countryElement = $form->createElement('select', 'COUNTRY_CODE');
		$countryElement->setLabel('Country');
		$countryElement->setRequired(true);

		$userSession = new Zend_Session_Namespace('user');
		$role = $userSession->role;
		$this->logger->debug('role->isEuropeLevel : '.$role->isEuropeLevel);
		if ($role->isEuropeLevel == '1') {
			$countries = $this->metadataModel->getModeFromUnit('COUNTRY_CODE');
			$countryElement->addMultiOptions($countries);
		} else {
			$countries = $this->metadataModel->getMode('COUNTRY_CODE', $userSession->user->countryCode);
			$countryElement->addMultiOptions($countries);
		}
		$countryElement->setValue($userSession->user->countryCode);

		//
		// Add the comment element
		//
		$commentElement = $form->createElement('text', 'COMMENT');
		$commentElement->setLabel('Comment');

		//
		// Add the submit element
		//
		$submitElement = $form->createElement('submit', 'submit');
		$submitElement->setLabel('Submit');

		// Add elements to form:
		$form->addElement($requestElement);
		$form->addElement($countryElement);
		$form->addElement($commentElement);
		$form->addElement($submitElement);

		return $form;
	}

	/**
	 * Build and return the plot location upload form.
	 */
	private function _getPlotLocationUploadForm($showDetail = false) {

		$form = new Zend_Form();
		$form->setAction($this->baseUrl.'/integration/validate-upload-plot-location');
		$form->setAttrib('enctype', 'multipart/form-data');
		$form->setMethod('post');

		// Get some infos from the session
		$locationSession = new Zend_Session_Namespace('submission');
		$locationSubmission = $locationSession->location;

		//
		// Add the file selector element
		//
		$fileelement = new Zend_Form_Element_File('LOCATION_FILE');

		$fileelement->setLabel('Upload plot location file:');
		$fieldsDesc = '';
		if ($showDetail) {
			// Get some more informations in the metadata base
			$fields = $this->metadataModel->getFileFields('LOCATION_FILE', $locationSubmission->countryCode);
			$fieldsDesc .= "The expected fields are: ";
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
				$fieldsDesc .= ';&nbsp;</br></br>';
			}
			$fieldsDesc = substr($fieldsDesc, 0, -2).")";
		}

		$fileelement->setDescription($fieldsDesc);
		$fileelement->addDecorator('Description', array('escape' => false));
		$fileelement->addValidator('Count', false, 1); // ensure only 1 file
		$fileelement->addValidator('Size', false, $this->fileMaxSize * 1024 * 1024); // limit to 40 Mo
		//$element->addValidator('Extension', false, 'csv'); // extension should be csv

		//
		// Add the submit element
		//
		$submitElement = $form->createElement('submit', 'submit');
		$submitElement->setLabel('Submit');

		// Add elements to form:
		$form->addElement($fileelement);
		$form->addElement($submitElement);

		return $form;
	}

	/**
	 * Build and return the strata submission form.
	 */
	private function _getStrataSubmissionForm() {

		$form = new Zend_Form();
		$form->setAction($this->baseUrl.'/integration/validate-create-strata-submission');
		$form->setMethod('post');

		//
		// Add the country element
		//
		$countryElement = $form->createElement('select', 'COUNTRY_CODE');
		$countryElement->setLabel('Country');
		$countryElement->setRequired(true);

		$userSession = new Zend_Session_Namespace('user');
		$role = $userSession->role;
		$this->logger->debug('role->isEuropeLevel : '.$role->isEuropeLevel);
		if ($role->isEuropeLevel == '1') {
			$countries = $this->metadataModel->getModeFromUnit('COUNTRY_CODE');
			$countryElement->addMultiOptions($countries);
		} else {
			$countries = $this->metadataModel->getMode('COUNTRY_CODE', $userSession->user->countryCode);
			$countryElement->addMultiOptions($countries);
		}
		$countryElement->setValue($userSession->user->countryCode);

		//
		// Add the submit element
		//
		$submitElement = $form->createElement('submit', 'submit');
		$submitElement->setLabel('Submit');

		// Add elements to form:
		$form->addElement($countryElement);
		$form->addElement($submitElement);

		return $form;
	}

	/**
	 * Build and return the strata upload form.
	 */
	private function _getStrataUploadForm($showDetail = false) {

		$form = new Zend_Form();
		$form->setAction($this->baseUrl.'/integration/validate-upload-strata');
		$form->setAttrib('enctype', 'multipart/form-data');
		$form->setMethod('post');

		// Get some infos from the session
		$strataSession = new Zend_Session_Namespace('submission');
		$strataSubmission = $strataSession->strata;

		//
		// Add the file selector element
		//
		$fileelement = new Zend_Form_Element_File('STRATA_FILE');

		$fileelement->setLabel('Upload strata file:');
		$fieldsDesc = '';
		if ($showDetail) {
			// Get some more informations in the metadata base
			$fields = $this->metadataModel->getFileFields('STRATA_FILE', $strataSubmission->countryCode);
			$fieldsDesc .= "The expected fields are: ";
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
				$fieldsDesc .= ';&nbsp;</br></br>';
			}
			$fieldsDesc = substr($fieldsDesc, 0, -2).")";
		}

		$fileelement->setDescription($fieldsDesc);
		$fileelement->addDecorator('Description', array('escape' => false));
		$fileelement->addValidator('Count', false, 1); // ensure only 1 file
		$fileelement->addValidator('Size', false, $this->fileMaxSize * 1024 * 1000); // limit to 40 Mo

		//
		// Add the submit element
		//
		$submitElement = $form->createElement('submit', 'submit');
		$submitElement->setLabel('Submit');

		// Add elements to form:
		$form->addElement($fileelement);
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

		// Get the list of files to upload for this submission
		$dataSession = new Zend_Session_Namespace('submission');
		$submission = $dataSession->data;

		$this->logger->debug('submissionId : '.$submission->submissionId);

		$dataSubmission = $this->submissionModel->getDataSubmission($submission->submissionId);
		$requestedFiles = $this->metadataModel->getRequestedFiles($dataSubmission->datasetId);

		//
		// For each requested file, add a file upload element
		//
		foreach ($requestedFiles as $requestedFile) {

			$fileelement = new Zend_Form_Element_File($requestedFile->format);

			$fileelement->setLabel('Upload '.$requestedFile->label.': ');
			$fieldsDesc = '';
			if ($showDetail) {
				// Get some more informations in the metadata base
				$fields = $this->metadataModel->getFileFields($requestedFile->format, $submission->countryCode);
				$fieldsDesc .= "The expected fields are: ";
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
					$fieldsDesc .= ';&nbsp;</br></br>';
				}
				$fieldsDesc = substr($fieldsDesc, 0, -2).")";
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
	 * Show the plot location page.
	 *
	 * @return the HTML view
	 */
	public function showPlotLocationPageAction() {
		$this->logger->debug('showPlotLocationPageAction');

		// Get some info about the user
		$userSession = new Zend_Session_Namespace('user');

		// If the user can see all countries ...
		if ($userSession->role->isEuropeLevel == '1') {
			$countryCode = null;
		} else {
			$countryCode = $userSession->user->countryCode;
		}
		$this->logger->debug('countryCode : '.$countryCode);

		// Get the current plot location submissions
		$this->view->submissions = $this->submissionModel->getActiveSubmissions($countryCode, 'LOCATION');

		// Get the countries label
		$countries = $this->metadataModel->getModeFromUnit('COUNTRY_CODE');
		$this->view->countries = $countries;

		return $this->render('show-plot-location-page');
	}

	/**
	 * Show the strata page.
	 *
	 * @return the HTML view
	 */
	public function showStrataPageAction() {
		$this->logger->debug('showStrataPageAction');

		// Get some info about the user
		$userSession = new Zend_Session_Namespace('user');

		// If the user can see all countries ...
		if ($userSession->role->isEuropeLevel == '1') {
			$countryCode = null;
		} else {
			$countryCode = $userSession->user->countryCode;
		}
		$this->logger->debug('countryCode : '.$countryCode);

		// Get the current plot location submissions
		$this->view->submissions = $this->submissionModel->getActiveSubmissions($countryCode, 'STRATA');

		// Get the countries label
		$countries = $this->metadataModel->getModeFromUnit('COUNTRY_CODE');
		$this->view->countries = $countries;

		return $this->render('show-strata-page');
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

		// If the user can see all countries ...
		if ($userSession->role->isEuropeLevel == '1') {
			$countryCode = null;
		} else {
			$countryCode = $userSession->user->countryCode;
		}
		$this->logger->debug('countryCode : '.$countryCode);

		// Get the current data submissions
		$this->view->submissions = $this->submissionModel->getActiveDataSubmissions($countryCode);

		// Get the countries label
		$this->view->countries = $this->metadataModel->getModeFromUnit('COUNTRY_CODE');

		$this->render('show-data-submission-page');
	}

	/**
	 * Show the create plot location submission page.
	 *
	 * @return the HTML view
	 */
	public function showCreatePlotLocationSubmissionAction() {
		$this->logger->debug('showCreatePlotLocationSubmissionAction');

		// If the user cannot see all countries
		// We automatically choose his country and skip to the next page
		$userSession = new Zend_Session_Namespace('user');
		if ($userSession->role->isEuropeLevel != '1') {

			$countryCode = $userSession->user->countryCode;
			$this->logger->debug('showCreatePlotLocationSubmissionAction countryCode : '.$countryCode);
			return $this->validateCreatePlotLocationSubmissionAction($countryCode);

		} else {
			$this->view->form = $this->_getPlotLocationSubmissionForm();

			$this->render('show-create-plot-location-submission');

		}
	}

	/**
	 * Show the create strata submission page.
	 *
	 * @return the HTML view
	 */
	public function showCreateStrataSubmissionAction() {
		$this->logger->debug('showCreateStrataSubmissionAction');

		// If the user cannot see all countries
		// We automatically choose his country and skip to the next page
		$userSession = new Zend_Session_Namespace('user');
		if ($userSession->role->isEuropeLevel != '1') {

			$countryCode = $userSession->user->countryCode;
			$this->logger->debug('showCreateStrataSubmissionAction countryCode : '.$countryCode);
			return $this->validateCreateStrataSubmissionAction($countryCode);

		} else {
			$this->view->form = $this->_getStrataSubmissionForm();

			$this->render('show-create-strata-submission');

		}
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
	 * Show the upload plot location page.
	 *
	 * @return the HTML view
	 */
	public function showUploadPlotLocationAction() {
		$this->logger->debug('showUploadPlotLocationAction');

		$this->view->form = $this->_getPlotLocationUploadForm(true);

		$this->render('show-upload-plot-location');
	}

	/**
	 * Show the upload strata page.
	 *
	 * @return the HTML view
	 */
	public function showUploadStrataAction() {
		$this->logger->debug('showUploadStrataAction');

		$this->view->form = $this->_getStrataUploadForm(true);

		$this->render('show-upload-strata');
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
	 * Validate the create plot location submission page.
	 *
	 * @param String $countryCode The country code
	 * @return the HTML view
	 */
	public function validateCreatePlotLocationSubmissionAction($countryCode = null) {
		$this->logger->debug('validateCreatePlotLocationSubmissionAction');

		// Get the selected country code
		if ($countryCode == null) {

			// Check the validity of the POST
			if (!$this->getRequest()->isPost()) {
				$this->logger->debug('form is not a POST');
				return $this->_forward('index');
			}

			// Check the validity of the From
			$form = $this->_getPlotLocationSubmissionForm();
			if (!$form->isValid($_POST)) {
				$this->logger->debug('form is not valid');
				$this->view->form = $form;
				return $this->render('show-create-plot-location-submission');
			}

			$values = $form->getValues();
			$countryCode = $values['COUNTRY_CODE'];
			$this->logger->debug('countryCode : '.$countryCode);
		}

		// Send the request to the integration server
		try {
			$submissionId = $this->integrationServiceModel->newLocationSubmission($countryCode);
		} catch (Exception $e) {
			$this->logger->debug('Error during upload: '.$e);
			$this->view->errorMessage = $e->getMessage();
			return $this->render('show-plot-location-error');
		}

		// Store the submission information in session
		$locationSubmission = new Submission();
		$locationSubmission->submissionId = $submissionId;
		$locationSubmission->countryCode = $countryCode;
		$locationSession = new Zend_Session_Namespace('submission');
		$locationSession->location = $locationSubmission;

		// Forward the user to the next step
		return $this->showUploadPlotLocationAction();
	}

	/**
	 * Validate the create strata submission page.
	 *
	 * @param String $countryCode The country code
	 * @return the HTML view
	 */
	public function validateCreateStrataSubmissionAction($countryCode = null) {
		$this->logger->debug('validateCreateStrataSubmissionAction');

		// Get the selected country code
		if ($countryCode == null) {

			// Check the validity of the POST
			if (!$this->getRequest()->isPost()) {
				$this->logger->debug('form is not a POST');
				return $this->_forward('index');
			}

			// Check the validity of the From
			$form = $this->_getStrataSubmissionForm();
			if (!$form->isValid($_POST)) {
				$this->logger->debug('form is not valid');
				$this->view->form = $form;
				return $this->render('show-create-strata-submission');
			}

			$values = $form->getValues();
			$countryCode = $values['COUNTRY_CODE'];
			$this->logger->debug('countryCode : '.$countryCode);
		}

		// Send the request to the integration server
		try {
			$submissionId = $this->integrationServiceModel->newStrataSubmission($countryCode);
		} catch (Exception $e) {
			$this->logger->debug('Error during upload: '.$e);
			$this->view->errorMessage = $e->getMessage();
			return $this->render('show-strata-error');
		}

		// Store the submission information in session
		$strataSubmission = new Submission();
		$strataSubmission->submissionId = $submissionId;
		$strataSubmission->countryCode = $countryCode;
		$strataSession = new Zend_Session_Namespace('submission');
		$strataSession->strata = $strataSubmission;

		// Forward the user to the next step
		return $this->showUploadStrataAction();
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

		// Check the validity of the From
		$form = $this->_getDataSubmissionForm();
		if (!$form->isValid($_POST)) {
			$this->logger->debug('form is not valid');
			$this->view->form = $form;
			return $this->render('show-create-data-submission');
		}

		// Get the selected values
		$values = $form->getValues();
		$countryCode = $values['COUNTRY_CODE'];
		$this->logger->debug('countryCode : '.$countryCode);

		$datasetId = $values['DATASET_ID'];
		$comment = $values['COMMENT'];

		$userSession = new Zend_Session_Namespace('user');
		$userLogin = $userSession->user->login;

		$this->logger->debug('userLogin : '.$userLogin);

		// Send the request to the integration server
		try {
			$submissionId = $this->integrationServiceModel->newDataSubmission($countryCode, $datasetId, $comment, $userLogin);
		} catch (Exception $e) {
			$this->logger->debug('Error during upload: '.$e);
			$this->view->errorMessage = $e->getMessage();
			return $this->render('show-data-error');
		}

		// Store the submission information in session
		$dataSubmission = new Submission();
		$dataSubmission->submissionId = $submissionId;
		$dataSubmission->countryCode = $countryCode;
		$dataSession = new Zend_Session_Namespace('submission');
		$dataSession->data = $dataSubmission;

		// Forward the user to the next step
		return $this->showUploadDataAction();
	}

	/**
	 * Validate the upload of a plot location file.
	 *
	 * @return the HTML view
	 */
	public function validateUploadPlotLocationAction() {
		$this->logger->debug('validateUploadPlotLocationAction');

		// Check the validity of the POST
		if (!$this->getRequest()->isPost()) {
			$this->logger->debug('form is not a POST');
			return $this->_forward('index');
		}

		// Check the validity of the Form
		$form = $this->_getPlotLocationUploadForm();
		if (!$form->isValid($_POST)) {
			$this->logger->debug('form is not valid');
			$this->view->form = $form;
			return $this->render('show-upload-plot-location');
		}

		// Upload the files on Server
		$upload = new Zend_File_Transfer_Adapter_Http();
		$upload->receive();

		// Get the file name
		$filename = $upload->getFileName('LOCATION_FILE', false);
		$filepath = $upload->getFileName('LOCATION_FILE');
		$this->logger->debug('filename: '.$filename);
		$this->logger->debug('filepath: '.$filepath);

		if (empty($filename)) {
			$this->view->errorMessage = 'You must select a file to upload';
			$this->view->form = $form;
			$this->render('show-upload-plot-location');
		} else {

			// Get the submission info
			$locationSession = new Zend_Session_Namespace('submission');
			$submission = $locationSession->location;

			// Move the file to the upload directory for archive
			$configuration = Zend_Registry::get("configuration");
			$uploadDir = $configuration->uploadDir;
			$targetName = $uploadDir.DIRECTORY_SEPARATOR.$submission->submissionId.DIRECTORY_SEPARATOR."LOCATION_FILE".DIRECTORY_SEPARATOR.$filename;
			@mkdir($uploadDir.DIRECTORY_SEPARATOR.$submission->submissionId); // create the dir if not available
			@mkdir($uploadDir.DIRECTORY_SEPARATOR.$submission->submissionId.DIRECTORY_SEPARATOR."LOCATION_FILE"); // create the dir if not available
			@rename($filepath, $targetName);

			// Send the file to the integration server
			try {
				$this->integrationServiceModel->uploadPlotLocation($submission->submissionId, $submission->countryCode, $targetName);
			} catch (Exception $e) {
				$this->logger->debug('Error during upload: '.$e);
				$this->view->errorMessage = $e->getMessage();
				return $this->render('show-plot-location-error');
			}

			// Redirect the user to the show plot location page
			// This ensure that the user will not resubmit the data by doing a refresh on the page
			$this->_redirector->gotoUrl('/integration/show-plot-location-page');
		}
	}

	/**
	 * Validate the upload of a strata file.
	 *
	 * @return the HTML view
	 */
	public function validateUploadStrataAction() {
		$this->logger->debug('validateUploadStrataAction');

		// Check the validity of the POST
		if (!$this->getRequest()->isPost()) {
			$this->logger->debug('form is not a POST');
			return $this->_forward('index');
		}

		// Check the validity of the Form
		$form = $this->_getStrataUploadForm();
		if (!$form->isValid($_POST)) {
			$this->logger->debug('form is not valid');
			$this->view->form = $form;
			return $this->render('show-upload-strata');
		}

		// Upload the files on Server
		$upload = new Zend_File_Transfer_Adapter_Http();
		$upload->receive();

		// Get the file name
		$filename = $upload->getFileName('STRATA_FILE', false);
		$filepath = $upload->getFileName('STRATA_FILE');
		$this->logger->debug('filename: '.$filename);
		$this->logger->debug('filepath: '.$filepath);

		if (empty($filename)) {
			$this->view->errorMessage = 'You must select a file to upload';
			$this->view->form = $form;
			$this->render('show-upload-plot-location');
		} else {

			// Get the submission info
			$strataSession = new Zend_Session_Namespace('submission');
			$submission = $strataSession->strata;

			// Move the file to the upload directory for archive
			$configuration = Zend_Registry::get("configuration");
			$uploadDir = $configuration->uploadDir;
			$targetName = $uploadDir.DIRECTORY_SEPARATOR.$submission->submissionId.DIRECTORY_SEPARATOR."STRATA_FILE".DIRECTORY_SEPARATOR.$filename;
			@mkdir($uploadDir.DIRECTORY_SEPARATOR.$submission->submissionId); // create the dir if not available
			@mkdir($uploadDir.DIRECTORY_SEPARATOR.$submission->submissionId.DIRECTORY_SEPARATOR."STRATA_FILE"); // create the dir if not available
			@rename($filepath, $targetName);

			// Send the file to the integration server
			try {
				$this->integrationServiceModel->uploadStrata($submission->submissionId, $submission->countryCode, $targetName);
			} catch (Exception $e) {
				$this->logger->debug('Error during upload: '.$e);
				$this->view->errorMessage = $e->getMessage();
				return $this->render('show-strata-error');
			}

			// Redirect the user to the show plot location page
			// This ensure that the user will not resubmit the data by doing a refresh on the page
			$this->_redirector->gotoUrl('/integration/show-strata-page');
		}
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

		// Get the configuration info
		$configuration = Zend_Registry::get("configuration");
		$uploadDir = $configuration->uploadDir;

		//
		// For each requested file
		//
		$dataSubmission = $this->submissionModel->getDataSubmission($submission->submissionId);
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
				$this->integrationServiceModel->uploadData($submission->submissionId, $submission->countryCode, $requestedFiles);
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
	 * Cancel a plot location submission.
	 *
	 * @return the HTML view
	 */
	public function cancelPlotLocationSubmissionAction() {
		$this->logger->debug('cancelPlotLocationSubmissionAction');

		// Desactivate the timeout
		set_time_limit(0);

		// Get the submission  Id
		$submissionId = $this->_getParam("submissionId");

		// Send the cancel request to the integration server
		try {
			$this->integrationServiceModel->cancelLocationSubmission($submissionId);
		} catch (Exception $e) {
			$this->logger->debug('Error during upload: '.$e);
			$this->view->errorMessage = $e->getMessage();
			return $this->render('show-plot-location-error');
		}

		// Redirect the user to the show plot location page
		// This ensure that the user will not resubmit the data by doing a refresh on the page
		$this->_redirector->gotoUrl('/integration/show-plot-location-page');
	}

	/**
	 * Cancel a strata submission.
	 *
	 * @return the HTML view
	 */
	public function cancelStrataSubmissionAction() {
		$this->logger->debug('cancelStrataSubmissionAction');

		// Desactivate the timeout
		set_time_limit(0);

		// Get the submission  Id
		$submissionId = $this->_getParam("submissionId");

		// Send the cancel request to the integration server
		try {
			$this->integrationServiceModel->cancelStrataSubmission($submissionId);
		} catch (Exception $e) {
			$this->logger->debug('Error during upload: '.$e);
			$this->view->errorMessage = $e->getMessage();
			return $this->render('show-strata-error');
		}

		// Redirect the user to the show plot location page
		// This ensure that the user will not resubmit the data by doing a refresh on the page
		$this->_redirector->gotoUrl('/integration/show-strata-page');
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
	 * Validate plot locations.
	 *
	 * @return a View.
	 */
	public function validatePlotLocationAction() {
		$this->logger->debug('validatePlotLocationAction');

		// Get the submission  Id
		$submissionId = $this->_getParam("submissionId");

		// Send the cancel request to the integration server
		try {
			$this->integrationServiceModel->validatePlotLocation($submissionId);
		} catch (Exception $e) {
			$this->logger->debug('Error during upload: '.$e);
			$this->view->errorMessage = $e->getMessage();
			return $this->render('show-data-error');
		}

		// Forward the user to the next step
		$this->_redirector->gotoUrl('/integration/show-plot-location-page');
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
	 * Gets the strata integration status.
	 */
	public function getStrataStatusAction() {
		$this->_getStatus('StrataServlet');
	}

	/**
	 * Gets the plot location integration status.
	 */
	public function getPlotLocationStatusAction() {
		$this->_getStatus('PlotLocationServlet');
	}

	/**
	 * Gets the check status.
	 */
	public function getCheckStatusAction() {
		$this->_getStatus('CheckServlet');
	}

	/**
	 * Gets the plot location validation status.
	 */
	public function getPlotLocationValidationStatusAction() {
		$this->logger->debug('getPlotLocationValidationStatusAction');

		// Get the submission Id
		$submissionId = $this->_getParam("submissionId");

		// Send the cancel request to the integration server
		try {
			$status = $this->integrationServiceModel->getStatus($submissionId, 'PlotLocationServlet', 'validationStatus');

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
