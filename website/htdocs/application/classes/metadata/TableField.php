<?php
/**
 * © French National Forest Inventory 
 * Licensed under EUPL v1.1 (see http://ec.europa.eu/idabc/eupl).
 */ 
require_once 'metadata/Field.php';

/**
 * Represent a Field of a Database.
 * @package classes
 */
class TableField extends Field {


	/**
	 * The physical name of the column.
	 */
	var $columnName;

	/**
	 * The value of the field (OPTIONAL, only used for criterias).
	 */
	var $value;

	/**
	 * The name of the corresponding form field (used for column-oriented data).
	 */
	var $sourceFieldName;

	/**
	 * The name of the corresponding form (used for column-oriented data).
	 */
	var $sourceFormName;

	/**
	 * Link the field to its source table (used when building the SQL request).
	 * refer to a TableTreeData object.
	 */
	var $sourceTable;


}