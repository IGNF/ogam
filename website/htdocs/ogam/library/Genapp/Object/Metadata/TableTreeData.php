<?php
/**
 * © French National Forest Inventory
 * Licensed under EUPL v1.1 (see http://ec.europa.eu/idabc/eupl).
 */

/**
 * Represent an information about a table in the table hierarchical tree.
 *
 * @package objects
 * @SuppressWarnings checkUnusedVariables
 */
class Genapp_Object_Metadata_TableTreeData {

	/**
	 * The logical name of the table format
	 */
	var $tableFormat;

	/**
	 * The logical name of its ancestor
	 */
	var $parentTable;

	/**
	 * The foreign key (String with the columns separated by a semicolon)
	 */
	var $keys = array();

	/**
	 * The primary key (String with the columns separated by a semicolon)
	 */
	var $identifiers = array();

	/**
	 * The physical name of the table
	 */
	var $tableName;

	/**
	 * Return a logical name for the table.
	 * By default it is the table format.
	 * If the table is column oriented it must be joined more than once, the differenciate the name
	 *
	 * @return String the logical name of the table
	 */
	function getLogicalName() {
		return $this->tableFormat;
	}

}
