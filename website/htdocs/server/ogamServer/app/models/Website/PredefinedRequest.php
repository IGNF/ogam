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

/**
 * This is the PredefinedRequest model.
 *
 * @package Application_Model
 * @subpackage Website
 */
class Application_Model_Website_PredefinedRequest extends Zend_Db_Table_Abstract {

	/**
	 * The logger.
	 *
	 * @var Zend_Log
	 */
	var $logger;

	/**
	 * Initialisation.
	 */
	public function init() {

		// Initialise the logger
		$this->logger = Zend_Registry::get("logger");

		$translate = Zend_Registry::get('Zend_Translate');
		$this->lang = strtoupper($translate->getAdapter()->getLocale());
	}

	/**
	 * Create a new predefined request result field.
	 *
	 * @param String $requestName
	 *        	The requet name
	 * @param Application_Object_Website_PredefinedField $resultColumn
	 *        	The result field
	 */
	private function _savePredefinedRequestResult($requestName, $resultColumn) {
		$db = $this->getAdapter();

		$req = " INSERT INTO predefined_request_result (request_name, format, data )";
		$req .= " VALUES (?, ?, ?)";

		$this->logger->info('_savePredefinedRequestResult : ' . $req);

		$query = $db->prepare($req);
		$query->execute(array(
			$requestName,
			$resultColumn->format,
			$resultColumn->data
		));
	}

	/**
	 * Create a new predefined request.
	 *
	 * @param String $requestName
	 *        	The requet name
	 * @param Application_Object_Website_PredefinedField $criteriaColumn
	 *        	The criteria field
	 */
	private function _savePredefinedRequestCriteria($requestName, $criteriaColumn) {
		$db = $this->getAdapter();

		$req = " INSERT INTO predefined_request_criteria (request_name, format, data, value, fixed )";
		$req .= " VALUES (?, ?, ?, ?, ?)";

		$this->logger->info('_savePredefinedRequestCriteria : ' . $req);

		$query = $db->prepare($req);
		$query->execute(array(
			$requestName,
			$criteriaColumn->format,
			$criteriaColumn->data,
			$criteriaColumn->value,
			$criteriaColumn->fixed
		));
	}

	/**
	 * Create a new predefined request.
	 *
	 * @param PredefinedRequest $predefinedRequest
	 *        	the predefined request
	 */
	public function savePredefinedRequest($predefinedRequest) {
		$db = $this->getAdapter();

		// Save the request
		$req = " INSERT INTO predefined_request (request_name, schema_code, dataset_id, definition, label)";
		$req .= " VALUES (?, ?, ?, ?, ?)";

		$this->logger->info('savePredefinedRequest : ' . $req);

		$query = $db->prepare($req);
		$query->execute(array(
			$predefinedRequest->requestName,
			$predefinedRequest->schemaCode,
			$predefinedRequest->datasetID,
			$predefinedRequest->definition,
			$predefinedRequest->label
		));

		// Save the request results columns
		$resultFieldsList = $predefinedRequest->resultsList;
		foreach ($resultFieldsList as $resultField) {
			$this->_savePredefinedRequestResult($predefinedRequest->requestName, $resultField);
		}

		// Save the request results criterias
		$criteriaFieldsList = $predefinedRequest->criteriaList;
		foreach ($criteriaFieldsList as $criteriaField) {
			$this->_savePredefinedRequestCriteria($predefinedRequest->requestName, $criteriaField);
		}
	}

	/**
	 * Get a predefined request.
	 *
	 * @param String $requestName
	 *        	the name of the request
	 * @return PredefinedRequest the request
	 */
	public function getPredefinedRequest($requestName) {
		$db = $this->getAdapter();

		// Get the request
		$req = " SELECT pr.request_name, ";
		$req .= "       COALESCE(t.label, pr.label) as label, ";
		$req .= "       COALESCE(t.definition, pr.definition) as definition, ";
		$req .= "       pr.date, ";
		$req .= "       pr.schema_code, ";
		$req .= "       pr.dataset_id, ";
		$req .= "       prga.position, ";
		$req .= "       prg.group_name as group_name, ";
		$req .= "       prg.label as group_label, ";
		$req .= "       prg.position as group_position, ";
		$req .= "       dataset.label as dataset_label";
		$req .= " FROM predefined_request pr ";
		$req .= " LEFT JOIN predefined_request_group_asso prga using (request_name)";
		$req .= " LEFT JOIN predefined_request_group prg using (group_name)";
		$req .= " LEFT JOIN dataset on (pr.dataset_id = dataset.dataset_id)";
		$req .= " LEFT JOIN translation t ON (lang = '" . $this->lang . "' AND table_format = 'PREDEFINED_REQUEST' AND row_pk = pr.request_name) ";
		$req .= " WHERE pr.request_name = ?";

		$this->logger->info('getPredefinedRequest : ' . $req);

		$query = $db->prepare($req);
		$query->execute(array(
			$requestName
		));

		$result = $query->fetch();

		if (empty($result)) {
			return null;
		}

		$request = new Application_Object_Website_PredefinedRequest();
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
		$request->resultsList = $this->getPredefinedRequestResults($requestName);

		// Get the request criteria columns
		$request->criteriaList = $this->getPredefinedRequestCriteria($requestName);

		return $request;
	}

	/**
	 * Get the list of predefined request (only the description, not the detailed fields and criteria).
	 *
	 * @param String $schema
	 *        	the database schema
	 * @param String $dir
	 *        	the direction of sorting (ASC or DESC)
	 * @param String $sort
	 *        	the sort column
	 * @return Array[PredefinedRequest] the list of requests
	 */
	public function getPredefinedRequestList($schema = 'RAW_DATA', $dir = 'ASC', $sort = 'request_name') {
		$db = $this->getAdapter();

		// Prevent the sql injections
		$columnNames = array(
			'request_name',
			'label',
			'definition',
			'date',
			'position',
			'group_name',
			'group_label',
			'group_position',
			'dataset_id',
			'dataset_name'
		);
		if (!in_array($sort, $columnNames, true)) {
			$sort = $columnNames[0];
		}
		$dirs = array(
			Zend_Db_Select::SQL_ASC,
			Zend_Db_Select::SQL_DESC
		);
		if (!in_array($dir, $dirs, true)) {
			$dir = $dirs[0];
		}

		// Get the request
		$req = " SELECT pr.request_name, ";
		$req .= "       COALESCE(t.label, pr.label) as label, ";
		$req .= "       COALESCE(t.definition, pr.definition) as definition, ";
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
		$req .= " LEFT JOIN translation t ON (lang = '" . $this->lang . "' AND table_format = 'PREDEFINED_REQUEST' AND row_pk = pr.request_name) ";
		$req .= " WHERE pr.schema_code = '" . $schema . "'";
		$req .= " ORDER BY " . $sort . " " . $dir;

		$this->logger->info('getPredefinedRequestList : ' . $req);

		$query = $db->prepare($req);
		$query->execute();

		$requestList = array();
		$results = $query->fetchAll();
		foreach ($results as $result) {
			$request = new Application_Object_Website_PredefinedRequest();
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
	 * Get the results of a predefined request.
	 *
	 * @param String $requestName
	 *        	the name of the request
	 * @return Array[PredefinedField] The list of request criterias
	 */
	public function getPredefinedRequestResults($requestName) {
		$db = $this->getAdapter();

		// Get the request result columns
		$req = " SELECT * ";
		$req .= " FROM predefined_request_result ";
		$req .= " WHERE request_name = ?";

		$query = $db->prepare($req);
		$query->execute(array(
			$requestName
		));

		$resultsList = array();
		$results = $query->fetchAll();
		foreach ($results as $result) {
			$field = new Application_Object_Website_PredefinedField();
			$field->format = $result['format'];
			$field->data = $result['data'];

			$resultsList[$field->getName()] = $field;
		}

		return $resultsList;
	}

	/**
	 * Get the criteria of a predefined request.
	 *
	 * @param String $requestName
	 *        	the name of the request
	 * @return Array[PredefinedField] The list of request criterias
	 */
	public function getPredefinedRequestCriteria($requestName) {
		$db = $this->getAdapter();

		// Get the request
		$req = " SELECT format, data, value, fixed, type, subtype, data.unit, COALESCE(t.label, data.label) as label, COALESCE(t.definition, data.definition) as definition, form_field.*";
		$req .= " FROM predefined_request_criteria";
		$req .= " LEFT JOIN form_field using (data, format)";
		$req .= " LEFT JOIN data using (data)";
		$req .= " LEFT JOIN unit using (unit)";
		$req .= " LEFT JOIN translation t ON (lang = '" . $this->lang . "' AND table_format = 'DATA' AND row_pk = data.data) ";
		$req .= " WHERE request_name = ?";

		$this->logger->info('getPredefinedRequestCriteria : ' . $req);

		$query = $db->prepare($req);
		$query->execute(array(
			$requestName
		));

		$criteriaList = array();
		$results = $query->fetchAll();
		foreach ($results as $result) {

			$this->logger->info('$result : ' . print_r($result, true));

			$field = new Application_Object_Website_PredefinedField();
			$field->format = $result['format'];
			$field->data = $result['data'];
			$field->unit = $result['unit'];
			$field->fixed = ($result['fixed'] == '1') ? true : false;
			$field->inputType = $result['input_type'];
			$field->type = $result['type'];
			$field->subtype = $result['subtype'];
			$field->label = $result['label'];
			$field->definition = $result['definition'];
			$field->isCriteria = 1; // a predefined field is always a criteria
			$field->isResult = $result['is_result'];
			$field->isDefaultResult = $result['is_default_result'];
			$field->isDefaultCriteria = 1; // a predefined field is always a default criteria
			$field->value = $result['value'];
			$field->defaultValue = $result['value'];
			$field->decimals = $result['decimals'];
			$field->mask = $result['mask'];

			$criteriaList[$field->getName()] = $field;
		}

		return $criteriaList;
	}

	/**
	 * Delete a predefined request.
	 *
	 * @param String $requestName
	 *        	the name of the predefined request to delete
	 */
	public function deletePredefinedRequest($requestName) {
		$db = $this->getAdapter();

		// delete the request criterias
		$req = " DELETE FROM predefined_request_criteria WHERE request_name = ?";

		$this->logger->info('deletePredefinedRequest : ' . $req);

		$query = $db->prepare($req);
		$query->execute(array(
			$requestName
		));

		// delete the request results
		$req = " DELETE FROM predefined_request_result WHERE request_name = ?";

		$this->logger->info('deletePredefinedRequest : ' . $req);

		$query = $db->prepare($req);
		$query->execute(array(
			$requestName
		));

		// delete the request
		$req = " DELETE FROM predefined_request WHERE request_name = ?";

		$this->logger->info('deletePredefinedRequest : ' . $req);

		$query = $db->prepare($req);
		$query->execute(array(
			$requestName
		));
	}
}
