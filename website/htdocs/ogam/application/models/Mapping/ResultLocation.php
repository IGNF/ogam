<?php
/**
 * © French National Forest Inventory
 * Licensed under EUPL v1.1 (see http://ec.europa.eu/idabc/eupl).
 */

/**
 * This is the model for managing result locations (for the web mapping).
 * @package models
 */
class Application_Model_Mapping_ResultLocation extends Zend_Db_Table_Abstract {

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
	 * @param TableField $locationField the location field.
	 * @param TableFormat $locationTable the location table
	 * @param String $visualisationSRS the projection system used for visualisation.
	 */
	public function fillLocationResult($sqlWhere, $sessionId, $locationField, $locationTable, $visualisationSRS) {
		$db = $this->getAdapter();
		$db->getConnection()->setAttribute(PDO::ATTR_TIMEOUT, 480);

		if ($sqlWhere != null) {
			$keys = $locationTable->primaryKeys;

				
			$request = " INSERT INTO result_location (session_id, format, pk, the_geom ) ";
			$request .= " SELECT DISTINCT '".$sessionId."', ";
			$request .= "'".$locationTable->format."', ";
				
			// Ajout des clés primaires de la table portant l'info géométrique
			$keyColumns = "";
			foreach ($keys as $key) {
				$keyColumns .= $locationTable->format.".".$key." || '__' || ";
			}
			if ($keyColumns != "") {
				$keyColumns = substr($keyColumns, 0, -11);
			}
			$request .= $keyColumns.", ";
				
			// Ajout de la colonne portant la géométrie
			$request .= " st_transform(".$locationTable->format.".".$locationField->columnName.",".$visualisationSRS.") as the_geom ";
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
	 * @return Array[String] the list of plot locations as WKT (well known text)
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
	 * @return String the bounging box as WKT (well known text)
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

	
	/**
	 * Returns the intersected location information.
	 *
	 * @param String $sessionId The session id
	 * @param Float $lon the longitude
	 * @param Float $lat the latitude
	 * @param String $geometryType the geometry type
	 *
	 * @return Array
	 */
	public function getLocationInfo($sessionId, $lon, $lat, $geometryType = 'POINT') {
	
		$db = $this->getAdapter();
	
		$configuration = Zend_Registry::get("configuration");
		$projection = $configuration->srs_visualisation;
		$margin = $configuration->featureinfo->margin;
	
		$translate = Zend_Registry::get('Zend_Translate');
		$lang = strtoupper($translate->getAdapter()->getLocale());
	
		$websiteSession = new Zend_Session_Namespace('website');
		// Get the current used schema
		$schema = $websiteSession->schema;
		// Get the last query done
		$queryObject = $websiteSession->queryObject;
	
		$genericService = new Genapp_Service_GenericService();
		$metadataModel = new Genapp_Model_Metadata_Metadata();
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
		$i=0;
		foreach ($tableFields as $tableField) {
			if($tableField->columnName != $locationField->columnName
					&& $tableField->columnName != 'SUBMISSION_ID'
					&& $tableField->columnName != 'PROVIDER_ID'
					&& $tableField->columnName != 'LINE_NUMBER'){
				// Get the mode label if the field is a modality
				if($tableField->type == 'CODE' && $tableField->subtype == 'MODE'){
					$tableFormat = $metadataModel->getTableFormatFromTableName('METADATA', 'MODE');
					$modeAlias = 'm'.$i;
					$translateAlias = 't'.$i;
					$cols .= 'COALESCE('.$translateAlias.'.label, '.$modeAlias.'.label) as '. $tableField->columnName .', ';
					$joinForMode .= 'LEFT JOIN mode '.$modeAlias.' ON '.$modeAlias.'.CODE = '.$tableField->columnName.' AND '.$modeAlias.'.UNIT = \''.$tableField->unit .'\' ';
					$joinForMode .= 'LEFT JOIN translation '.$translateAlias.' ON '.$translateAlias.'.lang = \''.$lang.'\' AND '.$translateAlias.'.table_format = \''.$tableFormat->format.'\' AND '.$translateAlias.'.row_pk = '.$modeAlias.'.unit || \',\' || '.$modeAlias.'.code ';
					$i++;
				} else {
					$cols .= $tableField->columnName . ', ';
				}
			}
		}
	
		// Setup the location table pks for the join on the location table
		// and for the pk column
		$pkscols = '';
		foreach ($locationTableInfo->primaryKeys as $primaryKey) {
			$pkscols .= "l.".$primaryKey . " || '__' || ";
			$cols .= "'".strtoupper($primaryKey)."/' || ".$primaryKey . " || '/' || ";
		}
		if($pkscols != ''){
			$pkscols = substr($pkscols, 0, -11);
		} else {
			throw new Exception('No pks columns found for the location table.');
		}
		if($cols != ''){
			$cols = substr($cols, 0, -11) . " as pk ";
		} else {
			throw new Exception('No columns found for the location table.');
		}
	
		$req = "SELECT " . $cols . " ";
		$req .= "FROM result_location r ";
		$req .= "LEFT JOIN ".$locationTableInfo->tableName." l on (r.format = '".$locationTableInfo->format."' AND r.pk = ".$pkscols.") ";
		$req .= $joinForMode;
		$req .= "WHERE r.session_id = ? and geometrytype(r.the_geom)='".$geometryType."' ";
		$req .= "and ST_DWithin(r.the_geom, ST_SetSRID(ST_Point(?, ?),".$projection."), ".$margin.")";
	
		$this->logger->info('getLocationInfo session_id : '.$sessionId);
		$this->logger->info('getLocationInfo lon : '.$lon);
		$this->logger->info('getLocationInfo lat : '.$lat);
		$this->logger->info('getLocationInfo request : '.$req);
	
		$select = $db->prepare($req);
		$select->execute(array($sessionId, $lon, $lat));
	
		return $select->fetchAll();
	}
}
