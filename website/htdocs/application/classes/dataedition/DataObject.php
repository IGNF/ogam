<?php
/**
 * © French National Forest Inventory
 * Licensed under EUPL v1.1 (see http://ec.europa.eu/idabc/eupl).
 */

/**
 * Represent a data object.
 *
 * A data objet can be any entry in the raw database.
 *
 * @package classes
 */
class DataObject {

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
	var $primaryKeys = array();

	/**
	 * The other values.
	 * Array[TableField].
	 */
	var $fields = array();

	/**
	 * Add a key element.
	 *
	 * @param TableField $field a field
	 */
	public function addPrimaryKeyField($field) {
		$this->primaryKeys[$field->data] = $field;
	}

	/**
	 * Get a table field from the primary key.
	 *
	 * @param String $key a data
	 * @return TableField the table field
	 */
	public function getPrimaryKeyField($key) {
		return $this->primaryKeys[trim($key)];
	}

	/**
	 * Add a field element.
	 *
	 * @param TableField $field a field
	 */
	public function addField($field) {
		$this->fields[$field->data] = $field;
	}

}
