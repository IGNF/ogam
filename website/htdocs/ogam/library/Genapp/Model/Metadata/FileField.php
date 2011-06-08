<?php
/**
 * © French National Forest Inventory
 * Licensed under EUPL v1.1 (see http://ec.europa.eu/idabc/eupl).
 */

/**
 * Represent a Field of a File.
 * 
 * @package classes
 * @SuppressWarnings checkUnusedVariables
 */
class Genapp_Model_Metadata_FileField extends Genapp_Model_Metadata_Field {

	/**
	 * Indicate if the field is mandatory
	 * 1 for true
	 * 0 for false
	 */
	var $isMandatory;

	/**
	 * The mask of the field
	 */
	var $mask;

	/**
	 * Serialize the object as a JSON string
	 *
	 * @return a JSON string
	 */
	public function toJSON() {

		$json = 'name:'.json_encode($this->format.'__'.$this->data);
		$json .= ',format:'.json_encode($this->format);
		$json .= ',label:'.json_encode($this->label);
		$json .= ',isMandatory:'.json_encode($this->isMandatory);
		$json .= ',definition:'.json_encode($this->definition);
		$json .= ',mask:'.json_encode($this->mask);

		return $json;
	}
}
