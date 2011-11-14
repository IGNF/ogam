<?php
/**
 * © French National Forest Inventory
 * Licensed under EUPL v1.1 (see http://ec.europa.eu/idabc/eupl).
 */

/**
 * This is the model for managing countries bounding boxes.
 * @package models
 */
class Application_Model_Mapping_BoundingBox extends Zend_Db_Table_Abstract {

	var $logger;

	/**
	 * Initialisation
	 */
	public function init() {

		// Initialise the logger
		$this->logger = Zend_Registry::get("logger");
	}

	/**
	 * Get the center and defaut zoom level of the map for the country.
	 *
	 * @param String $providerId the provider identifier
	 * @return Center the center
	 */
	public function getCenter($providerId) {
		$db = $this->getAdapter();

		if (empty($providerId)) {
			$userSession = new Zend_Session_Namespace('user');
			$providerId = $userSession->user->providerId;
		}

		$req = " SELECT (bb_xmin + bb_xmax) / 2 as x_center, (bb_ymin + bb_ymax) / 2 as y_center, zoom_level
			   	 FROM bounding_box
			   	 WHERE provider_id = ?";

		Zend_Registry::get("logger")->info('getCenter : '.$req);

		$select = $db->prepare($req);
		$select->execute(array($providerId));

		$row = $select->fetch();
		$center = new Application_Object_Mapping_Center();
		$center->x_center = $row['x_center'];
		$center->y_center = $row['y_center'];
		$center->defaultzoom = $row['zoom_level'];

		return $center;
	}

}
