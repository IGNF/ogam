<?php

namespace OGAMBundle\Entity\Generic;

/**
 * A Form Query is the list of criterias and result columns
 */
class QueryForm {

	/**
	 * The dataset identifier.
	 * String.
	 */
	var $datasetId;

	/**
	 * The criterias.
	 * Array[OGAMBundle\Entity\Generic\Field]
	 */
	var $criterias = array();

	/**
	 * The asked results.
	 * Array[OGAMBundle\Entity\Generic\Field]
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
		$field = new GenericField();
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
		$field = new GenericField();
		$field->setFormat($format);
		$field->setData($data);
		$this->results[] = $field;
	}

	/**
	 * Get all table fields.
	 *
	 * @return Array[OGAMBundle\Entity\Generic\Field] the form fields
	 */
	public function getFields() {
		return array_merge($this->criterias, $this->results);
	}

	/**
	 * Get the criterias.
	 *
	 * @return Array[OGAMBundle\Entity\Generic\Field] the form fields
	 */
	public function getCriterias() {
		return $this->criterias;
	}

	/**
	 * Get the result columns.
	 *
	 * @return Array[OGAMBundle\Entity\Generic\Field] the form fields
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
	
	/**
	 * Get all table formats.
	 *
	 * @return Array[String] the table formats
	 */
	public function getFormats() {
	    $formats = array();
	
	    foreach ($this->getFields() as $field) {
	        if (!in_array($field->format, $formats)) {
	            $formats[] = $field->format;
	        }
	    }
	
	    return $formats;
	}
	
	/**
	 * Tell if the data object contains at least one geometry field.
	 *
	 * @return Boolean true is one geomtry field is present
	 */
	public function hasGeometry() {
	    $hasGeom = false;
	
	    foreach ($this->getFields() as $field) {
	        if ($field->type === 'GEOM') {
	            $hasGeom = true;
	            break;
	        }
	    }
	
	    return $hasGeom;
	}
}
