<?php
/**
 * © French National Forest Inventory
 * Licensed under EUPL v1.1 (see http://ec.europa.eu/idabc/eupl).
 */
//require_once 'Genapp/classes/metadata/Field.php';

/**
 * Represent a Field of a Database.
 * @package classes
 */
class Genapp_Model_Metadata_TableField extends Genapp_Model_Metadata_Field {

	/**
	 * The physical name of the column.
	 * @var String
	 */
	var $columnName;

	/**
	 * Indicate if the field is calculated during an INSERT or UPDATE.
	 * @var bool
	 */
	var $isCalculated;

	/**
	 * The value of the field (this is not defined in the metadata database, it's the raw value of the data).
	 * In case of a query request, can contain an array of authorised values (will generate a OR clause).
	 * @var mixed
	 */
	var $value;

	/**
	 * These fields are only filled when the table field is of unit GEOM.	
	 */
	var $xmin;
	var $xmax;
	var $ymin;
	var $ymax;
	var $center;
	
	/**
	 * The position of the table field to be displayed. This is used in the detail panel and in the data edition module. 
	 */
	var $position;

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
