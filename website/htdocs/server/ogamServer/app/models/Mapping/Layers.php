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
 * @package Application_Model
 * @subpackage Mapping
 */
class Application_Model_Mapping_Layers extends Zend_Db_Table_Abstract {

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
	 * Read a layer object from a result line.
	 *
	 * @param Result $row
	 * @return Application_Object_Mapping_Layer
	 */
	private function _readLayer($row) {
		$layer = new Application_Object_Mapping_Layer();
		$layer->layerName = $row['layer_name'];
		$layer->layerLabel = $row['layer_label'];
		$layer->serviceLayerName = $row['service_layer_name'];
		$layer->isTransparent = ($row['istransparent'] === 1);
		$layer->defaultOpacity = $row['default_opacity'];
		$layer->isBaseLayer = ($row['isbaselayer'] === 1);
		$layer->isUntiled = ($row['isuntiled'] === 1);
		$layer->isVector = ($row['isvector'] === 1);
		$layer->maxscale = $row['maxscale'];
		$layer->minscale = $row['minscale'];
		$layer->hasLegend = ($row['has_legend'] === 1);
		$layer->providerId = $row['provider_id'];
		$layer->activateType = $row['activate_type'];
		$layer->viewServiceName = $row['view_service_name'];
		$layer->legendServiceName = $row['legend_service_name'];
		$layer->detailServiceName = $row['detail_service_name'];
		$layer->featureServiceName = $row['feature_service_name'];

		return $layer;
	}

	/**
	 * Read a layer tree item.
	 *
	 * @param Result $row
	 * @return Application_Object_Mapping_LegendItem
	 */
	private function _readTreeItem($row) {
		$legendItem = new Application_Object_Mapping_LegendItem();
		$legendItem->itemId = $row['item_id'];
		$legendItem->parentId = $row['parent_id'];
		$legendItem->isLayer = ($row['is_layer'] === 1);
		$legendItem->isChecked = ($row['is_checked'] === 1);
		$legendItem->isHidden = ($row['is_hidden'] === 1);
		$legendItem->isDisabled = ($row['is_disabled'] === 1);
		$legendItem->isExpended = ($row['is_expended'] === 1);
		$legendItem->layerName = $row['name'];
		$legendItem->label = $row['layer_label'];
		$legendItem->checkedGroup = $row['checked_group'];

		return $legendItem;
	}

	/**
	 * Get the list of available vector layers for the map.
	 *
	 * @return Array[String] The layer names
	 */
	public function getVectorLayersList() {
		$db = $this->getAdapter();
		$params = array();

		$req = " SELECT *, COALESCE(t.label, layer.layer_label) as layer_label ";
		$req .= " FROM layer ";
		$req .= " LEFT JOIN translation t ON (lang = '" . $this->lang . "' AND table_format = 'LAYER' AND row_pk = layer.layer_name) ";
		$req .= " WHERE layer.feature_service_name IS NOT NULL";

		// Filtrer on the user restrictions
		$userSession = new Zend_Session_Namespace('user');
		if (!empty($userSession) && !empty($userSession->user)) {
			$req .= ' AND (layer_name NOT IN (SELECT layer_name FROM layer_role_restriction JOIN role_to_user USING (role_code) WHERE user_login = ?))';
			$req .= " ORDER BY layer_name";
			$params[] = $userSession->user->login;
		}

		Zend_Registry::get("logger")->info('getVectorLayersList : ' . $req);

		$select = $db->prepare($req);
		$select->execute($params);

		$result = array();
		foreach ($select->fetchAll() as $row) {

			$layer = $this->_readLayer($row);

			$result[$layer->layerName] = $layer;
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

		$req = " SELECT *";
		$req .= " FROM layer ";
		$req .= " WHERE layer_name = ?";

		Zend_Registry::get("logger")->info('getLayer : ' . $req);

		$select = $db->prepare($req);
		$select->execute(array(
			$layerName
		));

		$row = $select->fetch();

		$layer = $this->_readLayer($row);

		return $layer;
	}

	/**
	 * Get the list of available layers for the map.
	 * The layers are linked to the layer tree.
	 *
	 * @param String $providerId
	 *        	the identifier of the provider
	 * @return Array[Layer]
	 */
	public function getLayersList($providerId = null) {
		$db = $this->getAdapter();
		$params = array();

		$req = " SELECT * ";
		$req .= " FROM layer ";
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

		// Filtrer on the user restrictions
		$userSession = new Zend_Session_Namespace('user');
		if (!empty($userSession) && !empty($userSession->user)) {
			$req .= ' AND (layer_name NOT IN (SELECT layer_name FROM layer_role_restriction JOIN role_to_user USING (role_code) WHERE user_login = ?))';
			$params[] = $userSession->user->login;
		}

		$req .= " ORDER BY position ASC";

		Zend_Registry::get("logger")->info('getLayersList : ' . $req);

		$select = $db->prepare($req);
		$select->execute($params);

		$result = array();
		foreach ($select->fetchAll() as $row) {

			$layer = $this->_readLayer($row);

			$layer->treeItem = $this->_readTreeItem($row);

			$result[$layer->layerName] = $layer;
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
	 * @return Array[Application_Object_Mapping_LegendItem]
	 */
	public function getLegendItems($parentId, $providerId = null) {
		Zend_Registry::get("logger")->info('getLegendItems : parentId : ' . $parentId . ' - providerId : ' . $providerId);

		$db = $this->getAdapter();
		$params = array();

		// Prepare the request
		$req = " SELECT layer_tree.*, COALESCE(t.label, layer.layer_label) as layer_label ";
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

		// Filtrer on the user restrictions
		$userSession = new Zend_Session_Namespace('user');
		if (!empty($userSession) && !empty($userSession->user)) {
			$req = $req . ' AND (layer_name NOT IN (SELECT layer_name FROM layer_role_restriction JOIN role_to_user USING (role_code) WHERE user_login = ?))';
			$params[] = $userSession->user->login;
		}

		$req = $req . " ORDER BY position";

		Zend_Registry::get("logger")->info('layer_model.getLegendItems() : ' . $req);

		$select = $db->prepare($req);
		$select->execute($params);

		$result = array();
		foreach ($select->fetchAll() as $row) {
			$legendItem = $this->_readTreeItem($row);
			$result[$legendItem->itemId] = $legendItem;
		}
		return $result;
	}
}