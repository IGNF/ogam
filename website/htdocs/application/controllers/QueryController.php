<?php
/**
 * © French National Forest Inventory 
 * Licensed under EUPL v1.1 (see http://ec.europa.eu/idabc/eupl).
 */ 
require_once 'AbstractQueryController.php';

/**
 * QueryController is the controller that manages database query module.
 * @package controllers
 */
class QueryController extends AbstractQueryController {

	protected $schema = "RAW_DATA";

	/**
	 * Initialise the controler
	 */
	public function init() {
		parent::init();

		// Set the current module name
		$websiteSession = new Zend_Session_Namespace('website');
		$websiteSession->module = "query";
		$websiteSession->moduleLabel = "Query Data";
		$websiteSession->moduleURL = "query";

		$configuration = Zend_Registry::get("configuration");
		$this->visualisationSRS = $configuration->srs_visualisation;
		$this->databaseSRS = $configuration->srs_raw_data;
		$this->detailsLayers = $configuration->query_details_layers->toArray();
		
		// Init the activated layers
		$mappingSession = new Zend_Session_Namespace('mapping');
		$mappingSession->activatedLayers[] = 'all_locations';
		$mappingSession->activatedLayers[] = 'all_locations_country';

	}

	/**
	 * Check if the authorization is valid this controler.
	 */
	function preDispatch() {

		parent::preDispatch();

		$userSession = new Zend_Session_Namespace('user');
		$permissions = $userSession->permissions;
		if (empty($permissions) || !array_key_exists('DATA_QUERY', $permissions)) {
			$this->_redirector->gotoUrl('/');
		}
	}

	/**
	 * Return the logical name of the location table (the table containing the the_geom column).
	 *
	 * @return String the name of the table.
	 */
	protected function getLocationTable() {
		return "LOCATION_DATA";
	}

   /**
     * Return the logical name of the plot table (the table containing the plot data).
     *
     * @return String the plot table
     */
    protected function getPlotTable() {
        return "PLOT_DATA";
    }
}