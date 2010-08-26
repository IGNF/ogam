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
		$req = " INSERT INTO predefined_request (request_name, schema_code, dataset_id, definition )";
		$req .= " VALUES (?, ?, ?, ?)";

		$this->logger->info('savePredefinedRequest : '.$req);

		$query = $db->prepare($req);
		$query->execute(array(
			$predefinedRequest->requestName,
			$predefinedRequest->schemaCode,
			$predefinedRequest->datasetID,
			$predefinedRequest->definition));

		// Save the request results columns
		$resultColumns = $predefinedRequest->resultsList;
		foreach ($resultColumns as $resultColumn) {
			$req = " INSERT INTO predefined_request_result (request_name, format, data )";
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
			$req = " INSERT INTO predefined_request_criteria (request_name, format, data, value )";
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

	/**
	 * Increment of one the clicks number
     *
     * @param String the name of the request
	 */
	public function updateClick($requestName) {
        $db = $this->getAdapter();

        // Get the request
        $req = " UPDATE predefined_request SET click = click+1 WHERE request_name = ?";
        
        $this->logger->info('updateClick : '.$req);

        $query = $db->prepare($req);
        $query->execute(array($requestName));
	}
	
	/**
	 * Get a predefined request.
	 *
	 * @param String the name of the request
	 */
	public function getPredefinedRequest($requestName) {
		$db = $this->getAdapter();

		// Get the request
		$req = " SELECT * FROM predefined_request WHERE request_name = ?";

		$this->logger->info('getPredefinedRequest : '.$req);

		$query = $db->prepare($req);
		$query->execute(array($requestName));

		$result = $query->fetch();

		if (empty($result)) {
			throw Exception('Undefined predefined request');
		}

		$request = new PredefinedRequest();
		$request->requestName = $requestName;
		$request->definition = $result['definition'];
		$request->datasetID = $result['dataset_id'];
		$request->schemaCode = $result['schema_code'];

		// Get the request result columns
		$req = " SELECT * FROM predefined_request_result WHERE request_name = ?";

		$query = $db->prepare($req);
		$query->execute(array($requestName));

		$results = $query->fetchAll();
		foreach ($results as $result) {
			$field = new PredefinedField();
			$field->format = $result['format'];
			$field->data = $result['data'];

			$request->resultsList[$field->format.'__'.$field->data] = $field;
		}

		// Get the request result columns
		$req = " SELECT * FROM predefined_request_criteria WHERE request_name = ?";

		$query = $db->prepare($req);
		$query->execute(array($requestName));

		$results = $query->fetchAll();
		foreach ($results as $result) {
			$field = new PredefinedField();
			$field->format = $result['format'];
			$field->data = $result['data'];
			$field->value = $result['value'];

			$request->criteriaList[$field->format.'__'.$field->data] = $field;
		}

		return $request;

	}

	/**
	 * Get a predefined request List.
	 */
	public function getPredefinedRequestList($dir, $sort) {
		$db = $this->getAdapter();

		// Prevent the sql injections
		$columnNames = array('request_name', 'label', 'definition', 'click', 'date', 'criteria_hint', 'group_name', 'dataset_id');
		if (!in_array($sort, $columnNames, true)) {
		    $sort = $columnNames[0];
		}
		$dirs = array(Zend_Db_Select::SQL_ASC, Zend_Db_Select::SQL_DESC);
	    if (!in_array($dir, $dirs, true)) {
            $dir = $dirs[0];
        }

		// Get the request
		$req = " SELECT " . $columnNames[0];
		for($i=1;$i<count($columnNames);$i++){
		    $req .= ', ' . $columnNames[$i];
		}
		$req .= " FROM predefined_request";
		$req .= " JOIN predefined_request_group_asso using(request_name)";
		$req .= " ORDER BY $sort $dir";

		$this->logger->info('getPredefinedRequestList : '.$req);

		$query = $db->prepare($req);
		$query->execute();

		return $query->fetchAll();
	}
	
	/**
	 * Get the criteria of a predefined request.
	 */
	public function getPredefinedRequestCriteria($requestName) {
		$db = $this->getAdapter();

		// Get the request
		$req = " SELECT  format || '__' || data as name, format, data, value, fixed, input_type, type, data.label, data.definition";
		$req .= " FROM predefined_request_criteria";
		$req .= " JOIN form_field using (data, format)";
		$req .= " JOIN data using (data)";
		$req .= " JOIN unit using (unit)";
		$req .= " WHERE request_name = ?";

		$this->logger->info('getPredefinedRequestCriteria : '.$req);

		$query = $db->prepare($req);
		$query->execute(array($requestName));

		return $query->fetchAll();
	}
}
