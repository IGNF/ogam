<?php

/**
 * Represent a Field.
 *
 * @package classes
 */
class Field {

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
