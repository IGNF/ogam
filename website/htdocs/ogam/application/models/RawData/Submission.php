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
 * This is a model allowing access to the submission information.
 * 
 * @package models
 */
class Application_Model_RawData_Submission extends Zend_Db_Table_Abstract {

	var $logger;

	/**
	 * Initialisation
	 */
	public function init() {
		
		// Initialise the logger
		$this->logger = Zend_Registry::get("logger");
	}

	/**
	 * Get some information about the active submissions.
	 *
	 * @return Array[Submission]
	 */
	public function getActiveSubmissions() {
		$db = $this->getAdapter();
		
		$req = " SELECT submission_id, step, status, provider_id, dataset_id, user_login, file_type, file_name, nb_line, _creationdt ";
		$req .= " FROM submission ";
		$req .= " LEFT JOIN submission_file USING (submission_id) ";
		$req .= " WHERE step <>  'CANCELLED' AND step <> 'INIT'";
		$req .= " ORDER BY submission_id ";
		
		$select = $db->prepare($req);
		$select->execute(array());
		
		Zend_Registry::get("logger")->info('getActiveSubmissions : ' . $req);
		
		$result = array();
		foreach ($select->fetchAll() as $row) {
			
			$submissionId = $row['submission_id'];
			
			if (empty($result[$submissionId])) {
				// Create the new submission
				$submission = new Application_Object_RawData_Submission();
				$submission->submissionId = $submissionId;
				$submission->step = $row['step'];
				$submission->status = $row['status'];
				$submission->providerId = $row['provider_id'];
				$submission->datasetId = $row['dataset_id'];
				$submission->userLogin = $row['user_login'];
				$submission->date = $row['_creationdt'];
				$result[$submissionId] = $submission;
			}
			// Add file info
			$submissionFile = new Application_Object_RawData_Submission();
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
	 * Get submissions for Harmonization.
	 *
	 * @return Array[Submission]
	 */
	public function getSubmissionsForHarmonization() {
		$db = $this->getAdapter();
		
		$req = " SELECT provider_id, dataset_id, max(submission_id) as submission_id, max(step) as step, max(status) as status, max(user_login) as user_login, max( _creationdt) as _creationdt ";
		$req .= " FROM submission ";
		$req .= " WHERE step <>  'CANCELLED' AND step <> 'INIT'";
		$req .= " GROUP BY provider_id, dataset_id";
		$req .= " ORDER BY submission_id ";
		
		$select = $db->prepare($req);
		$select->execute(array());
		
		Zend_Registry::get("logger")->info('getSubmissionsForHarmonization : ' . $req);
		
		$result = array();
		foreach ($select->fetchAll() as $row) {
			
			$submission = new Application_Object_RawData_Submission();
			$submission->submissionId = $row['submission_id'];
			$submission->step = $row['step'];
			$submission->status = $row['status'];
			$submission->providerId = $row['provider_id'];
			$submission->datasetId = $row['dataset_id'];
			$submission->userLogin = $row['user_login'];
			$submission->date = $row['_creationdt'];
			$result[] = $submission;
		}
		return $result;
	}

	/**
	 * Get some information about a submission.
	 *
	 * @param
	 *        	Int the submission identifier
	 * @return Submission
	 * @throws an exception if the submission doesn't exist
	 */
	public function getSubmission($submissionId) {
		Zend_Registry::get("logger")->info('getSubmission : ' . $submissionId);
		
		$db = $this->getAdapter();
		$req = " SELECT *";
		$req .= " FROM submission ";
		$req .= " WHERE submission_id = ?";
		
		$select = $db->prepare($req);
		
		$select->execute(array(
			$submissionId
		));
		
		Zend_Registry::get("logger")->info('getSubmission : ' . $req);
		
		$row = $select->fetch();
		
		if (!empty($row)) {
			// Create the new submission
			$submission = new Application_Object_RawData_Submission();
			$submission->submissionId = $submissionId;
			$submission->step = $row['step'];
			$submission->status = $row['status'];
			$submission->providerId = $row['provider_id'];
			$submission->datasetId = $row['dataset_id'];
			$submission->userLogin = $row['user_login'];
			return $submission;
		} else {
			throw new Exception("Submission cannot be found");
		}
	}
}