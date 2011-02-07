<?php
/**
 * © French National Forest Inventory
 * Licensed under EUPL v1.1 (see http://ec.europa.eu/idabc/eupl).
 */
require_once APPLICATION_PATH.'/models/abstract_service/AbstractService.php';

/**
 * This is a model allowing to access the integration service via HTTP calls.
 * @package models
 */
class Model_IntegrationService extends Model_AbstractService {

	var $serviceUrl;
	var $logger;

	/**
	 * Class constructor
	 */
	function Model_IntegrationService() {

		// Initialise the service URL
		$configuration = Zend_Registry::get("configuration");
		$this->serviceUrl = $configuration->integrationService_url;

		// Initialise the logger
		$this->logger = Zend_Registry::get("logger");
	}

	/**
	 * Create a new location submission.
	 *
	 * @param string the country code
	 * @return the generated submissionId
	 * @throws Exception if a problem occured on the server side
	 */
	public function newLocationSubmission($countryCode) {
		$this->logger->debug("newLocationSubmission : ".$countryCode);

		$client = new Zend_Http_Client();
		$client->setUri($this->serviceUrl."PlotLocationServlet?action=NewLocationSubmission");
		$client->setConfig(array(
			'maxredirects' => 0,
			'timeout' => 30));

		$client->setParameterPost('COUNTRY_CODE', $countryCode);

		$this->logger->debug("HTTP REQUEST : ".$this->serviceUrl."PlotLocationServlet?action=NewLocationSubmission");

		$response = $client->request('POST');

		// Check the result status
		if ($response->isError()) {
			$this->logger->debug("Error while creating new location submission : ".$response->getMessage());
			throw new Exception("Error while creating new location submission : ".$response->getMessage());
		}

		// Extract the response body
		$body = $response->getBody();
		$this->logger->debug("HTTP RESPONSE : ".$body);

		// Check the response status
		if (strpos($body, "<Status>OK</Status>") === FALSE) {
			// Parse an error message
			$error = $this->parseErrorMessage($body);
			throw new Exception("Error while creating new location submission : ".$error->errorMessage);
		} else {
			// Parse a valid response
			$value = $this->parseValueResponse($body);
			return $value;
		}
	}

	/**
	 * Create a strara submission.
	 *
	 * @param string the country code
	 * @return the generated submissionId
	 * @throws Exception if a problem occured on the server side
	 */
	public function newStrataSubmission($countryCode) {
		$this->logger->debug("newStrataSubmission : ".$countryCode);

		$client = new Zend_Http_Client();
		$client->setUri($this->serviceUrl."StrataServlet?action=NewStrataSubmission");
		$client->setConfig(array(
			'maxredirects' => 0,
			'timeout' => 30));

		$client->setParameterPost('COUNTRY_CODE', $countryCode);

		$this->logger->debug("HTTP REQUEST : ".$this->serviceUrl."StrataServlet?action=NewStrataSubmission");

		$response = $client->request('POST');

		// Check the result status
		if ($response->isError()) {
			$this->logger->debug("Error while creating new strata submission : ".$response->getMessage());
			throw new Exception("Error while creating new strata submission : ".$response->getMessage());
		}

		// Extract the response body
		$body = $response->getBody();
		$this->logger->debug("HTTP RESPONSE : ".$body);

		// Check the response status
		if (strpos($body, "<Status>OK</Status>") === FALSE) {
			// Parse an error message
			$error = $this->parseErrorMessage($body);
			throw new Exception("Error while creating new strata submission : ".$error->errorMessage);
		} else {
			// Parse a valid response
			$value = $this->parseValueResponse($body);
			return $value;
		}
	}

	/**
	 * Create a new data submission.
	 *
	 * @param String the provider identifier
	 * @param String the dataset identifier
	 * @param String the user login
	 * @return the generated submissionId
	 * @throws Exception if a problem occured on the server side
	 */
	public function newDataSubmission($providerId, $datasetId, $userLogin) {
		$this->logger->debug("newDataSubmission : ".$providerId." ".$datasetId);

		$client = new Zend_Http_Client();
		$client->setUri($this->serviceUrl."DataServlet?action=NewDataSubmission");
		$client->setConfig(array(
			'maxredirects' => 0,
			'timeout' => 30));

		$client->setParameterPost('PROVIDER_ID', $providerId);
		$client->setParameterPost('DATASET_ID', $datasetId);
		$client->setParameterPost('USER_LOGIN', $userLogin);

		$this->logger->debug("HTTP REQUEST : ".$this->serviceUrl."DataServlet?action=NewDataSubmission");

		$response = $client->request('POST');

		// Check the result status
		if ($response->isError()) {
			$this->logger->debug("Error while creating new data submission : ".$response->getMessage());
			throw new Exception("Error while creating new data submission : ".$response->getMessage());
		}

		// Extract the response body
		$body = $response->getBody();
		$this->logger->debug("HTTP RESPONSE : ".$body);

		// Check the response status
		if (strpos($body, "<Status>OK</Status>") === FALSE) {
			// Parse an error message
			$error = $this->parseErrorMessage($body);
			throw new Exception("Error while creating new data submission : ".$error->errorMessage);
		} else {
			// Parse a valid response
			$value = $this->parseValueResponse($body);
			return $value;
		}
	}

	/**
	 * Upload a plot location file.
	 *
	 * @param string the identifier of the submission
	 * @param string the country code
	 * @param string the path of the file to upload
	 * @return true if the upload was OK
	 * @throws Exception if a problem occured on the server side
	 */
	public function uploadPlotLocation($submissionId, $countryCode, $locationFile) {
		$this->logger->debug("uploadPlotLocation : ".$submissionId." - ".$countryCode." - ".$locationFile);

		$client = new Zend_Http_Client();
		$client->setEncType($client->ENC_FORMDATA);
		$client->setUri($this->serviceUrl."PlotLocationServlet?action=UploadLocations");
		$client->setConfig(array(
			'maxredirects' => 0,
			'timeout' => 30));

		$client->setParameterPost('SUBMISSION_ID', $submissionId);
		$client->setParameterPost('COUNTRY_CODE', $countryCode);
		$client->setFileUpload($locationFile, 'LOCATION_FILE');

		$this->logger->debug("HTTP REQUEST : ".$this->serviceUrl."PlotLocationServlet?action=UploadLocations");

		$response = $client->request('POST');

		// Check the result status
		if ($response->isError()) {
			$this->logger->debug("Error while creating new location submission : ".$response->getMessage());
			throw new Exception("Error while creating new location submission : ".$response->getMessage());
		}

		// Extract the response body
		$body = $response->getBody();
		$this->logger->debug("HTTP RESPONSE : ".$body);

		// Check the response status
		if (strpos($body, "<Status>OK</Status>") === FALSE) {
			// Parse an error message
			$error = $this->parseErrorMessage($body);
			throw new Exception("Error while creating new location submission : ".$error->errorMessage);
		} else {
			return true;
		}
	}

	/**
	 * Upload a strata file.
	 *
	 * @param string the identifier of the submission
	 * @param string the country code
	 * @param string the path of the file to upload
	 * @return true if the upload was OK
	 * @throws Exception if a problem occured on the server side
	 */
	public function uploadStrata($submissionId, $countryCode, $strataFile) {
		$this->logger->debug("uploadStrata : ".$submissionId." - ".$countryCode." - ".$strataFile);

		$client = new Zend_Http_Client();
		$client->setEncType($client->ENC_FORMDATA);
		$client->setUri($this->serviceUrl."StrataServlet?action=UploadStrata");
		$client->setConfig(array(
			'maxredirects' => 0,
			'timeout' => 30));

		$client->setParameterPost('SUBMISSION_ID', $submissionId);
		$client->setParameterPost('COUNTRY_CODE', $countryCode);
		$client->setFileUpload($strataFile, 'STRATA_FILE');

		$this->logger->debug("HTTP REQUEST : ".$this->serviceUrl."StrataServlet?action=UploadStrata");

		$response = $client->request('POST');

		// Check the result status
		if ($response->isError()) {
			$this->logger->debug("Error while creating new strata : ".$response->getMessage());
			throw new Exception("Error while creating new strata : ".$response->getMessage());
		}

		// Extract the response body
		$body = $response->getBody();
		$this->logger->debug("HTTP RESPONSE : ".$body);

		// Check the response status
		if (strpos($body, "<Status>OK</Status>") === FALSE) {
			// Parse an error message
			$error = $this->parseErrorMessage($body);
			throw new Exception("Error while creating new strata submission : ".$error->errorMessage);
		} else {
			return true;
		}
	}

	/**
	 * Upload one or more data file.
	 *
	 * @param string the identifier of the submission
	 * @param string the country code
	 * @param Array[RequestFormat] the list of files to upload
	 * @return true if the upload was OK
	 * @throws Exception if a problem occured on the server side
	 */
	public function uploadData($submissionId, $countryCode, $dataFiles) {
		$this->logger->debug("uploadData : ".$submissionId." - ".$countryCode." - ".$dataFiles);

		$client = new Zend_Http_Client();
		$client->setUri($this->serviceUrl."DataServlet?action=UploadData");
		$client->setEncType('multipart/form-data');
		$client->setConfig(array(
			'maxredirects' => 0,
			'timeout' => 30));

		$client->setParameterPost('SUBMISSION_ID', $submissionId);
		$client->setParameterPost('COUNTRY_CODE', $countryCode);
		foreach ($dataFiles as $dataFile) {
			$this->logger->debug("adding file : ".$dataFile->filePath);
			$client->setFileUpload($dataFile->filePath, $dataFile->format);
		}

		$this->logger->debug("HTTP REQUEST : ".$this->serviceUrl."DataServlet?action=UploadData");

		$response = $client->request('POST');

		// Check the result status
		if ($response->isError()) {
			$this->logger->debug("Error while creating new data submission : ".$response->getMessage());
			throw new Exception("Error while creating new data submission : ".$response->getMessage());
		}

		// Extract the response body
		$body = $response->getBody();
		$this->logger->debug("HTTP RESPONSE : ".$body);

		// Check the response status
		if (strpos($body, "<Status>OK</Status>") === FALSE) {
			// Parse an error message
			$error = $this->parseErrorMessage($body);
			throw new Exception("Error while creating new data submission : ".$error->errorMessage);
		} else {
			return true;
		}
	}

	/**
	 * Cancel a location submission.
	 *
	 * @param string the submission identifier
	 * @return true if the cancel was OK
	 * @throws Exception if a problem occured on the server side
	 */
	public function cancelLocationSubmission($submissionId) {
		$this->logger->debug("cancelLocationSubmission : ".$submissionId);

		$client = new Zend_Http_Client();
		$client->setUri($this->serviceUrl."PlotLocationServlet?action=CancelLocationSubmission");
		$client->setConfig(array(
			'maxredirects' => 0,
			'timeout' => 300));

		$client->setParameterPost('SUBMISSION_ID', $submissionId);

		$this->logger->debug("HTTP REQUEST : ".$this->serviceUrl."PlotLocationServlet?action=CancelLocationSubmission");

		$response = $client->request('POST');

		// Check the result status
		if ($response->isError()) {
			$this->logger->debug("Error while cancelling the location submission : ".$response->getMessage());
			throw new Exception("Error while cancelling the location submission : ".$response->getMessage());
		}

		// Extract the response body
		$body = $response->getBody();
		$this->logger->debug("HTTP RESPONSE : ".$body);

		// Check the response status
		if (strpos($body, "<Status>OK</Status>") === FALSE) {
			// Parse an error message
			$error = $this->parseErrorMessage($body);
			throw new Exception("Error while cancelling the location submission : ".$error->errorMessage);
		} else {
			return true;
		}
	}

	/**
	 * Cancel a strata submission.
	 *
	 * @param string the submission identifier
	 * @return true if the cancel was OK
	 * @throws Exception if a problem occured on the server side
	 */
	public function cancelStrataSubmission($submissionId) {
		$this->logger->debug("cancelStrataSubmission : ".$submissionId);

		$client = new Zend_Http_Client();
		$client->setUri($this->serviceUrl."StrataServlet?action=CancelStrataSubmission");
		$client->setConfig(array(
			'maxredirects' => 0,
			'timeout' => 300));

		$client->setParameterPost('SUBMISSION_ID', $submissionId);

		$this->logger->debug("HTTP REQUEST : ".$this->serviceUrl."StrataServlet?action=CancelStrataSubmission");

		$response = $client->request('POST');

		// Check the result status
		if ($response->isError()) {
			$this->logger->debug("Error while cancelling the strata submission : ".$response->getMessage());
			throw new Exception("Error while cancelling the strata submission : ".$response->getMessage());
		}

		// Extract the response body
		$body = $response->getBody();
		$this->logger->debug("HTTP RESPONSE : ".$body);

		// Check the response status
		if (strpos($body, "<Status>OK</Status>") === FALSE) {
			// Parse an error message
			$error = $this->parseErrorMessage($body);
			throw new Exception("Error while cancelling the strata submission : ".$error->errorMessage);
		} else {
			return true;
		}
	}

	/**
	 * Cancel a data submission.
	 *
	 * @param string the submission identifier
	 * @return true if the cancel was OK
	 * @throws Exception if a problem occured on the server side
	 */
	public function cancelDataSubmission($submissionId) {
		$this->logger->debug("cancelDataSubmission : ".$submissionId);

		$client = new Zend_Http_Client();
		$client->setUri($this->serviceUrl."DataServlet?action=CancelDataSubmission");
		$client->setConfig(array(
			'maxredirects' => 0,
			'timeout' => 300));

		$client->setParameterPost('SUBMISSION_ID', $submissionId);

		$this->logger->debug("HTTP REQUEST : ".$this->serviceUrl."DataServlet?action=CancelDataSubmission");

		$response = $client->request('POST');

		// Check the result status
		if ($response->isError()) {
			$this->logger->debug("Error while cancelling the data submission : ".$response->getMessage());
			throw new Exception("Error while cancelling the data submission : ".$response->getMessage());
		}

		// Extract the response body
		$body = $response->getBody();
		$this->logger->debug("HTTP RESPONSE : ".$body);

		// Check the response status
		if (strpos($body, "<Status>OK</Status>") === FALSE) {
			// Parse an error message
			$error = $this->parseErrorMessage($body);
			throw new Exception("Error while cancelling the data submission : ".$error->errorMessage);
		} else {
			return true;
		}
	}

	/**
	 * Validate a data submission.
	 *
	 * @param string the submission identifier
	 * @return true if the validation was OK
	 * @throws Exception if a problem occured on the server side
	 */
	public function validateDataSubmission($submissionId) {
		$this->logger->debug("validateDataSubmission : ".$submissionId);

		$client = new Zend_Http_Client();
		$client->setUri($this->serviceUrl."DataServlet?action=ValidateDataSubmission");
		$client->setConfig(array(
			'maxredirects' => 0,
			'timeout' => 30));

		$client->setParameterPost('SUBMISSION_ID', $submissionId);

		$this->logger->debug("HTTP REQUEST : ".$this->serviceUrl."DataServlet?action=ValidateDataSubmission");

		$response = $client->request('POST');

		// Check the result status
		if ($response->isError()) {
			$this->logger->debug("Error while validating the data submission : ".$response->getMessage());
			throw new Exception("Error while validating the data submission : ".$response->getMessage());
		}

		// Extract the response body
		$body = $response->getBody();
		$this->logger->debug("HTTP RESPONSE : ".$body);

		// Check the response status
		if (strpos($body, "<Status>OK</Status>") === FALSE) {
			// Parse an error message
			$error = $this->parseErrorMessage($body);
			throw new Exception("Error while validating the data submission : ".$error->errorMessage);
		} else {
			return true;
		}
	}

	/**
	 * Validate a plot location submission.
	 *
	 * @param string the submission identifier
	 * @return true if the validation was OK
	 * @throws Exception if a problem occured on the server side
	 */
	public function validatePlotLocation($submissionId) {
		$this->logger->debug("validatePlotLocation : ".$submissionId);

		$client = new Zend_Http_Client();
		$client->setUri($this->serviceUrl."PlotLocationServlet?action=ValidatePlotLocationSubmission");
		$client->setConfig(array(
			'maxredirects' => 0,
			'timeout' => 30));

		$client->setParameterPost('SUBMISSION_ID', $submissionId);

		$this->logger->debug("HTTP REQUEST : ".$this->serviceUrl."PlotLocationServlet?action=ValidatePlotLocationSubmission");

		$response = $client->request('POST');

		// Check the result status
		if ($response->isError()) {
			$this->logger->debug("Error while validating the plot location submission : ".$response->getMessage());
			throw new Exception("Error while validating the plot location submission : ".$response->getMessage());
		}

		// Extract the response body
		$body = $response->getBody();
		$this->logger->debug("HTTP RESPONSE : ".$body);

		// Check the response status
		if (strpos($body, "<Status>OK</Status>") === FALSE) {
			// Parse an error message
			$error = $this->parseErrorMessage($body);
			throw new Exception("Error while validating the data submission : ".$error->errorMessage);
		} else {
			return true;
		}
	}

	/**
	 * Check the data of a submission.
	 *
	 * @param string the submission identifier
	 * @return true if the check was OK
	 * @throws Exception if a problem occured on the server side
	 */
	public function checkDataSubmission($submissionId) {
		$this->logger->debug("checkDataSubmission : ".$submissionId);

		$client = new Zend_Http_Client();
		$client->setUri($this->serviceUrl."CheckServlet?action=check");
		$client->setConfig(array(
			'maxredirects' => 0,
			'timeout' => 30));

		$client->setParameterPost('SUBMISSION_ID', $submissionId);

		$this->logger->debug("HTTP REQUEST : ".$this->serviceUrl."CheckServlet?action=check");

		$response = $client->request('POST');

		// Check the result status
		if ($response->isError()) {
			$this->logger->debug("Error while checking the data submission : ".$response->getMessage());
			throw new Exception("Error while checking the data submission : ".$response->getMessage());
		}

		// Extract the response body
		$body = $response->getBody();
		$this->logger->debug("HTTP RESPONSE : ".$body);

		// Check the response status
		if (strpos($body, "<Status>OK</Status>") === FALSE) {
			// Parse an error message
			$error = $this->parseErrorMessage($body);
			throw new Exception("Error while checking the data submission : ".$error->errorMessage);
		} else {
			return true;
		}
	}

	/**
	 * Launch the get status process.
	 *
	 * @param $submissionId the submission identifier
	 * @param $servletName The name of the servlet to call
	 * @param $actionName The name of the action
	 * @return ProcessStatus the status of the process
	 * @throws Exception if a problem occured on the server side
	 */
	public function getStatus($submissionId, $servletName, $actionName = "status") {
		$this->logger->debug("getStatus : ".$submissionId);

		$client = new Zend_Http_Client();
		$client->setUri($this->serviceUrl.$servletName."?action=".$actionName."&");
		$client->setConfig(array(
			'maxredirects' => 0,
			'timeout' => 30));

		$client->setParameterPost('SUBMISSION_ID', $submissionId);

		$this->logger->debug("HTTP REQUEST : ".$this->serviceUrl.$servletName."?action=".$actionName);

		$response = $client->request('POST');

		// Check the result status
		if ($response->isError()) {
			$this->logger->debug("Error while getting the status : ".$response->getMessage());
			throw new Exception("Error while getting the status : ".$response->getMessage());
		}

		// Extract the response body
		$body = $response->getBody();
		$this->logger->debug("HTTP RESPONSE : ".$body);

		// Check the response status
		if (strpos($body, "<Status>OK</Status>") === FALSE) {
			// Parse an error message
			$error = $this->parseErrorMessage($body);
			throw new Exception("Error while getting the status : ".$error->errorMessage);
		} else {
			return $this->parseStatusResponse($body);
		}
	}
}
