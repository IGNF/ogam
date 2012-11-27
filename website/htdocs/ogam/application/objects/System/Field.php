<?php
/**
 * © French National Forest Inventory
 * Licensed under EUPL v1.1 (see http://ec.europa.eu/idabc/eupl).
 */

/**
 * Represent a Field in the system.
 * 
 * @package objects
 * @SuppressWarnings checkUnusedVariables
 */
class Application_Object_System_Field {

	/**
	* The real name of the column.
	*/
	var $columnName;

	/**
	 * The real name of the table.
	 */
	var $tableName;

	/**
	 * The real name of the schema.
	 */
	var $schemaName;
	
	/**
	* The type of the field in the database.
	*/
	var $type;

}
