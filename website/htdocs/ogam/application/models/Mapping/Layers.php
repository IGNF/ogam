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
 * This is the model for managing web mapping layers.
 * @package models
 */
class Application_Model_Mapping_Layers extends Zend_Db_Table_Abstract {

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
	 * Get the list of available vector layers for the map.
	 *
	 * @return Array[String] The layer names
	 */
	public function getVectorLayersList() {

		$tableFormat = $this->metadataModel->getTableFormatFromTableName('MAPPING', 'LAYER');
		$db = $this->getAdapter();
		$params = array();

		$req = " SELECT layer_name, COALESCE(t.label, layer.layer_label) as layer_label ";
		$req .= " FROM layer ";
		$req .= " LEFT JOIN translation t ON lang = '".$this->lang."' AND table_format = '".$tableFormat->format."' AND row_pk = layer.layer_name";
		$req .= " WHERE isVector = 1 ";

		// Check the user profile
		$userSession = new Zend_Session_Namespace('user');
		$role = $userSession->role;
		$req .= ' AND (layer_name NOT IN (SELECT layer_name FROM layer_role_restriction WHERE role_code = ?))';

		$req .= " ORDER BY layer_name";

		Zend_Registry::get("logger")->info('getVectorLayersList : '.$req);

		$select = $db->prepare($req);
		$select->execute(array($role->roleCode));

		$result = array();
		foreach ($select->fetchAll() as $row) {
			$result[$row['layer_name']] = $row['layer_label'];
		}
		return $result;
	}

	/**
	 * Get the list of available layers for the map.
	 *
	 * @param String $providerId the identifier of the provider
	 * @return Array[Layer]
	 */
	public function getLayersList($providerId = null) {

		$tableFormat = $this->metadataModel->getTableFormatFromTableName('MAPPING', 'LAYER');
		$db = $this->getAdapter();
		$params = array();

		$req = " SELECT parent_id, layer_name, COALESCE(t.label, layer.layer_label) as layer_label, service_layer_name, ";
		$req .= " istransparent, isbaselayer, isuntiled, maxscale, minscale, transitioneffect, imageformat, is_checked, ";
		$req .= " is_hidden, is_disabled, is_checked, activate_type, has_legend, has_sld, checked_group, isvector,service_name ";
		$req .= " FROM layer ";
		$req .= " LEFT JOIN translation t ON lang = '".$this->lang."' AND table_format = '".$tableFormat->format."' AND row_pk = layer.layer_name";
		$req .= " LEFT JOIN layer_tree ON (layer_tree.name = layer.layer_name ) ";
		$req .= " WHERE (name is not null) ";
		$req .= " AND layer_tree.is_layer = 1 ";

		// Check the provider id
		if ($providerId == null) {
			$req .= ' AND provider_id IS NULL';
		} else {
			$req .= ' AND (provider_id IS NULL OR provider_id = ?)';
			$params[] = $providerId;
		}

		// Check the user profile
		$userSession = new Zend_Session_Namespace('user');
		$role = $userSession->role;
		$req .= ' AND (layer_name NOT IN (SELECT layer_name FROM layer_role_restriction WHERE role_code = ?))';
		$params[] = $role->roleCode;

		$req .= " ORDER BY (parent_id, position) DESC";

		Zend_Registry::get("logger")->info('getLayersList : '.$req);

		$select = $db->prepare($req);
		$select->execute($params);

		$result = array();
		foreach ($select->fetchAll() as $row) {
			$layer = new Application_Object_Mapping_Layer();
			$layer->parentId = $row['parent_id'];
			$layer->layerName = $row['layer_name'];
			$layer->layerLabel = $row['layer_label'];
			$layer->serviceLayerName = $row['service_layer_name'];
			$layer->isTransparent = $row['istransparent'];
			$layer->isBaseLayer = $row['isbaselayer'];
			$layer->isUntiled = $row['isuntiled'];
			$layer->serviceName = $row['service_name'];
			$layer->maxscale = $row['maxscale'];
			$layer->minscale = $row['minscale'];
			$layer->transitionEffect = $row['transitioneffect'];
			$layer->imageFormat = $row['imageformat'];
			$layer->isDefault = $row['is_checked'];
			$layer->isHidden = $row['is_hidden'];
			$layer->isDisabled = $row['is_disabled'];
			$layer->isChecked = $row['is_checked'];
			$layer->activateType = $row['activate_type'];
			$layer->hasLegend = $row['has_legend'];
			$layer->hasSLD = $row['has_sld'];
			$layer->checkedGroup = $row['checked_group'];
			$layer->isVector = $row['isvector'];
			$result[] = $layer;
		}
		return $result;
	}

	/**
	 * Get the list of all available layers.
	 *
	 * @return Array[Layer]
	 */
	public function getAllLayersList() {

		$tableFormat = $this->metadataModel->getTableFormatFromTableName('MAPPING', 'LAYER');
		$db = $this->getAdapter();
		$params = array();

		$req = " SELECT parent_id, layer_name, COALESCE(t.label, layer.layer_label) as layer_label, service_layer_name, ";
		$req .= " istransparent, isbaselayer, isuntiled, service_name, maxscale, minscale, transitioneffect, imageformat, is_checked, ";
		$req .= " is_hidden, is_disabled, is_checked, activate_type, has_legend, has_sld, checked_group, isvector ";
		$req .= " FROM layer ";
		$req .= " LEFT JOIN layer_tree ON (layer_tree.name = layer.layer_name ) ";
		$req .= " LEFT JOIN translation t ON lang = '".$this->lang."' AND table_format = '".$tableFormat->format."' AND row_pk = layer.layer_name";
		$req .= " WHERE (name is not null) ";
		$req .= " AND layer_tree.is_layer = 1 ";
		$req .= " ORDER BY (parent_id, position) DESC";

		Zend_Registry::get("logger")->info('getAllLayersList : '.$req);

		$select = $db->prepare($req);
		$select->execute($params);

		$result = array();
		foreach ($select->fetchAll() as $row) {
			$layer = new Application_Object_Mapping_Layer();
			$layer->parentId = $row['parent_id'];
			$layer->layerName = $row['layer_name'];
			$layer->layerLabel = $row['layer_label'];
			$layer->serviceLayerName = $row['service_layer_name'];
			$layer->isTransparent = $row['istransparent'];
			$layer->isBaseLayer = $row['isbaselayer'];
			$layer->isUntiled = $row['isuntiled'];
			$layer->serviceName = $row['service_name'];
			$layer->maxscale = $row['maxscale'];
			$layer->minscale = $row['minscale'];
			$layer->transitionEffect = $row['transitioneffect'];
			$layer->imageFormat = $row['imageformat'];
			$layer->isDefault = $row['is_checked'];
			$layer->isHidden = $row['is_hidden'];
			$layer->isDisabled = $row['is_disabled'];
			$layer->isChecked = $row['is_checked'];
			$layer->activateType = $row['activate_type'];
			$layer->hasLegend = $row['has_legend'];
			$layer->hasSLD = $row['has_sld'];
			$layer->checkedGroup = $row['checked_group'];
			$layer->isVector = $row['isvector'];
			$result[] = $layer;
		}
		return $result;
	}

	/**
	 * Get the layer definition.
	 *
	 * @param String $layerName the layer logical name
	 * @return Layer
	 */
	public function getLayer($layerName) {

		$tableFormat = $this->metadataModel->getTableFormatFromTableName('MAPPING', 'LAYER');
		$db = $this->getAdapter();

		$req = " SELECT layer_name, COALESCE(t.label, layer.layer_label) as layer_label, service_layer_name, istransparent, isbaselayer, isuntiled, service_name, maxscale, minscale, transitioneffect, imageformat, activate_type, has_sld, isvector ";
		$req .= " FROM layer ";
		$req .= " LEFT JOIN translation t ON lang = '".$this->lang."' AND table_format = '".$tableFormat->format."' AND row_pk = layer.layer_name";
		$req .= " WHERE layer_name = ?";

		Zend_Registry::get("logger")->info('getLayersList : '.$req);

		$select = $db->prepare($req);
		$select->execute(array($layerName));

		$result = array();
		$row = $select->fetch();
		$layer = new Application_Object_Mapping_Layer();
		$layer->layerName = $row['layer_name'];
		$layer->layerLabel = $row['layer_label'];
		$layer->serviceLayerName = $row['service_layer_name'];
		$layer->isTransparent = $row['istransparent'];
		$layer->isBaseLayer = $row['isbaselayer'];
		$layer->isUntiled = $row['isuntiled'];
		$layer->serviceName = $row['service_name'];
		$layer->maxscale = $row['maxscale'];
		$layer->minscale = $row['minscale'];
		$layer->transitionEffect = $row['transitioneffect'];
		$layer->imageFormat = $row['imageformat'];
		$layer->activateType = $row['activate_type'];
		$layer->hasSLD = $row['has_sld'];
		$layer->isVector = $row['isvector'];
		return $layer;
	}
	/**
	 * Get the services.
	 *
	 * @param String $serviceName the service logical name
	 * @return Service
	 */
	public function getServices() {
	
	    $db = $this->getAdapter();
	
	    $req = " SELECT service_name,config,print_pdf_base_url,detail_base_url FROM layer_service";
	    
	    Zend_Registry::get("logger")->info('getServices : '.$req);
	
	    $select = $db->prepare($req);
	    $select->execute();
	
	$result = array();
	foreach ($select->fetchAll() as $row) {
	    $service = new Application_Object_Mapping_Service();
		$service->serviceName = $row['service_name'];
		$service->serviceConfig = $row['config'];
		$service->servicePrintUrl = $row['print_pdf_base_url'];
		$service->serviceDetailUrl = $row['detail_base_url'];
		$result[]=$service;
	}
	    return $result;
	}
	/**
	 * Get the list of available scales.
	 *
	 * @return Array[String]
	 */
	public function getScales() {

		$db = $this->getAdapter();

		$req = "SELECT scale FROM scales ORDER BY scale DESC";

		Zend_Registry::get("logger")->info('getScales : '.$req);

		$select = $db->prepare($req);
		$select->execute();

		$result = array();
		foreach ($select->fetchAll() as $row) {
			$result[] = $row['scale'];
		}
		return $result;

	}

	/**
	 * Get the list of layer_tree items for a given parendId.
	 *
	 * @param String $parentId the identifier of the category
	 * @param String $providerId the identifier of the provider
	 * @return Array[layer_tree]
	 */
	public function getLegend($parentId, $providerId = null) {

		Zend_Registry::get("logger")->info('getLegend : parentId : '.$parentId.' - providerId : '.$providerId);

		$tableFormat = $this->metadataModel->getTableFormatFromTableName('MAPPING', 'LAYER');
		$db = $this->getAdapter();
		$params = array();

		// Prepare the request
		$req = " SELECT item_id, parent_id, isbaselayer, is_layer, is_checked, is_expended, COALESCE(t.label, layer.layer_label) as layer_label, layer_name, is_hidden, is_disabled, maxscale, minscale ";
		$req .= " FROM layer_tree ";
		$req .= " LEFT OUTER JOIN layer ON (layer_tree.name = layer.layer_name) ";
		$req .= " LEFT JOIN translation t ON lang = '".$this->lang."' AND table_format = '".$tableFormat->format."' AND row_pk = layer.layer_name";
		$req .= " WHERE parent_id = '".$parentId."'";

		// Check the provider id
		if ($providerId == null) {
			$req .= ' AND provider_id IS NULL';
		} else {
			$req .= ' AND (provider_id IS NULL OR provider_id = ?)';
			$params[] = $providerId;
		}

		// Check the user profile
		$userSession = new Zend_Session_Namespace('user');
		$role = $userSession->role;
		$req = $req.' AND (layer_name NOT IN (SELECT layer_name FROM layer_role_restriction WHERE role_code = ?))';
		$params[] = $role->roleCode;

		$req = $req." ORDER BY position";

		Zend_Registry::get("logger")->info('layer_model.getLegend() : '.$req);

		$select = $db->prepare($req);
		$select->execute($params);

		$result = array();
		foreach ($select->fetchAll() as $row) {
			$legendItem = new Application_Object_Mapping_LegendItem();
			$legendItem->itemId = $row['item_id'];
			$legendItem->parentId = $row['parent_id'];
			$legendItem->isBaseLayer = $row['isbaselayer'];
			$legendItem->isLayer = $row['is_layer'];
			$legendItem->isChecked = $row['is_checked'];
			$legendItem->isExpended = $row['is_expended'];
			$legendItem->label = $row['layer_label'];
			$legendItem->layerName = $row['layer_name'];
			$legendItem->isHidden = $row['is_hidden'];
			$legendItem->isDisabled = $row['is_disabled'];
			$legendItem->maxScale = $row['maxscale'];
			$legendItem->minScale = $row['minscale'];
			$result[] = $legendItem;
		}
		return $result;

	}

}
