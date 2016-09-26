<?php

namespace OGAMBundle\Manager;

use OGAMBundle\Entity\Generic\DataObject;
use Doctrine\DBAL\Connection;
use Doctrine\ORM\EntityManager;
use OGAMBundle\Services\GenericService;
use OGAMBundle\Entity\Metadata\TableTree;

/**
 * Class allowing generic access to the RAW_DATA tables.
 * @author FBourcier
 *        
 */
class GenericManager {
	/**
	 * The system of projection for the visualisation.
	 *
	 * @var String
	 */
	var $visualisationSRS;
	
	/**
	 * The logger.
	 *
	 * @var Logger
	 */
	var $logger;
	
	/**
	 * The generic service.
	 *
	 * @var GenericService
	 */
	protected $genericService;
	
	/**
	 * The metadata Model.
	 *
	 * @var EntityManager
	 */
	protected $metadataModel;
	
	/**
	 * The database connections
	 *
	 * @var Connection
	 */
	private $rawdb;
	/**
	 * 
	 * @var Connection
	 */
	private $metadatadb;
	
	/**
	 * Initialisation
	 */
	public function __construct($metaModel_em, $raw_em, $genericService, $configuration) {
	
		// Initialise the logger
		//$this->logger = Zend_Registry::get("logger");
	
		// Initialise the projection system
		$this->visualisationSRS = $configuration->getConfig('srs_visualisation', 3857);
	
		// Initialise the metadata model
		$this->metadataModel = $metaModel_em;
	
		// Initialise the generic service
		$this->genericService = $genericService;
	
		// The database connection
		$this->rawdb = $raw_em->getConnection();
		$this->metadatadb = $metaModel_em->getConnection();
	}
	
	/**
	 * Fill a line of data with the values a table, given its primary key.
	 * Only one object is expected in return.
	 *
	 * @param DataObject $data
	 *        	the shell of the data object with the values for the primary key.
	 * @return DataObject The complete data object.
	 */
	public function getDatum($data) {
		$tableFormat = $data->tableFormat;
	
		$this->logger->info('getDatum : ' . $tableFormat->getFormat());
	
		$schema = $this->metadataModel->find('OGAMBundle:Metadata\TableSchema', $tableFormat->getSchemaCode());
	
		// Get the values from the data table
		$sql = "SELECT " . $this->genericService->buildSelect($data->getFields());
		$sql .= " FROM " . $schema->getName() . "." . $tableFormat->getTableName() . " AS " . $tableFormat->getFormat();
		$sql .= " WHERE (1 = 1)" . $this->genericService->buildWhere($schema->getCode(), $data->infoFields);
	
		$this->logger->info('getDatum : ' . $sql);
	
		$select = $this->rawdb->prepare($sql);
		$select->execute();
		$row = $select->fetch();
	
		// Fill the values with data from the table
		foreach ($data->editableFields as $field) {
			$key = strtolower($field->getName());
			$field->value = $row[$key];
	       $unit =$field->getData()->getUnit();
			// Store additional info for geometry type
			if ($unit->getType() === "GEOM") {
				$field->xmin = $row[strtolower($key) . '_x_min'];
				$field->xmax = $row[strtolower($key) . '_x_max'];
				$field->ymin = $row[strtolower($key) . '_y_min'];
				$field->ymax = $row[strtolower($key) . '_y_max'];
			} else if ($unit->getType() === "ARRAY") {
				// For array field we transform the value in a array object
				$field->value = $this->genericService->stringToArray($field->value);
			}
		}
	
		// Fill the values with data from the table
		foreach ($data->getFields() as $field) {
	
			// Fill the value labels for the field
			$field->valueLabel = $this->genericService->getValueLabel($field, $field->value);
		}
	
		return $data;
	}
	
	/**
	 * Get the information about the ancestors of a line of data.
	 * The key elements in the parent tables must have an existing value in the child.
	 *
	 * @param DataObject $data the data object we're looking at.
	 * @return DataObject[] The line of data in the parent tables.
	 */
	public function getAncestors(DataObject $data) {
		$ancestors = array();
	
		$tableFormat = $data->tableFormat;
		/* @var $tableFormat TableFormat */
	
		$this->logger->info('getAncestors');
	
		// Get the parent of the current table
		$sql = "SELECT parent_table";
		$sql .= " FROM TABLE_TREE ";
		$sql .= " WHERE SCHEMA_CODE = '" . $tableFormat->getSchemaCode() . "'";
		$sql .= " AND child_table = '" . $tableFormat->getFormat() . "'";
	
		$this->logger->info('getAncestors : ' . $sql);
	
		$select = $this->metadatadb->prepare($sql);
		$select->execute();
		$parentTable = $select->fetchColumn(0);
	
		// Check if we are not the root table
		if ($parentTable != "*") {
	
			// Build an empty parent object
			$parent = $this->genericService->buildDataObject($tableFormat->getSchemaCode(), $parentTable, null);
	
			// Fill the PK values (we hope that the child contain the fields of the parent pk)
			foreach ($parent->infoFields as $key) {
				$fieldName = $data->tableFormat->getFormat() . '__' . $key->getData();
				$fields = $data->getFields();
				if (array_key_exists($fieldName, $fields)) {
					$keyField = $fields[$fieldName];
					if ($keyField != null && $keyField->value != null) {
						$key->value = $keyField->value;
					}
				}
			}
	
			// Get the line of data from the table
			$parent = $this->getDatum($parent);
	
			$ancestors[] = $parent;
	
			// Recurse
			$ancestors = array_merge($ancestors, $this->getAncestors($parent));
		}
		return $ancestors;
	}
	
	/**
	 * Get the information about the children of a line of data.
	 *
	 * @param DataObject $data
	 *        	the data object we're looking at.
	 * @param String $datasetId
	 *        	the dataset id
	 * @return Array[Format => List[DataObject]] The lines of data in the children tables, indexed by format.
	 */
	public function getChildren($data, $datasetId = null) {
	    $children = array();
	
	    /* @var $data DataObject */
	    $tableFormat = $data->tableFormat;
	    /* @var $tableFormat TableFormat */
	
	    $this->logger->info('getChildren dataset : ' . $datasetId);
	
	    // Get the children of the current table
	    $sql = "SELECT *";
	    $sql .= " FROM TABLE_TREE TT";
	    if ($datasetId != null) {
	        $sql .= " JOIN (SELECT DISTINCT DATASET_ID, SCHEMA_CODE, FORMAT FROM DATASET_FIELDS) as DF";
	        $sql .= " ON DF.SCHEMA_CODE = TT.SCHEMA_CODE AND DF.FORMAT = TT.CHILD_TABLE";
	    }
	    $sql .= " WHERE TT.SCHEMA_CODE = '" . $tableFormat->getSchemaCode() . "'";
	    $sql .= " AND TT.PARENT_TABLE = '" . $tableFormat->getFormat() . "'";
	    if ($datasetId != null) {
	        $sql .= " AND DF.DATASET_ID = '" . $datasetId . "'";
	    }
	
	    $this->logger->info('getChildren : ' . $sql);
	
	    $select = $this->metadatadb->prepare($sql);
	    $select->execute();
	
	    // For each potential child table listed, we search for the actual lines of data available
	    foreach ($select->fetchAll() as $row) {
	        $childTable = $row['child_table'];
	
	        // Build an empty data object (for the query)
	        $child = $this->genericService->buildDataObject($tableFormat->getSchemaCode(), $childTable);
	
	        // Fill the known primary keys (we hope the child contain the keys of the parent)
	        foreach ($data->infoFields as $dataKey) {
	            foreach ($child->infoFields as $childKey) {
	                if ($dataKey->getData() == $childKey->getData()) {
	                    $childKey->value = $dataKey->value;
	                }
	            }
	            foreach ($child->editableFields as $childKey) {
	                if ($dataKey->getData() == $childKey->getData()) {
	                    $childKey->value = $dataKey->value;
	                }
	            }
	        }
	
	        // Get the lines of data corresponding to the partial key
	        $childs = $this->_getDataList($child);
	
	        // Add to the result
	        $children[$child->tableFormat->getFormat()] = $childs;
	    }
	
	    return $children;
	}
	
	/**
	 * Get a list of data objects from a table, given an incomplete primary key.
	 * A list of data objects is expected in return.
	 *
	 * @param DataObject $data the shell of the data object with the values for the primary key.
	 * @return Array[DataObject] The complete data objects.
	 */
	private function _getDataList($data) {
	    $this->logger->info('_getDataList');
	
	    $result = array();
	
	    // The table format descriptor
	    $tableFormat = $data->tableFormat;
	
	    $schema = $tableFormat->getSchema();
	
	    // Get the values from the data table
	    $sql = "SELECT " . $this->genericService->buildSelect($data->getFields());
	    $sql .= " FROM " . $schema->getName() . "." . $tableFormat->getTableName() . " AS " . $tableFormat->getFormat();
	    $sql .= " WHERE (1 = 1)" . $this->genericService->buildWhere($schema->getCode(), array_merge($data->infoFields, $data->editableFields));
	
	    $this->logger->info('_getDataList : ' . $sql);
	
	    $select = $this->rawdb->prepare($sql);
	    $select->execute();
	    foreach ($select->fetchAll() as $row) {
	
	        // Build an new empty data object
	        $child = $this->genericService->buildDataObject($schema->getCode(), $data->tableFormat->getFormat());
	
	        // Fill the values with data from the table
	        foreach ($child->getFields() as $field) {
	
	            $field->value = $row[strtolower($field->getName())];
	
	            if ($field->type === "ARRAY") {
	                // For array field we transform the value in a array object
	                $field->value = $this->genericService->stringToArray($field->value);
	            }
	
	            // Fill the value labels for the field
	            $field->valueLabel = $this->genericService->getValueLabel($field, $field->value);
	        }
	
	        $result[] = $child;
	    }
	
	    return $result;
	}
	
	/**
	 * Get the join keys
	 *
	 * @param DataObject $data the shell of the data object.
	 * @return Array[String] The join keys.
	 */
	public function getJoinKeys($data) {
	    $tableFormat = $data->tableFormat;
/*	
	    $sql = "SELECT join_key";
	    $sql .= " FROM TABLE_TREE";
	    $sql .= " WHERE schema_code = '" . $tableFormat->schemaCode . "'";
	    $sql .= " AND child_table = '" . $tableFormat->format . "'";
	*/
	    $joinKeys = $this->metadataModel->find(TableTree::class, array('schema' => $tableFormat->getSchema()->getCode(), 'tableFormat'=>$tableFormat->getFormat()))->getJoinKeys();
	
	    return $joinKeys;
	}
	

	/**
	 * Insert a line of data from a table.
	 *
	 * @param DataObject $data the shell of the data object to insert.
	 * @return DataObject $data the eventually edited data object.
	 * @throws an exception if an error occur during insert
	 */
	public function insertData($data) {
	    $this->logger->info('insertData');
	
	    $tableFormat = $data->tableFormat;
	
	    $schema = $tableFormat->getSchema();
	
	    // Get the values from the data table
	    $sql = "INSERT INTO " . $schema->getName() . "." . $tableFormat->getTableName();
	    $columns = "";
	    $values = "";
	    $return = "";
	
	    // updates of the data.
	    foreach ($data->getInfoFields() as $field) {
	        if ($field->value !== null) {
	
	            // Primary keys that are not set should be serials ...
	            $columns .= $field->getColumnName() . ", ";
	            $values .= $this->genericService->buildSQLValueItem($schema->getCode(), $field);
	            $values .= ", ";
	        } else {
	            $this->logger->info('field ' . $field->getColumnName() . " " . $field->getIsCalculated());
	
	            // Case of a calculated PK (for example a serial)
	            if ($field->getIsCalculated()) {
	                if ($return == "") {
	                    $return .= " RETURNING ";
	                } else {
	                    $return .= ", ";
	                }
	                $return .= $field->columnName;
	            }
	        }
	    }
	    foreach ($data->getEditableFields() as $field) {
	        if ($field->value != null) {
	            // Primary keys that are not set should be serials ...
	            if ($field->getData()->getData() !== "LINE_NUMBER") {
	                $columns .= $field->getColumnName() . ", ";
	                $values .= $this->genericService->buildSQLValueItem($schema->getCode(), $field);
	                $values .= ", ";
	            }
	        }
	    }
	    // remove last commas
	    $columns = substr($columns, 0, -2);
	    $values = substr($values, 0, -2);
	
	    $sql .= "(" . $columns . ") VALUES (" . $values . ")" . $return;
	
	    $this->logger->info('insertData : ' . $sql);
	
	    $request = $this->rawdb->prepare($sql);
	
	    try {
	        $request->execute();
	    } catch (Exception $e) {
	        $this->logger->err('Error while inserting data  : ' . $e->getMessage());
	        throw new \Exception("Error while inserting data  : " . $e->getMessage());
	    }
	
	    if ($return !== "") {
	
	        foreach ($request->fetchAll() as $row) {
	            foreach ($data->getInfoFields() as $field) {
	                if ($field->getIsCalculated()) {
	                    $field->value = $row[strtolower($field->getColumnName())];
	                }
	            }
	        }
	    }
	
	    return $data;
	}

	/**
	 * Update a line of data from a table.
	 *
	 * @param DataObject $data the shell of the data object with the values for the primary key.
	 * @throws an exception if an error occur during update
	 */
	public function updateData($data) {
	
	    /* @var $data _DataObject */
	    $tableFormat = $data->tableFormat;
	    /* @var $tableFormat TableFormat */
	
	    $schema = $tableFormat->getSchema();
	
	    // Get the values from the data table
	    $sql = "UPDATE " . $schema->getName() . "." . $tableFormat->getTableName() . " " . $tableFormat->getFormat();
	    $sql .= " SET ";
	
	    // updates of the data.
	    foreach ($data->editableFields as $field) {
	        /* @var $field TableField */
	
	        if ($field->getData()->getData() != "LINE_NUMBER" && $field->getIsEditable()) {
	            // Hardcoded value
	            $sql .= $field->getColumnName() . " = " . $this->genericService->buildSQLValueItem($schema->getCode(), $field);
	            $sql .= ", ";
	        }
	    }
	    // remove last comma
	    $sql = substr($sql, 0, -2);
	
	    $sql .= " WHERE (1 = 1)";
	
	    // Build the WHERE clause with the info from the PK.
	    foreach ($data->infoFields as $primaryKey) {
	        // Hardcoded value : We ignore the submission_id info (we should have an unicity constraint that allow this)
	        $sql .= $this->genericService->buildWhereItem($schema->getCode(), $primaryKey, true);
	    }
	
	    $this->logger->info('updateData : ' . $sql);
	
	    $request = $this->rawdb->prepare($sql);
	
	    try {
	        $request->execute();
	    } catch (Exception $e) {
	        $this->logger->err('Error while updating data  : ' . $e->getMessage());
	        throw new \Exception("Error while updating data  : " . $e->getMessage());
	    }
	}
	
	
	public function setLogger($logger){
		$this->logger = $logger;
	}
}