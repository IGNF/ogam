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
 * Represent a predefined request.
 *
 * @package objects
 * @SuppressWarnings checkUnusedVariables
 */
class Application_Object_Website_PredefinedRequest {

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
// 		$json .= ',0'; // click
		$json .= ','.json_encode($this->date);
// 		$json .= ',null'; // criteria_hint
		$json .= ','.json_encode($this->position);
		$json .= ','.json_encode($this->groupName);
		$json .= ','.json_encode($this->groupLabel);
		$json .= ','.json_encode($this->groupPosition);
		$json .= ','.json_encode($this->datasetID);
		$json .= ']';

		return $json;
	}

}
