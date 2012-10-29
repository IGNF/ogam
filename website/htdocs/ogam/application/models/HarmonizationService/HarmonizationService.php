<?php
/**
 * © French National Forest Inventory
 * Licensed under EUPL v1.1 (see http://ec.europa.eu/idabc/eupl).
 */

/**
 * This is a model allowing to access the harmonization service via HTTP calls.
 * @package models
 */
class Application_Model_HarmonizationService_HarmonizationService extends Application_Model_AbstractService_AbstractService {

	var $serviceUrl;
	var $logger;

	/**
	 * Class constructor
	 */
	function Application_Model_HarmonizationService_HarmonizationService() {

		// Initialise the service URL
		$configuration = Zend_Registry::get("configuration");
		$this->serviceUrl = $configuration->harmonizationService_url;

		// Initialise the logger
		$this->logger = Zend_Registry::get("logger");
	}

	/**
	 * Launch the harmonization process
	 *
	 * @param String the data provider identifier
	 * @param String the dataset identifier
	 * @return true if the process was OK
	 * @throws Exception if a problem occured on the server side
	 */
	public function harmonizeData($providerId, $datasetId, $removeOnly) {
		$this->logger->debug("harmonizeData : ".$providerId." ".$datasetId);

		$client = new Zend_Http_Client();
		$uri = $this->serviceUrl."HarmonizationServlet?action=HarmonizeData";
		if($removeOnly){
			$uri = $this->serviceUrl."HarmonizationServlet?action=RemoveHarmonizeData";
		}
		$client->setUri($uri);
		$client->setConfig(array(
			'maxredirects' => 0,
			'timeout' => 30));

		$client->setParameterPost('PROVIDER_ID', $providerId);
		$client->setParameterPost('DATASET_ID', $datasetId);

		$this->logger->debug("HTTP REQUEST : ".$uri);

		$response = $client->request('POST');

		// Check the result status
		if ($response->isError()) {
			$this->logger->debug("Error while harmonizing data : ".$response->getMessage());
			throw new Exception("Error while harmonizing data : ".$response->getMessage());
		}

		// Extract the response body
		$body = $response->getBody();
		$this->logger->debug("HTTP RESPONSE : ".$body);

		// Check the response status
		if (strpos($body, "<Status>OK</Status>") === FALSE) {
			// Parse an error message
			$error = $this->parseErrorMessage($body);
			throw new Exception("Error while harmonizing data : ".$error->errorMessage);
		} else {
			return true;
		}
	}

	/**
	 * Get the status of the harmonisation process.
	 *
	 * @param $datasetId The identifier of the dataset
	 * @param $providerId The identifier of the data provider
	 * @param $servletName The name of the servlet to call
	 * @return ProcessStatus the status of the process.
	 * @throws Exception if a problem occured on the server side
	 */
	public function getStatus($datasetId, $providerId, $servletName) {
		$this->logger->debug("getStatus : ".$datasetId);

		$client = new Zend_Http_Client();
		$client->setUri($this->serviceUrl.$servletName."?action=status");
		$client->setConfig(array(
			'maxredirects' => 0,
			'timeout' => 30));

		$client->setParameterPost('DATASET_ID', $datasetId);
		$client->setParameterPost('PROVIDER_ID', $providerId);

		$this->logger->debug("HTTP REQUEST : ".$this->serviceUrl.$servletName."?action=status");

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
