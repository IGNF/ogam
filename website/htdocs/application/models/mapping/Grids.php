<?php

/**
 * This is the model for managing aggregation grids.
 * @package models
 */
class Model_Grids extends Zend_Db_Table_Abstract {

	var $logger;

	/**
	 * Initialisation
	 */
	public function init() {

		// Initialise the logger
		$this->logger = Zend_Registry::get("logger");
	}

	/**
	 * Get the list of available grids.
	 *
	 * @return Array[Grid]
	 */
	public function getGrids() {
		$db = $this->getAdapter();

		$req = " SELECT * "." FROM grid_definition "." ORDER BY position ";

		Zend_Registry::get("logger")->info('getGrids : '.$req);

		$select = $db->prepare($req);
		$select->execute();

		$result = array();
		foreach ($select->fetchAll() as $row) {
			$grid = new Grid();
			$grid->name = $row['grid_name'];
			$grid->label = $row['grid_label'];
			$grid->tableName = $row['grid_table'];
			$grid->locationColumn = $row['location_column'];
			$grid->aggregationLayerName = $row['aggregation_layer_name'];
			$result[] = $grid;
		}

		return $result;
	}

	/**
	 * Get the detail of one grid.
	 *
	 * @param String the grid name
	 * @return Grid
	 */
	public function getGrid($gridName) {
		$db = $this->getAdapter();

		Zend_Registry::get("logger")->debug('getGrid $gridName : '.$gridName);

		$req = " SELECT * "." FROM grid_definition "." WHERE grid_name = ? ";

		Zend_Registry::get("logger")->info('getGrid : '.$req);

		$select = $db->prepare($req);
		$select->execute(array($gridName));

		$row = $select->fetch();
		$grid = new Grid();
		$grid->name = $row['grid_name'];
		$grid->label = $row['grid_label'];
		$grid->tableName = $row['grid_table'];
		$grid->locationColumn = $row['location_column'];
		$grid->aggregationLayerName = $row['aggregation_layer_name'];

		return $grid;

	}
}
