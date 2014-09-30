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
 * @package models
 */
class Application_Model_Mapping_Services extends Zend_Db_Table_Abstract {

	var $logger;

	/**
	 * Initialisation
	 */
	public function init() {

		// Initialise the logger
		$this->logger = Zend_Registry::get("logger");

		$translate = Zend_Registry::get('Zend_Translate');
        $this->lang = strtoupper($translate->getAdapter()->getLocale());

        $this->metadataModel = new Genapp_Model_Metadata_Metadata();
	}

	/**
	 * Get the view services.
	 *
	 * @return Service
	 */
	public function getViewServices() {
	
	    $db = $this->getAdapter();
	
	    $req = " SELECT service_name, config FROM layer_service, layer";
	    $req .= " WHERE layer.view_service_name = layer_service.service_name ";
	    $req .= " GROUP BY service_name, config";
	    
	    Zend_Registry::get("logger")->info('getViewServices : '.$req);
	
	    $select = $db->prepare($req);
	    $select->execute();
	
		$result = array();
		foreach ($select->fetchAll() as $row) {
		    $service = new Application_Object_Mapping_Service();
			$service->serviceName = $row['service_name'];
			$service->serviceConfig = $row['config'];
			$result[]=$service;
		}
	    return $result;
	}
	
	/**
	 * Get the feature services.
	 *
	 * @return Service
	 */
	public function getFeatureServices() {
	
	    $db = $this->getAdapter();
	
	    $req = " SELECT service_name, config ";
	    $req .= " FROM layer_service, layer";
	    $req .= " WHERE layer.feature_service_name = layer_service.service_name ";
	    $req .= " GROUP BY service_name, config";
	     
	    Zend_Registry::get("logger")->info('getFeatureServices : '.$req);
	
	    $select = $db->prepare($req);
	    $select->execute();
	
	    $result = array();
	    foreach ($select->fetchAll() as $row) {
	        $service = new Application_Object_Mapping_Service();
	        $service->serviceName = $row['service_name'];
	        $service->serviceConfig = $row['config'];
	        $result[]=$service;
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
	
	    Zend_Registry::get("logger")->info('getPrintServices : '.$req);
	
	    $select = $db->prepare($req);
	    $select->execute();
	
	    $result = array();
	    foreach ($select->fetchAll() as $row) {
	        $service = new Application_Object_Mapping_Service();
	        $service->serviceName = $row['service_name'];
	        $service->serviceConfig = $row['config'];
	        $result[]=$service;
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
	
	    Zend_Registry::get("logger")->info('getDetailServices : '.$req);
	
	    $select = $db->prepare($req);
	    $select->execute();
	
	    $result = array();
	    foreach ($select->fetchAll() as $row) {
	        $service = new Application_Object_Mapping_Service();
	        $service->serviceName = $row['service_name'];
	        $service->serviceConfig = $row['config'];
	        $result[]=$service;
	    }
	    return $result;
	}
	
	
	/**
	 * Get the legend services.
	 *
	 * @return Service
	 */
	public function getLegendServices() {
	
	    $db = $this->getAdapter();
	
	    $req = " SELECT service_name,config FROM layer_service, layer";
	    $req .= " WHERE layer.legend_service_name = layer_service.service_name ";
	    $req .= " GROUP BY service_name, config";
	
	    Zend_Registry::get("logger")->info('getLegendServices : '.$req);
	
	    $select = $db->prepare($req);
	    $select->execute();
	
	    $result = array();
	    foreach ($select->fetchAll() as $row) {
	        $service = new Application_Object_Mapping_Service();
	        $service->serviceName = $row['service_name'];
	        $service->serviceConfig = $row['config'];
	        $result[]=$service;
	    }
	    return $result;
	}
	
	
	
	/**
	 * Get the feature info services for displaying the labels of the layers.
	 *
	 * @return Service
	 */
	public function getFeatureInfoServices() {
	
	    $db = $this->getAdapter();
	
	    $req = " SELECT service_name,config FROM layer_service, layer";
	    $req .= " WHERE layer.feature_info_service_name = layer_service.service_name ";
	    $req .= " GROUP BY service_name, config";
	
	    Zend_Registry::get("logger")->info('getFeatureInfoServices : '.$req);
	
	    $select = $db->prepare($req);
	    $select->execute();
	
	    $result = array();
	    foreach ($select->fetchAll() as $row) {
	        $service = new Application_Object_Mapping_Service();
	        $service->serviceName = $row['service_name'];
	        $service->serviceConfig = $row['config'];
	        $result[]=$service;
	    }
	    return $result;
	}
	
	
	/**
	 * Get the service definition.
	 *
	 * @param String $serviceName the service logical name
	 * @return Service
	 */
	public function getService($serviceName) {
	
	    $tableFormat = $this->metadataModel->getTableFormatFromTableName('MAPPING', 'LAYER_SERVICE');
	    $db = $this->getAdapter();
	
	    $req = " SELECT service_name, config";
	    $req .= " FROM layer_service ";
	    $req .= " LEFT JOIN translation t ON lang = '".$this->lang."' AND table_format = '".$tableFormat->format."' AND row_pk = layer_service.service_name";
	    $req .= " WHERE service_name = ?";
	
	    Zend_Registry::get("logger")->info('getServiceList : '.$req);
	
	    $select = $db->prepare($req);
	    $select->execute(array($serviceName));
	
	    $result = array();
	    $row = $select->fetch();
	    $service = new Application_Object_Mapping_Service();
	    $service->serviceName = $row['service_name'];
	    $service->serviceConfig = $row['config'];
	    return $service;
	}
	
	
}