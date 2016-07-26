<?php

/**
 * Licensed under EUPL v1.1 (see http://ec.europa.eu/idabc/eupl).
 *
 * © European Union, 2008-2012
 *
 * Reuse is authorised, provided the source is acknowledged. The reuse policy of the European Commission is implemented by a Decision of 12 December 2011.
 *
 * The general principle of reuse can be subject to conditions which may be specified in individual copyright notices.
 * Therefore users are advised to refer to the copyright notices of the individual websites maintained under Europa and of the individual documents.
 * Reuse is not applicable to documents subject to intellectual property rights of third parties.
 */

/**
 * Represent an information about a table in the table hierarchical tree.
 *
 * @SuppressWarnings checkUnusedVariables
 *
 * @package Application_Object
 * @subpackage Metadata
 */
class Application_Object_Metadata_TableTreeData {

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
