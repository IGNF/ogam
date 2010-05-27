<?php

/**
 * This is a model allowing access to the locations.
 * @package models
 */
class Model_Location extends Zend_Db_Table_Abstract {

	var $logger;

	/**
	 * Initialisation
	 */
	public function init() {

		// Initialise the logger
		$this->logger = Zend_Registry::get("logger");
	}

	/**
	 * Get the number of plot locations per country.
	 *
	 * @return Array[countryCode => count]
	 */
	public function getLocationsPerCountry() {
		$db = $this->getAdapter();
		$req = " SELECT code, label, nb_locations "." FROM mode "." LEFT JOIN ( "."     SELECT country_code, count(*) as nb_locations "."     FROM  location "."     GROUP BY country_code "." ) as l ON (mode.code = l.country_code) "." WHERE unit = 'COUNTRY_CODE' "." ORDER BY position";

		$select = $db->prepare($req);

		$select->execute(array());

		Zend_Registry::get("logger")->info('getLocationsPerCountry : '.$req);

		$result = array();
		foreach ($select->fetchAll() as $row) {
			$result[$row['code']] = $row['nb_locations'];
		}

		return $result;

	}

}
