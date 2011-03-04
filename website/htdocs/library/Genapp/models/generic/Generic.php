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

	/**
	 * The system of projection for the visualisation.
	 */
	var $visualisationSRS;

	/**
	 * The logger.
	 */
	var $logger;

	/**
	 * Initialisation
	 */
	public function init() {

		// Initialise the logger
		$this->logger = Zend_Registry::get("logger");

		// Initialise the projection system
		$configuration = Zend_Registry::get("configuration");
		$this->visualisationSRS = $configuration->srs_visualisation;

		// Initialise the metadata model
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
	 * Build the WHERE clause.
	 *
	 * @param DataObject $data the shell of the data object.
	 * @return String the WHERE part of the SQL query
	 */
	private function _buildWhere($data) {

		$sql = " WHERE(1 = 1) ";

		// Build the WHERE clause with the info from the PK.
		foreach ($data->infoFields as $primaryKey) {

			// If the PK elem is null, then we don't add the criteria, we will have more that one result
			if ($primaryKey->value != null) {

				// Hardcoded value : We ignore the submission_id info (we should have an unicity constraint that allow this)
				if (!($data->tableFormat->schemaCode == "RAW_DATA" && $primaryKey->data == "SUBMISSION_ID")) {

					if ($primaryKey->type == "NUMERIC" || $primaryKey->type == "INTEGER") {
						$sql .= " AND ".$primaryKey->columnName." = ".$primaryKey->value;
					} else {
						$sql .= " AND ".$primaryKey->columnName." = '".$primaryKey->value."'";
					}
				}
			}
		}

		return $sql;
	}

	/**
	 * Build the SELECT part for one field.
	 *
	 * @param TableField $field a table field descriptor.
	 * @return String the SELECT part corresponding to the field.
	 */
	private function _buildSelectItem($field) {

		$sql = "";

		if ($field->type == "DATE") {
			$sql .= "to_char(".$field->columnName.", 'YYYY/MM/DD') as ".$field->data.", ";
		} else if ($field->unit == "GEOM") {
			// Special case for THE_GEOM
			$sql .= "asText(".$field->columnName.") as ".$field->data.", ";
			$sql .= 'ymin(box2d(transform('.$field->columnName.','.$this->visualisationSRS.'))) as '.$field->data.'_y_min, ';
			$sql .= 'ymax(box2d(transform('.$field->columnName.','.$this->visualisationSRS.'))) as '.$field->data.'_y_max, ';
			$sql .= 'xmin(box2d(transform('.$field->columnName.','.$this->visualisationSRS.'))) as '.$field->data.'_x_min, ';
			$sql .= 'xmax(box2d(transform('.$field->columnName.','.$this->visualisationSRS.'))) as '.$field->data.'_x_max, ';

		} else {
			$sql .= $field->columnName." as ".$field->data.", ";
		}

		return $sql;

	}

	/**
	 * Build the SELECT clause.
	 *
	 * @param DataObject $data the shell of the data object.
	 * @return String the SELECT part of the SQL query
	 */
	private function _buildSelect($data) {

		$sql = "SELECT ";

		// Iterate through the fields
		foreach ($data->getFields() as $field) {
			$sql .= $this->_buildSelectItem($field);
		}

		// Remove the last comma
		$sql = substr($sql, 0, -2);

		return $sql;
	}

	/**
	 * Build an empty data object.
	 *
	 * @param String $schema the name of the schema
	 * @param String $format the name of the format
	 * @param String $datasetId the dataset identifier
	 * @param Boolean $isForDisplay indicate if we only want to display the data or if for update/insert
	 * @return DataObject the DataObject structure (with no values set)
	 */
	public function buildDataObject($schema, $format, $datasetId = null, $isForDisplay = false) {

		// Prepare a data object to be filled
		$data = new DataObject();

		$data->datasetId = $datasetId;

		// Get the description of the table
		$data->tableFormat = $this->metadataModel->getTableFormat($schema, $format);

		// Get all the description of the Table Fields corresponding to the format
		$tableFields = $this->metadataModel->getTableFields($datasetId, $schema, $format);

		// Separate the keys from other values
		foreach ($tableFields as $tableField) {
			if (in_array($tableField->data, $data->tableFormat->primaryKeys)) {
				// Primary keys are displayed as info fields
				$data->addInfoField($tableField);
			} else {
				if ($isForDisplay || !$tableField->isCalculated) {
					// Fields that are calculated by a trigger should not be edited
					$data->addEditableField($tableField);
				}
			}
		}

		return $data;
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

		Zend_Registry::get("logger")->info('getDatum : ');

		// Get the values from the data table
		$sql = $this->_buildSelect($data);
		$sql .= " FROM ".$tableFormat->schemaCode.".".$tableFormat->tableName;
		$sql .= $this->_buildWhere($data);

		Zend_Registry::get("logger")->info('getDatum : '.$sql);

		$select = $db->prepare($sql);
		$select->execute();
		$row = $select->fetch();

		// Fill the values with data from the table
		foreach ($data->editableFields as $field) {
			$field->value = $row[strtolower($field->data)];

			// Store additional info for geometry type
			if ($field->unit == "GEOM") {
				$field->xmin = $row[strtolower($field->data).'_x_min'];
				$field->xmax = $row[strtolower($field->data).'_x_max'];
				$field->ymin = $row[strtolower($field->data).'_y_min'];
				$field->ymax = $row[strtolower($field->data).'_y_max'];
			}

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
	public function getData($schema, $data) {
		$db = $this->getAdapter();

		Zend_Registry::get("logger")->info('getData');

		$result = array();

		// The table format descriptor
		$tableFormat = $data->tableFormat;

		// Get the values from the data table
		$sql = $this->_buildSelect($data);
		$sql .= " FROM ".$tableFormat->schemaCode.".".$tableFormat->tableName;
		$sql .= $this->_buildWhere($data);

		Zend_Registry::get("logger")->info('getDatum : '.$sql);

		$select = $db->prepare($sql);
		$select->execute();
		foreach ($select->fetchAll() as $row) {

			// Build an new empty data object
			$child = $this->buildDataObject($schema, $data->tableFormat->format);

			// Fill the values with data from the table
			foreach ($child->getFields() as $field) {
				$field->value = $row[strtolower($field->data)];
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
	 * @param String $schema the name of the schema
	 * @param DataObject $data the data object we're looking at.
	 * @param Boolean $isForDisplay indicate if we only want to display the data or if for update/insert
	 * @return List[DataObject] The line of data in the parent tables.
	 */
	public function getAncestors($schema, $data, $isForDisplay = false) {
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

			// Build an empty parent object
			$parent = $this->buildDataObject($schema, $parentTable, null, $isForDisplay);
						
			// Fill the PK values
			foreach ($parent->infoFields as $key) {
				$keyField = $data->getInfoField($key->data);
				if ($keyField != null && $keyField->value != null) {
					$key->value = $keyField->value;
				}
			}

			// Get the line of data from the table
			$parent = $this->getDatum($parent);

			$ancestors[] = $parent;

			// Recurse
			$ancestors = array_merge($ancestors, $this->getAncestors($schema, $parent, $isForDisplay));

		}
		return $ancestors;

	}

	/**
	 * Get the information about the children of a line of data.
	 *
	 * @param DataObject $data the data object we're looking at.
	 * @return List[DataObject] The lines of data in the parent tables.
	 */
	public function getChildren($schema, $data) {
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

			// Build an empty data object (for the query)
			$child = $this->buildDataObject($schema, $childTable);

			// Fill the known primary keys
			foreach ($data->infoFields as $dataKey) {
				foreach ($child->infoFields as $childKey) {
					if ($dataKey->data == $childKey->data) {
						$childKey->value = $dataKey->value;
					}
				}
			}

			// Get the lines of data corresponding to the partial key
			$childs = $this->getData($schema, $child);

			// Add to the result
			$children[$child->tableFormat->format] = $childs;

		}

		return $children;
	}

	/**
	 * Serialize the data object as a JSON string.
	 *
	 * @param DataObject $data the data object we're looking at.
	 * @return JSON
	 */
	public function dataToDetailJSON($data) {

		$json = "{title:'".$data->tableFormat->format."', is_array:false, fields:[";
		$fields = "";
		foreach ($data->getFields() as $tableField) {

			// Get the form field correspondnig to the table field
			$form = $this->metadataModel->getTableToFormMapping($tableField, true);

			// Add the corresponding JSON
			if ($form != null) {
				$fields .= $form->toDetailJSON().",";
			}
		}
		// remove last comma
		if ($fields != "") {
			$fields = substr($fields, 0, -1);
		}
		$json .= $fields."]}";

		return $json;
	}
}
