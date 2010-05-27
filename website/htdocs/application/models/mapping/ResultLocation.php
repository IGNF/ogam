<?php

/**
 * This is the model for managing result locations (for the web mapping).
 * @package models
 */
class Model_ResultLocation extends Zend_Db_Table_Abstract {

	var $logger;

	/**
	 * Initialisation
	 */
	public function init() {

		// Initialise the logger
		$this->logger = Zend_Registry::get("logger");
	}

	/**
	 * Populate the result location table.
	 *
	 * @param String $sqlWhere the FROM / WHERE part of the SQL Request
	 * @param String $sessionId the user session id.
	 * @param String $locationtable the location table.
	 * @param String $visualisationSRS the projection system used for visualisation.
	 */
	public function fillLocationResult($sqlWhere, $sessionId, $locationtable, $visualisationSRS) {
		$db = $this->getAdapter();
		$db->getConnection()->setAttribute(PDO::ATTR_TIMEOUT, 480);

		if ($sqlWhere != null) {
			$request = " INSERT INTO result_location (session_id, country_code, plot_code, the_geom ) ";
			$request .= " SELECT DISTINCT '".$sessionId."', ".$locationtable.".country_code, ".$locationtable.".plot_code, st_transform(".$locationtable.".the_geom,".$visualisationSRS.") as the_geom ";
			$request .= $sqlWhere;

			$this->logger->info('fillLocationResult : '.$request);

			$query = $db->prepare($request);
			$query->execute();
		}
	}

	/**
	 * Clean the previously stored results.
	 * Delete the results belonging to the current user or that are too old.
	 *
	 * @param String the user session id.
	 */
	public function cleanPreviousResults($sessionId) {
		$db = $this->getAdapter();

		$req = "DELETE FROM result_location WHERE session_id = ? OR ((NOW()-_creationdt)> '2 day')";

		$this->logger->info('cleanPreviousResults request : '.$req);

		$query = $db->prepare($req);
		$query->execute(array($sessionId));
	}

	/**
	 * Get the plot locations.
	 *
	 * @param String the user session id.
	 */
	public function getPlotLocations($sessionId) {
		$db = $this->getAdapter();

		$configuration = Zend_Registry::get("configuration");
		$projection = $configuration->srs_visualisation;

		$req = "SELECT astext(transform(the_geom,".$projection.")) as position FROM result_location WHERE session_id = ?";

		$this->logger->info('getPlotLocations session_id : '.$sessionId);
		$this->logger->info('getPlotLocations request : '.$req);

		$select = $db->prepare($req);
		$select->execute(array($sessionId));

		$result = array();
		foreach ($select->fetchAll() as $row) {
			$result[] = $row['position'];
		}
		return $result;
	}

   /**
     * Returns the bounding box that bounds geometries of results table.
     *
     * @param String the user session id.
     */
    public function getResultsBBox($sessionId) {
        $db = $this->getAdapter();

        $configuration = Zend_Registry::get("configuration");
        $projection = $configuration->srs_visualisation;

        $req = "SELECT astext(st_extent(transform(the_geom,".$projection."))) as wkt FROM result_location WHERE session_id = ?";

        $this->logger->info('getResultsBBox session_id : '.$sessionId);
        $this->logger->info('getResultsBBox request : '.$req);

        $select = $db->prepare($req);
        $select->execute(array($sessionId));
        $result = $select->fetchColumn(0);

        return $result;
    }
}
