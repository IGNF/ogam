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
 * The Generic Service.
 *
 * This service handles transformations between data objects and generate generic SQL requests from the metadata.
 *
 * @package service
 */
class Application_Service_GenericService {

	/**
	 * The logger.
	 *
	 * @var Zend_Log
	 */
	var $logger;

	/**
	 * The models.
	 */
	var $metadataModel;

	/**
	 * The projection systems.
	 */
	var $databaseSRS;

	var $visualisationSRS;

	/**
	 * Constructor.
	 */
	function Application_Service_GenericService() {

		// Initialise the logger
		$this->logger = Zend_Registry::get("logger");

		// Initialise the metadata models
		$this->metadataModel = new Application_Model_Metadata_Metadata();

		// Configure the projection systems
		$configuration = Zend_Registry::get("configuration");
		$this->visualisationSRS = $configuration->srs_visualisation;
		$this->databaseSRS = $configuration->srs_raw_data;
	}

	/**
	 * Serialize the data object as a JSON string.
	 *
	 * @param Application_Object_Generic_DataObject $data
	 *        	the data object we're looking at.
	 * @param String $dataset
	 *        	the dataset identifier (optional), limit the children to the current dataset.
	 * @return JSON
	 */
	public function datumToDetailJSON($data, $datasetId = null) {
		$this->logger->info('datumToDetailJSON');

		// Get the user rights
		$userSession = new Zend_Session_Namespace('user');
		$role = $userSession->user->role;

		// Get children for the current dataset
		$this->genericModel = new Application_Model_Generic_Generic();
		$children = $this->genericModel->getChildren($data, $datasetId);

		$childrenCount = 0;
		if (!empty($children)) {
			$childrenCount = count(current($children));
		}
		$json = '{"title":' . json_encode($data->tableFormat->label, JSON_HEX_APOS) . ', "children_count":' . $childrenCount . ', "id":"' . $data->getId() . '", "fields":[';
		$fields = '';
		// Get the form field corresponding to the table field
		$formFields = $this->getFormFieldsOrdered($data->getFields());
		foreach ($formFields as $formField) {
			// Add the corresponding JSON
			$fields .= $formField->toDetailJSON() . ",";
		}
		// remove last comma
		if ($fields != '') {
			$fields = substr($fields, 0, -1);
		} else {
			return '';
		}
		$json .= $fields . "]";

		// Add the edit link
		if ($role->isAllowed('DATA_EDITION')) {
			$json .= ',"editURL":' . json_encode($data->getId());
		} else {
			$json .= ',"editURL":null';
		}

		$json .= '}';

		return $json;
	}

	/**
	 * Return a formated array
	 *
	 * @param DataObject $data
	 *        	the data object we're looking at.
	 * @param String $dataset
	 *        	the dataset identifier (optional), limit the children to the current dataset.
	 * @return ARRAY
	 */
	public function datumToDetailArray($data, $datasetId = null) {
		$this->logger->info('datumToDetailJSON', $data);

		// Get the user rights
		$userSession = new Zend_Session_Namespace('user');
		$permissions = $userSession->permissions;

		// Get children for the current dataset
		$this->genericModel = new Genapp_Model_Generic_Generic();
		$children = $this->genericModel->getChildren($data, $datasetId);

		$childrenCount = 0;
		if (!empty($children)) {
			$childrenCount = count(current($children));
		}
		$out = Array();
		$out['title'] = json_encode($data->tableFormat->label, JSON_HEX_APOS);
		$out['children_count'] = $childrenCount;
		$out['id'] = $data->getId();

		$fields = '';
		// Get the form field corresponding to the table field
		$formFields = $this->getFormFieldsOrdered($data->getFields());
		foreach ($formFields as $formField) {
			// Add the corresponding JSON
			$fields .= $formField->toDetailJSON() . ",";
		}
		// remove last comma
		if ($fields != '') {
			$fields = substr($fields, 0, -1);
		} else {
			return '';
		}
		$out['fields'] = $fields;

		// Add the edit link
		if (!empty($permissions) && array_key_exists('DATA_EDITION', $permissions)) {
			$out['editURL'] = json_encode($data->getId());
		} else {
			$out['editURL'] = null;
		}

		return $out;
	}

	/**
	 * Serialize a list of data objects as a JSON array for a display into a Ext.GridPanel.
	 *
	 * @param String $id
	 *        	the id for the returned dataset
	 * @param List[Application_Object_Generic_DataObject] $data
	 *        	the data object we're looking at.
	 * @return JSON
	 */
	public function dataToGridDetailJSON($id, $data) {
		$this->logger->info('dataToDetailJSON');

		if (!empty($data)) {

			// The columns config to setup the grid columnModel
			$columns = array();
			// The columns max length to setup the column width
			$columnsMaxLength = array();
			// The fields config to setup the store reader
			$locationFields = array(
				'id'
			);
			// The data to full the store
			$locationsData = array();
			$firstData = $data[0];

			// Dump each row values
			foreach ($data as $datum) {
				$locationData = array();
				// Addition of the row id
				$locationData[0] = $datum->getId();
				$formFields = $this->getFormFieldsOrdered($datum->getFields());
				foreach ($formFields as $formField) {
					// We keep only the result fields (The columns availables)
					array_push($locationData, $formField->getValueLabel());
					if (empty($columnsMaxLength[$formField->data])) {
						$columnsMaxLength[$formField->data] = array();
					}
					array_push($columnsMaxLength[$formField->data], strlen($formField->getValueLabel()));
				}
				array_push($locationsData, $locationData);
			}

			// Add the colums description
			foreach ($formFields as $field) {
				// Set the column model and the location fields
				$dataIndex = $firstData->tableFormat->format . '__' . $field->data;
				// Adds the column header to prevent it from being truncated too
				array_push($columnsMaxLength[$field->data], strlen($field->label));
				$column = array(
					'header' => $field->label,
					'dataIndex' => $dataIndex,
					'editable' => false,
					'tooltip' => $field->definition,
					'width' => 150, // max($columnsMaxLength[$field->data]) * 7
					'type' => $field->type
				);
				array_push($columns, $column);
				array_push($locationFields, $dataIndex);
			}

			// Check if the table has a child table
			$hasChild = false;
			$children = $this->metadataModel->getChildrenTableLabels($firstData->tableFormat);
			if (!empty($children)) {
				$hasChild = true;
			}
			return '{' . 'success:true' . ', id:' . json_encode($id) . ', title:' . json_encode($firstData->tableFormat->label . ' (' . count($locationsData) . ')') . ', hasChild:' . json_encode($hasChild) . ', columns:' . json_encode(array_values($columns)) . ', fields:' . json_encode(array_values($locationFields)) . ', data:' . json_encode(array_values($locationsData)) . '}';
		} else {
			return '{success:true, id:null, title:null, hasChild:false, columns:[], fields:[], data:[]}';
		}
	}

	/**
	 * Serialize a list of data objects as an array for a display into a Ext.GridPanel.
	 *
	 * @param String $id
	 *        	the id for the returned dataset
	 * @param List[DataObject] $data
	 *        	the data object we're looking at.
	 * @return ARRAY
	 */
	public function dataToGridDetailArray($id, $data) {
		$this->logger->info('dataToDetailArray');

		if (!empty($data)) {

			// The columns config to setup the grid columnModel
			$columns = array(
				array(

					'header' => 'Informations',
					'dataIndex' => 'informations',
					'editable' => false,
					'tooltip' => 'Informations',
					'width' => 150,
					'type' => 'STRING'
				)
			);
			// The columns max length to setup the column width
			$columnsMaxLength = array();
			// The fields config to setup the store reader
			$locationFields = array(
				'id',
				'informations'
			);
			// The data to full the store
			$locationsData = array();
			$firstData = $data[0];

			// Dump each row values
			foreach ($data as $datum) {
				$locationData = array();
				// Addition of the row id
				$locationData[0] = $datum->getId();
				$locationData[1] = "";
				foreach ($datum->getInfoFields() as $field) {
					$locationData[1] .= $field->valueLabel . ', ';
				}

				if ($locationData[1] != "") {
					$locationData[1] = substr($locationData[1], 0, -2);
				}
				$formFields = $this->getFormFieldsOrdered($datum->getFields());
				foreach ($formFields as $formField) {
					// We keep only the result fields (The columns availables)
					array_push($locationData, $formField->getValueLabel());
					if (empty($columnsMaxLength[$formField->data])) {
						$columnsMaxLength[$formField->data] = array();
					}
					array_push($columnsMaxLength[$formField->data], strlen($formField->getValueLabel()));
				}
				array_push($locationsData, $locationData);
			}

			// Add the colums description
			foreach ($formFields as $field) {
				// Set the column model and the location fields
				$dataIndex = $firstData->tableFormat->format . '__' . $field->data;
				// Adds the column header to prevent it from being truncated too
				array_push($columnsMaxLength[$field->data], strlen($field->label));
				$column = array(
					'header' => $field->label,
					'dataIndex' => $dataIndex,
					'editable' => false,
					'tooltip' => $field->definition,
					'width' => 150, // max($columnsMaxLength[$field->data]) * 7
					'type' => $field->type
				);
				array_push($columns, $column);
				array_push($locationFields, $dataIndex);
			}

			// Check if the table has a child table
			$hasChild = false;
			$children = $this->metadataModel->getChildrenTableLabels($firstData->tableFormat);
			if (!empty($children)) {
				$hasChild = true;
			}
			$out = Array();
			$out['id'] = $id;
			$out['title'] = $firstData->tableFormat->label . ' (' . count($locationsData) . ')';
			$out['hasChild'] = $hasChild;
			$out['columns'] = array_values($columns);
			$out['fields'] = array_values($locationFields);
			$out['data'] = array_values($locationsData);
			return $out;
		} else {
			return null;
		}
	}

	/**
	 * Return the form fields mapped to the table fields and ordered by position
	 *
	 * @param array $tableFields
	 *        	The table fields
	 * @return array The form fields ordered
	 */
	public function getFormFieldsOrdered(array $tableFields) {
		$fieldsOrdered = array();
		foreach ($tableFields as $tableField) {
			// Get the form field corresponding to the table field
			$formField = $this->getTableToFormMapping($tableField, true);
			if ($formField != null && $formField->isResult) {
				$fieldsOrdered[] = $formField;
			}
		}
		return array_values($fieldsOrdered);
	}

	/**
	 * Get the form field corresponding to the table field.
	 *
	 * @param Application_Object_Metadata_TableField $tableField
	 *        	the table field
	 * @param Boolean $copyValues
	 *        	is true the values will be copied
	 * @return FormField
	 */
	public function getTableToFormMapping($tableField, $copyValues = false) {

		// Get the description of the form field
		$formField = $this->metadataModel->getTableToFormMapping($tableField);

		// Clone the object to avoid modifying existing object
		if ($formField != null) {
			$formField = clone $formField;
		}

		// Copy the values
		if ($copyValues == true && $formField != null && $tableField->value != null) {

			// Copy the value and label
			$formField->value = $tableField->value;
			$formField->valueLabel = $tableField->valueLabel;
		}

		return $formField;
	}

	/**
	 * Get the table field corresponding to a form field.
	 *
	 * @param String $schema
	 *        	the schema
	 * @param Application_Object_Metadata_FormField $formField
	 *        	the form field
	 * @param Boolean $copyValues
	 *        	is true the values will be copied
	 * @return Application_Object_Metadata_TableField
	 */
	public function getFormToTableMapping($schema, $formField, $copyValues = false) {

		// Get the description of the corresponding table field
		$tableField = $this->metadataModel->getFormToTableMapping($schema, $formField);

		// Clone the object to avoid modifying existing object
		if ($tableField != null) {
			$tableField = clone $tableField;
		}

		// Copy the values
		if ($copyValues == true && $tableField != null && $formField->value != null) {

			// Copy the value
			$tableField->value = $formField->value;
		}

		return $tableField;
	}

	/**
	 * Generate the FROM clause of the SQL request corresponding to a list of parameters.
	 *
	 * @param String $schema
	 *        	the schema
	 * @param Application_Object_Generic_DataObject $dataObject
	 *        	the query object (list of TableFields)
	 * @return String a SQL request
	 */
	public function generateSQLFromRequest($schema, $dataObject) {
		$this->logger->debug('generateSQLFromRequest');

		//
		// Prepare the FROM clause
		//

		// Prepare the list of needed tables
		$tables = $this->getAllFormats($schema, $dataObject);

		// Add the root table;
		$rootTable = array_shift($tables);
		$from = " FROM " . $rootTable->tableName . " " . $rootTable->getLogicalName();

		// Add the joined tables
		$i = 0;
		foreach ($tables as $tableTreeData) {
			$i ++;

			// Join the table
			$from .= " JOIN " . $tableTreeData->tableName . " " . $tableTreeData->getLogicalName() . " on (";

			// Add the join keys
			$keys = explode(',', $tableTreeData->keys);
			foreach ($keys as $key) {
				$from .= $tableTreeData->getLogicalName() . "." . trim($key) . " = " . $tableTreeData->parentTable . "." . trim($key) . " AND ";
			}
			$from = substr($from, 0, -5);
			$from .= ") ";
		}

		return $from;
	}

	/**
	 * Generate the WHERE clause of the SQL request corresponding to a list of parameters.
	 *
	 * @param String $schema
	 *        	the schema
	 * @param Application_Object_Generic_DataObject $dataObject
	 *        	the query object (list of TableFields)
	 * @return String a SQL request
	 */
	public function generateSQLWhereRequest($schema, $dataObject) {
		$this->logger->debug('generateSQLWhereRequest');

		// Prepare the list of needed tables
		$tables = $this->getAllFormats($schema, $dataObject);

		// Add the root table;
		$rootTable = array_shift($tables);

		// Get the root table fields
		$rootTableFields = $this->metadataModel->getTableFields($schema, $rootTable->getLogicalName());
		$hasColumnProvider = array_key_exists('PROVIDER_ID', $rootTableFields);

		//
		// Prepare the WHERE clause
		//
		$where = " WHERE (1 = 1)";
		foreach ($dataObject->infoFields as $tableField) {
			$where .= $this->buildWhereItem($tableField, false);
		}

		// Right management
		// Check the provider id of the logged user
		$userSession = new Zend_Session_Namespace('user');
		if (!empty($userSession->user)) {
			$providerId = $userSession->user->provider->id;
			$role = $userSession->user->role;
			if (!$role->isAllowed('DATA_QUERY_OTHER_PROVIDER') && $hasColumnProvider) {
				$where .= " AND " . $rootTable->getLogicalName() . ".provider_id = '" . $providerId . "'";
			}
		}

		// Return the completed SQL request
		return $where;
	}

	/**
	 * Generate the SQL request corresponding the distinct locations of the query result.
	 *
	 * @param String $schema
	 *        	the schema
	 * @param Application_Object_Generic_DataObject $dataObject
	 *        	the query object (list of TableFields)
	 * @return String a SQL request
	 */
	public function generateSQLSelectRequest($schema, $dataObject) {
		$this->logger->debug('generateSQLSelectRequest');

		//
		// Prepare the SELECT clause
		//
		$select = "SELECT DISTINCT "; // distinct for the case where we have some criterias but no result columns selected o the last table
		foreach ($dataObject->editableFields as $tableField) {
			$select .= $this->buildSelectItem($tableField) . ", ";
		}
		$select = substr($select, 0, -2);

		//
		// Create a unique identifier for each line
		// We use the last column of the leaf table
		//
		// Get the left table;
		$tables = $this->getAllFormats($schema, $dataObject);
		$rootTable = reset($tables);
		$reversedTable = array_reverse($tables); // Only variables should be passed by reference
		$leftTable = array_shift($reversedTable);

		// Get the root table fields
		$rootTableFields = $this->metadataModel->getTableFields($schema, $rootTable->getLogicalName());
		$hasColumnProvider = array_key_exists('PROVIDER_ID', $rootTableFields);

		$uniqueId = "'SCHEMA/" . $schema . "/FORMAT/" . $leftTable->getLogicalName() . "'";

		$identifiers = explode(',', $leftTable->identifiers);
		foreach ($identifiers as $identifier) {
			$identifier = trim($identifier);
			// Concatenate the column to create a unique Id
			$uniqueId .= " || '/' || '" . $identifier . "/' ||" . $leftTable->getLogicalName() . "." . trim($identifier);
		}
		$select .= ", " . $uniqueId . " as id";

		// Detect the column containing the geographical information
		$locationField = $this->metadataModel->getGeometryField($schema, array_keys($tables));

		// Add the location centroid (for zooming on the map)
		$select .= ", st_astext(st_centroid(st_transform(" . $locationField->format . "." . $locationField->columnName . "," . $this->visualisationSRS . "))) as location_centroid ";

		// Right management
		// Get back the provider id of the data
		$userSession = new Zend_Session_Namespace('user');
		if (!empty($userSession->user)) {
			$providerId = $userSession->user->provider->id;
			$role = $userSession->user->role;
			if (!$role->isAllowed('DATA_EDITION_OTHER_PROVIDER') && $hasColumnProvider) {
				$select .= ", " . $leftTable->getLogicalName() . ".provider_id as _provider_id";
			}
		}

		// Return the completed SQL request
		return $select;
	}

	/**
	 * Generate the primary key of the left table of the query.
	 * Fields composing the pkey are prefixed with the table label
	 *
	 * @param String $schema
	 *        	the schema
	 * @param Application_Object_Generic_DataObject $dataObject
	 *        	the query object (list of TableFields)
	 * @return String a primary key
	 */
	public function generateSQLPrimaryKey($schema, $dataObject) {
		$this->logger->debug('generateSQLPrimaryKey');

		// Get the left table;
		$tables = $this->getAllFormats($schema, $dataObject);
		$leftTable = array_pop($tables);

		$identifiers = explode(',', $leftTable->identifiers);
		foreach ($identifiers as $index => $identifier) {
			$identifiers[$index] = $leftTable->getLogicalName() . "." . trim($identifier);
		}

		return implode(',', $identifiers);
	}

	/**
	 * Build the WHERE clause corresponding to a list of criterias.
	 *
	 * @param Array[Application_Object_Metadata_TableField] $criterias
	 *        	the criterias.
	 * @return String the WHERE part of the SQL query
	 */
	public function buildWhere($criterias) {
		$sql = "";

		// Build the WHERE clause with the info from the PK.
		foreach ($criterias as $tableField) {
			$sql .= $this->buildWhereItem($tableField, true); // exact match
		}

		return $sql;
	}

	/**
	 * Build a WHERE criteria for a single numeric value.
	 *
	 * @param Application_Object_Metadata_TableField $tableField
	 *        	a criteria field.
	 * @param String $value
	 *        	a numeric criterium.
	 *
	 *        	Examples of values :
	 *        	12
	 *        	12.5
	 *        	12.5 - 17.9 (will generate a min - max criteria)
	 */
	private function _buildNumericWhereItem($tableField, $value) {
		$sql = "";
		$posBetween = strpos($value, " - ");
		$posInf = strpos($value, "<=");
		$posSup = strpos($value, ">=");

		// Cas où les 2 valeurs sont présentes
		if ($posBetween !== false) {

			$minValue = substr($value, 0, $posBetween);
			$maxValue = substr($value, $posBetween + 3);
			$sql2 = '';

			if (($minValue !== null) && ($minValue !== '')) {
				$sql2 .= $tableField->format . "." . $tableField->columnName . " >= " . $minValue;
			}
			if (($maxValue !== null) && ($maxValue !== '')) {
				if ($sql2 != "") {
					$sql2 .= ' AND ';
				}
				$sql2 .= $tableField->format . "." . $tableField->columnName . " <= " . $maxValue;
			}
			$sql .= '(' . $sql2 . ')';
		} else if ($posInf !== false) {
			// Cas où on a juste un max
			$maxValue = trim(substr($value, $posInf + 2));
			if (($maxValue !== null) && ($maxValue !== '')) {
				$sql .= $tableField->format . "." . $tableField->columnName . " <= " . $maxValue;
			}
		} else if ($posSup !== false) {
			// Cas où on a juste un min
			$minValue = trim(substr($value, $posSup + 2));
			if (($minValue !== null) && ($minValue !== '')) {
				$sql .= $tableField->format . "." . $tableField->columnName . " >= " . $minValue;
			}
		} else {
			// One value, we make an equality comparison
			$sql .= $tableField->format . "." . $tableField->columnName . " = " . $value;
		}

		return $sql;
	}

	/**
	 * Return the SQL String representation of an array.
	 *
	 * Example : Array ( [0] => Boynes, [1] => Ascoux ) => {"Boynes", "Ascoux"}
	 *
	 * @param Array[String] $value
	 *        	an array of values.
	 * @return the String representation of the array
	 */
	private function _arrayToSQLString($arrayValues) {
		$string = "'{";

		if (is_array($arrayValues)) {
			foreach ($arrayValues as $value) {
				$string .= '"' . $value . '",';
			}
			if (!empty($arrayValues)) {
				$string = substr($string, 0, -1); // Remove last comma
			}
		} else {
			$string .= $arrayValues;
		}
		$string .= "}'";

		return $string;
	}

	/**
	 * Return an Array object corresponding to a SQL string.
	 *
	 * Example : {"Boynes", "Ascoux"} => Array ( [0] => Boynes, [1] => Ascoux )
	 *
	 * @param String $value
	 *        	an array of values.
	 * @return the String representation of the array
	 */
	public function stringToArray($value) {
		$values = str_replace("{", "", $value);
		$values = str_replace("}", "", $values);
		$values = str_replace('"', "", $values);
		$values = trim($values);
		$valuesArray = explode(",", $values);

		foreach ($valuesArray as $v) {
			$v = trim($v);
		}

		return $valuesArray;
	}

	/**
	 * Build a WHERE criteria for a single date value.
	 *
	 * @param TableField $tableField
	 *        	a criteria field.
	 * @param String $value
	 *        	a date criterium.
	 *
	 *        	Examples of values :
	 *        	YYYY/MM/DD : for equality
	 *        	>= YYYY/MM/DD : for the superior value
	 *        	<= YYYY/MM/DD : for the inferior value
	 *        	YYYY/MM/DD - YYYY/MM/DD : for the interval
	 */
	private function _buildDateWhereItem($tableField, $value) {
		$sql = "";
		$value = trim($value);
		$column = $tableField->format . "." . $tableField->columnName;

		if (!empty($value)) {
			if (strlen($value) == 10) {
				// Case "YYYY/MM/DD"
				if (Zend_Date::isDate($value, 'YYYY/MM/DD')) {
					// One value, we make an equality comparison
					$sql .= "(" . $column . " = to_date('" . $value . "', 'YYYY/MM/DD'))";
				}
			} else if (strlen($value) == 13 && substr($value, 0, 2) == '>=') {
				// Case ">= YYYY/MM/DD"
				$beginDate = substr($value, 3, 10);
				if (Zend_Date::isDate($beginDate, 'YYYY/MM/DD')) {
					$sql .= "(" . $column . " >= to_date('" . $beginDate . "', 'YYYY/MM/DD'))";
				}
			} else if (strlen($value) == 13 && substr($value, 0, 2) == '<=') {
				// Case "<= YYYY/MM/DD"
				$endDate = substr($value, 3, 10);
				if (Zend_Date::isDate($endDate, 'YYYY/MM/DD')) {
					$sql .= "(" . $column . " <= to_date('" . $endDate . "', 'YYYY/MM/DD'))";
				}
			} else if (strlen($value) == 23) {
				// Case "YYYY/MM/DD - YYYY/MM/DD"
				$beginDate = substr($value, 0, 10);
				$endDate = substr($value, 13, 10);
				if (Zend_Date::isDate($beginDate, 'YYYY/MM/DD') && Zend_Date::isDate($endDate, 'YYYY/MM/DD')) {
					$sql .= "(" . $column . " >= to_date('" . $beginDate . "', 'YYYY/MM/DD') AND " . $column . " <= to_date('" . $endDate . "', 'YYYY/MM/DD'))";
				}
			}
		}

		if ($sql == "") {
			throw new Exception("Invalid data format");
		}

		return $sql;
	}

	/**
	 * Build the WHERE clause corresponding to one criteria.
	 *
	 * @param TableField $tableField
	 *        	a criteria.
	 * @param Boolean $exact
	 *        	if true, will use an exact equal (no like %% and no IN (xxx) for trees).
	 * @return String the WHERE part of the SQL query (ex : 'AND BASAL_AREA = 6.05')
	 */
	public function buildWhereItem($tableField, $exact = false) {
		$sql = "";

		$value = $tableField->value;
		$column = $tableField->format . "." . $tableField->columnName;

		if ($value != null && $value != '' && $value != array()) {

			switch ($tableField->type) {

				case "BOOLEAN":
					// Value is 1 or 0, stored in database as a char(1)
					if (is_array($value)) {
						$value = $value[0];
						$sql .= " AND " . $column . " = '" . $value . "'";
					} else if (is_bool($value)) {
						$sql .= " AND " . $column . " = '" . $value . "'";
					} else {
						$sql .= " AND " . $column . " = '" . $value . "'";
					}
					break;

				case "DATE":
					// Numeric values
					if (is_array($value)) {
						// Case of a list of values
						$sql2 = '';
						foreach ($value as $val) {
							if (!empty($val)) {
								$sql2 .= $this->_buildDateWhereItem($tableField, $val) . " OR ";
							}
						}
						if ($sql2 != '') {
							$sql2 = substr($sql2, 0, -4); // remove the last OR
							$sql .= " AND (" . $sql2 . ")";
						}
					} else {
						// Single value
						if (!empty($value)) {
							$sql .= " AND " . $this->_buildDateWhereItem($tableField, $value);
						}
					}
					break;
				case "INTEGER":
				case "NUMERIC":
					// Numeric values
					if (is_array($value)) {

						// Case of a list of values
						$sql2 = '';
						foreach ($value as $val) {
							if ($val != null && $val != '') {
								$sql2 .= $this->_buildNumericWhereItem($tableField, $val) . " OR ";
							}
						}
						if ($sql2 != '') {
							$sql2 = substr($sql2, 0, -4); // remove the last OR
						}
						$sql .= " AND (" . $sql2 . ")";
					} else {
						// Single value
						if (is_numeric($value) || is_string($value)) {
							$sql .= " AND (" . $this->_buildNumericWhereItem($tableField, $value) . ")";
						}
					}
					break;
				case "ARRAY":

					// Case of a code in a generic TREE
					if ($tableField->subtype === 'TREE') {

						if (is_array($value)) {
							$value = $value[0];
						}

						if ($exact) {
							$sql .= " AND " . $column . " = '" . $value . "'";
						} else {
							// Get all the children of a selected node
							$nodeCodes = $this->metadataModel->getTreeChildrenCodes($tableField->unit, $value, 0);

							// Case of a list of values
							$stringValue = $this->_arrayToSQLString($nodeCodes);
							$sql .= " AND " . $column . " && " . $stringValue;
						}
					} else if ($tableField->subtype === 'TAXREF') {
						// Case of a code in a Taxonomic referential
						if (is_array($value)) {
							$value = $value[0];
						}

						if ($exact) {
							$sql .= " AND " . $column . " = '" . $value . "'";
						} else {
							// Get all the children of a selected taxon
							$nodeCodes = $this->metadataModel->getTaxrefChildrenCodes($tableField->unit, $value, 0);

							// Case of a list of values
							$stringValue = $this->_arrayToSQLString($nodeCodes);
							$sql .= " AND " . $column . " && " . $stringValue;
						}
					} else {

						$stringValue = $this->_arrayToSQLString($value);
						if (is_array($value)) {
							// Case of a list of values
							if ($exact) {
								$sql .= " AND " . $column . " = " . $stringValue;
							} else {
								$sql .= " AND " . $column . " && " . $stringValue;
							}
						} else if (is_string($value)) {
							// Single value
							if ($exact) {
								$sql .= " AND " . $column . " = " . $stringValue;
							} else {
								$sql .= " AND '" . $value . "' = ANY(" . $column . ")";
							}
						}
					}

					break;
				case "CODE":

					// Case of a code in a generic TREE
					if ($tableField->subtype === 'TREE') {

						if (is_array($value)) {
							$value = $value[0];
						}

						if ($exact) {
							$sql .= " AND " . $column . " = '" . $value . "'";
						} else {
							// Get all the children of a selected node
							$nodeCodes = $this->metadataModel->getTreeChildrenCodes($tableField->unit, $value, 0);

							$sql2 = '';
							foreach ($nodeCodes as $nodeCode) {
								$sql2 .= "'" . $nodeCode . "', ";
							}
							$sql2 = substr($sql2, 0, -2); // remove last comma

							$sql .= " AND " . $column . " IN (" . $sql2 . ")";
						}
					} else if ($tableField->subtype === 'TAXREF') {
						// Case of a code in a Taxonomic referential
						if (is_array($value)) {
							$value = $value[0];
						}

						if ($exact) {
							$sql .= " AND " . $column . " = '" . $value . "'";
						} else {

							// Get all the children of a selected taxon
							$nodeCodes = $this->metadataModel->getTaxrefChildrenCodes($tableField->unit, $value, 0);

							$sql2 = '';
							foreach ($nodeCodes as $nodeCode) {
								$sql2 .= "'" . $nodeCode . "', ";
							}
							$sql2 = substr($sql2, 0, -2); // remove last comma

							$sql .= " AND " . $column . " IN (" . $sql2 . ")";
						}
					} else {

						// String
						if (is_array($value)) {
							// Case of a list of values
							$values = '';
							foreach ($value as $val) {
								if ($val != null && $val != '' && is_string($val)) {
									$values .= "'" . $val . "', ";
								}
							}
							if ($values != '') {
								$values = substr($values, 0, -2); // remove the last comma
								$sql .= " AND " . $column . " IN (" . $values . ")";
							}
						} else {
							// Single value
							$sql .= " AND " . $column . " = '" . $value . "'";
						}
					}
					break;
				case "GEOM":
					if (is_array($value)) {
						// Case of a list of geom
						$sql .= " AND (";
						$oradded = false;
						foreach ($value as $val) {
							if ($val != null && $val != '' && is_string($val)) {
								if ($exact) {
									$sql .= "ST_Equals(" . $column . ", ST_Transform(ST_GeomFromText('" . $val . "', " . $this->visualisationSRS . "), " . $this->databaseSRS . "))";
								} else {
									// The ST_Buffer(0) is used to correct the "Relate Operation called with a LWGEOMCOLLECTION type" error.
									$sql .= "ST_Intersects(" . $column . ", ST_Buffer(ST_Transform(ST_GeomFromText('" . $val . "', " . $this->visualisationSRS . "), " . $this->databaseSRS . "), 0))";
								}
								$sql .= " OR ";
								$oradded = true;
							}
						}
						if ($oradded) {
							$sql = substr($sql, 0, -4); // remove the last OR
						}
						$sql .= ")";
					} else {
						if (is_string($value)) {
							if ($exact) {
								$sql .= " AND (ST_Equals(" . $column . ", ST_Transform(ST_GeomFromText('" . $value . "', " . $this->visualisationSRS . "), " . $this->databaseSRS . ")))";
							} else {
								$sql .= " AND (ST_Intersects(" . $column . ", ST_Buffer(ST_Transform(ST_GeomFromText('" . $value . "', " . $this->visualisationSRS . "), " . $this->databaseSRS . "), 0)))";
							}
						}
					}
					break;
				case "STRING":
				default:
					// String
					if (is_array($value)) {
						// Case of a list of values
						$sql .= " AND (";
						$oradded = false;
						foreach ($value as $val) {
							if ($val != null && $val != '' && is_string($val)) {
								if ($exact) {
									$sql .= $column . " = '" . $val . "'";
								} else {
									$sql .= $column . " ILIKE '%" . $val . "%'";
								}
								$sql .= " OR ";
								$oradded = true;
							}
						}
						if ($oradded) {
							$sql = substr($sql, 0, -4); // remove the last OR
						}
						$sql .= ")";
					} else {
						if (is_string($value)) {
							// Single value
							$sql .= " AND (" . $column;
							if ($exact) {
								$sql .= " = '" . $value . "'";
							} else {
								$sql .= " ILIKE '%" . $value . "%'";
							}
							$sql .= ")";
						}
					}
					break;
			}
		}

		return $sql;
	}

	/**
	 * Build the update part of a SQL request corresponding to a table field.
	 *
	 * @param TableField $tableField
	 *        	a criteria.
	 * @return String the update part of the SQL query (ex : BASAL_AREA = 6.05)
	 */
	public function buildSQLValueItem($tableField) {
		$sql = "";

		$value = $tableField->value;
		$column = $tableField->columnName;

		switch ($tableField->type) {

			case "BOOLEAN":
				// Value is 1 or 0, stored in database as a char(1)
				$sql = ($value == true ? '1' : '0');
				break;
			case "DATE":
				if ($value == "") {
					$sql = "NULL";
				} else {
					$sql = " to_date('" . $value . "', 'YYYY/MM/DD')";
				}
				break;
			case "INTEGER":
			case "NUMERIC":
			case "RANGE":
				if ($value == "") {
					$sql = "NULL";
				} else {
					$value = str_replace(",", ".", $value);
					$sql = $value;
				}
				break;
			case "ARRAY":
				$sql = $this->_arrayToSQLString($value);
				break;
			case "CODE":
				$sql = "'" . $value . "'";
				break;
			case "GEOM":
				if ($value == "") {
					$sql = "NULL";
				} else {
					$sql = " ST_transform(ST_GeomFromText('" . $value . "', " . $this->visualisationSRS . "), " . $this->databaseSRS . ")";
				}
				break;
			case "STRING":
			default:
				// Single value
				$sql = "'" . $value . "'";
				break;
		}

		return $sql;
	}

	/**
	 * Build the SELECT part for one field.
	 *
	 * @param TableField $field
	 *        	a table field descriptor.
	 * @return String the SELECT part corresponding to the field.
	 */
	public function buildSelectItem($field) {
		$sql = "";

		if ($field->type === "DATE") {
			$sql .= "to_char(" . $field->format . "." . $field->columnName . ", 'YYYY/MM/DD') as " . $field->getName();
		} else if ($field->type === "GEOM") {
			// Special case for THE_GEOM
			$sql .= "st_asText(st_transform(" . $field->format . "." . $field->columnName . "," . $this->visualisationSRS . ")) as location, ";
			$sql .= "st_asText(st_transform(" . $field->format . "." . $field->columnName . "," . $this->visualisationSRS . ")) as " . $field->getName() . ", ";
			$sql .= 'st_ymin(box2d(st_transform(' . $field->format . "." . $field->columnName . ',' . $this->visualisationSRS . '))) as ' . $field->getName() . '_y_min, ';
			$sql .= 'st_ymax(box2d(st_transform(' . $field->format . "." . $field->columnName . ',' . $this->visualisationSRS . '))) as ' . $field->getName() . '_y_max, ';
			$sql .= 'st_xmin(box2d(st_transform(' . $field->format . "." . $field->columnName . ',' . $this->visualisationSRS . '))) as ' . $field->getName() . '_x_min, ';
			$sql .= 'st_xmax(box2d(st_transform(' . $field->format . "." . $field->columnName . ',' . $this->visualisationSRS . '))) as ' . $field->getName() . '_x_max ';
		} else {
			$sql .= $field->format . "." . $field->columnName . " as " . $field->getName();
		}

		return $sql;
	}

	/**
	 * Build the SELECT clause.
	 *
	 * @param Array[TableFields] $tableFields
	 *        	a list of result columns.
	 * @return String the SELECT part of the SQL query
	 */
	public function buildSelect($tableFields) {
		$sql = "";

		// Iterate through the fields
		foreach ($tableFields as $field) {
			$sql .= $this->buildSelectItem($field) . ", ";
		}

		// Remove the last comma
		$sql = substr($sql, 0, -2);

		return $sql;
	}

	/**
	 * Build an empty data object.
	 *
	 * @param String $schema
	 *        	the name of the schema
	 * @param String $format
	 *        	the name of the format
	 * @param String $datasetId
	 *        	the dataset identifier
	 * @return Application_Object_Generic_DataObject the DataObject structure (with no values set)
	 */
	public function buildDataObject($schema, $format, $datasetId = null) {

		// Prepare a data object to be filled
		$data = new Application_Object_Generic_DataObject();

		$data->datasetId = $datasetId;

		// Get the description of the table
		$data->tableFormat = $this->metadataModel->getTableFormat($schema, $format);

		// Get all the description of the Table Fields corresponding to the format
		$tableFields = $this->metadataModel->getTableFields($schema, $format, $datasetId);

		// Separate the keys from other values
		foreach ($tableFields as $tableField) {
			if (in_array($tableField->data, $data->tableFormat->primaryKeys)) {
				// Primary keys are displayed as info fields
				$data->addInfoField($tableField);
			} else {
				// Editable fields are displayed as form fields
				$data->addEditableField($tableField);
			}
		}

		return $data;
	}

	/**
	 * Transform the form request object into a table data object.
	 *
	 * @param String $schema
	 *        	the schema
	 * @param FormQuery $formQuery
	 *        	the list of form fields
	 * @return Application_Object_Generic_DataObject $dataObject a data object (with data from different tables)
	 */
	public function getFormQueryToTableData($schema, $formQuery) {
		$result = new Application_Object_Generic_DataObject();

		$result->datasetId = $formQuery->datasetId;

		foreach ($formQuery->criterias as $formField) {
			$tableField = $this->getFormToTableMapping($schema, $formField, true);
			$result->addInfoField($tableField);
		}

		foreach ($formQuery->results as $formField) {
			$tableField = $this->getFormToTableMapping($schema, $formField);
			$result->addEditableField($tableField);
		}

		return $result;
	}

	/**
	 * Get the hierarchy of tables needed for a data object.
	 *
	 * @param String $schema
	 *        	the schema
	 * @param Application_Object_Generic_DataObject $dataObject
	 *        	the list of table fields
	 * @return Array[String => TableTreeData] The list of formats (including ancestors) potentially used
	 */
	public function getAllFormats($schema, $dataObject) {
		$this->logger->info('getAllFormats : ' . $schema);

		// Prepare the list of needed tables
		$tables = array();
		foreach ($dataObject->getFields() as $tableField) {

			if (!array_key_exists($tableField->format, $tables)) {

				// Get the ancestors of the table
				$ancestors = $this->metadataModel->getTablesTree($tableField->format, $schema);

				// Reverse the order of the list and store by indexing with the table name
				// The root table (LOCATION) should appear first
				$ancestors = array_reverse($ancestors);
				foreach ($ancestors as $ancestor) {
					$tables[$ancestor->getLogicalName()] = $ancestor;
				}
			}
		}

		return $tables;
	}

	/**
	 * Find the labels corresponding to the code value.
	 *
	 * @param Application_Object_Metadata_Field $tableField
	 *        	a table field descriptor
	 * @param [String|Array] $value
	 *        	a value
	 * @return String or Array The labels
	 */
	public function getValueLabel($tableField, $value) {

		// If empty, no label
		if ($value === null || $value === '') {
			return "";
		}

		// By default we keep the value as a label
		$valueLabel = $value;

		// For the CODE and ARRAY fields, we get the labels in the metadata
		if ($tableField->type === "CODE" || $tableField->type === "ARRAY") {

			// Get the modes => Label
			if ($tableField->subtype === "DYNAMIC") {
				$modes = $this->metadataModel->getDynamodeLabels($tableField->unit, $value);
			} else if ($tableField->subtype === "TREE") {
				$modes = $this->metadataModel->getTreeLabels($tableField->unit, $value);
			} else if ($tableField->subtype === "TAXREF") {
				$modes = $this->metadataModel->getTaxrefLabels($tableField->unit, $value);
			} else {
				$modes = $this->metadataModel->getModeLabels($tableField->unit, $value);
			}

			// Populate the labels of the currently selected values
			if (is_array($value)) {
				$labels = array();
				if (isset($value)) {
					foreach ($value as $mode) {
						if (isset($modes[$mode])) {
							$labels[] = $modes[$mode];
						}
					}
					$valueLabel = $labels;
				}
			} else {
				if (isset($modes[$value])) {
					$valueLabel = $modes[$value];
				}
			}
		}

		return $valueLabel;
	}

	/**
	 * Remove the accents.
	 *
	 * @param String $str
	 *        	The string
	 * @param String $charset
	 *        	The string charset
	 */
	public function removeAccents($str, $charset = 'utf-8') {
		$str = htmlentities($str, ENT_NOQUOTES, $charset);

		$str = preg_replace('#&([A-za-z])(?:acute|cedil|circ|grave|orn|ring|slash|th|tilde|uml);#', '\1', $str);
		$str = preg_replace('#&([A-za-z]{2})(?:lig);#', '\1', $str); // pour les ligatures e.g. '&oelig;'
		$str = preg_replace('#&[^;]+;#', '', $str); // supprime les autres caractères

		return $str;
	}
}