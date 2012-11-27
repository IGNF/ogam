<?php
/**
 * © French National Forest Inventory
 * Licensed under EUPL v1.1 (see http://ec.europa.eu/idabc/eupl).
 */

/**
 * Represent a Foreign Key in the system.
 *
 * @package objects
 * @SuppressWarnings checkUnusedVariables
 */
class Application_Object_System_ForeignKey {

	/**
	 * The name of the table.
	 */
	var $table;

	/**
	 * The name of referenced table.
	 */
	var $sourceTable;
	
	/**
	* The pks.
	*/
	var $foreignKeys = array();
	
	/**
	* Set the primary keys
	*
	* @param String $keys
	*/
	public function setForeignKeys($keys) {
		$this->foreignKeys = array();
		$pks = explode(",", $keys);
		foreach ($pks as $pk) {
			$this->foreignKeys[] = trim($pk); // we need to trim all the values
		}
	}

}
