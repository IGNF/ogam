<?php
require_once 'metadata/Field.php';

/**
 * Represent a Field of a Form.
 * @package classes
 */
class FormField extends Field {

	/**
	 * The input type of the field (SELECT, TEXT, ...)
	 */
	var $inputType;

	/**
	 * True if the field is a default criteria
	 */
	var $isDefaultCriteria;

	/**
	 * True if the field is a default result
	 */
	var $isDefaultResult;

	/**
     * default value for the criteria
     */
    var $defaultValue;

	/**
	 * Serialize the object as a JSON string
	 *
	 * @return JSON the form field descriptor
	 */
	public function toJSON() {
		$return = 'name:'.json_encode($this->format.'__'.$this->data).
                ',data:'.json_encode($this->data).
                ',format:'.json_encode($this->format).
                ',label:'.json_encode($this->label).
                ',inputType:'.json_encode($this->inputType).
                ',unit:'.json_encode($this->unit).
                ',type:'.json_encode($this->type).
                ',definition:'.json_encode($this->definition);
		return $return;
	}

	/**
	 * Serialize the criteria as a JSON string
	 *
	 * @return JSON the criteria field descriptor
	 */
	public function toCriteriaJSON() {
		$return = 'a:'.json_encode($this->format.'__'.$this->data).
                ',b:'.json_encode($this->label).
                ',c:'.json_encode($this->inputType).
                ',d:'.json_encode($this->type).
                ',e:'.json_encode($this->definition).
                ',f:'.$this->isDefaultCriteria.
                ',g:'.json_encode($this->defaultValue);
		return $return;
	}

	/**
	 * Serialize the result as a JSON string
	 *
	 * @return JSON the result field descriptor
	 */
	public function toResultJSON() {
		$return = 'a:'.json_encode($this->format.'__'.$this->data).
                ',b:'.json_encode($this->label).
                ',c:'.json_encode($this->definition).
                ',d:'.$this->isDefaultResult;
		return $return;
	}
}