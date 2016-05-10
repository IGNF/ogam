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
class Application_Model_Website_Provider {

	/**
	 * The logger.
	 *
	 * @var Zend_Log
	 */
	protected $logger;

	/**
	 * The database connection
	 *
	 * @var Zend_Db
	 */
	var $db;

	/**
	 * Initialisation.
	 */
	public function __construct() {
		$this->logger = Zend_Registry::get("logger");

		// The database connection
		$this->db = Zend_Registry::get('website_db');
	}

	/**
	 * Destuction.
	 */
	function __destruct() {
		$this->db->closeConnection();
	}

	/**
	 * Read a provider object from a result line.
	 *
	 * @param Result $row
	 * @return Application_Object_Website_Provider
	 */
	private function _readProvider($row) {
		$provider = new Application_Object_Website_Provider();
		$provider->id = $row['id'];
		$provider->label = $row['label'];
		$provider->definition = $row['definition'];

		return $provider;
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
		$req = " SELECT * ";
		$req .= " FROM providers ";
		$req .= " WHERE id = ? ";
		$this->logger->info('getProvider : ' . $req);

		$query = $this->db->prepare($req);
		$query->execute(array(
			$id
		));

		$row = $query->fetch();

		if (!empty($row)) {
			// Create the provider object
			$role = $this->_readProvider($row);

			return $role;
		} else {
			throw new Exception("Could not find provider " . $id);
		}
	}

	/**
	 * Add a new provider in Db.
	 *
	 * @param Application_Object_Website_Provider $provider
	 *        	The provider
	 * @return Application_Object_Website_Provider the provider updated with the last id inserted
	 */
	public function addProvider($provider) {

		// Insert the provider
		$req = " INSERT INTO providers (label, definition )";
		$req .= " VALUES (?, ?) ";
		$req .= " RETURNING id";

		$this->logger->info('addProvider : ' . $req);

		$query = $this->db->prepare($req);
		$query->execute(array(
			$provider->label,
			$provider->definition
		));

		// Get back the inserted id
		$req2 = "SELECT LASTVAL() as id";
		$query2 = $this->db->prepare($req2);
		$query2->execute();
		$row = $query2->fetch();

		$provider->id = $row['id'];

		return $provider;
	}

	/**
	 * Update a provider in Db.
	 *
	 * @param Application_Object_Website_Provider $provider
	 *        	The provider
	 */
	public function updateProvider($provider) {
		$req = " UPDATE providers ";
		$req .= " SET label = ?, definition = ?";
		$req .= " WHERE id = ?";

		$this->logger->info('update providers : ' . $req);

		$query = $this->db->prepare($req);
		$query->execute(array(
			$provider->label,
			$provider->definition,
			$provider->id
		));
	}

	/**
	 * Delete a provider from Db.
	 *
	 * @param String $id
	 *        	the identifier of the provider
	 */
	public function deleteProvider($id) {

		// Suppression du fournisseur
		$req = " DELETE FROM providers WHERE id = ?";

		$this->logger->info('delete provider : ' . $req);

		$query = $this->db->prepare($req);
		$query->execute(array(
			$id
		));
	}

	/**
	 * Get the list of different providers.
	 *
	 * @return Array[Application_Object_Website_Provider]
	 */
	public function getProvidersList() {
		$req = " SELECT * ";
		$req .= " FROM providers ";
		$req .= " ORDER BY id ";

		$query = $this->db->prepare($req);
		$query->execute();

		$rows = $query->fetchAll();
		$providers = array();
		foreach ($rows as $row) {
			$provider = $this->_readProvider($row);
			$providers[$provider->id] = $provider;
		}

		return $providers;
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
		$isDeletable = true;

		// No linked user
		$userModel = new Application_Model_Website_User();
		$isDeletable = $isDeletable && (count($userModel->getUsersByProvider($id)) === 0);

		// No active submission
		$submissionModel = new Application_Model_RawData_Submission();
		$isDeletable = $isDeletable && (count($submissionModel->getActiveSubmissions($id)) === 0);

		// No data in database
		$genericModel = new Application_Model_Generic_Generic();
		$isDeletable = $isDeletable && (array_sum($genericModel->getProviderNbOfRawDatasByTable($id)) == 0);

		return $isDeletable;
	}
}
