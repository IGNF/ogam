<?php
/**
 * © French National Forest Inventory 
 * Licensed under EUPL v1.1 (see http://ec.europa.eu/idabc/eupl).
 */ 
require_once 'metadata/Field.php';

/**
 * Represent a Field of a File.
 * @package classes
 */
class FileField extends Field {
    
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
        return 'name:'.json_encode($this->format.'__'.$this->data).
                ',format:'.json_encode($this->format).
                ',label:'.json_encode($this->label).
                ',isMandatory:'.json_encode($this->isMandatory).
                ',definition:'.json_encode($this->definition).
                ',mask:'.json_encode($this->mask);
    }
}