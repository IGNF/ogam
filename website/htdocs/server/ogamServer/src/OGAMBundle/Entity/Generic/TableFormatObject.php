<?php

namespace OGAMBundle\Entity\Generic;

use OGAMBundle\Entity\Metadata\TableFormat;
use OGAMBundle\Entity\Metadata\TableField;

/**
 * A table format object represents an object stored in a single table of the database.
 */
class TableFormatObject {

	/**
	 * The identifier of the dataset.
	 */
	private $datasetId;

	/**
	 * The descriptor of the single database table.
	 * @var OgamBundle\Entity\Metadata\TableFormat
	 */
	private $tableFormat;

	/**
	 * The IDs fields
	 * (Array of GenericField with a metadata field of type TableField)
	 * @var Array[GenericField]
	 */
	private $idFields = array();

	/**
	 * The fields not included into the IDs fields
	 * (Array of GenericField with a metadata field of type TableField)
	 * @var Array[GenericField].
	 */
	private $fields = array();

	/**
	 * Create a TableFormatObject
	 * 
	 * @param string $datasetId The identifier of the dataset
	 * @param TableFormat $tableFormat The descriptor of the single database table
	 */
	function __construct($datasetId, TableFormat $tableFormat) {
	    $this->datasetId = $datasetId;
	    $this->tableFormat = $tableFormat;
	}

	/**
	 * Add a identifier field.
	 * (GenericField with a metadata field of type TableField)
	 * @param GenericField $field a field
	 */
	public function addIdField(GenericField $field) {
	    if(is_a($field->getMetadata(),TableField::class)){
	        $this->idFields[$field->getId()] = $field;
	    } else {
	        throw new \InvalidArgumentException('The GenericField must have a metadata field of type \'TableField\'.');
	    }
	}

	/**
	 * Add a field.
	 * (GenericField with a metadata field of type TableField)
	 * @param GenericField $field a field
	 */
	public function addField(GenericField $field) {
	    if(is_a($field->getMetadata(),TableField::class)){
	        $this->fields[$field->getId()] = $field;
	    } else {
	        throw new \InvalidArgumentException('The GenericField must have a metadata field of type \'TableField\'.');
	    }
	}

	/**
	 * Build and return the datum id
	 *
	 * @return String the datum identifier
	 */
	public function getId() {
	    $datumId = 'SCHEMA/' . $this->tableFormat->getSchemaCode() . '/FORMAT/' . $this->tableFormat->getFormat();
	    foreach ($this->getIdFields() as $field) {
	        $datumId .= '/' . $field->getData() . '/' . $field->getValue();
	    }
	    return $datumId;
	}

	/**
	 * Return the table format.
	 * 
	 * @return the TableFormat
	 */
	public function getTableFormat()
	{
	    return $this->tableFormat;
	}

	/**
	 * Get a identifier field.
	 *
	 * @param string $id
	 * @return Array[GenericField]
	 */
	public function getIdField($id) {
	    return $this->idFields[trim($id)];
	}

	/**
	 * Return the idFields array.
	 *
	 * @return Array[GenericField] the idFields array
	 */
	public function getIdFields() {
		return $this->idFields;
	}

	/**
	 * Return a field.
	 *
	 * @param String $id a field identifier
	 * @return GenericField the field
	 */
	public function getField($id) {
	    return $this->fields[trim($id)];
	}

	/**
	 * Return the fields array.
	 *
	 * @return Array[GenericField] the fields array
	 */
	public function getFields() {
		return $this->fields;
	}

	/**
	 * Get all table fields.
	 *
	 * @return [GenericField] the table fields
	 */
	public function all() {
	    return array_merge($this->idFields, $this->fields);
	}
}
