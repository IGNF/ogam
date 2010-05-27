<?php
require_once 'raw_data/Submission.php';
require_once 'raw_data/SubmissionFile.php';
require_once 'raw_data/DataSubmission.php';

/**
 * This is a model allowing access to the submission information.
 * @package models
 */
class Model_Submission extends Zend_Db_Table_Abstract {

	var $logger;

	/**
	 * Initialisation
	 */
	public function init() {

		// Initialise the logger
		$this->logger = Zend_Registry::get("logger");
	}

	/**
	 * Get some information about the active submissions of a given type for a given country.
	 *
	 * @param String $countryCode the country code (or null for all countries)
	 * @param String $type the submission type
	 * @return Array[Submission]
	 */
	public function getActiveSubmissions($countryCode, $type) {

		$db = $this->getAdapter();

		$req = " SELECT submission_id, country_code, status, step, type, file_type, file_name, nb_line "." FROM submission "." LEFT JOIN submission_file USING (submission_id) "." WHERE step <>  'CANCELLED' "." AND type = '".$type."'";

		if (!empty($countryCode)) {
			$req = $req." AND country_code = ?";
		}
		$req = $req." ORDER BY submission_id ";

		$select = $db->prepare($req);

		if (!empty($countryCode)) {
			$select->execute(array($countryCode));
		} else {
			$select->execute(array());
		}

		Zend_Registry::get("logger")->info('getActiveSubmissions : '.$req);

		$result = array();
		foreach ($select->fetchAll() as $row) {

			$submissionId = $row['submission_id'];

			if (empty($result[$submissionId])) {
				// Create the new submission
				$submission = new Submission();
				$submission->submissionId = $submissionId;
				$submission->countryCode = $row['country_code'];
				$submission->status = $row['status'];
				$submission->step = $row['step'];
				$submission->type = $row['type'];
				$result[$submissionId] = $submission;
			}
			// Add file info
			$submissionFile = new SubmissionFile();
			$submissionFile->fileName = $row['file_name'];
			$submissionFile->fileType = $row['file_type'];
			$submissionFile->lineNumber = $row['nb_line'];
			$submission->addFile($submissionFile);

			// Add the submission to the list
			$result[$submissionId] = $submission;
		}
		return $result;
	}

	/**
	 * Get some information about the active submissions for a given country.
	 *
	 * @param string the country code (or null for all countries)
	 * @return Array[DataSubmission]
	 */
	public function getActiveDataSubmissions($countryCode) {
		$db = $this->getAdapter();

		$req = " SELECT submission_id, country_code, status, step, file_type, file_name, nb_line, request_id, comment "." FROM submission "." LEFT JOIN data_submission USING (submission_id) "." LEFT JOIN submission_file USING (submission_id) "." WHERE step <>  'CANCELLED' "." AND type = 'DATA'";

		if (!empty($countryCode)) {
			$req = $req." AND country_code = ?";
		}
		$req = $req." ORDER BY submission_id ";

		$select = $db->prepare($req);

		if (!empty($countryCode)) {
			$select->execute(array($countryCode));
		} else {
			$select->execute(array());
		}

		Zend_Registry::get("logger")->info('getActiveDataSubmissions : '.$req);

		$result = array();
		foreach ($select->fetchAll() as $row) {

			$submissionId = $row['submission_id'];

			if (empty($result[$submissionId])) {
				// Create the new submission
				$submission = new DataSubmission();
				$submission->submissionId = $submissionId;
				$submission->countryCode = $row['country_code'];
				$submission->status = $row['status'];
				$submission->step = $row['step'];
				$submission->comment = $row['comment'];
				$submission->jrcRequest = $row['request_id'];
				$result[$submissionId] = $submission;
			}
			// Add file info
			$submissionFile = new SubmissionFile();
			$submissionFile->fileName = $row['file_name'];
			$submissionFile->fileType = $row['file_type'];
			$submissionFile->lineNumber = $row['nb_line'];
			$submission->addFile($submissionFile);

			// Add the submission to the list
			$result[$submissionId] = $submission;
		}
		return $result;
	}

	/**
	 * Get some information about a data submission.
	 *
	 * @param Int the submission identifier
	 * @return DataSubmission
	 */
	public function getDataSubmission($submissionId) {

		Zend_Registry::get("logger")->info('getDataSubmission : '.$submissionId);

		$db = $this->getAdapter();
		$req = " SELECT submission_id, request_id, country_code"." FROM data_submission "." LEFT JOIN submission using (submission_id) "." WHERE submission_id = ?";

		$select = $db->prepare($req);

		$select->execute(array($submissionId));

		Zend_Registry::get("logger")->info('getDataSubmission : '.$req);

		$result = $select->fetch();

		if (!empty($result)) {
			$dataSubmission = new DataSubmission();
			$dataSubmission->submissionId = $result['submission_id'];
			$dataSubmission->datasetId = $result['request_id'];
			$dataSubmission->countryCode = $result['country_code'];
			return $dataSubmission;
		} else {
			return null;
		}

	}

	/**
	 * Get some information about a submission.
	 *
	 * @param Int the submission identifier
	 * @return Submission
	 */
	public function getSubmission($submissionId) {
		$db = $this->getAdapter();
		$req = " SELECT submission_id, type, step, status, country_code"." FROM  submission "." WHERE submission_id = ?";

		$select = $db->prepare($req);

		$select->execute(array($submissionId));

		Zend_Registry::get("logger")->info('getSubmission : '.$req);

		$result = $select->fetch();

		if (!empty($result)) {
			$submission = new Submission();
			$submission->submissionId = $result['submission_id'];
			$submission->type = $result['type'];
			$submission->step = $result['step'];
			$submission->status = $result['status'];
			$submission->countryCode = $result['country_code'];
			return $submission;
		} else {
			return null;
		}

	}

	/**
	 * Get the submissions that can be used for harmonization.
	 *
	 * @return Array[HarmonizationProcess]
	 */
	public function getCountrySubmissions() {
		$db = $this->getAdapter();
		$req = " SELECT request_id, country_code "." FROM data_submission "." LEFT JOIN submission using (submission_id) "." GROUP BY request_id, country_code "." ORDER BY request_id, country_code";

		$select = $db->prepare($req);

		$select->execute(array());

		Zend_Registry::get("logger")->info('getCountrySubmissions : '.$req);

		$result = array();

		foreach ($select->fetchAll() as $row) {
			$harmonizationProcess = new HarmonizationProcess();
			$harmonizationProcess->datasetId = $row['request_id'];
			$harmonizationProcess->countryCode = $row['country_code'];

			$result[] = $harmonizationProcess;

		}

		return $result;

	}

	/**
	 * Get some statistics about the submission
	 *
	 * @return Array[countryCode][datasetId][Submission]
	 */
	public function getSubmissionsStatistics() {
		$db = $this->getAdapter();
		$req = " SELECT submission_id, country_code, coalesce(request_id, type) as  request_id, status, step, type "." FROM submission "." LEFT JOIN data_submission using (submission_id) "." WHERE step <> 'CANCELLED' "." AND status NOT IN ('ERROR','CRASH') "." ORDER BY country_code ";

		$select = $db->prepare($req);

		$select->execute(array());

		Zend_Registry::get("logger")->info('getSubmissionsStatistics : '.$req);

		$result = array();

		foreach ($select->fetchAll() as $row) {
			$submission = new Submission();
			$submission->submissionId = $row['submission_id'];
			$submission->countryCode = $row['country_code'];
			$submission->status = $row['status'];
			$submission->step = $row['step'];
			$submission->type = $row['type'];

			$countryCode = $row['country_code'];
			$datasetId = $row['request_id'];

			$result[$countryCode][$datasetId] = $submission;

		}

		return $result;

	}

}
