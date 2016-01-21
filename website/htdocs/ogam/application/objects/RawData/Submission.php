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
 * Represent a submission.
 *
 * A submission is a batch of files that is send to the server in order to be stored in database.
 *
 * @package objects
 *          @SuppressWarnings checkUnusedVariables
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
	 * The provider (country, organisation, .
	 *
	 * ..) identifier
	 */
	var $providerId;

	/**
	 * The dataset identifier
	 */
	var $datasetId;

	/**
	 * The dataset label
	 */
	var $datasetLabel;

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
	 * @param
	 *        	SubmissionFile
	 */
	public function addFile($subFile) {
		$this->files[] = $subFile;
	}
}
