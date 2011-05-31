<?php
/**
 * © French National Forest Inventory
 * Licensed under EUPL v1.1 (see http://ec.europa.eu/idabc/eupl).
 */

/**
 * Represent a harmonization process.
 *
 * @package classes
 * @SuppressWarnings checkUnusedVariables
 */
class Application_Model_Harmonizeddata_HarmonizationProcess {

	/**
	 * The harmonization identifier
	 */
	var $harmonizationId;

	/**
	 * The provider identifier
	 */
	var $providerId;

	/**
	 * The dataset identifier
	 */
	var $datasetId;

	/**
	 * The harmonization status
	 */
	var $status;

	/**
	 * The date of the process
	 */
	var $date;

	/**
	 * The status of the raw_data
	 */
	var $submissionStatus;

	/**
	 * The identifiers of the used raw data submissions
	 */
	var $submissionIDs = array();

}
