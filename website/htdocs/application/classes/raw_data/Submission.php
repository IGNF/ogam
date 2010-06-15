<?php
/**
 * © French National Forest Inventory 
 * Licensed under EUPL v1.1 (see http://ec.europa.eu/idabc/eupl).
 */ 
require_once 'raw_data/SubmissionFile.php';

/**
 * Represent a submission.
 *
 * A submission is a batch of files that is send to the E-forest server in order to be stored in database.
 *
 * @package classes
 */
class Submission {

	/**
	 * The submission identifier
	 */
	var $submissionId;

	/**
	 * The country code
	 */
	var $countryCode;

	/**
	 * The submission step
	 */
	var $step;

	/**
	 * The submission status
	 */
	var $status;

	/**
	 * The submission type
	 */
	var $type;

	/**
	 * The files of the submission (array of SubmissionFile);
	 */
	var $files = array();

	/**
	 * Add a file to the list.
	 *
	 * @param SubmissionFile
	 */
	public function addFile($subFile) {
		$this->files[] = $subFile;
	}

}
