<?php

/**
 * Represent an information about a table in the table hierarchical tree.
 * 
 * @package classes
 */
class TableTreeData {

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
	var $keys = array ();
	
	/**
	 * The primary key (String with the columns separated by a semicolon)
	 */
	var $identifiers = array ();
	
	/**
	 * The physical name of the table
	 */
	var $tableName;

	/**
	 * Indicate if the table is column-oriented (1 if true, 0 if false).
	 */
	var $isColumnOriented;
	
	/**
	 * The name of the field that first triggered the inclusion of this table.
	 * It is only used for column-oriented tables.
	 */
	var $fieldName;


	/**
	 * Return a logical name for the table.
	 * By default it is the table format.
	 * If the table is column oriented it must be joined more than once, the differenciate the name
	 * 
	 * @return Struing the logical name of the table
	 */
	function getLogicalName() {
		if ($this->isColumnOriented == 1) {
			return  $this->tableFormat."_".$this->fieldName;
		} else {
			return  $this->tableFormat;
		}
	}
	

}