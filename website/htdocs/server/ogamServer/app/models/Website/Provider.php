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
 * This is the Provider model.
 *
 * @package Application_Model
 * @subpackage Website
 */
class Application_Model_Website_Provider extends Zend_Db_Table_Abstract {

	// == Properties defined in Zend_Db_Table_Abstract

	// Db table name
	protected $_name = 'website.providers';
	// Primary key column
	protected $_primary = 'id';
	// Sequence name for generating next provider_id value
	protected $_sequence = 'website.provider_id_seq';

	/**
	 * The logger.
	 *
	 * @var Zend_Log
	 */
	protected $logger;

	/**
	 * Initialisation.
	 */
	public function init() {
		$this->logger = Zend_Registry::get("logger");
	}

	/**
	 * Get a provider by id.
	 *
	 * @param String $id
	 *        	the identifier of the provider
	 * @return Rowset
	 * @throws Exception
	 */
	public function getProvider($id) {
		$row = $this->fetchRow("id = '" . $id . "'");
		if (!$row) {
			throw new Exception("Could not find provider " . $id);
		}
		return $row;
	}

	/**
	 * Add a new provider in Db.
	 *
	 * @param String $label
	 *        	The label
	 * @param String $definition
	 *        	The definition
	 * @return mixed : last id inserted
	 */
	public function addProvider($label, $definition = '') {
		$data = array(
			'label' => $label,
			'definition' => $definition
		);
		return $this->insert($data);
	}

	/**
	 * Update a provider in Db.
	 *
	 * @param String $id
	 *        	the identifier of the provider
	 * @param String $label
	 *        	The label
	 * @param string $definition
	 */
	public function updateProvider($id, $label, $definition = '') {
		$data = array(
			'label' => $label,
			'definition' => $definition
		);
		$this->update($data, "id = '" . $id . "'");
	}

	/**
	 * Delete a provider from Db.
	 *
	 * @param String $id
	 *        	the identifier of the provider
	 */
	public function deleteProvider($id) {
		$this->delete("id = '" . $id . "'");
	}

	/**
	 * Get the list of different providers.
	 *
	 * @return Array[String => Label]
	 */
	public function getProvidersList() {
		$rows = $this->fetchAll();
		if (!$rows) {
			return null;
		}

		$providers = array();
		foreach ($rows as $row) {
			$providers[$row->id] = $row->label;
		}

		return $providers;
	}

	/**
	 * Get the users linked to a provider.
	 *
	 * @param String $id
	 *        	the identifier of the provider
	 * @return Array of Rowset
	 */
	public function getProviderUsers($id) {
		$userModel = new Application_Model_Website_User();
		return $userModel->findByProviderId($id);
	}

	/**
	 * Get the submissions linked to a provider.
	 *
	 * @param String $id
	 *        	the identifier of the provider
	 * @return Array of Rowset
	 */
	public function getProviderActiveSubmissions($id) {
		$submissionModel = new Application_Model_RawData_Submission();
		return $submissionModel->getActiveSubmissions($id);
	}

	/**
	 * Get the number of lines of data linked to a provider.
	 *
	 * @param String $id
	 *        	the identifier of the provider
	 * @return Array
	 */
	public function getProviderNbOfRawDatasByTable($id) {
		$db = $this->getAdapter();

		// Get all tables in raw_data, with a provider_id column, except technical tables :
		$req = "select table_name from information_schema.columns
                where column_name = 'provider_id'
                and table_schema='raw_data'
                and table_name not in ('submission', 'check_error');";
		$select = $db->prepare($req);
		$select->execute(array());

		$rawDataCount = array();

		// For each table, count number of lines
		foreach ($select->fetchAll() as $row) {
			$tableName = $row['table_name'];

			$countReq = "select count(*) from " . $tableName . " where provider_id = ?";
			$count = $db->prepare($countReq);
			$count->execute(array(
				$id
			));

			$nbLines = $count->fetchColumn();
			$rawDataCount[$tableName] = $nbLines;
		}

		return $rawDataCount;
	}

	/**
	 * Returns true if you can safely delete a provider.
	 * (no data or users related to it)
	 *
	 * @param String $id
	 *        	the identifier of the provider
	 * @return bool
	 */
	public function isProviderDeletable($id) {
		// Ni users, ni submissions, ni rawdatas
		$isDeletable = (count($this->getProviderUsers($id)) == 0) && (count($this->getProviderActiveSubmissions($id)) == 0) && (array_sum($this->getProviderNbOfRawDatasByTable($id)) == 0);

		return $isDeletable;
	}
}
