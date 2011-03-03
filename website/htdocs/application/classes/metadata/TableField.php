<?php
/**
 * © French National Forest Inventory
 * Licensed under EUPL v1.1 (see http://ec.europa.eu/idabc/eupl).
 */
require_once 'metadata/Field.php';

/**
 * Represent a Field of a Database.
 * @package classes
 */
class TableField extends Field {

	/**
	 * The physical name of the column.
	 */
	var $columnName;

	/**
	 * Indicate if the field is calculated during an INSERT or UPDATE.
	 */
	var $isCalculated;

	/**
	 * Indicate if an operation of agregation can be done on this field (for numeric values).
	 */
	var $isAggregatable;

	/**
	 * The value of the field (this is not defined in the metadata databae, it's the raw value of the data).
	 */
	var $value;

	/**
	 * Clone the field
	 */
	function __clone() {
		foreach ($this as $name => $value) {
			if (gettype($value) == 'object') {
				$this->$name = clone ($this->$name);
			}
		}
	}

}
