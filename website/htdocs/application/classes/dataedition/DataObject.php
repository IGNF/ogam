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
	 * The logical name of the datatable
	 */
	var $format;

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
	 * @param TableField a value
	 */
	public function addPrimaryKey($value) {
		$this->primaryKeys[] = $value;
	}

	/**
	 * Add a value element.
	 *
	 * @param TableField a field
	 */
	public function addValue($field) {
		$this->fields[] = $field;
	}

}
