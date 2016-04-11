<?php

/**
 * Licensed under EUPL v1.1 (see http://ec.europa.eu/idabc/eupl).
 *
 * � European Union, 2008-2012
 *
 * Reuse is authorised, provided the source is acknowledged. The reuse policy of the European Commission is implemented by a Decision of 12 December 2011.
 *
 * The general principle of reuse can be subject to conditions which may be specified in individual copyright notices.
 * Therefore users are advised to refer to the copyright notices of the individual websites maintained under Europa and of the individual documents.
 * Reuse is not applicable to documents subject to intellectual property rights of third parties.
 */

/**
 * This is the model for managing web mapping layers.
 *
 * @package models
 */
class Application_Model_Mapping_Services extends Zend_Db_Table_Abstract {

	/**
	 * The logger.
	 *
	 * @var Zend_Log
	 */
	var $logger;

	/**
	 * Initialisation.
	 */
	public function init() {

		// Initialise the logger
		$this->logger = Zend_Registry::get("logger");

		$translate = Zend_Registry::get('Zend_Translate');
		$this->lang = strtoupper($translate->getAdapter()->getLocale());

		$this->metadataModel = new Application_Model_Metadata_Metadata();
	}

	/**
	 * Read a service from a row.
	 *
	 * @param Result $row
	 * @return Application_Object_Mapping_Service
	 */
	private function _readService($row) {
		$service = new Application_Object_Mapping_Service();
		$service->serviceName = $row['service_name'];
		$service->serviceConfig = $row['config'];

		return $service;
	}

	/**
	 * Get the view services.
	 *
	 * @return Service
	 */
	public function getServices() {
		$db = $this->getAdapter();

		$req = " SELECT service_name,config FROM layer_service, layer";
		$req .= " GROUP BY service_name, config";

		Zend_Registry::get("logger")->info('getServices : ' . $req);

		$select = $db->prepare($req);
		$select->execute();

		$result = array();
		foreach ($select->fetchAll() as $row) {
			$service = $this->_readService($row);
			$result[$service->serviceName] = $service;
		}
		return $result;
	}

	/**
	 * Get the detail services (proxy).
	 *
	 * @return Service
	 */
	public function getDetailServices() {
		$db = $this->getAdapter();

		$req = " SELECT service_name,config FROM layer_service, layer";
		$req .= " WHERE layer.detail_service_name = layer_service.service_name ";
		$req .= " GROUP BY service_name, config";

		Zend_Registry::get("logger")->info('getDetailServices : ' . $req);

		$select = $db->prepare($req);
		$select->execute();

		$result = array();
		foreach ($select->fetchAll() as $row) {
			$service = $this->_readService($row);
			$result[$service->serviceName] = $service;
		}
		return $result;
	}

	/**
	 * Get the print services (local).
	 *
	 * @return Service
	 */
	public function getPrintServices() {
		$db = $this->getAdapter();

		$req = " SELECT service_name,config FROM layer_service, layer";
		$req .= " WHERE layer.print_service_name = layer_service.service_name ";
		$req .= " GROUP BY service_name, config";

		Zend_Registry::get("logger")->info('getPrintServices : ' . $req);

		$select = $db->prepare($req);
		$select->execute();

		$result = array();
		foreach ($select->fetchAll() as $row) {
			$service = $this->_readService($row);
			$result[$service->serviceName] = $service;
		}
		return $result;
	}

	/**
	 * Get the service definition.
	 *
	 * @param String $serviceName
	 *        	the service logical name
	 * @return Service
	 */
	public function getService($serviceName) {
		$db = $this->getAdapter();

		$req = " SELECT service_name, config";
		$req .= " FROM layer_service ";
		$req .= " LEFT JOIN translation t ON (lang = '" . $this->lang . "' AND table_format = 'LAYER_SERVICE' AND row_pk = layer_service.service_name) ";
		$req .= " WHERE service_name = ?";

		Zend_Registry::get("logger")->info('getServiceList : ' . $req);

		$select = $db->prepare($req);
		$select->execute(array(
			$serviceName
		));

		$result = array();
		$row = $select->fetch();

		$service = $this->_readService($row);

		return $service;
	}
}