<?php
/**
 * © French National Forest Inventory
 * Licensed under EUPL v1.1 (see http://ec.europa.eu/idabc/eupl).
 */

/**
 * This is a model allowing generic access to the RAW_DATA tables.
 * @package models
 */
class Model_Generic extends Zend_Db_Table_Abstract {

	var $logger;

	/**
	 * Initialisation
	 */
	public function init() {

		// Initialise the logger
		$this->logger = Zend_Registry::get("logger");

		$this->metadataModel = new Model_Metadata();

	}

	/**
	 * Execute the request.
	 *
	 * @param string the SQL Request
	 * @return Array[]
	 */
	public function executeRequest($sql) {
		$db = $this->getAdapter();
		$db->getConnection()->setAttribute(PDO::ATTR_TIMEOUT, 480);

		Zend_Registry::get("logger")->info('executeRequest : '.$sql);

		$result = $db->fetchAll($sql);

		return $result;

	}

	/**
	 * Fill a line of data with the values a table, given its primary key.
	 * Only one object is expected in return.
	 *
	 * @param DataObject $data the shell of the data object with the values for the primary key.
	 * @return DataObject The complete data object.
	 */
	public function getDatum($data) {
		$db = $this->getAdapter();

		/* @var $data DataObject */
		$tableFormat = $data->tableFormat;
		/* @var $tableFormat TableFormat */

		Zend_Registry::get("logger")->info('getDatum');

		// Get the values from the data table
		$sql = "SELECT *";
		$sql .= " FROM ".$tableFormat->schemaCode.".".$tableFormat->tableName;
		$sql .= " WHERE(1 = 1)";

		// Build the WHERE clause with the info from the PK.
		foreach ($data->infoFields as $primaryKey) {
			/* @var $primaryKey TableField */

			// Hardcoded value : We ignore the submission_id info (we should have an unicity constraint that allow this)
			if (!($tableFormat->schemaCode == "RAW_DATA" && $primaryKey->data == "SUBMISSION_ID")) {

				if ($primaryKey->type == "NUMERIC" || $primaryKey->type == "INTEGER") {
					$sql .= " AND ".$primaryKey->columnName." = ".$primaryKey->value;
				} else {
					$sql .= " AND ".$primaryKey->columnName." = '".$primaryKey->value."'";
				}
			}
		}

		Zend_Registry::get("logger")->info('getDatum : '.$sql);

		$select = $db->prepare($sql);
		$select->execute();
		$row = $select->fetch();

		// Fill the values with data from the table
		foreach ($data->editableFields as $field) {
			/* @var $value TableField */
			$field->value = $row[strtolower($field->columnName)];
		}

		return $data;

	}

	/**
	 * Get a line of data from a table, given its primary key.
	 * A list of objects is expected in return.
	 *
	 * @param DataObject $data the shell of the data object with the values for the primary key.
	 * @return Array[DataObject] The complete data objects.
	 */
	public function getData($data) {
		$db = $this->getAdapter();

		Zend_Registry::get("logger")->info('getData');

		$result = array();

		// The table format descriptor
		$tableFormat = $data->tableFormat;
		//Zend_Registry::get("logger")->info('$tableFormat : '.print_r($tableFormat, true));

		// The table fields descriptor
		$tableFields = $this->metadataModel->getTableFields(null, 'RAW_DATA', $tableFormat->format);

		//Zend_Registry::get("logger")->info('$tableFields : '.print_r($tableFields, true));

		// Get the values from the data table
		$sql = "SELECT *";
		$sql .= " FROM ".$tableFormat->schemaCode.".".$tableFormat->tableName;
		$sql .= " WHERE(1 = 1)";

		// Build the WHERE clause with the info from the PK.
		foreach ($data->infoFields as $primaryKey) {
			/* @var $primaryKey TableField */

			// Hardcoded value : We ignore the submission_id info (we should have an unicity constraint that allow this)
			if (!($tableFormat->schemaCode == "RAW_DATA" && $primaryKey->data == "SUBMISSION_ID")) {

				if ($primaryKey->type == "NUMERIC" || $primaryKey->type == "INTEGER") {
					$sql .= " AND ".$primaryKey->columnName." = ".$primaryKey->value;
				} else {
					$sql .= " AND ".$primaryKey->columnName." = '".$primaryKey->value."'";
				}
			}
		}

		Zend_Registry::get("logger")->info('getDatum : '.$sql);

		$select = $db->prepare($sql);
		$select->execute();
		foreach ($select->fetchAll() as $row) {

			// Create a new data object
			$child = new DataObject();
			$child->tableFormat = $tableFormat;

			// Copy the key info (with know values)
			$knownKeys = array();
			foreach ($data->infoFields as $field) {
				$child->addInfoField($field);
				$knownKeys[] = $field->data;
			}

			// Add the unknown key items with their value from the table
			$unknownKeys = array_diff($tableFormat->primaryKeys, $knownKeys);
			foreach ($unknownKeys as $keyname) {
				if ($keyname != 'SUBMISSION_ID') {
					$key = clone $tableFields[$keyname];
					$key->value = $row[strtolower($key->columnName)];
					$child->addInfoField($key);
				}
			}

			// Fill the values with data from the table
			foreach ($data->editableFields as $field) {
				$key = clone $tableFields[$keyname];
				$field->value = $row[strtolower($field->columnName)];
				$child->addEditableField($field);

			}

			$result[] = $child;
		}

		return $result;

	}

	/**
	 * Update a line of data from a table.
	 *
	 * @param DataObject $data the shell of the data object with the values for the primary key.
	 */
	public function updateData($data) {
		$db = $this->getAdapter();

		/* @var $data DataObject */
		$tableFormat = $data->tableFormat;
		/* @var $tableFormat TableFormat */

		Zend_Registry::get("logger")->info('updateData');

		// Get the values from the data table
		$sql = "UPDATE ".$tableFormat->schemaCode.".".$tableFormat->tableName;
		$sql .= " SET ";

		// updates of the data.
		foreach ($data->editableFields as $field) {
			/* @var $field TableField */

			if ($field->data != "LINE_NUMBER") { // Hardcoded value
				if ($field->type == "NUMERIC" || $field->type == "INTEGER") {
					$sql .= $field->columnName." = ".$field->value;
				} else {
					$sql .= $field->columnName." = '".$field->value."'";
				}
				$sql .= ",";
			}
		}
		// remove last comma
		$sql = substr($sql, 0, -1);

		$sql .= " WHERE(1 = 1)";

		// Build the WHERE clause with the info from the PK.
		foreach ($data->infoFields as $primaryKey) {
			/* @var $primaryKey TableField */

			// Hardcoded value : We ignore the submission_id info (we should have an unicity constraint that allow this)
			if (!($tableFormat->schemaCode == "RAW_DATA" && $primaryKey->data == "SUBMISSION_ID")) {

				if ($primaryKey->type == "NUMERIC" || $primaryKey->type == "INTEGER") {
					$sql .= " AND ".$primaryKey->columnName." = ".$primaryKey->value;
				} else {
					$sql .= " AND ".$primaryKey->columnName." = '".$primaryKey->value."'";
				}
			}
		}

		Zend_Registry::get("logger")->info('updateData : '.$sql);

		$request = $db->prepare($sql);

		try {
			$request->execute();
		} catch (Exception $e) {
			Zend_Registry::get("logger")->err('Error while updating data  : '.$e->getMessage());
			throw new Exception("Error while updating data  : ".$e->getMessage());
		}

	}

	/**
	 * Insert a line of data from a table.
	 *
	 * @param DataObject $data the shell of the data object to insert.
	 */
	public function insertData($data) {
		$db = $this->getAdapter();

		/* @var $data DataObject */
		$tableFormat = $data->tableFormat;
		/* @var $tableFormat TableFormat */

		Zend_Registry::get("logger")->info('insertData');

		// Get the values from the data table
		$sql = "INSERT INTO ".$tableFormat->schemaCode.".".$tableFormat->tableName;
		$columns = "";
		$values = "";

		// updates of the data.
		foreach ($data->infoFields as $field) {
			if ($field->value != null) { // Primary keys that are not set should be serials ...
				$columns .= $field->columnName.", ";
				if ($field->type == "NUMERIC" || $field->type == "INTEGER") {
					$values .= $field->value.", ";
				} else {
					$values .= "'".$field->value."', ";
				}
			}
		}
		foreach ($data->editableFields as $field) {
			if ($field->value != null) { // Primary keys that are not set should be serials ...
				if ($field->data != "LINE_NUMBER") {
					$columns .= $field->columnName.", ";
					if ($field->type == "NUMERIC" || $field->type == "INTEGER") {
						$values .= $field->value.", ";
					} else {
						$values .= "'".$field->value."', ";
					}
				}
			}
		}
		// remove last commas
		$columns = substr($columns, 0, -2);
		$values = substr($values, 0, -2);

		$sql .= "(".$columns.") VALUES (".$values.")";

		Zend_Registry::get("logger")->info('insertData : '.$sql);

		$request = $db->prepare($sql);

		try {
			$request->execute();
		} catch (Exception $e) {
			Zend_Registry::get("logger")->err('Error while inserting data  : '.$e->getMessage());
			throw new Exception("Error while inserting data  : ".$e->getMessage());
		}

	}

	/**
	 * Get the information about the ancestors of a line of data.
	 * The key elements in the parent tables must have an existing value in the child.
	 *
	 * @param DataObject $data the data object we're looking at.
	 * @return List[DataObject] The lines of data in the parent tables.
	 */
	public function getAncestors($data) {
		$db = $this->getAdapter();

		$ancestors = array();

		/* @var $data DataObject */
		$tableFormat = $data->tableFormat;
		/* @var $tableFormat TableFormat */

		Zend_Registry::get("logger")->info('getAncestors');

		// Get the parent of the current table
		$sql = "SELECT *";
		$sql .= " FROM TABLE_TREE ";
		$sql .= " WHERE SCHEMA_CODE = '".$tableFormat->schemaCode."'";
		$sql .= " AND child_table = '".$tableFormat->format."'";

		Zend_Registry::get("logger")->info('getAncestors : '.$sql);

		$select = $db->prepare($sql);
		$select->execute();
		$row = $select->fetch();

		$parentTable = $row['parent_table'];
		$joinKeys = explode(',', $row['join_key']);

		// Check if we are not the root table
		if ($parentTable != "*") {

			// Get more info about the table format
			$parentFormat = $this->metadataModel->getTableFormat('RAW_DATA', $parentTable);

			// Build an empty parent object (with the key info)
			$parent = new DataObject();
			$parent->datasetId = $data->datasetId;
			$parent->tableFormat = $parentFormat;
			foreach ($joinKeys as $key) {

				$keyField = $data->getInfoField($key);

				$parent->addInfoField($keyField);
			}

			// Get the line of data from the parent
			$parentData = $this->getDatum($parent);

			$ancestors[] = $parentData;

			// Recurse
			$ancestors = array_merge($ancestors, $this->getAncestors($parentData));

		}
		return $ancestors;

	}

	/**
	 * Get the information about the children of a line of data.
	 *
	 * @param DataObject $data the data object we're looking at.
	 * @return List[DataObject] The lines of data in the parent tables.
	 */
	public function getChildren($data) {
		$db = $this->getAdapter();

		$children = array();

		/* @var $data DataObject */
		$tableFormat = $data->tableFormat;
		/* @var $tableFormat TableFormat */

		Zend_Registry::get("logger")->info('getChildren');

		// Get the children of the current table
		$sql = "SELECT *";
		$sql .= " FROM TABLE_TREE ";
		$sql .= " WHERE SCHEMA_CODE = '".$tableFormat->schemaCode."'";
		$sql .= " AND parent_table = '".$tableFormat->format."'";

		Zend_Registry::get("logger")->info('getChildren : '.$sql);

		$select = $db->prepare($sql);
		$select->execute();

		// For each potential child table listed, we search for the actual lines of data available		
		foreach ($select->fetchAll() as $row) {
			$childTable = $row['child_table'];
			$joinKeys = explode(',', $row['join_key']);

			$childFormat = $this->metadataModel->getTableFormat('RAW_DATA', $childTable);

			// Build an empty child object (with the key info)
			$child = new DataObject();
			$child->datasetId = $data->datasetId;
			$child->tableFormat = $childFormat;
			foreach ($joinKeys as $key) {
				$keyField = $data->getInfoField($key);
				$child->addInfoField($keyField);
			}

			// Get the lines of data corresponding to the partial key
			$child = $this->getData($child);

			$children[$childFormat->format] = $child;

		}

		return $children;
	}

}
