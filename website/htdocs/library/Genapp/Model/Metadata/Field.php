<?php
/**
 * © French National Forest Inventory 
 * Licensed under EUPL v1.1 (see http://ec.europa.eu/idabc/eupl).
 */ 

/**
 * Represent a Field.
 *
 * @package classes
 */
class Genapp_Model_Metadata_Field {

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
	 * The type of the unit of the data (INTEGER, STRING, ...)
	 */
	var $type;

	/**
	 * The definition of the field
	 */
	var $definition;

}
