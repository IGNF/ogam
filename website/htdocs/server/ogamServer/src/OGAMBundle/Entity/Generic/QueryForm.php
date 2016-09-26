<?php

namespace OGAMBundle\Entity\Generic;

/**
 * A Form Query is the list of criterias and columns
 */
class QueryForm {

	/**
	 * The dataset identifier.
	 * String.
	 */
	private $datasetId;

	/**
	 * The asked criterias.
	 * Array[OGAMBundle\Entity\Generic\Field]
	 */
	private $criterias = array();

	/**
	 * The asked columns.
	 * Array[OGAMBundle\Entity\Generic\Field]
	 */
	private $columns = array();

	/**
	 * Return the dataset Id
	 * @return string the dataset Id
	 */
	public function getDatasetId()
	{
	    return $this->datasetId;
	}
	
	/**
	 * Set the datasetId
	 * @param string $datasetId
	 */
	public function setDatasetId($datasetId)
	{
	    $this->datasetId = $datasetId;
	    return $this;
	}

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
		$formField = new GenericField($format, $data);
		$formField->setValue($value);
		$this->criterias[] = $formField;
	}

	/**
	 * Add a new column.
	 *
	 * @param String $format
	 *        	the column form format
	 * @param String $data
	 *        	the column form data
	 */
	public function addColumn($format, $data) {
		$formField = new GenericField($format, $data);
		$this->columns[] = $formField;
	}

	/**
	 * Get all table fields.
	 *
	 * @return Array[OGAMBundle\Entity\Generic\Field] the form fields
	 */
	public function getFields() {
		return array_merge($this->criterias, $this->columns);
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
	 * Get the columns.
	 *
	 * @return Array[OGAMBundle\Entity\Generic\Field] the form fields
	 */
	public function getColumns() {
		return $this->columns;
	}

	/**
	 * Get the request validity.
	 *
	 * @return Boolean True if the request is valid.
	 */
	public function isValid() {
		return !empty($this->getColumns());
	}
	
	/**
	 * TODO: Get all table formats.
	 *
	 * @return Array[String] the table formats
	 *
	public function getFormats() {
	    $formats = array();
	
	    foreach ($this->getFields() as $formField) {
	        if (!in_array($formField->format, $formats)) {
	            $formats[] = $formField->format;
	        }
	    }
	
	    return $formats;
	}*/
	
	/**
	 * TODO: Tell if the data object contains at least one geometry field.
	 *
	 * @return Boolean true is one geomtry field is present
	 *
	public function hasGeometry() {
	    $hasGeom = false;
	
	    foreach ($this->getFields() as $field) {
	        if ($field->type === 'GEOM') {
	            $hasGeom = true;
	            break;
	        }
	    }
	
	    return $hasGeom;
	}*/
}
