<?php

namespace OGAMBundle\Manager;

use OGAMBundle\Entity\Generic\DataObject;
use Doctrine\DBAL\Connection;
use Doctrine\ORM\EntityManager;
use OGAMBundle\Services\GenericService;

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
	
		$schema = $this->metadataModel->find('OGAMBundle:Metadata\Schema', $tableFormat->getSchemaCode());
	
		// Get the values from the data table
		$sql = "SELECT " . $this->genericService->buildSelect($data->getFields());
		$sql .= " FROM " . $schema->name . "." . $tableFormat->getTableName() . " AS " . $tableFormat->getFormat();
		$sql .= " WHERE (1 = 1)" . $this->genericService->buildWhere($schema->code, $data->infoFields);
	
		$this->logger->info('getDatum : ' . $sql);
	
		$select = $this->rawdb->prepare($sql);
		$select->execute();
		$row = $select->fetch();
	
		// Fill the values with data from the table
		foreach ($data->editableFields as $field) {
			$key = strtolower($field->getName());
			$field->value = $row[$key];
	
			// Store additional info for geometry type
			if ($field->type === "GEOM") {
				$field->xmin = $row[strtolower($key) . '_x_min'];
				$field->xmax = $row[strtolower($key) . '_x_max'];
				$field->ymin = $row[strtolower($key) . '_y_min'];
				$field->ymax = $row[strtolower($key) . '_y_max'];
			} else if ($field->type === "ARRAY") {
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
	 * @param DataObject $data
	 *        	the data object we're looking at.
	 * @return DataObject[] The line of data in the parent tables.
	 */
	public function getAncestors(DataObject $data) {
		$ancestors = array();
	
		/* @var $data Application_Object_Generic_DataObject */
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
	
	    /* @var $data Application_Object_Generic_DataObject */
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
	                if ($dataKey->data == $childKey->data) {
	                    $childKey->value = $dataKey->value;
	                }
	            }
	            foreach ($child->editableFields as $childKey) {
	                if ($dataKey->data == $childKey->data) {
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
	 * @param Application_Object_Generic_DataObject $data
	 *        	the shell of the data object with the values for the primary key.
	 * @return Array[DataObject] The complete data objects.
	 */
	private function _getDataList($data) {
	    $this->logger->info('_getDataList');
	
	    $result = array();
	
	    // The table format descriptor
	    $tableFormat = $data->tableFormat;
	
	    $schema = $this->metadataModel->getSchema($tableFormat->schemaCode);
	
	    // Get the values from the data table
	    $sql = "SELECT " . $this->genericService->buildSelect($data->getFields());
	    $sql .= " FROM " . $schema->name . "." . $tableFormat->tableName . " AS " . $tableFormat->format;
	    $sql .= " WHERE (1 = 1)" . $this->genericService->buildWhere($schema->code, array_merge($data->infoFields, $data->editableFields));
	
	    $this->logger->info('_getDataList : ' . $sql);
	
	    $select = $this->rawdb->prepare($sql);
	    $select->execute();
	    foreach ($select->fetchAll() as $row) {
	
	        // Build an new empty data object
	        $child = $this->genericService->buildDataObject($tableFormat->schemaCode, $data->tableFormat->format);
	
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
	
	public function setLogger($logger){
		$this->logger = $logger;
	}
}