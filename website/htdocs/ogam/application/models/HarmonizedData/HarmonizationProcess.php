<?php
/**
 * © French National Forest Inventory
 * Licensed under EUPL v1.1 (see http://ec.europa.eu/idabc/eupl).
 */
//require_once 'harmonized_data/HarmonizationProcess.php';

/**
 * This is a model allowing access to the harmonization process information.
 * @package models
 */
class Application_Model_HarmonizedData_HarmonizationProcess extends Zend_Db_Table_Abstract {

	var $logger;

	/**
	 * Initialisation
	 */
	public function init() {

		// Initialise the logger
		$this->logger = Zend_Registry::get("logger");
	}

	/**
	 * Get the status of the last harmonization process for a given country and dataset
	 *
	 * @param Submission $activeSubmission a submission
	 * @return HarmonizationProcess The completed process info
	 */
	public function getHarmonizationProcessInfo($activeSubmission) {
		$db = $this->getAdapter();
		$req = " SELECT * ";
		$req .= " FROM harmonization_process ";
		$req .= " LEFT JOIN harmonization_process_submissions USING (harmonization_process_id) ";
		$req .= " WHERE provider_id = ? ";
		$req .= " AND  dataset_id = ? ";
		$req .= " ORDER BY harmonization_process_id DESC LIMIT 1";

		$select = $db->prepare($req);
		$select->execute(array($activeSubmission->providerId, $activeSubmission->datasetId));

		Zend_Registry::get("logger")->info('getHarmonizationProcessInfo : '.$req);

		$result = $select->fetch();

		$harmonizationProcess = new Application_Object_Harmonizeddata_HarmonizationProcess();
		$harmonizationProcess->providerId = $activeSubmission->providerId;
		$harmonizationProcess->datasetId = $activeSubmission->datasetId;
		if (!empty($result)) {
			$harmonizationProcess->harmonizationId = $result['harmonization_process_id'];
			$harmonizationProcess->status = $result['harmonization_status'];
			$harmonizationProcess->date = $result['_creationdt'];
		} else {
			$harmonizationProcess->status = 'UNDONE';
		}

		return $harmonizationProcess;
	}

	/**
	 * Get the raw_data submissions used by a harmonization process
	 *
	 * @param HarmonizationProcess $harmonizationProcess the process to complete
	 * @return HarmonizationProcess The completed process info
	 */
	public function getHarmonizationProcessSources($harmonizationProcess) {
		$db = $this->getAdapter();
		$req = " SELECT * ";
		$req .= " FROM harmonization_process_submissions ";
		$req .= " WHERE harmonization_process_id = ? ";

		$select = $db->prepare($req);
		$select->execute(array($harmonizationProcess->harmonizationId));

		Zend_Registry::get("logger")->info('getHarmonizationProcessSources : '.$req);

		foreach ($select->fetchAll() as $row) {
			$harmonizationProcess->submissionIDs[] = $row['raw_data_submission_id'];
		}

		return $harmonizationProcess;
	}

}
