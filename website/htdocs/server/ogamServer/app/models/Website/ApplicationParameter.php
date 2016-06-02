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
 * This is the Parameter model.
 *
 * @package Application_Model
 * @subpackage Website
 */
class Application_Model_Website_ApplicationParameter {

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

		$translate = Zend_Registry::get('Zend_Translate');
		$this->lang = strtoupper($translate->getAdapter()->getLocale());

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
	 * Return the list of parameters.
	 *
	 * @return Array[Application_Object_Website_ApplicationParameter]
	 */
	public function getParameters() {
		$req = " SELECT name, ";
		$req .= " value, ";
		$req .= " description";
		$req .= " FROM website.application_parameters ";

		$this->logger->info('getAppParameters : ' . $req);

		$query = $this->db->prepare($req);
		$query->execute();

		$results = $query->fetchAll();
		$parameters = array();

		foreach ($results as $result) {
			$param = new Application_Object_Website_ApplicationParameter();
			$param->name = $result['name'];
			$param->value = $result['value'];
			$param->description = $result['description'];

			$parameters[$param->name] = $param;
		}

		return $parameters;
	}

	/**
	 * Return the intern map service url
	 *
	 * @return String map service url
	 */
	public function getMapServiceUrl() {
		$req = " SELECT config ";
		$req .= " FROM website.application_parameters, mapping.layer_service ";
		$req .= " WHERE name = 'proxy_service_name'";
		$req .= " AND value = service_name;";
		$this->logger->info('getMapServiceUrl : ' . $req);

		$query = $this->db->prepare($req);
		$query->execute();

		$result = $query->fetch();

		return $result;
	}
}
