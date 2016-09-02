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
	
		$this->logger->info('getDatum : ' . $tableFormat->format);
	
		$schema = $this->metadataModel->find('Schema', $tableFormat->schemaCode);
	
		// Get the values from the data table
		$sql = "SELECT " . $this->genericService->buildSelect($data->getFields());
		$sql .= " FROM " . $schema->name . "." . $tableFormat->tableName . " AS " . $tableFormat->format;
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
	
	public function setLogger($logger){
		$this->logger = $logger;
	}
}