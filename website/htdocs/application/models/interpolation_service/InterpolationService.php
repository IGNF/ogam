<?php
/**
 * © French National Forest Inventory
 * Licensed under EUPL v1.1 (see http://ec.europa.eu/idabc/eupl).
 */
require_once APPLICATION_PATH.'/models/abstract_service/AbstractService.php';

/**
 * This is a model allowing to access the interpolation service via HTTP calls.
 * @package models
 */
class Model_InterpolationService extends Model_AbstractService {

	var $serviceUrl;
	var $logger;

	/**
	 * Class constructor
	 */
	function Model_InterpolationService() {

		// Initialise the service URL
		$configuration = Zend_Registry::get("configuration");
		$this->serviceUrl = $configuration->interpolationService_url;

		// Initialise the logger
		$this->logger = Zend_Registry::get("logger");
	}

	/**
	 * Create a interpolation result.
	 *
	 * @param String $datasetId the dataset identifier
	 * @param String $sqlWhere the FROM/WHERE part of the query
	 * @param String $format the logical name of the table containing the value
	 * @param String the logical name of the column containing the value
	 * @param String $layerName the name of the generated layer
	 * @param String $method the name of the interpolation method
	 * @param Integer $gridSize the size of the interpolation grid (in meters)
	 * @param Integer $maxdist the max distance (in meters)
	 * @return a boolean
	 * @throws Exception if a problem occured on the server side
	 */
	public function interpolateData($datasetId, $sqlWhere, $format, $data, $layerName, $method, $gridSize, $maxdist) {
		$this->logger->debug("interpolateData : ".$datasetId);

		$client = new Zend_Http_Client();
		$client->setUri($this->serviceUrl."InterpolationServlet?action=InterpolateData");
		$client->setConfig(array(
			'maxredirects' => 0,
			'timeout' => 30));

		$client->setParameterPost('SESSION_ID', session_id());
		$client->setParameterPost('DATASET_ID', $datasetId);
		$client->setParameterPost('SQL_WHERE', $sqlWhere);
		$client->setParameterPost('FORMAT', $format);
		$client->setParameterPost('DATA', $data);
		$client->setParameterPost('METHOD', $method);
		$client->setParameterPost('LAYER_NAME', $layerName);
		$client->setParameterPost('GRID_SIZE', $gridSize);
		$client->setParameterPost('MAXDIST', $maxdist);

		$this->logger->debug("HTTP REQUEST : ".$this->serviceUrl."InterpolationServlet?action=InterpolateData");

		$response = $client->request('POST');

		// Check the result status
		if ($response->isError()) {
			$this->logger->debug("Error while creating new interpolation : ".$response->getMessage());
			throw new Exception("Error while creating new interpolation : ".$response->getMessage());
		}

		// Extract the response body
		$body = $response->getBody();
		$this->logger->debug("HTTP RESPONSE : ".$body);

		// Check the response status
		if (strpos($body, "<Status>OK</Status>") === FALSE) {
			// Parse an error message
			$error = $this->parseErrorMessage($body);
			throw new Exception("Error while creating new interpolation : ".$error->errorMessage);
		} else {
			// Parse a valid response
			$value = $this->parseStatusResponse($body);
			return $value;
		}
	}

	/**
	 * Get the status of the interpolation process.
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
