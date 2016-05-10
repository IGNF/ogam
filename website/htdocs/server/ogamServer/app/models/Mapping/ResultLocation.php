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
 * This is the model for managing result locations (for the web mapping).
 *
 * @package Application_Model
 * @subpackage Mapping
 */
class Application_Model_Mapping_ResultLocation {

	/**
	 * The logger.
	 *
	 * @var Zend_Log
	 */
	var $logger;

	/**
	 * The database connection
	 *
	 * @var Zend_Db
	 */
	var $db;

	/**
	 * Initialisation.
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
	 * Populate the result location table.
	 *
	 * @param String $sqlWhere
	 *        	the FROM / WHERE part of the SQL Request
	 * @param String $sessionId
	 *        	the user session id.
	 * @param Application_Object_Metadata_TableField $locationField
	 *        	the location field.
	 * @param Application_Object_Metadata_TableFormat $locationTable
	 *        	the location table
	 * @param String $visualisationSRS
	 *        	the projection system used for visualisation.
	 */
	public function fillLocationResult($sqlWhere, $sessionId, $locationField, $locationTable, $visualisationSRS) {
		if ($this->_isLocalDB()) {
			// We can use INSERT ... SELECT statement only if we are exactly on the same server
			$this->_fillLocationResult($sqlWhere, $sessionId, $locationField, $locationTable, $visualisationSRS);
		} else {
			// The "remote" method is 2x or 3x more time consuming
			$this->_fillLocationResultRemote($sqlWhere, $sessionId, $locationField, $locationTable, $visualisationSRS);
		}
	}

	/**
	 * Indicate if the raw database is on a remote server.
	 *
	 * @return Boolean true if the raw database is on a local server
	 */
	private function _isLocalDB() {
		$rawdb = Zend_Registry::get('raw_db');

		$mappingConfig = $this->db->getConfig();
		$rawConfig = $rawdb->getConfig();

		// We consider that the database is remote if any of the main config options is different
		$isLocal = true;
		$isLocal = $isLocal && ($mappingConfig['host'] === $rawConfig['host']);
		$isLocal = $isLocal && ($mappingConfig['port'] === $rawConfig['port']);
		$isLocal = $isLocal && ($mappingConfig['dbname'] === $rawConfig['dbname']);
		$isLocal = $isLocal && ($mappingConfig['username'] === $rawConfig['username']);

		$this->logger->info('mappingConfig[dbname] : ' . $mappingConfig['dbname']);
		$this->logger->info('rawConfig[dbname] : ' . $rawConfig['dbname']);

		$this->logger->info('isLocal : ' . ($isLocal ? "yes" : "no"));

		return $isLocal;
	}

	/**
	 * Populate the result location table.
	 *
	 * @param String $sqlWhere
	 *        	the FROM / WHERE part of the SQL Request
	 * @param String $sessionId
	 *        	the user session id.
	 * @param Application_Object_Metadata_TableField $locationField
	 *        	the location field.
	 * @param Application_Object_Metadata_TableFormat $locationTable
	 *        	the location table
	 * @param String $visualisationSRS
	 *        	the projection system used for visualisation.
	 */
	private function _fillLocationResult($sqlWhere, $sessionId, $locationField, $locationTable, $visualisationSRS) {
		$this->db->getConnection()->setAttribute(PDO::ATTR_TIMEOUT, 480);

		if ($sqlWhere != null) {
			$keys = $locationTable->primaryKeys;

			$request = " INSERT INTO result_location (session_id, format, pk, the_geom ) ";

			// L'identifiant de session de l'utilisateur
			$request .= " SELECT DISTINCT '" . $sessionId . "', ";

			// Le nom de la table portant l'info géométrique
			$request .= "'" . $locationTable->format . "', ";

			// Ajout des clés primaires de la table
			$keyColumns = "";
			foreach ($keys as $key) {
				$keyColumns .= $locationTable->format . "." . $key . " || '__' || ";
			}
			if ($keyColumns != "") {
				$keyColumns = substr($keyColumns, 0, -11);
			}
			$request .= $keyColumns . ", ";

			// Ajout de la colonne portant la géométrie
			$request .= " st_transform(" . $locationTable->format . "." . $locationField->columnName . "," . $visualisationSRS . ") as the_geom ";
			$request .= $sqlWhere;

			$this->logger->info('fillLocationResult : ' . $request);

			$query = $this->db->prepare($request);
			$query->execute();
		}
	}

	/**
	 * Populate the result location table.
	 *
	 * Used when the raw data schema is in another database.
	 *
	 * @param String $sqlWhere
	 *        	the FROM / WHERE part of the SQL Request
	 * @param String $sessionId
	 *        	the user session id.
	 * @param Application_Object_Metadata_TableField $locationField
	 *        	the location field.
	 * @param Application_Object_Metadata_TableFormat $locationTable
	 *        	the location table
	 * @param String $visualisationSRS
	 *        	the projection system used for visualisation.
	 */
	private function _fillLocationResultRemote($sqlWhere, $sessionId, $locationField, $locationTable, $visualisationSRS) {
		$this->db->getConnection()->setAttribute(PDO::ATTR_TIMEOUT, 480);

		$rawdb = Zend_Registry::get('raw_db');
		$rawdb->getConnection()->setAttribute(PDO::ATTR_TIMEOUT, 480);

		if ($sqlWhere != null) {
			$keys = $locationTable->primaryKeys;

			// L'identifiant de session de l'utilisateur
			$select = " SELECT DISTINCT ";

			// Le nom de la table portant l'info géométrique
			$select .= "'" . $locationTable->format . "' as format, ";

			// Ajout des clés primaires de la table
			$keyColumns = "";
			foreach ($keys as $key) {
				$keyColumns .= $locationTable->format . "." . $key . " || '__' || ";
			}
			if ($keyColumns != "") {
				$keyColumns = substr($keyColumns, 0, -11);
			}
			$select .= $keyColumns . " as pk, ";

			// Ajout de la colonne portant la géométrie
			$select .= " st_transform(" . $locationTable->format . "." . $locationField->columnName . "," . $visualisationSRS . ") as the_geom ";
			$select .= $sqlWhere;

			$this->logger->info('fillLocationResultRemote : ' . $select);

			$query = $rawdb->prepare($select);
			$query->execute();

			foreach ($query->fetchAll() as $row) {

				$insert = " INSERT INTO result_location (session_id, format, pk, the_geom ) ";
				$insert .= " VALUES (?, ?, ?, ?)";

				$query = $this->db->prepare($insert);
				$query->execute(array(
					$sessionId,
					$row['format'],
					$row['pk'],
					$row['the_geom']
				));
			}
		}
	}

	/**
	 * Clean the previously stored results.
	 * Delete the results belonging to the current user or that are too old.
	 *
	 * @param
	 *        	String the user session id.
	 */
	public function cleanPreviousResults($sessionId) {
		$req = "DELETE FROM result_location WHERE session_id = ? OR (_creationdt < CURRENT_TIMESTAMP - INTERVAL '2 days')";

		$this->logger->info('cleanPreviousResults request : ' . $req);

		$query = $this->db->prepare($req);
		$query->execute(array(
			$sessionId
		));
	}

	/**
	 * Get the plot locations.
	 *
	 * @param
	 *        	String the user session id.
	 * @return Array[String] the list of plot locations as WKT (well known text)
	 */
	public function getPlotLocations($sessionId) {
		$configuration = Zend_Registry::get("configuration");
		$projection = $configuration->srs_visualisation;

		$req = "SELECT st_astext(st_transform(the_geom," . $projection . ")) as position FROM result_location WHERE session_id = ?";

		$this->logger->info('getPlotLocations session_id : ' . $sessionId);
		$this->logger->info('getPlotLocations request : ' . $req);

		$select = $this->db->prepare($req);
		$select->execute(array(
			$sessionId
		));

		$result = array();
		foreach ($select->fetchAll() as $row) {
			$result[] = $row['position'];
		}
		return $result;
	}

	/**
	 * Returns the bounding box that bounds geometries of results table.
	 *
	 * @param
	 *        	String the user session id.
	 * @return String the bounging box as WKT (well known text)
	 */
	public function getResultsBBox($sessionId) {
		$configuration = Zend_Registry::get("configuration");
		$projection = $configuration->srs_visualisation;

		$req = "SELECT st_astext(st_extent(st_transform(the_geom," . $projection . "))) as wkt FROM result_location WHERE session_id = ?";

		$this->logger->info('getResultsBBox session_id : ' . $sessionId);
		$this->logger->info('getResultsBBox request : ' . $req);

		$select = $this->db->prepare($req);
		$select->execute(array(
			$sessionId
		));
		$result = $select->fetchColumn(0);

		return $result;
	}

	/**
	 * Returns the number of results in the results table.
	 *
	 * @param
	 *        	String the user session id.
	 * @return Integer the number of results
	 */
	public function getResultsCount($sessionId) {
		$req = "SELECT count(*) FROM result_location WHERE session_id = ?";

		$this->logger->info('getResultsCount session_id : ' . $sessionId);
		$this->logger->info('getResultsCount request : ' . $req);

		$select = $this->db->prepare($req);
		$select->execute(array(
			$sessionId
		));
		$result = $select->fetchColumn(0);

		return $result;
	}

	/**
	 * Returns the intersected location information.
	 *
	 * @param String $sessionId
	 *        	The session id
	 * @param Float $lon
	 *        	the longitude
	 * @param Float $lat
	 *        	the latitude
	 * @return Array
	 * @throws Exception
	 */
	public function getLocationInfo($sessionId, $lon, $lat) {
		$configuration = Zend_Registry::get("configuration");
		$projection = $configuration->srs_visualisation;

		$selectMode = $configuration->featureinfo_selectmode;
		$margin = $configuration->featureinfo_margin;

		$translate = Zend_Registry::get('Zend_Translate');
		$lang = strtoupper($translate->getAdapter()->getLocale());

		$websiteSession = new Zend_Session_Namespace('website');
		// Get the current used schema
		$schema = $websiteSession->schema;
		// Get the last query done
		$queryObject = $websiteSession->queryObject;

		$genericService = new Application_Service_GenericService();
		$metadataModel = new Application_Model_Metadata_Metadata();
		// Extract the location table from the last query
		$tables = $genericService->getAllFormats($schema, $queryObject);
		// Extract the location field from the available tables
		$locationField = $metadataModel->getGeometryField($schema, array_keys($tables));
		// Get the location table infos
		$locationTableInfo = $metadataModel->getTableFormat($schema, $locationField->format);
		// Get the location table columns
		$tableFields = $metadataModel->getTableFields($schema, $locationField->format, null);

		// Setup the location table columns for the select
		$cols = '';
		$joinForMode = '';
		$i = 0;
		foreach ($tableFields as $tableField) {
			if ($tableField->columnName != $locationField->columnName && $tableField->columnName != 'SUBMISSION_ID' && $tableField->columnName != 'PROVIDER_ID' && $tableField->columnName != 'LINE_NUMBER') {
				// Get the mode label if the field is a modality
				if ($tableField->type === 'CODE' && $tableField->subtype === 'MODE') {
					$modeAlias = 'm' . $i;
					$translateAlias = 't' . $i;
					$cols .= 'COALESCE(' . $translateAlias . '.label, ' . $modeAlias . '.label) as ' . $tableField->columnName . ', ';
					$joinForMode .= 'LEFT JOIN mode ' . $modeAlias . ' ON ' . $modeAlias . '.CODE = ' . $tableField->columnName . ' AND ' . $modeAlias . '.UNIT = \'' . $tableField->unit . '\' ';
					$joinForMode .= 'LEFT JOIN translation ' . $translateAlias . ' ON (' . $translateAlias . '.lang = \'' . $lang . '\' AND ' . $translateAlias . '.table_format = \'MODE\' AND ' . $translateAlias . '.row_pk = ' . $modeAlias . '.unit || \',\' || ' . $modeAlias . '.code) ';
					$i ++;
				} elseif ($tableField->type === "DATE") {
					$cols .= 'to_char(' . $tableField->columnName . ', \'YYYY/MM/DD\') as ' . $tableField->columnName . ', ';
				} else {
					$cols .= $tableField->columnName . ', ';
				}
			}
		}

		// Setup the location table pks for the join on the location table
		// and for the pk column
		$pkscols = '';
		foreach ($locationTableInfo->primaryKeys as $primaryKey) {
			$pkscols .= "l." . $primaryKey . "::varchar || '__' || ";
			$cols .= "'" . strtoupper($primaryKey) . "/' || " . $primaryKey . " || '/' || ";
		}
		if ($pkscols != '') {
			$pkscols = substr($pkscols, 0, -11);
		} else {
			throw new Exception('No pks columns found for the location table.');
		}
		if ($cols != '') {
			$cols = substr($cols, 0, -11) . " as pk ";
		} else {
			throw new Exception('No columns found for the location table.');
		}

		$req = "SELECT " . $cols . " ";
		if ($selectMode === 'distance') {
			$req .= ", ST_Distance(r.the_geom, ST_SetSRID(ST_Point(?, ?)," . $projection . ")) as dist ";
		}
		$req .= "FROM result_location r ";
		$req .= "LEFT JOIN " . $locationTableInfo->tableName . " l on (r.format = '" . $locationTableInfo->format . "' AND r.pk = " . $pkscols . ") ";
		$req .= $joinForMode;
		$req .= "WHERE r.session_id = ? ";
		if ($selectMode === 'buffer') {
			$req .= "and ST_DWithin(r.the_geom, ST_SetSRID(ST_Point(?, ?)," . $projection . "), " . $margin . ")";
		} elseif ($selectMode === 'distance') {
			$req .= "and ST_Distance(r.the_geom, ST_SetSRID(ST_Point(?, ?)," . $projection . ")) < " . $margin;
			$req .= "ORDER BY dist";
		}

		$this->logger->info('getLocationInfo session_id : ' . $sessionId);
		$this->logger->info('getLocationInfo lon : ' . $lon);
		$this->logger->info('getLocationInfo lat : ' . $lat);
		$this->logger->info('getLocationInfo request : ' . $req);

		$select = $this->db->prepare($req);
		if ($selectMode === 'buffer') {
			$select->execute(array(
				$sessionId,
				$lon,
				$lat
			));
		} elseif ($selectMode === 'distance') {
			$select->execute(array(
				$lon,
				$lat,
				$sessionId,
				$lon,
				$lat
			));
		}

		return $select->fetchAll();
	}
}
