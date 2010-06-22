<?php
/**
 * © French National Forest Inventory
 * Licensed under EUPL v1.1 (see http://ec.europa.eu/idabc/eupl).
 */
require_once 'website/PredefinedRequest.php';

/**
 * This is the PredefinedRequest model.
 * @package models
 */
class Model_PredefinedRequest extends Zend_Db_Table_Abstract {

	var $logger;

	/**
	 * Initialisation
	 */
	public function init() {

		// Initialise the logger
		$this->logger = Zend_Registry::get("logger");
	}

	/**
	 * Create a new predefined request.
	 *
	 * @param PredefinedRequest predefined request
	 */
	public function savePredefinedRequest($predefinedRequest) {
		$db = $this->getAdapter();

		// Save the request
		$req =  " INSERT INTO predefined_request (request_name, schema_code, dataset_id, description )";
		$req .= " VALUES (?, ?, ?, ?)";

		$this->logger->info('savePredefinedRequest : '.$req);

		$query = $db->prepare($req);
		$query->execute(array(
			$predefinedRequest->requestName,
			$predefinedRequest->schemaCode,
			$predefinedRequest->datasetID,
			$predefinedRequest->description));
			
		// Save the request results columns
		$resultColumns = $predefinedRequest->resultsList;
		foreach ($resultColumns as $resultColumn) {
			$req =  " INSERT INTO predefined_request_result_parameter (request_name, format, data )";
			$req .= " VALUES (?, ?, ?)";
	
			$this->logger->info('savePredefinedRequest : '.$req);
	
			$query = $db->prepare($req);
			$query->execute(array(
				$predefinedRequest->requestName,
				$resultColumn->format,
				$resultColumn->data));		
		}
		
		// Save the request results criterias
		$resultCriterias = $predefinedRequest->criteriaList;
		foreach ($resultCriterias as $resultCriteria) {
				$req =  " INSERT INTO predefined_request_criteria_parameter (request_name, format, data, parameter_value )";
				$req .= " VALUES (?, ?, ?, ?)";
		
				$this->logger->info('savePredefinedRequest : '.$req);
		
				$query = $db->prepare($req);
				$query->execute(array(
					$predefinedRequest->requestName,
					$resultCriteria->format,
					$resultCriteria->data,
					$resultCriteria->value));		
		}
					
			
	}

}
