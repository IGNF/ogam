<?php
/**
 * © French National Forest Inventory
 * Licensed under EUPL v1.1 (see http://ec.europa.eu/idabc/eupl).
 */

/**
 * Represent a submission.
 *
 * A submission is a batch of files that is send to the server in order to be stored in database.
 *
 * @package classes
 * @SuppressWarnings checkUnusedVariables
 */
class Application_Object_RawData_Submission {

	/**
	 * The submission identifier
	 */
	var $submissionId;

	/**
	 * The submission step
	 */
	var $step;

	/**
	 * The submission status
	 */
	var $status;

	/**
	 * The provider (country, organisation, ...) identifier
	 */
	var $providerId;

	/**
	 * The dataset identifier
	 */
	var $datasetId;

	/**
	 * The login of the user who has done the submission
	 */
	var $userLogin;

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
