<?php

/**
 * Licensed under EUPL v1.1 (see http://ec.europa.eu/idabc/eupl).
 *
 * © European Union, 2008-2012
 *
 * Reuse is authorised, provided the source is acknowledged. The reuse policy of the European Commission is implemented by a Decision of 12 December 2011.
 *
 * The general principle of reuse can be subject to conditions which may be specified in individual copyright notices.
 * Therefore users are advised to refer to the copyright notices of the individual websites maintained under Europa and of the individual documents.
 * Reuse is not applicable to documents subject to intellectual property rights of third parties.
 */

/**
 * Represent a Field.
 *
 * @package objects
 * @SuppressWarnings checkUnusedVariables
 */
class Application_Object_Metadata_Field {

	/**
	 * The field identifier (data)
	 */
	var $data;

	/**
	 * The source format
	 */
	var $format;

	/**
	 * The label of the field
	 */
	var $label;

	/**
	 * The unit of the data
	 */
	var $unit;

	/**
	 * The type of the unit of the data (BOOLEAN, CODE, ARRAY, COORDINATE, DATE, INTEGER, NUMERIC or STRING)
	 */
	var $type;

	/**
	 * The sub-type of the unit of the data (MODE, TREE or DYNAMIC for CODE or ARRAY, RANGE for numeric)
	 */
	var $subtype;

	/**
	 * The definition of the field
	 */
	var $definition;

	/**
	 * The value of the field (this is not defined in the metadata databae, it's the raw value of the data).
	 * Can be an array in case of a select multiple (will generate a OR clause).
	 *
	 * @var mixed Examples of valid values :
	 *      toto
	 *      12.6
	 *      0.2 - 0.6
	 *      2010/05/12
	 *      2010/05/12 - 2010/06/30
	 *      POINT(3.51, 4.65)
	 */
	var $value;

	/**
	 * The label corresponding to value of the field.
	 */
	var $valueLabel;

	/**
	 * Return the unique identifier of the field.
	 *
	 * @return String the identifier of the field
	 */
	function getName() {
		return $this->format . '__' . $this->data;
	}

	/**
	 * Return the label.
	 *
	 * @return String the label
	 */
	function getLabel() {
		if ($this->label != null) {
			return $this->label;
		} else {
			return $this->data;
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
