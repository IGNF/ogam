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
	 * @param TableField a value
	 */
	public function addPrimaryKey($field) {
		$this->primaryKeys[] = $field;
	}

	/**
	 * Add a field element.
	 *
	 * @param TableField a field
	 */
	public function addField($field) {
		$this->fields[] = $field;
	}

}
