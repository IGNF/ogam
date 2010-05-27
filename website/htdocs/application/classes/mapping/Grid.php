<?php

/**
 * Represent a grid definition.
 *
 * @package classes
 */
class Grid {

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
