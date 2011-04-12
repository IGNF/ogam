<?php
/**
 * © French National Forest Inventory 
 * Licensed under EUPL v1.1 (see http://ec.europa.eu/idabc/eupl).
 */ 

/**
 * Represent a grid definition.
 *
 * @package classes
 */
class Application_Model_Mapping_Grid {

	/**
	 * The logical name of the grid.
	 */
	var $name;

	/**
	 * The label of the grid.
	 */
	var $label;

	/**
	 * The name of the table containing the grid.
	 */
	var $tableName;

	/**
	 * The name of the column of the location table containing the cell id.
	 */
	var $locationColumn;

	/**
	 * The logical name of the aggregated layer corresponding to the grid.
	 */
	var $aggregationLayerName;

}
