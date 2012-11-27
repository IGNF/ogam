<?php
/**
 * © French National Forest Inventory
 * Licensed under EUPL v1.1 (see http://ec.europa.eu/idabc/eupl).
 */

/**
 * A data object is used to store a values of a line of data (from any table of a database).
 *
 * @package objects
 * @SuppressWarnings checkUnusedVariables
 */
class Genapp_Object_Generic_DataObject {

	/**
	 * The identifier of the dataset.
	 */
	var $datasetId;

	/**
	 * The descriptor of the table.
	 * TableFormat
	 */
	var $tableFormat;

	/**
	 * The elements of the primary key.
	 * Array[TableField].
	 */
	var $infoFields = array();

	/**
	 * The other values.
	 * Array[TableField].
	 */
	var $editableFields = array();

	/**
	 * Add a key element.
	 *
	 * @param TableField $field a field
	 */
	public function addInfoField($field) {
		$this->infoFields[$field->getName()] = $field;
	}

	/**
	 * Get a table field from the primary key.
	 *
	 * @param String $key a data
	 * @return TableField the table field
	 */
	public function getInfoField($key) {
		return $this->infoFields[trim($key)];
	}

	/**
	 * Return the infoFields array .
	 *
	 * @return TableField the infoFields array
	 */
	public function getInfoFields() {
		return $this->infoFields;
	}

	/**
	 * Return the editableFields array .
	 *
	 * @return TableField the editableFields array
	 */
	public function getEditableFields() {
		return $this->editableFields;
	}

	/**
	 * Add a field element.
	 *
	 * @param TableField $field a field
	 */
	public function addEditableField($field) {
		$this->editableFields[$field->getName()] = $field;
	}

	/**
	 * Get all table fields.
	 *
	 * @return Array[TableField] the table fields
	 */
	public function getFields() {
		return array_merge($this->infoFields, $this->editableFields);
	}

	/**
	 * Get all table formats.
	 *
	 * @return Array[String] the table formats
	 */
	public function getFormats() {

		$formats = array();

		foreach ($this->getFields() as $field) {
			if (!in_array($field->format, $formats)) {
				$formats[] = $field->format;
			}
		}

		return $formats;
	}

	/**
	 * Tell if the data object contains at least one geometry field.
	 *
	 * @return Boolean true is one geomtry field is present
	 */
	public function hasGeometry() {

		$hasGeom = false;

		foreach ($this->getFields() as $field) {
			if ($field->type == 'GEOM') {
				$hasGeom = true;
				break;
			}
		}

		return $hasGeom;
	}

	/**
	 * Build and return the datum id
	 *
	 * @return String the datum identifier
	 */
	public function getId() {
		$datumId = 'SCHEMA/'.$this->tableFormat->schemaCode.'/FORMAT/'.$this->tableFormat->format;
		foreach ($this->getInfoFields() as $field) {
			$datumId .= '/'.$field->data.'/'.$field->value;
		}
		return $datumId;
	}

}