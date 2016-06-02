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
 * This is the model for managing countries bounding boxes.
 *
 * @package Application_Model
 * @subpackage Mapping
 */
class Application_Model_Mapping_BoundingBox {

	/**
	 * The logger.
	 *
	 * @var Zend_Log
	 */
	protected $logger;

	/**
	 * The database connection
	 *
	 * @var Zend_Db
	 */
	var $db;

	/**
	 * Initialisation
	 */
	public function __construct() {

		// Initialise the logger
		$this->logger = Zend_Registry::get("logger");

		// The database connection
		$this->db = Zend_Registry::get('mapping_db');
	}

	/**
	 * Destuction.
	 */
	function __destruct() {
		$this->db->closeConnection();
	}

	/**
	 * Read a BBox object from a result line.
	 *
	 * @param Result $row
	 * @return Application_Object_Mapping_BoundingBox
	 */
	private function _readBBox($row) {
		$bbox = new Application_Object_Mapping_BoundingBox();
		$bbox->xmin = $row['bb_xmin'];
		$bbox->ymin = $row['bb_ymin'];
		$bbox->xmax = $row['bb_xmax'];
		$bbox->ymax = $row['bb_ymax'];
		$bbox->zoomLevel = $row['zoom_level'];

		return $bbox;
	}

	/**
	 * Get a bounding box by provider id.
	 *
	 * @param String $providerId
	 * @return Application_Object_Mapping_BoundingBox
	 * @throws Exception
	 */
	public function getBoundingBox($providerId) {
		$req = " SELECT *";
		$req .= " FROM mapping.bounding_box ";
		$req .= " WHERE provider_id = ?";

		Zend_Registry::get("logger")->info('getBoundingBox : ' . $req);

		$select = $this->db->prepare($req);
		$select->execute(array(
			$providerId
		));

		$row = $select->fetch();
		if (!$row) {
			throw new Exception("Could not find BBox for provider " . $providerId);
		}

		$bbox = $this->_readBBox($row);

		return $bbox;
	}

	/**
	 * Add a new bounding box in database.
	 *
	 * @param String $providerId
	 *        	the provider id
	 * @param Application_Object_Mapping_BoundingBox $boundingBox
	 *        	the bounding box
	 */
	public function addBoundingBox($providerId, $boundingBox) {
		$req = " INSERT INTO mapping.bounding_box (provider_id, bb_xmin, bb_ymin, bb_xmax, bb_ymax, zoom_level)";
		$req .= " VALUES (?, ?, ?, ?, ?, ?)";

		$this->logger->info('addBoundingBox : ' . $req);

		$query = $this->db->prepare($req);
		$query->execute(array(
			$providerId,
			$boundingBox->xmin,
			$boundingBox->ymin,
			$boundingBox->xmax,
			$boundingBox->ymax,
			$boundingBox->zoomLevel
		));
	}

	/**
	 * Delete a bounding box from Db
	 *
	 * @param String $providerId
	 *        	the provider id
	 */
	public function deleteBoundingBox($providerId) {
		$req = " DELETE FROM mapping.bounding_box ";
		$req .= " WHERE provider_id = ?";

		$this->logger->info('deleteBoundingBox : ' . $req);

		$query = $this->db->prepare($req);
		$query->execute(array(
			$providerId
		));
	}

	/**
	 * Get the center and defaut zoom level of the map for the provider.
	 *
	 * @param String $providerId
	 *        	the provider identifier
	 * @return Center the center
	 */
	public function getCenter($providerId) {
		$req = " SELECT (bb_xmin + bb_xmax) / 2 as x_center, (bb_ymin + bb_ymax) / 2 as y_center, zoom_level ";
		$req .= " FROM bounding_box ";
		$req .= " WHERE provider_id = ?";

		Zend_Registry::get("logger")->info('getCenter : ' . $req);

		$select = $this->db->prepare($req);
		$select->execute(array(
			$providerId
		));

		$row = $select->fetch();
		if (!empty($row)) {
			$center = new Application_Object_Mapping_Center();
			$center->x = $row['x_center'];
			$center->y = $row['y_center'];
			$center->zoomLevel = $row['zoom_level'];

			return $center;
		} else {
			return null;
		}
	}
}