<?php
/**
 * © French National Forest Inventory
 * Licensed under EUPL v1.1 (see http://ec.europa.eu/idabc/eupl).
 */
//require_once 'website/PredefinedRequest.php';

/**
 * This is the PredefinedRequest model.
 * @package models
 */
class Application_Model_DbTable_Website_PredefinedRequest extends Zend_Db_Table_Abstract {

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
	 * Get a predefined request.
	 *
	 * @param String $requestName the name of the request
	 * @return PredefinedRequest the request
	 * @throws an exception if the request is not found
	 */
	public function getPredefinedRequest($requestName) {
		$db = $this->getAdapter();

		// Get the request
		$req = " SELECT pr.request_name, ";
		$req .= "       pr.label as label, ";
		$req .= "       pr.definition as definition, ";
		$req .= "       pr.date, ";
		$req .= "       pr.schema_code, ";
		$req .= "       pr.dataset_id, ";
		$req .= "       prga.position, ";
		$req .= "       prg.group_name as group_name, ";
		$req .= "       prg.label as group_label, ";
		$req .= "       prg.position as group_position, ";
		$req .= "       dataset.label as dataset_label";
		$req .= " FROM predefined_request pr ";
		$req .= " JOIN predefined_request_group_asso prga using (request_name)";
		$req .= " JOIN predefined_request_group prg using (group_name)";
		$req .= " LEFT JOIN dataset on (pr.dataset_id = dataset.dataset_id)";
		$req .= " WHERE pr.request_name = ?";

		$this->logger->info('getPredefinedRequest : '.$req);

		$query = $db->prepare($req);
		$query->execute(array($requestName));

		$result = $query->fetch();

		if (empty($result)) {
			throw Exception('Undefined predefined request');
		}

		$request = new Application_Model_Website_PredefinedRequest();
		$request->requestName = $result['request_name'];
		$request->schemaCode = $result['schema_code'];
		$request->datasetID = $result['dataset_id'];
		$request->definition = $result['definition'];
		$request->label = $result['label'];
		$request->date = $result['date'];
		$request->position = $result['position'];
		$request->groupName = $result['group_name'];
		$request->groupLabel = $result['group_label'];
		$request->groupPosition = $result['group_position'];
		$request->datasetLabel = $result['dataset_label'];

		// Get the request result columns
		$req = " SELECT * FROM predefined_request_result WHERE request_name = ?";

		$query = $db->prepare($req);
		$query->execute(array($requestName));

		$results = $query->fetchAll();
		foreach ($results as $result) {
			$field = new Application_Model_Website_PredefinedField();
			$field->format = $result['format'];
			$field->data = $result['data'];

			$request->resultsList[$field->format.'__'.$field->data] = $field;
		}

		// Get the request result columns
		$request->criteriaList = $this->getPredefinedRequestCriteria($requestName);

		return $request;

	}

	/**
	 * Get the list of predefined request (only the description, not the detailed fields and criteria).
	 *
	 * @param String $schema the database schema
	 * @param String $dir the direction of sorting (ASC or DESC)
	 * @param String $sort the sort column
	 * @return Array[PredefinedRequest] the list of requests
	 */
	public function getPredefinedRequestList($schema, $dir, $sort) {
		$db = $this->getAdapter();

		// Prevent the sql injections
		$columnNames = array('request_name', 'label', 'definition', 'date', 'position', 'group_name', 'group_label', 'group_position', 'dataset_id', 'dataset_name');
		if (!in_array($sort, $columnNames, true)) {
			$sort = $columnNames[0];
		}
		$dirs = array(Zend_Db_Select::SQL_ASC, Zend_Db_Select::SQL_DESC);
		if (!in_array($dir, $dirs, true)) {
			$dir = $dirs[0];
		}

		// Get the request
		$req = " SELECT pr.request_name, ";
		$req .= "       pr.label as label, ";
		$req .= "       pr.definition as definition, ";
		$req .= "       pr.date, ";
		$req .= "       pr.schema_code, ";
		$req .= "       pr.dataset_id, ";
		$req .= "       prga.position, ";
		$req .= "       prg.group_name as group_name, ";
		$req .= "       prg.label as group_label, ";
		$req .= "       prg.position as group_position, ";
		$req .= "       dataset.label as dataset_label";
		$req .= " FROM predefined_request pr ";
		$req .= " JOIN predefined_request_group_asso prga using (request_name)";
		$req .= " JOIN predefined_request_group prg using (group_name)";
		$req .= " LEFT JOIN dataset on (pr.dataset_id = dataset.dataset_id)";
		$req .= " WHERE pr.schema_code = '".$schema."'";
		$req .= " ORDER BY ".$sort." ".$dir;

		$this->logger->info('getPredefinedRequestList : '.$req);

		$query = $db->prepare($req);
		$query->execute();

		$requestList = array();
		$results = $query->fetchAll();
		foreach ($results as $result) {
			$request = new Application_Model_Website_PredefinedRequest();
			$request->requestName = $result['request_name'];
			$request->schemaCode = $result['schema_code'];
			$request->datasetID = $result['dataset_id'];
			$request->definition = $result['definition'];
			$request->label = $result['label'];
			$request->date = $result['date'];
			$request->position = $result['position'];
			$request->groupName = $result['group_name'];
			$request->groupLabel = $result['group_label'];
			$request->groupPosition = $result['group_position'];
			$request->datasetLabel = $result['dataset_label'];

			$requestList[$request->requestName] = $request;
		}

		return $requestList;
	}

	/**
	 * Get the criteria of a predefined request.
	 *
	 * @param String $requestName the name of the request
	 * @return Array[PredefinedField] The list of request criterias
	 */
	public function getPredefinedRequestCriteria($requestName) {
		$db = $this->getAdapter();

		// Get the request
		$req = " SELECT format, data, value, fixed, input_type, type, subtype, data.unit, data.label, data.definition";
		$req .= " FROM predefined_request_criteria";
		$req .= " JOIN form_field using (data, format)";
		$req .= " JOIN data using (data)";
		$req .= " JOIN unit using (unit)";
		$req .= " WHERE request_name = ?";

		$this->logger->info('getPredefinedRequestCriteria : '.$req);

		$query = $db->prepare($req);
		$query->execute(array($requestName));

		$criteriaList = array();
		$results = $query->fetchAll();
		foreach ($results as $result) {
			$field = new Application_Model_Website_PredefinedField();
			$field->format = $result['format'];
			$field->data = $result['data'];
			$field->unit = $result['unit'];
			$field->value = $result['value'];
			$field->fixed = $result['fixed'];
			$field->inputType = $result['input_type'];
			$field->type = $result['type'];
			$field->subtype = $result['subtype'];
			$field->label = $result['label'];
			$field->definition = $result['definition'];

			$criteriaList[$field->format.'__'.$field->data] = $field;
		}

		return $criteriaList;
	}
}
