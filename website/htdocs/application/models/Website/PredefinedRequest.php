<?php
/**
 * © French National Forest Inventory
 * Licensed under EUPL v1.1 (see http://ec.europa.eu/idabc/eupl).
 */
//require_once APPLICATION_PATH.'/classes/website/PredefinedField.php';


/**
 * Represent a predefined request.
 *
 * @package classes
 */
class Application_Model_Website_PredefinedRequest {

	/**
	 * The request name.
	 */
	var $requestName;

	/**
	 * The request definition.
	 */
	var $definition;

	/**
	 * The request label.
	 */
	var $label;

	/**
	 * The date of creation of the request.
	 */
	var $date;

	/**
	 * The schema where the predefined request is executed (RAW or HARMONIZED).
	 */
	var $schemaCode;

	/**
	 * The dataset identifier.
	 */
	var $datasetID;

	/**
	 * The position of the request in its group.
	 */
	var $position;

	/**
	 * The logical name of the group of requests.
	 */
	var $groupName;

	/**
	 * The label of the group of requests.
	 */
	var $groupLabel;

	/**
	 * The position of the group of requests.
	 */
	var $groupPosition;

	/**
	 * The label of the dataset.
	 */
	var $datasetLabel;

	/**
	 * The list of result columns (array[PredefinedField]).
	 */
	var $resultsList = array();

	/**
	 * The list of criteria columns (array[PredefinedField]).
	 */
	var $criteriaList = array();

	/**
	 * Return a JSON representation of the object.
	 * This should correspond to the definition of the grid reader in PredefinedRequestPanel.js
	 *
	 * @return String
	 */
	function toJSON() {
		$json = '[';
		$json .= json_encode($this->requestName);
		$json .= ','.json_encode($this->label);
		$json .= ','.json_encode($this->definition);
		$json .= ','; // click
		$json .= ','.json_encode($this->date);
		$json .= ','; // criteria_hint
		$json .= ','.json_encode($this->position);
		$json .= ','.json_encode($this->groupName);
		$json .= ','.json_encode($this->groupLabel);
		$json .= ','.json_encode($this->groupPosition);
		$json .= ','.json_encode($this->datasetID);
		$json .= ']';

		return $json;
	}

}
