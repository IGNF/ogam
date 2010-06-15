<?php
/**
 * © French National Forest Inventory 
 * Licensed under EUPL v1.1 (see http://ec.europa.eu/idabc/eupl).
 */ 

/**
 * Represent a Form Format (a logical bloc of the HTML Query page).
 * @package classes
 */
class FormFormat {

	/**
	 * The form identifier 
	 */
	var $format;
	
	/**
	 * The label of the form
	 */
	var $label;
	
	
	/**
	 * The definition of the form
	 */
	var $definition;
	
	/**
	 * Serialize the object as a JSON string
	 * 
	 * @return a JSON string
	 */
	public function toJSON() {
		return 'id:'.json_encode($this->format).',label:'.json_encode($this->label);
	}

}