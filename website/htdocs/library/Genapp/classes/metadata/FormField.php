<?php
require_once LIBRARY_PATH.'/Genapp/classes/metadata/Field.php';

/**
 * Represent a Field of a Form.
 * @package classes
 */
class FormField extends Field {

	/**
	 * The input type of the field (SELECT, TEXT, ...).
	 */
	var $inputType;

	/**
	 * True if the field is a criteria.
	 */
	var $isCriteria;

	/**
	 * True if the field is a result.
	 */
	var $isResult;

	/**
	 * True if the field is a default criteria.
	 */
	var $isDefaultCriteria;

	/**
	 * True if the field is a default result.
	 */
	var $isDefaultResult;

	/**
	 * default value for the criteria.
	 */
	var $defaultValue;

	/**
	 * the number of decimals for a numeric value.
	 */
	var $decimals;

	/**
	 * the mask (for dates).
	 */
	var $mask;

	/**
	 * The value of the field (this is not defined in the metadata databae, it's the raw value of the data).
	 * Can be an array in case of a select multiple (will generate a OR clause). 
	 * @var mixed 
	 * 
	 * Examples of valid values :
	 * toto
	 * 12.6
	 * 0.2 - 0.6
	 * 2010/05/12
	 * 2010/05/12 - 2010/06/30
	 * POINT(3.51, 4.65)
	 */
	var $value;

	/**
	 * The label corresponding to value of the field (this is not defined in the metadata databae, it's the raw value of the data).
	 */
	var $valueLabel;

	/**
	 * Serialize the object as a JSON used to describe a list of result columns
	 *
	 * @return JSON the form field descriptor
	 */
	public function toJSON() {
		$return = 'name:'.json_encode($this->format.'__'.$this->data);
		$return .= ',data:'.json_encode($this->data);
		$return .= ',format:'.json_encode($this->format);
		$return .= ',label:'.json_encode($this->label);
		$return .= ',inputType:'.json_encode($this->inputType);
		$return .= ',unit:'.json_encode($this->unit);
		$return .= ',type:'.json_encode($this->type);
		$return .= ',definition:'.json_encode($this->definition);
		$return .= ',decimals:'.json_encode($this->decimals);
		return $return;
	}

	/**
	 * Serialize the object as a JSON string for display in the detail panel
	 *
	 * @return JSON the form field descriptor
	 */
	public function toDetailJSON() {
		$return = '{label:'.json_encode($this->label);
		$return .= ',value:'.json_encode($this->valueLabel).'}';

		return $return;
	}

	/**
	 * Serialize the criteria as a JSON string
	 *
	 * @return JSON the criteria field descriptor
	 */
	public function toCriteriaJSON() {
		$return = 'a:'.json_encode($this->format.'__'.$this->data);
		$return .= ',b:'.json_encode($this->label);
		$return .= ',c:'.json_encode($this->inputType);
		$return .= ',d:'.json_encode($this->type);
		$return .= ',e:'.json_encode($this->definition);
		$return .= ',f:'.$this->isDefaultCriteria;
		$return .= ',g:'.json_encode($this->defaultValue);
		$return .= ',h:'.json_encode($this->decimals);
		return $return;
	}

	/**
	 * Serialize the result as a JSON string
	 *
	 * @return JSON the result field descriptor
	 */
	public function toResultJSON() {
		$return = 'a:'.json_encode($this->format.'__'.$this->data);
		$return .= ',b:'.json_encode($this->label);
		$return .= ',c:'.json_encode($this->definition);
		$return .= ',d:'.$this->isDefaultResult;
		return $return;
	}

	/**
	 * Clone the field
	 */
	function __clone() {
		foreach ($this as $name => $value) {
			if (gettype($value) == 'object') {
				$this->$name = clone ($this->$name);
			}
		}
	}
}
