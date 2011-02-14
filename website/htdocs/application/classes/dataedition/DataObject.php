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
	 * The logical name of the datatable
	 */
	var $format;

	/**
	 * The elements of the primary key.
	 * Array[Values].
	 */
	var $primaryKeys = array();

	/**
	 * The other values.
	 * Array[Values].
	 */
	var $values = array();

	/**
	 * Add a key element.
	 *
	 * @param Value a value
	 */
	public function addPrimaryKey($value) {
		$this->primaryKeys[] = $value;
	}

	/**
	 * Add a value element.
	 *
	 * @param Value a value
	 */
	public function addValue($value) {
		$this->values[] = $value;
	}

}
