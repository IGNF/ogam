<?php
/**
 * © French National Forest Inventory
 * Licensed under EUPL v1.1 (see http://ec.europa.eu/idabc/eupl).
 */

/**
 * Model used to access the Metadata tables in order to compare with the real tables.
 * @package models
 */
class Application_Model_System_Metadata extends Zend_Db_Table_Abstract {

	var $logger;

	/**
	 * Initialisation
	 */
	public function init() {

		// Initialise the logger
		$this->logger = Zend_Registry::get("logger");
	}



	/**
	 * List the available tables.
	 *
	 * @return The list of tables
	 * @throws an exception if the request is not found
	 */
	public function getTables() {
		$db = $this->getAdapter();

		$tables = array();

		// Get the request
		$req = " SELECT * ";
		$req .= " FROM table_format t ";
		$req .= " INNER JOIN table_schema s USING (schema_code) ";

		$this->logger->info('getTables : '.$req);

		$query = $db->prepare($req);
		$query->execute(array());

		$results = $query->fetchAll();
		foreach ($results as $result) {
				
			$table = new Application_Object_System_Table();
				
			$table->tableName = $result['table_name'];
			$table->schemaName = $result['schema_name'];
			$table->setPrimaryKeys($row['primary_key']);
				
			$tables[$table->schemaName.'_'.$table->tableName] = $table;
				
		}

		return $tables;

	}
	
	
	/**
	* List the available tables.
	*
	* @return The list of tables
	* @throws an exception if the request is not found
	*/
	public function getFields() {
		$db = $this->getAdapter();
	
		$fields = array();
	
		// Get the request
		$req = " SELECT * ";
		$req .= " FROM table_field f ";
		$req .= " INNER JOIN table_format t USING (format)";
		$req .= " INNER JOIN table_schema s USING (schema_code) ";
		$req .= " INNER JOIN data USING (data) ";
		$req .= " INNER JOIN unit USING (unit) ";
	
		$this->logger->info('getFields : '.$req);
	
		$query = $db->prepare($req);
		$query->execute(array());
	
		$results = $query->fetchAll();
		foreach ($results as $result) {
	
			$field = new Application_Object_System_Field();
	
			$field->columnName = $result['column_name'];
			$field->tableName = $result['table_name'];
			$field->schemaName = $result['schema_name'];
			$field->type = $result['type'];
	
			$fields[$field->schemaName.'_'.$field->tableName.'_'.$field->columnName] = $field;
	
		}
	
		return $fields;
	
	}

}
