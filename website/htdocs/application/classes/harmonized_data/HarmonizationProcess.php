<?php

/**
 * Represent a harmonization process.
 *
 * @package classes
 */
class HarmonizationProcess {

	/**
	 * The harmonization identifier
	 */
	var $harmonizationId;

	/**
	 * The country code
	 */
	var $countryCode;

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
