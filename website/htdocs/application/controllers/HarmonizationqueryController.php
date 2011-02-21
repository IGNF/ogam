<?php
/**
 * © French National Forest Inventory 
 * Licensed under EUPL v1.1 (see http://ec.europa.eu/idabc/eupl).
 */ 
require_once 'AbstractQueryController.php';
require_once APPLICATION_PATH.'/models/aggregation/Aggregation.php';

/**
 * HarmonizationQueryController is the controller that manages database query module on harmonized data.
 * @package controllers
 */
class HarmonizationQueryController extends AbstractQueryController {

	protected $schema = "HARMONIZED_DATA";

	/**
	 * Initialise the controler
	 */
	public function init() {
		parent::init();

		// Set the current module name
		$websiteSession = new Zend_Session_Namespace('website');
		$websiteSession->module = "harmonizationquery";
		$websiteSession->moduleLabel = "Query Harmonized Data";
		$websiteSession->moduleURL = "harmonizationquery";

		$configuration = Zend_Registry::get("configuration");
		$this->visualisationSRS = $configuration->srs_visualisation;
		$this->databaseSRS = $configuration->srs_harmonized_data;
		$this->detailsLayers = $configuration->harmonized_details_layers->toArray();

		// Init the activated layers
		$mappingSession = new Zend_Session_Namespace('mapping');
		$mappingSession->activatedLayers[] = 'all_harmonized_locations';
		$mappingSession->activatedLayers[] = 'all_harmonized_locations_country';
	}

	/**
	 * Check if the authorization is valid this controler.
	 */
	function preDispatch() {

		parent::preDispatch();

		$userSession = new Zend_Session_Namespace('user');
		$permissions = $userSession->permissions;
		if (empty($permissions) || !array_key_exists('DATA_QUERY_HARMONIZED', $permissions)) {
			$this->_redirector->gotoUrl('/');
		}
	}

	/**
	 * Return the logical name of the location table (the table containing the the_geom column).
	 *
	 * @return String the location table
	 */
	protected function getLocationTable() {
		return "HARMONIZED_LOCATION_DATA";
	}

	/**
	 * Return the logical name of the plot table (the table containing the plot data).
	 *
	 * @return String the plot table
	 */
	protected function getPlotTable() {
		return "HARMONIZED_PLOT_DATA";
	}

	/**
	 * Returns a csv file corresponding to the requested data.
	 */
	public function aggregationCsvExportAction() {

		// Configure memory and time limit because the program ask a lot of resources
		$configuration = Zend_Registry::get("configuration");
		ini_set("memory_limit", $configuration->memory_limit);
		ini_set("max_execution_time", $configuration->max_execution_time);

		// Define the header of the response
		$this->getResponse()->setHeader('Content-Type', 'text/csv;charset=UTF-8;application/force-download;', true);
		$this->getResponse()->setHeader('Content-disposition', 'attachment; filename=DataExport.csv', true);

		// Get the order parameters
		$sort = $this->getRequest()->getPost('sort');
		$sortDir = $this->getRequest()->getPost('dir');

		$filter = "";
		if ($sort != "") {
			$filter .= " ORDER BY ".$sort." ".$sortDir;
		}

		// Execute the request
		$aggregationModel = new Model_Aggregation();
		$result = $aggregationModel->getAggregatedData(session_id(), $filter);

		if (sizeof($result) != 0) {

			// Prepend the Byte Order Mask to inform Excel that the file is in UTF-8
			echo(chr(0xEF));
			echo(chr(0xBB));
			echo(chr(0xBF));

			// Display the default message
			echo('// *************************************************')."\n";
			echo('// Data Export')."\n";
			echo('// *************************************************')."\n\n";

			// Export the column names
			$labels = array(
				'Cell id',
				'Average value',
				'Value count'
			);
			echo '// ';
			foreach ($labels as $label) {
				echo $label.';';
			}
			echo "\n";

			// Export the lines of data
			foreach ($result as $line) {
				$nbcol = sizeof($line);
				$keys = array_keys($line);
				for ($i = 0; $i < $nbcol; $i++) {
					$colName = $keys[$i]; // get the name of the column
					$value = $line[$colName];
					echo $value.';';
				}
				echo "\n";
			}
		} else {
			echo('// No Data');
		}

		$this->_helper->layout()->disableLayout();
		$this->_helper->viewRenderer->setNoRender();
	}

}
