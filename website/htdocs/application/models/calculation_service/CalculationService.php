<?php
/**
 * © French National Forest Inventory 
 * Licensed under EUPL v1.1 (see http://ec.europa.eu/idabc/eupl).
 */ 
require_once APPLICATION_PATH.'/models/abstract_service/AbstractService.php';

/**
 * This is a model allowing to access the calculation service via HTTP calls.
 * @package models
 */
class Model_CalculationService extends Model_AbstractService {

	var $serviceUrl;
	var $logger;

	/**
	 * Class constructor
	 */
	function Model_CalculationService() {

		// Initialise the service URL
		$configuration = Zend_Registry::get("configuration");
		$this->serviceUrl = $configuration->calculationService_url;

		// Initialise the logger
		$this->logger = Zend_Registry::get("logger");
	}

	/**
	 * Launch the calculation on some aggregated data.
	 *
	 * @param String $sessionId the user session identifier (to be stored in the result table)
	 * @param String $datasetId the identifierof the dataset
	 * @param Field $selectedField the value to aggregate
	 * @param Grid $grid the selected grid
	 * @param String $sqlWhere the SQL Query corresponding to the user choice
	 * @throws Exception if a problem occured on the server side
	 */
	public function aggregateData($sessionId, $datasetId, $selectedField, $grid, $sqlWhere) {
		$this->logger->debug("aggregateData : ".$selectedField->data." ".$grid->name);

		$client = new Zend_Http_Client();
		$client->setUri($this->serviceUrl."CalculationServlet?action=AggregateData");
		$client->setConfig(array(
			'maxredirects' => 0,
			'timeout' => 30));

		$client->setParameterPost('SESSION_ID', $sessionId);
		$client->setParameterPost('DATASET_ID', $datasetId);
		$client->setParameterPost('VARIABLE_NAME', $selectedField->data);
		$client->setParameterPost('VARIABLE_FORMAT', $selectedField->format);
		$client->setParameterPost('GRID', $grid->name);
		$client->setParameterPost('SQL', $sqlWhere);

		$this->logger->debug("HTTP REQUEST : ".$this->serviceUrl."CalculationServlet?action=AggregateData");

		$response = $client->request('POST');

		// Check the result status
		if ($response->isError()) {
			$this->logger->debug("Error while aggregating data : ".$response->getMessage());
			throw new Exception("Error while aggregating data : ".$response->getMessage());
		}

		// Extract the response body
		$body = $response->getBody();
		$this->logger->debug("HTTP RESPONSE : ".$body);

		// Check the response status
		if (strpos($body, "<Status>OK</Status>") === FALSE) {
			// Parse an error message
			$error = $this->parseErrorMessage($body);
			throw new Exception("Error while aggregating data : ".$error->errorMessage);
		} else {
			return true;
		}
	}

	/**
	 * Get the status of the calculation process.
	 *
	 * @param $sessionId The user session id.
	 * @param $servletName The name of the servlet to call
	 * @return ProcessStatus the status of the process.
	 * @throws Exception if a problem occured on the server side
	 */
	public function getStatus($sessionId, $servletName) {
		$this->logger->debug("getStatus : ".$sessionId);

		$client = new Zend_Http_Client();
		$client->setUri($this->serviceUrl.$servletName."?action=status");
		$client->setConfig(array(
			'maxredirects' => 0,
			'timeout' => 30));

		$client->setParameterPost('SESSION_ID', $sessionId);

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
