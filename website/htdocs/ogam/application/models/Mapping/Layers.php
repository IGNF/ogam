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
 * 
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
		$db = $this->getAdapter();
		$params = array();
		
		$req = " SELECT layer_name, COALESCE(t.label, layer.layer_label) as layer_label, config as feature_service_config ";
		$req .= " FROM layer_service , layer ";
		$req .= " LEFT JOIN translation t ON (lang = '" . $this->lang . "' AND table_format = 'LAYER' AND row_pk = layer.layer_name) ";
		$req .= " WHERE layer.feature_service_name <> '' AND layer.feature_service_name = layer_service.service_name";
		
		// Check the user profile
		$userSession = new Zend_Session_Namespace('user');
		$role = $userSession->user->role;
		$req .= ' AND (layer_name NOT IN (SELECT layer_name FROM layer_role_restriction WHERE role_code = ?))';
		$req .= " ORDER BY layer_name";
		
		Zend_Registry::get("logger")->info('getVectorLayersList : ' . $req);
		
		$select = $db->prepare($req);
		$select->execute(array(
			$role->code
		));
		
		$result = array();
		foreach ($select->fetchAll() as $row) {
			$result[$row['layer_name']] = array(
				$row['layer_label'],
				$row['feature_service_config']
			);
		}
		return $result;
	}

	/**
	 * Get the list of available layers for the map.
	 *
	 * @param String $providerId
	 *        	the identifier of the provider
	 * @return Array[Layer]
	 */
	public function getLayersList($providerId = null) {
		$db = $this->getAdapter();
		$params = array();
		
		$req = " SELECT parent_id, layer_name, COALESCE(t.label, layer.layer_label) as layer_label, service_layer_name, ";
		$req .= " istransparent, default_opacity, isbaselayer, maxscale, minscale, transitioneffect, imageformat, is_checked, ";
		$req .= " is_hidden, is_disabled, is_checked, activate_type, has_sld, checked_group, feature_service_name, print_service_name, detail_service_name,view_service_name, legend_service_name ";
		$req .= " FROM layer ";
		$req .= " LEFT JOIN translation t ON (lang = '" . $this->lang . "' AND table_format = 'LAYER' AND row_pk = layer.layer_name) ";
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
		$role = $userSession->user->role;
		$req .= ' AND (layer_name NOT IN (SELECT layer_name FROM layer_role_restriction WHERE role_code = ?))';
		$params[] = $role->code;
		
		$req .= " ORDER BY (parent_id, position) DESC";
		
		Zend_Registry::get("logger")->info('getLayersList : ' . $req);
		
		$select = $db->prepare($req);
		$select->execute($params);
		
		$result = array();
		foreach ($select->fetchAll() as $row) {
			$layer = new Application_Object_Mapping_Layer();
			$layer->parentId = $row['parent_id'];
			$layer->layerName = $row['layer_name'];
			$layer->layerLabel = $row['layer_label'];
			$layer->serviceLayerName = $row['service_layer_name'];
			$layer->isTransparent = ($row['istransparent'] === 1);
			$layer->defaultOpacity = $row['default_opacity'];
			$layer->isBaseLayer = ($row['isbaselayer'] === 1);
			$layer->maxscale = $row['maxscale'];
			$layer->minscale = $row['minscale'];
			$layer->transitionEffect = $row['transitioneffect'];
			$layer->imageFormat = $row['imageformat'];
			$layer->isDefault = ($row['is_checked'] === 1);
			$layer->isHidden = ($row['is_hidden'] === 1);
			$layer->isDisabled = ($row['is_disabled'] === 1);
			$layer->isChecked = ($row['is_checked'] === 1);
			$layer->activateType = $row['activate_type'];
			$layer->hasSLD = ($row['has_sld'] === 1);
			$layer->checkedGroup = $row['checked_group'];
			$layer->viewServiceName = $row['view_service_name'];
			$layer->legendServiceName = $row['legend_service_name'];
			$layer->printServiceName = $row['print_service_name'];
			$layer->detailServiceName = $row['detail_service_name'];
			$layer->featureServiceName = $row['feature_service_name'];
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
		$db = $this->getAdapter();
		$params = array();
		
		$req = " SELECT parent_id, layer_name, COALESCE(t.label, layer.layer_label) as layer_label, service_layer_name, ";
		$req .= " istransparent, default_opacity, isbaselayer, view_service_name, maxscale, minscale, transitioneffect, imageformat, is_checked, ";
		$req .= " is_hidden, is_disabled, is_checked, activate_type, has_sld, checked_group, print_service_name, detail_service_name, feature_service_name, legend_service_name ";
		$req .= " FROM layer ";
		$req .= " LEFT JOIN layer_tree ON (layer_tree.name = layer.layer_name ) ";
		$req .= " LEFT JOIN translation t ON (lang = '" . $this->lang . "' AND table_format = 'LAYER' AND row_pk = layer.layer_name) ";
		$req .= " WHERE (name is not null) ";
		$req .= " AND layer_tree.is_layer = 1 ";
		$req .= " ORDER BY (parent_id, position) DESC";
		
		Zend_Registry::get("logger")->info('getAllLayersList : ' . $req);
		
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
			$layer->defaultOpacity = $row['default_opacity'];
			$layer->isBaseLayer = $row['isbaselayer'];
			$layer->viewServiceName = $row['view_service_name'];
			$layer->featureServiceName = $row['feature_service_name'];
			$layer->maxscale = $row['maxscale'];
			$layer->minscale = $row['minscale'];
			$layer->transitionEffect = $row['transitioneffect'];
			$layer->imageFormat = $row['imageformat'];
			$layer->isDefault = $row['is_checked'];
			$layer->isHidden = $row['is_hidden'];
			$layer->isDisabled = $row['is_disabled'];
			$layer->isChecked = $row['is_checked'];
			$layer->activateType = $row['activate_type'];
			$layer->hasSLD = $row['has_sld'];
			$layer->checkedGroup = $row['checked_group'];
			$layer->printServiceName = $row['print_service_name'];
			$layer->detailServiceName = $row['detail_service_name'];
			$layer->featureInfoServiceName = $row['feature_info_service_name'];
			$layer->legendServiceName = $row['legend_service_name'];
			$result[] = $layer;
		}
		return $result;
	}

	/**
	 * Get the layer definition.
	 *
	 * @param String $layerName
	 *        	the layer logical name
	 * @return Layer
	 */
	public function getLayer($layerName) {
		$db = $this->getAdapter();
		
		$req = " SELECT layer_name, COALESCE(t.label, layer.layer_label) as layer_label, service_layer_name, istransparent, default_opacity, isbaselayer, view_service_name, feature_service_name, maxscale, minscale, transitioneffect, imageformat, activate_type, has_sld, print_service_name, detail_service_name, legend_service_name ";
		$req .= " FROM layer ";
		$req .= " LEFT JOIN translation t ON (lang = '" . $this->lang . "' AND table_format = 'LAYER' AND row_pk = layer.layer_name) ";
		$req .= " WHERE layer_name = ?";
		
		Zend_Registry::get("logger")->info('getLayer : ' . $req);
		
		$select = $db->prepare($req);
		$select->execute(array(
			$layerName
		));
		
		$result = array();
		$row = $select->fetch();
		$layer = new Application_Object_Mapping_Layer();
		$layer->layerName = $row['layer_name'];
		$layer->layerLabel = $row['layer_label'];
		$layer->serviceLayerName = $row['service_layer_name'];
		$layer->isTransparent = ($row['istransparent'] === 1);
		$layer->defaultOpacity = $row['default_opacity'];
		$layer->isBaseLayer = ($row['isbaselayer'] === 1);
		$layer->maxscale = $row['maxscale'];
		$layer->minscale = $row['minscale'];
		$layer->transitionEffect = $row['transitioneffect'];
		$layer->imageFormat = $row['imageformat'];
		$layer->activateType = $row['activate_type'];
		$layer->hasSLD = ($row['has_sld'] === 1);
		$layer->viewServiceName = $row['view_service_name'];
		$layer->legendServiceName = $row['legend_service_name'];
		$layer->printServiceName = $row['print_service_name'];
		$layer->detailServiceName = $row['detail_service_name'];
		$layer->featureServiceName = $row['feature_service_name'];
		return $layer;
	}

	/**
	 * Get the list of available scales.
	 *
	 * @return Array[String]
	 */
	public function getScales() {
		$db = $this->getAdapter();
		
		$req = "SELECT scale FROM scales ORDER BY scale DESC";
		
		Zend_Registry::get("logger")->info('getScales : ' . $req);
		
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
	 * @param String $parentId
	 *        	the identifier of the category
	 * @param String $providerId
	 *        	the identifier of the provider
	 * @return Array[layer_tree]
	 */
	public function getLegend($parentId, $providerId = null) {
		Zend_Registry::get("logger")->info('getLegend : parentId : ' . $parentId . ' - providerId : ' . $providerId);
		
		$db = $this->getAdapter();
		$params = array();
		
		// Prepare the request
		$req = " SELECT item_id, parent_id, isbaselayer, is_layer, is_checked, is_expended, COALESCE(t.label, layer.layer_label) as layer_label, layer_name, is_hidden, is_disabled, maxscale, minscale ";
		$req .= " FROM layer_tree ";
		$req .= " LEFT OUTER JOIN layer ON (layer_tree.name = layer.layer_name) ";
		$req .= " LEFT JOIN translation t ON (lang = '" . $this->lang . "' AND table_format = 'LAYER' AND row_pk = layer.layer_name) ";
		$req .= " WHERE parent_id = '" . $parentId . "'";
		
		// Check the provider id
		if ($providerId == null) {
			$req .= ' AND provider_id IS NULL';
		} else {
			$req .= ' AND (provider_id IS NULL OR provider_id = ?)';
			$params[] = $providerId;
		}
		
		// Check the user profile
		$userSession = new Zend_Session_Namespace('user');
		$role = $userSession->user->role;
		$req = $req . ' AND (layer_name NOT IN (SELECT layer_name FROM layer_role_restriction WHERE role_code = ?))';
		$params[] = $role->code;
		
		$req = $req . " ORDER BY position";
		
		Zend_Registry::get("logger")->info('layer_model.getLegend() : ' . $req);
		
		$select = $db->prepare($req);
		$select->execute($params);
		
		$result = array();
		foreach ($select->fetchAll() as $row) {
			$legendItem = new Application_Object_Mapping_LegendItem();
			$legendItem->itemId = $row['item_id'];
			$legendItem->parentId = $row['parent_id'];
			$legendItem->isBaseLayer = ($row['isbaselayer'] === 1);
			$legendItem->isLayer = ($row['is_layer'] === 1);
			$legendItem->isChecked = ($row['is_checked'] === 1);
			$legendItem->isExpended = ($row['is_expended'] === 1);
			$legendItem->label = $row['layer_label'];
			$legendItem->layerName = $row['layer_name'];
			$legendItem->isHidden = ($row['is_hidden'] === 1);
			$legendItem->isDisabled = ($row['is_disabled'] === 1);
			$legendItem->maxScale = $row['maxscale'];
			$legendItem->minScale = $row['minscale'];
			$result[] = $legendItem;
		}
		return $result;
	}
}
