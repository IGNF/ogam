<?php
/**
 * © French National Forest Inventory 
 * Licensed under EUPL v1.1 (see http://ec.europa.eu/idabc/eupl).
 */ 
require_once 'raw_data/Submission.php';

/**
 * Represent a data submission.
 *
 * @package classes
 */
class DataSubmission extends Submission {

	/**
	 * The dataset identifier.
	 */
	var $datasetId;

	/**
	 * The country code
	 */
	var $countryCode;

}
