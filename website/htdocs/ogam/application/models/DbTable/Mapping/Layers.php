<?php
/**
 * © French National Forest Inventory
 * Licensed under EUPL v1.1 (see http://ec.europa.eu/idabc/eupl).
 */
//require_once 'mapping/Layer.php';
//require_once 'mapping/LegendItem.php';

/**
 * This is the model for managing web mapping layers.
 * @package models
 */
class Application_Model_DbTable_Mapping_Layers extends Zend_Db_Table_Abstract {

	var $logger;

	/**
	 * Initialisation
	 */
	public function init() {

		// Initialise the logger
		$this->logger = Zend_Registry::get("logger");
	}

	/**
	 * Get the list of available layers for the map.
	 *
	 * @param String $countryCode the country code
	 * @return Array[Layer]
	 */
	public function getLayersList($countryCode) {

		$db = $this->getAdapter();
		$params = array();

		$req = " SELECT * ";
		$req .= " FROM layer_definition ";
		$req .= " LEFT JOIN legend ON (legend.name = layer_definition.layer_name ) ";
		$req .= " WHERE (name is not null) ";
		$req .= " AND legend.is_layer = 1 ";

		// Check the country code
		if (empty($countryCode)) {
			$req .= ' AND country_code IS NULL';
		} else {
			$req .= ' AND (country_code IS NULL OR country_code = ?)';
			$params[] = $countryCode;
		}

		// Check the user profile
		$userSession = new Zend_Session_Namespace('user');
		$role = $userSession->role;
		$req .= ' AND (layer_name NOT IN (SELECT layer_name FROM layer_profile_restriction WHERE role_code = ?))';
		$params[] = $role->roleCode;

		$req .= " ORDER BY parent_id, position";

		Zend_Registry::get("logger")->info('getLayersList : '.$req);

		$select = $db->prepare($req);
		$select->execute($params);

		$result = array();
		foreach ($select->fetchAll() as $row) {
			$layer = new Application_Model_Mapping_Layer();
			$layer->layerName = $row['layer_name'];
			$layer->layerLabel = $row['layer_label'];
			$layer->mapservLayers = $row['mapserv_layers'];
			$layer->isTransparent = $row['istransparent'];
			$layer->isBaseLayer = $row['isbaselayer'];
			$layer->isUntiled = $row['isuntiled'];
			$layer->isCached = $row['iscached'];
			$layer->maxscale = $row['maxscale'];
			$layer->minscale = $row['minscale'];
			$layer->transitionEffect = $row['transitioneffect'];
			$layer->imageFormat = $row['imageformat'];
			$layer->opacity = $row['opacity'];
			$layer->isDefault = $row['is_checked'];
			$layer->isHidden = $row['is_hidden'];
			$layer->isDisabled = $row['is_disabled'];
			$layer->isChecked = $row['is_checked'];
			$layer->activateType = $row['activate_type'];
			$layer->hasLegend = $row['has_legend'];
			$layer->hasSLD = $row['has_sld'];
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

		$db = $this->getAdapter();

		$req = " SELECT * ";
		$req .= " FROM layer_definition ";
		$req .= " WHERE layer_name = ?";

		Zend_Registry::get("logger")->info('getLayersList : '.$req);

		$select = $db->prepare($req);
		$select->execute(array($layerName));

		$result = array();
		$row = $select->fetch();
		$layer = new Application_Model_Mapping_Layer();
		$layer->layerName = $row['layer_name'];
		$layer->layerLabel = $row['layer_label'];
		$layer->mapservLayers = $row['mapserv_layers'];
		$layer->isTransparent = $row['istransparent'];
		$layer->isBaseLayer = $row['isbaselayer'];
		$layer->isUntiled = $row['isuntiled'];
		$layer->isCached = $row['iscached'];
		$layer->maxscale = $row['maxscale'];
		$layer->minscale = $row['minscale'];
		$layer->transitionEffect = $row['transitioneffect'];
		$layer->imageFormat = $row['imageformat'];
		$layer->opacity = $row['opacity'];
		$layer->isDefault = $row['is_checked'];
		$layer->isHidden = $row['is_hidden'];
		$layer->isDisabled = $row['is_disabled'];
		$layer->isChecked = $row['is_checked'];
		$layer->activateType = $row['activate_type'];
		$layer->hasLegend = $row['has_legend'];
		$layer->hasSLD = $row['has_sld'];

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
	 * Get the list of legend items for a given parendId.
	 *
	 * @param String $parentId the identifier of the category
	 * @param String $countryCode the code of the country
	 * @return Array[Legend]
	 */
	public function getLegend($parentId, $countryCode) {

		Zend_Registry::get("logger")->info('getLegend : parentId : '.$parentId.' - countryCode : '.$countryCode);

		$db = $this->getAdapter();
		$params = array();

		// Prepare the request
		$req = " SELECT * ";
		$req .= " FROM legend ";
		$req .= " LEFT OUTER JOIN layer_definition  ON (legend.name = layer_definition.layer_name) ";
		$req .= " WHERE parent_id = '".$parentId."'";

		// Check the country code
		if (empty($countryCode)) {
			$req .= ' AND country_code IS NULL';
		} else {
			$req .= ' AND (country_code IS NULL OR country_code = ?)';
			$params[] = $countryCode;
		}

		// Check the user profile
		$userSession = new Zend_Session_Namespace('user');
		$role = $userSession->role;
		$req = $req.' AND (layer_name NOT IN (SELECT layer_name FROM layer_profile_restriction WHERE role_code = ?))';
		$params[] = $role->roleCode;

		$req = $req." ORDER BY position";

		Zend_Registry::get("logger")->info('layer_model.getLegend() : '.$req);

		$select = $db->prepare($req);
		$select->execute($params);

		$result = array();
		foreach ($select->fetchAll() as $row) {
			$legendItem = new Application_Model_Mapping_LegendItem();
			$legendItem->itemId = $row['item_id'];
			$legendItem->parentId = $row['parent_id'];
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
