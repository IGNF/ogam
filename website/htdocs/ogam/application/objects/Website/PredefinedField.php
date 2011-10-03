<?php
/**
 * © French National Forest Inventory
 * Licensed under EUPL v1.1 (see http://ec.europa.eu/idabc/eupl).
 */

/**
 * Represent a Predefined Field.
 *
 * @package objects
 * @SuppressWarnings checkUnusedVariables
 */
class Application_Object_Website_PredefinedField {

	/**
	 * The field identifier (data)
	 */
	var $data;

	/**
	 * The source format
	 */
	var $format;

	/**
	 * The value of the field
	 */
	var $value;

	/**
	 * Indicate if the value is fixed ("1") or if the user can select it ("0").
	 */
	var $fixed;

	/**
	 * The input type (SELECT, CHECKBOX, ...).
	 */
	var $inputType;

	/**
	 * The unit.
	 */
	var $unit;

	/**
	 * The type of the data (CODE, STRING, RANGE, ...)
	 */
	var $type;

	/**
	 * The label.
	 */
	var $label;

	/**
	 * The definition.
	 */
	var $definition;

	/**
	 * Return a JSON representation of the object.
	 * This should correspond to the definition of the grid reader in PredefinedRequestPanel.js
	 *
	 * @return String
	 */
	function toJSON() {

		$json = json_encode($this->format."__".$this->data); // name
		$json .= ','.json_encode($this->format);
		$json .= ','.json_encode($this->data);
		$json .= ','.json_encode($this->value);
		$json .= ','.json_encode($this->fixed);
		$json .= ','.json_encode($this->inputType);
		$json .= ','.json_encode($this->type);
		$json .= ','.json_encode($this->label);
		$json .= ','.json_encode($this->definition);

		return $json;
	}

}
