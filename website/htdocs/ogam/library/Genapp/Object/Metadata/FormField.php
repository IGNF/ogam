<?php

/**
 * Represent a Field of a Form.
 *
 * @package objects
 * @SuppressWarnings checkUnusedVariables
 */
class Genapp_Object_Metadata_FormField extends Genapp_Object_Metadata_Field {

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
	 * Indicate if the field is editable (for the edition module).
	 *
	 * @var Boolean
	 */
	var $editable;

	/**
	 * Indicate if the field is insertable (for the edition module).
	 *
	 * @var Boolean
	 */
	var $insertable;

	/**
	 * Indicate if the field is required (for the edition module).
	 *
	 * @var Boolean
	 */
	var $required;

	/**
	 * The field position in the form
	 */
	var $position;

	/**
	 * Serialize the object as a JSON used to describe a list of result columns
	 *
	 * @return JSON the form field descriptor
	 */
	public function toJSON() {
		$return = '"name":'.json_encode($this->getName());
		$return .= ',"data":'.json_encode($this->data);
		$return .= ',"format":'.json_encode($this->format);
		$return .= ',"label":'.json_encode($this->label);
		$return .= ',"inputType":'.json_encode($this->inputType);
		$return .= ',"unit":'.json_encode($this->unit);
		$return .= ',"type":'.json_encode($this->type);
		$return .= ',"subtype":'.json_encode($this->subtype);
		$return .= ',"definition":'.json_encode($this->definition);
		$return .= ',"decimals":'.json_encode($this->decimals);
		return $return;
	}

	/**
	 * Serialize the object as a JSON used to describe form field for the edition module.
	 *
	 * @return JSON the form field descriptor
	 */
	public function toEditJSON() {
		$return = '"name":'.json_encode($this->getName());
		$return .= ',"data":'.json_encode($this->data);
		$return .= ',"format":'.json_encode($this->format);
		$return .= ',"label":'.json_encode($this->label);
		$return .= ',"inputType":'.json_encode($this->inputType);
		$return .= ',"unit":'.json_encode($this->unit);
		$return .= ',"type":'.json_encode($this->type);
		$return .= ',"subtype":'.json_encode($this->subtype);
		$return .= ',"definition":'.json_encode($this->definition);
		$return .= ',"decimals":'.json_encode($this->decimals);
		$return .= ',"value":'.json_encode($this->value);
		$return .= ',"valueLabel":'.json_encode($this->getValueLabel());
		$return .= ',"editable":'.json_encode($this->editable);
		$return .= ',"insertable":'.json_encode($this->insertable);
		$return .= ',"required":'.json_encode($this->required);
		return $return;
	}

	/**
	 * Serialize the object as a JSON string for display in the detail panel
	 *
	 * @return JSON the form field descriptor
	 */
	public function toDetailJSON() {
		$return = '{"label":'.json_encode($this->label);

		if ($this->inputType == 'NUMERIC' && $this->decimals != null && $this->decimals != "") {
			$this->valueLabel = number_format($this->valueLabel, $this->decimals);
		}

		$return .= ',"value":'.json_encode($this->getValueLabel());
		$return .= ',"type":'.json_encode($this->inputType).'}';

		return $return;
	}

	/**
	 * Serialize the criteria as a JSON string
	 *
	 * @return JSON the criteria field descriptor
	 */
	public function toCriteriaJSON() {
		$return = '"name":'.json_encode($this->getName());
		$return .= ',"label":'.json_encode($this->label);
		$return .= ',"inputType":'.json_encode($this->inputType);
		$return .= ',"unit":'.json_encode($this->unit);
		$return .= ',"type":'.json_encode($this->type);
		$return .= ',"subtype":'.json_encode($this->subtype);
		$return .= ',"definition":'.json_encode($this->definition);
		$return .= ',"is_default":'.$this->isDefaultCriteria;
		$return .= ',"default_value":'.json_encode($this->defaultValue);
		$return .= ',"decimals":'.json_encode($this->decimals);
		return $return;
	}

	/**
	 * Serialize the result as a JSON string
	 *
	 * @return JSON the result field descriptor
	 */
	public function toResultJSON() {
		$return = '"name":'.json_encode($this->getName());
		$return .= ',"label":'.json_encode($this->label);
		$return .= ',"definition":'.json_encode($this->definition);
		$return .= ',"is_default":'.$this->isDefaultResult;
		$return .= ',"decimals":'.json_encode($this->decimals);
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

	/**
	 * Return the label corresponding to the value.
	 * For a code, will return the description.
	 * 
	 * @return String the label
	 */
	function getValueLabel() {
		if ($this->valueLabel != null) {
			return $this->valueLabel;
		} else {
			return $this->value;
		}
	}

}