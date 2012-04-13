<?php
/**
 * © French National Forest Inventory 
 * Licensed under EUPL v1.1 (see http://ec.europa.eu/idabc/eupl).
 */ 

/**
 * Represent a dataset.
 * 
 * @package objects
 * @SuppressWarnings checkUnusedVariables
 */
class Genapp_Object_Metadata_Dataset {

	/**
	 * The identifier of the dataset.
	 */
	var $id;
	
	/**
	 * The label.
	 */
	var $label;
	
	/**
	 * The definition.
	 */
	var $definition;
	
	/**
	 * Indicate if the dataset is displayed by default.
	 */
	var $isDefault;
	
	/**
	* Serialize the object as a JSON string
	*
	* @return a JSON string
	*/
	public function toJSON() {
	
		$json = '"id":'.json_encode($this->id);
		$json .= ',"label":'.json_encode($this->label);
		$json .= ',"definition":'.json_encode($this->definition);
		$json .= ',"is_default":'.json_encode($this->isDefault);
	
		return $json;
	}

}