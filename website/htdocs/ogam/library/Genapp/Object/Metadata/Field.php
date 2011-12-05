<?php
/**
 * © French National Forest Inventory
 * Licensed under EUPL v1.1 (see http://ec.europa.eu/idabc/eupl).
 */

/**
 * Represent a Field.
 *
 * @package objects
 * @SuppressWarnings checkUnusedVariables
 */
class Genapp_Object_Metadata_Field {

	/**
	 * The field identifier (data)
	 */
	var $data;

	/**
	 * The source format
	 */
	var $format;

	/**
	 * The label of the field
	 */
	var $label;

	/**
	 * The unit of the data
	 */
	var $unit;

	/**
	 * The type of the unit of the data (BOOLEAN, CODE, ARRAY, COORDINATE, DATE, INTEGER, NUMERIC or STRING)
	 */
	var $type;

	/**
	 * The sub-type of the unit of the data (MODE, TREE or DYNAMIC for CODE or ARRAY, RANGE for numeric)
	 */
	var $subtype;

	/**
	 * The definition of the field
	 */
	var $definition;

	/**
	 * Return the unique identifier of the field.
	 */
	function getName() {
		return $this->format.'__'. $this->data;
	}

}
