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
 * @package models
 */
class Application_Model_Website_ApplicationParameter extends Zend_Db_Table_Abstract {

	var $logger;

	/**
	 * Initialisation
	 */
	public function init() {
		
		// Initialise the logger
		$this->logger = Zend_Registry::get("logger");
		
		$translate = Zend_Registry::get('Zend_Translate');
		$this->lang = strtoupper($translate->getAdapter()->getLocale());
	}

	/**
	 * Converts an array to an object.
	 * The configuration stored in session should be an object with attributes.
	 *
	 * @param Array $array        	
	 * @return object
	 */
	private function _arrayToObject($array) {
		if (is_array($array)) {
			foreach ($array as &$item) {
				$item = $this->_arrayToObject($item);
			}
			return (object) $array;
		}
		
		return $array;
	}

	/**
	 * Return the list of parameters.
	 *
	 * @return Array of Parameters
	 */
	public function getParameters() {
		$db = $this->getAdapter();
		
		$req = " SELECT name, ";
		$req .= " value, ";
		$req .= " description";
		$req .= " FROM website.application_parameters ";
		
		$this->logger->info('getAppParameters : ' . $req);
		
		$query = $db->prepare($req);
		$query->execute();
		
		$results = $query->fetchAll();
		$parameters = array();
		
		foreach ($results as $result) {
			$parameters[$result['name']] = $result['value'];
		}
		
		$parameters = $this->_arrayToObject($parameters);
		
		return $parameters;
	}

	/**
	 * Return the intern map service url
	 *
	 * @return String map service url
	 */
	public function getMapServiceUrl() {
		$db = $this->getAdapter();
		
		$req = " SELECT config ";
		$req .= " FROM website.application_parameters, mapping.layer_service ";
		$req .= " WHERE name = 'proxy_service_name'";
		$req .= " AND value = service_name;";
		$this->logger->info('getMapServiceUrl : ' . $req);
		
		$query = $db->prepare($req);
		$query->execute();
		
		$result = $query->fetch();
		
		return $result;
	}
}
