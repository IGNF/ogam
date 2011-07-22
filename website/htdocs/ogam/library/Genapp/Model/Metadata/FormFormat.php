<?php
/**
 * © French National Forest Inventory
 * Licensed under EUPL v1.1 (see http://ec.europa.eu/idabc/eupl).
 */

/**
 * Represent a Form Format (a logical bloc of the HTML Query page).
 * 
 * @package classes
 * @SuppressWarnings checkUnusedVariables
 */
class Genapp_Model_Metadata_FormFormat extends Genapp_Model_Metadata_Format {

	/**
	 * The label of the form
	 */
	var $label;

	/**
	 * The definition of the form
	 */
	var $definition;

	/**
	 * The list of result columns.
	 */
	var $resultsList = array();

	/**
	 * The list of criteria columns.
	 */
	var $criteriaList = array();

	/**
	 * Serialize the object as a JSON string
	 *
	 * @return a JSON string
	 */
	public function toJSON() {
		return '"id":'.json_encode($this->format).',"label":'.json_encode($this->label);
	}

}
