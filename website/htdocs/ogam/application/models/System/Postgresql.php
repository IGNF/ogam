<?php
/**
 * © French National Forest Inventory
 * Licensed under EUPL v1.1 (see http://ec.europa.eu/idabc/eupl).
 */

/**
 * Model used to access the system tables of PostgreSQL.
 * @package models
 */
class Application_Model_System_Postgresql extends Zend_Db_Table_Abstract {

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
		$req = " SELECT     UPPER(table_name) AS table, ";
		$req .= "           UPPER(table_schema) AS schema, ";
		$req .= "           UPPER(constraint_name) as primary_key, ";
		$req .= "           string_agg(UPPER(c.column_name),',') as pk_columns ";
		$req .= " FROM information_schema.tables ";
		$req .= " LEFT JOIN information_schema.table_constraints USING (table_catalog, table_schema, table_name) ";
		$req .= " LEFT JOIN information_schema.constraint_column_usage AS c USING (table_catalog, table_schema, table_name, constraint_name)  ";
		$req .= " WHERE table_type = 'BASE TABLE' ";
		$req .= " AND table_schema NOT IN ('pg_catalog', 'information_schema') ";
		$req .= " AND constraint_type = 'PRIMARY KEY' ";
		$req .= " GROUP BY table_name, table_schema, constraint_name ";

		$this->logger->info('getTables : '.$req);

		$query = $db->prepare($req);
		$query->execute(array());

		$results = $query->fetchAll();
		foreach ($results as $result) {
			
			$table = new Application_Object_System_Table();

			$table->tableName = $result['table'];
			$table->schemaName = $result['schema'];
			$table->setPrimaryKeys($result['pk_columns']);

			$tables[$table->schemaName.'_'.$table->tableName] = $table;

		}

		return $tables;

	}

	/**
	 * List the available data columns.
	 *
	 * @return The list of data
	 * @throws an exception if the request is not found
	 */
	public function getFields() {
		$db = $this->getAdapter();

		$fields = array();

		// Get the request
		$req = " SELECT 	UPPER(column_name) AS column, ";
		$req .= "           UPPER(table_schema) AS schema, ";
		$req .= "           UPPER(table_name) AS table, ";
		$req .= "           UPPER(data_type) AS type ";
		$req .= " FROM information_schema.columns ";
		$req .= " INNER JOIN information_schema.tables using (table_catalog, table_schema, table_name) ";
		$req .= " WHERE table_type = 'BASE TABLE' ";
		$req .= " AND table_schema NOT IN ('pg_catalog', 'information_schema') ";

		$this->logger->info('getFields : '.$req);

		$query = $db->prepare($req);
		$query->execute(array());

		$results = $query->fetchAll();
		foreach ($results as $result) {

			$field = new Application_Object_System_Field();

			$field->columnName = $result['column'];
			$field->tableName = $result['table'];
			$field->schemaName = $result['schema'];
			$field->type = $result['type'];

			$fields[$field->schemaName.'_'.$field->tableName.'_'.$field->columnName] = $field;

		}

		return $fields;

	}

}
