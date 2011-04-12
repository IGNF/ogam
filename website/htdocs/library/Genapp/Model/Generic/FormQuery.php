<?php
/**
 * © French National Forest Inventory
 * Licensed under EUPL v1.1 (see http://ec.europa.eu/idabc/eupl).
 */

/**
 * A Form Query is the list of criterias and result columns composing a request from the use.
 *
 * @package classes
 */
class Genapp_Model_Generic_FormQuery {

	/**
	 * The dataset identifier.
	 * String.
	 */
	var $datasetId;

	/**
	 * The criterias.
	 * Array[FormField].
	 */
	var $criterias = array();

	/**
	 * The asked results.
	 * Array[FormField].
	 */
	var $results = array();

	/**
	 * Add a new criteria.
	 *
	 * @param String $format the criteria form format
	 * @param String $data the criteria form data
	 * @param String $value the criteria value
	 */
	public function addCriteria($format, $data, $value) {
		$field = new Genapp_Model_Metadata_FormField();
		$field->format = $format;
		$field->data = $data;
		$field->value = $value;
		$this->criterias[] = $field;
	}

	/**
	 * Add a new result.
	 *
	 * @param String $format the result form format
	 *  @param String $data the result form data
	 */
	public function addResult($format, $data) {
		$field = new Genapp_Model_Metadata_FormField();
		$field->format = $format;
		$field->data = $data;
		$this->results[] = $field;
	}

	/**
	 * Get all table fields.
	 *
	 * @return Array[FormField] the form fields
	 */
	public function getFields() {
		return array_merge($this->criterias, $this->results);
	}

}
