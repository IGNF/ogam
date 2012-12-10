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
