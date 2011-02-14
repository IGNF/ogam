<?php
/**
 * © French National Forest Inventory
 * Licensed under EUPL v1.1 (see http://ec.europa.eu/idabc/eupl).
 */

/**
 * Represent a value in a data object.
 *
 * @package classes
 */
class Value {

	/**
	 * The logical name of the column
	 */
	var $data;

	/**
	 * The value.
	 */
	var $value;

	/**
	 * Constructor.
	 *
	 * @param $adata a data
	 * @param $avalue a value
	 */
	function Value($adata, $avalue) {
		$this->data = $adata;
		$this->value = $avalue;
	}

}
