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
 * This is the model for managing scales.
 *
 * @package Application_Model
 * @subpackage Mapping
 */
class Application_Model_Mapping_Scales {

	/**
	 * The logger.
	 *
	 * @var Zend_Log
	 */
	var $logger;

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

		// Initialise the logger
		$this->logger = Zend_Registry::get("logger");

		// The database connection
		$this->db = Zend_Registry::get('mapping_db');
	}

	/**
	 * Destuction.
	 */
	function __destruct() {
		$this->db->closeConnection();
	}

	/**
	 * Get the list of available scales.
	 *
	 * @return Array[String]
	 */
	public function getScales() {
		$req = "SELECT scale FROM scales ORDER BY scale DESC";

		Zend_Registry::get("logger")->info('getScales : ' . $req);

		$select = $this->db->prepare($req);
		$select->execute();

		$result = array();
		foreach ($select->fetchAll() as $row) {
			$result[] = $row['scale'];
		}
		return $result;
	}
}
