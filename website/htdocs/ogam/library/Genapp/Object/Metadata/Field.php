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
	 * The value of the field (this is not defined in the metadata databae, it's the raw value of the data).
	 * Can be an array in case of a select multiple (will generate a OR clause).
	 * @var mixed
	 *
	 * Examples of valid values :
	 * toto
	 * 12.6
	 * 0.2 - 0.6
	 * 2010/05/12
	 * 2010/05/12 - 2010/06/30
	 * POINT(3.51, 4.65)
	 */
	var $value;

	/**
	 * The label corresponding to value of the field.
	 */
	var $valueLabel;

	/**
	 * Return the unique identifier of the field.
	 */
	function getName() {
		return $this->format.'__'. $this->data;
	}

}
