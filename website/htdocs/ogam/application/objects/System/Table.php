<?php
/**
 * © French National Forest Inventory
 * Licensed under EUPL v1.1 (see http://ec.europa.eu/idabc/eupl).
 */

/**
 * Represent a Table in the system.
 *
 * @package objects
 * @SuppressWarnings checkUnusedVariables
 */
class Application_Object_System_Table {

	/**
	 * The real name of the table.
	 */
	var $tableName;

	/**
	 * The real name of the schema.
	 */
	var $schemaName;
	
	/**
	* The pks.
	*/
	var $primaryKeys = array();
	
	/**
	* Set the primary keys
	*
	* @param String $keys
	*/
	public function setPrimaryKeys($keys) {
		$this->primaryKeys = array();
		$pks = explode(",", $keys);
		foreach ($pks as $pk) {
			$this->primaryKeys[] = trim($pk); // we need to trim all the values
		}
	}

}
