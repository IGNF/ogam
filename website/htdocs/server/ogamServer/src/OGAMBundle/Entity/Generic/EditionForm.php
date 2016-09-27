<?php

namespace OGAMBundle\Entity\Generic;

use OGAMBundle\Entity\Metadata\TableField;

/**
 * A data object is used to store a values of a line of data (from any table of a database).
 */
class EditionForm {

	/**
	 * The identifier of the dataset.
	 */
	var $datasetId;

	/**
	 * The descriptor of the table.
	 * @var OgamBundle\Entity\Metadata\TableFormat
	 */
	var $tableFormat;

	/**
	 * The primary key fields
	 * @var Array[OgamBundle\Entity\Generic\Generic\TableField].
	 */
	var $pkFields = array();

	/**
	 * The fields not included into the primary key
	 * @var Array[OgamBundle\Entity\Generic\Generic\TableField].
	 */
	var $fields = array();

	/**
	 * Add a key field.
	 *
	 * @param GenericField $field a field
	 */
	public function addPkField(GenericField $field) {
		$this->pkFields[$field->getId()] = $field;
	}

	/**
	 * Get a field from the primary key.
	 *
	 * @param String $key a data
	 * @return GenericField the field
	 */
	public function getPkField($key) {
		return $this->pkFields[trim($key)];
	}

	/**
	 * Return the pkFields array.
	 *
	 * @return [GenericField] the pkFields array
	 */
	public function getPkFields() {
		return $this->pkFields;
	}

	/**
	 * Return the fields array.
	 *
	 * @return [GenericField] the fields array
	 */
	public function getFields() {
		return $this->fields;
	}

	/**
	 * Return a field.
	 *
	 * @param String $key a data
	 * @return GenericField the field
	 */
	public function getField($key) {
		return $this->fields[trim($key)];
	}

	/**
	 * Add a field.
	 *
	 * @param [GenericField] $field a field
	 */
	public function addField($field) {
		$this->fields[$field->getId()] = $field;
	}

	/**
	 * Get all table fields.
	 *
	 * @return [GenericField] the table fields
	 */
	public function getFields() {
		return array_merge($this->pksFields, $this->fields);
	}

	/**
	 * Build and return the datum id
	 *
	 * @return String the datum identifier
	 */
	public function getId() {
		$datumId = 'SCHEMA/' . $this->tableFormat->getSchemaCode() . '/FORMAT/' . $this->tableFormat->getFormat();
		foreach ($this->getPkFields() as $field) {
			$datumId .= '/' . $field->getData() . '/' . $field->getValue();
		}
		return $datumId;
	}
}
