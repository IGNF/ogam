<?php
/**
 * © French National Forest Inventory 
 * Licensed under EUPL v1.1 (see http://ec.europa.eu/idabc/eupl).
 */ 
require_once APPLICATION_PATH.'/classes/website/PredefinedField.php';;

/**
 * Represent a predefined request.
 *
 * @package classes
 */
class PredefinedRequest {
	
	/**
	 * The request name.
	 */
	var $requestName;
	
	/**
	 * The request definition.
	 */
	var $definition;

	/**
	 * The dataset identifier.
	 */
	var $datasetID;

	/**
	 * The schema code.
	 */
	var $schemaCode;

	/**
	 * The list of result columns (array[PredefinedField]).
	 */
	var $resultsList = array();

	/**
	 * The list of criteria columns (array[PredefinedField]).
	 */
	var $criteriaList = array();

}
