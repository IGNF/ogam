<?php

/**
 * This is a model allowing to aggregate the harmonized data.
 * @package models
 */
class Model_Aggregation extends Zend_Db_Table_Abstract {

	var $logger;

	/**
	 * Initialisation
	 */
	public function init() {

		// Initialise the logger
		$this->logger = Zend_Registry::get("logger");
	}

	/**
	 * Clean the previously stored results.
	 * Delete the results belonging to the current user or that are too old.
	 *
	 * @param String the user session id.
	 */
	public function cleanPreviousResults($sessionId) {
		$db = $this->getAdapter();

		$req = "DELETE FROM aggregated_result WHERE session_id = ? OR ((NOW()-_creationdt)> '5 day')";

		$this->logger->info('cleanPreviousResults request : '.$req);

		$query = $db->prepare($req);
		$query->execute(array($sessionId));
	}

	/**
	 * Insert into the temporary aggregation table the result of the aggregation.
	 *
	 * @param String $sessionId  the session identifier of the user
	 * @param Field $selectedField the value to aggregate
	 * @param Grid $grid the destination grid descriptor
	 * @param String $sqlWhere the FROM WHERE part of the currently used sql request
	 */
	public function aggregateData($sessionId, $selectedField, $grid, $sqlWhere) {

		$db = $this->getAdapter();
		$db->getConnection()->setAttribute(PDO::ATTR_TIMEOUT, 480);

		// Force PostgreSQL to use the indexes
		$req = "SET enable_seqscan = false";
		$select = $db->prepare($req);
		$select->execute(array());

		// Aggregate the data extracted from the current request
		$req = " INSERT INTO aggregated_result (session_id, cell_id, average_value, value_count) ";
		$req .= " SELECT '".$sessionId."' as session_id, ";
		$req .= " coalesce(foo.cell_id, '') as cell_id, ";
		$req .= " AVG(foo.plotValue) as average_value, ";
		$req .= " COUNT (foo.*) as plot_count ";
		$req .= " FROM (";
		$req .= "       SELECT SUM(".$selectedField->format.".".$selectedField->data.") as plotValue, "; // the value to aggregate
		$req .= "       MAX(".$grid->locationColumn.") as cell_id "; // the cell_id (should be always the same for a given plot)
		$req .= "       ".$sqlWhere; // The criteria for the selection of plots
		$req .= "       GROUP BY LOCATION_DATA.plot_code";
		$req .= "      ) as foo ";
		$req .= " GROUP BY foo.cell_id";

		Zend_Registry::get("logger")->debug('aggregateData : '.$req);

		$select = $db->prepare($req);

		$select->execute(array());

	}

	/**
	 * Return the aggregated data for a given session id
	 *
	 * @param String the user session id.
	 * @return Array[] the aggregated data
	 */
	public function getAggregatedData($sessionId, $filter) {
		$db = $this->getAdapter();

		$req = "SELECT cell_id, average_value, value_count FROM aggregated_result WHERE session_id = ?";
		if (!empty($req)) {
			$req .= $filter;
		}

		$this->logger->info('getAggregatedData request : '.$req);

		$query = $db->prepare($req);
		$query->execute(array($sessionId));

		return $query->fetchAll();
	}

}
