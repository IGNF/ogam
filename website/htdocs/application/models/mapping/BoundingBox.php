<?php
/**
 * © French National Forest Inventory 
 * Licensed under EUPL v1.1 (see http://ec.europa.eu/idabc/eupl).
 */ 
require_once 'mapping/Center.php';

/**
 * This is the model for managing countries bounding boxes.
 * @package models
 */
class Model_BoundingBox extends Zend_Db_Table_Abstract {

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
	 * @param String $codeCountry the code of the country or 999 for europe
	 * @return Center the center
	 */
	public function getCenter($codeCountry) {
		$db = $this->getAdapter();

		if (empty($codeCountry)) {
            $configuration = Zend_Registry::get("configuration");
            $codeCountry = $configuration->defaultCodeCountry;
		}

		$req = " SELECT (bb_xmin + bb_xmax) / 2 as x_center, (bb_ymin + bb_ymax) / 2 as y_center, zoom_level
			   	 FROM bounding_box
			   	 WHERE code_country = ?";

		Zend_Registry::get("logger")->info('getCenter : '.$req);

		$select = $db->prepare($req);
		$select->execute(array($codeCountry));

		$row = $select->fetch();
		$center = new Center();
		$center->x_center = $row['x_center'];
		$center->y_center = $row['y_center'];
		$center->defaultzoom = $row['zoom_level'];

		return $center;
	}

	/**
	 * Get NUTS code of a country.
	 *
	 * @param String $codeCountry the code of the country or 999 for europe
	 * @return String the NUTS code
	 */
	public function getNUTSCode($codeCountry) {
		$db = $this->getAdapter();

		$req = " SELECT nuts_code
			   	 FROM bounding_box
			   	 WHERE code_country = ?";

		Zend_Registry::get("logger")->info('getNUTSCode for '.$codeCountry.' : '.$req);

		$select = $db->prepare($req);
		$select->execute(array($codeCountry));

		$row = $select->fetch();

		return $row['nuts_code'];
	}

}
