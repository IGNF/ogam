<?php
/**
 * © French National Forest Inventory
 * Licensed under EUPL v1.1 (see http://ec.europa.eu/idabc/eupl).
 */

/**
 * Represent a Table Format (a table in a database).
 * 
 * @package objects
 * @SuppressWarnings checkUnusedVariables
 */
class Genapp_Object_Metadata_TableFormat extends Genapp_Object_Metadata_Format {

	/**
	 * The real name of the table.
	 */
	var $tableName;

	/**
	 * The schema identifier.
	 */
	var $schemaCode;
	
	/**
	 * The primary key.
	 */
	var $primaryKeys = array();

	/**
	 * The label.
	 */
	var $label;
}
