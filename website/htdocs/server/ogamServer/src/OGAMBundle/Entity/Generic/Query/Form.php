<?php

namespace OGAMBundle\Entity\Generic\Query;

/**
 * A Form Query is the list of criterias and result columns
 */
class Form {

	/**
	 * The dataset identifier.
	 * String.
	 */
	var $datasetId;

	/**
	 * The criterias.
	 * Array[OGAMBundle\Entity\Generic\Query\Field]
	 */
	var $criterias = array();

	/**
	 * The asked results.
	 * Array[OGAMBundle\Entity\Generic\Query\Field]
	 */
	var $results = array();

	/**
	 * Add a new criteria.
	 *
	 * @param String $format
	 *        	the criteria form format
	 * @param String $data
	 *        	the criteria form data
	 * @param String $value
	 *        	the criteria value
	 */
	public function addCriteria($format, $data, $value) {
		$field = new CriteriaField();
		$field->setFormat($format);
		$field->setData($data);
		$field->setValue($value);
		$this->criterias[] = $field;
	}

	/**
	 * Add a new result.
	 *
	 * @param String $format
	 *        	the result form format
	 * @param String $data
	 *        	the result form data
	 */
	public function addResult($format, $data) {
		$field = new Field();
		$field->setFormat($format);
		$field->setData($data);
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

	/**
	 * Get the criterias.
	 *
	 * @return Array[FormField] the form fields
	 */
	public function getCriterias() {
		return $this->criterias;
	}

	/**
	 * Get the result columns.
	 *
	 * @return Array[FormField] the form fields
	 */
	public function getResults() {
		return $this->results;
	}

	/**
	 * Get the request validity.
	 *
	 * @return Boolean True if the request is valid.
	 */
	public function isValid() {
		return !empty($this->getResults());
	}
}
