<?php
/**
 * © French National Forest Inventory
 * Licensed under EUPL v1.1 (see http://ec.europa.eu/idabc/eupl).
 */
require_once 'AbstractEforestController.php';
require_once APPLICATION_PATH.'/models/metadata/Metadata.php';
require_once APPLICATION_PATH.'/models/raw_data/Generic.php';
require_once APPLICATION_PATH.'/models/mapping/ResultLocation.php';
require_once APPLICATION_PATH.'/models/website/PredefinedRequest.php';

/**
 * AbstractQueryController is the controller that manages the query module.
 * @package controllers
 */
abstract class AbstractQueryController extends AbstractEforestController {

	/**
	 * The name of the schema where the data is stored.
	 * @var String
	 */
	protected $schema;

	/**
	 * The system of projection for the visualisation.
	 */
	protected $visualisationSRS;

	/**
	 * The system of projection for the storage.
	 */
	protected $databaseSRS;

	/**
	 * Name of the layer used to display the images in the details panel.
	 */
	protected $detailsLayers;

	/**
	 * Initialise the controler
	 */
	public function init() {
		parent::init();

		// Initialise the logger
		$this->logger = Zend_Registry::get('logger');

		// Load the redirector helper
		$this->_redirector = $this->_helper->getHelper('Redirector');

		// Initialise the models
		$this->metadataModel = new Model_Metadata();
		$this->genericModel = new Model_Generic();
		$this->resultLocationModel = new Model_ResultLocation();
		$this->predefinedRequestModel = new Model_PredefinedRequest();

		// Reinit the activated layers
		$mappingSession = new Zend_Session_Namespace('mapping');
		$mappingSession->activatedLayers = array();

	}

	/**
	 * Return the name of the location table (the table containing the the_geom column)
	 */
	abstract protected function getLocationTable();

	/**
	 * Return the name of the plot table (the table containing the plot data)
	 */
	abstract protected function getPlotTable();

	/**
	 * The "index" action is the default action for all controllers.
	 *
	 * @return the default View
	 */
	public function indexAction() {
		$this->logger->debug('Query index');

		return $this->showQueryFormAction();
	}

	/**
	 * Show the main query page.
	 */
	public function showQueryFormAction() {
		$this->logger->debug('showQueryFormAction');

		// Clean previous results
		$sessionId = session_id();
		$this->resultLocationModel->cleanPreviousResults($sessionId);

		$this->render('show-query-form');
	}

	/**
	 * AJAX function : Get the predefined request.
	 *
	 * @param String $requestName The request name
	 * @return Forms
	 */
	private function _ajaxgetpredefinedrequest($requestName) {
		$this->logger->debug('_ajaxgetpredefinedrequest');

		// Get the saved values for the forms
		$savedRequest = $this->predefinedRequestModel->getPredefinedRequest($requestName);

		// Get the default values for the forms
		$forms = $this->metadataModel->getForms($savedRequest->datasetID, $savedRequest->schemaCode);
		foreach ($forms as $form) {
			// Fill each form with the list of criterias and results
			$form->criteriaList = $this->metadataModel->getFormFields($savedRequest->datasetID, $form->format, $this->schema, 'criteria');
			$form->resultsList = $this->metadataModel->getFormFields($savedRequest->datasetID, $form->format, $this->schema, 'result');
		}

		// Update the default values with the saved values.
		foreach ($forms as $form) {
			foreach ($form->criteriaList as $criteria) {
				$criteria->isDefaultCriteria = '0';
				$criteria->defaultValue = '';

				if (array_key_exists($criteria->format.'__'.$criteria->data, $savedRequest->criteriaList)) {
					$criteria->isDefaultCriteria = '1';
					$criteria->defaultValue = $savedRequest->criteriaList[$criteria->format.'__'.$criteria->data]->value;
				}
			}

			foreach ($form->resultsList as $result) {
				$result->isDefaultResult = '0';

				if (array_key_exists($result->format.'__'.$result->data, $savedRequest->resultsList)) {
					$result->isDefaultResult = '1';
				}
			}
		}

		// return the forms
		return $forms;

	}

	/**
	 * AJAX function : Get the list of available predefined requests.
	 */
	public function ajaxgetpredefinedrequestlistAction() {
		$this->logger->debug('ajaxgetpredefinedrequestlist');

		$dir = $this->_getParam('dir');
		$sort = $this->_getParam('sort');

		// Get the predefined values for the forms
		$predefinedRequestList = $this->predefinedRequestModel->getPredefinedRequestList($dir, $sort);

		// Generate the JSON string
		$total = count($predefinedRequestList);
		echo '{success:true, total:'.$total.',rows:[';

		foreach ($predefinedRequestList as $predefinedRequest) {
			$json = $predefinedRequest->toJSON().",";
		}
		if (strlen($json) > 1) {
			$json = substr($json, 0, -1); // remove the last colon
		}
		echo $json;

		echo ']}';

		// No View, we send directly the JSON
		$this->_helper->layout()->disableLayout();
		$this->_helper->viewRenderer->setNoRender();
	}

	/**
	 * AJAX function : Get the criteria of a predefined requests.
	 */
	public function ajaxgetpredefinedrequestcriteriaAction() {
		$this->logger->debug('ajaxgetpredefinedrequestcriteria');

		$requestName = $this->_getParam('request_name');

		// Get the predefined values for the forms
		$predefinedRequestCriterias = $this->predefinedRequestModel->getPredefinedRequestCriteria($requestName);

		// Generate the JSON string
		$total = count($predefinedRequestCriterias);
		$json = '{success:true, criteria:[';

		foreach ($predefinedRequestCriterias as $criteria) {

			$json .= '[';
			$json .= $criteria->toJSON();

			// add some specific options
			if ($criteria->type == "CODE") {
				$options = $this->metadataModel->getOptions($criteria->data);
				$json .= ',{options:[';
				foreach ($options as $option) {
					$json .= '["'.$option->code.'","'.$option->label.'"],';
				}
				$json = substr($json, 0, -1);
				$json .= ']}';
			} else if ($criteria->type == "RANGE") {
				// For the RANGE field, get the min and max values
				$range = $this->metadataModel->getRange($criteria->data);
				$json .= ',{min:'.$range->min.',max:'.$range->max.'}';
			} else {
				$json .= ',{}'; // no options
			}

			$json .= '],';
		}

		if ($total != 0) {
			$json = substr($json, 0, -1);
		}

		$json .= ']}';

		echo $json;

		// No View, we send directly the JSON
		$this->_helper->layout()->disableLayout();
		$this->_helper->viewRenderer->setNoRender();
	}
	
	/**
	 * AJAX function : Save the parameters of the current query as a new predefined request.
	 *
	 * @return JSON
	 */
	public function ajaxsavepredefinedrequestAction() {

		$this->logger->debug('ajaxsavepredefinedrequest');
		$json = "";

		// Check the validity of the POST
		if (!$this->getRequest()->isPost()) {
			$this->logger->debug('form is not a POST');
			return $this->_forward('index');
		}

		$datasetId = $this->getRequest()->getPost('datasetId');

		try {

			// Create the predefined request object
			$predefinedRequest = new PredefinedRequest();
			$predefinedRequest->datasetID = $datasetId;
			$predefinedRequest->schemaCode = $this->schema;
			$predefinedRequest->requestName = 'TEST REQUEST'; // TODO : get from FORM
			$predefinedRequest->description = 'TEST REQUEST'; // TODO : get from FORM

			// Parse the input parameters
			foreach ($_POST as $inputName => $inputValues) {
				if (strpos($inputName, "criteria__") === 0) {

					foreach ($inputValues as $inputValue) {

						// This is a criteria
						$criteriaName = substr($inputName, strlen("criteria__"));

						$pos = strpos($criteriaName, "__");
						$criteriaFormat = substr($criteriaName, 0, $pos);
						$criteriaData = substr($criteriaName, $pos + 2);

						$field = new PredefinedField();
						$field->format = $criteriaFormat;
						$field->data = $criteriaData;
						$field->value = $inputValue;

						if (isset($predefinedRequest->criteriaList[$criteriaFormat.'__'.$criteriaData])) {
							$predefinedRequest->criteriaList[$criteriaFormat.'__'.$criteriaData]->value .= ";".$field->value;
						} else {
							$predefinedRequest->criteriaList[$criteriaFormat.'__'.$criteriaData] = $field;
						}
					}
				}
				if (strpos($inputName, "column__") === 0) {

					// This is a result column
					$columnName = substr($inputName, strlen("column__"));

					$pos = strpos($columnName, "__");
					$columnFormat = substr($columnName, 0, $pos);
					$columnData = substr($columnName, $pos + 2);

					$field = new PredefinedField();
					$field->format = $columnFormat;
					$field->data = $columnData;

					$predefinedRequest->resultsList[$columnFormat.'__'.$columnData] = $field;
				}
			}

			// Save the request
			$this->predefinedRequestModel->savePredefinedRequest($predefinedRequest);

		} catch (Exception $e) {
			$this->logger->err('Error while getting result : '.$e);
			$json = "{success:false,errorMessage:'".json_encode($e->getMessage())."'}";
		}

		echo $json;

		// No View, we send directly the JSON
		$this->_helper->layout()->disableLayout();
		$this->_helper->viewRenderer->setNoRender();

	}

	/**
	 * Generate the JSON structure corresponding to a list of result and criteria columns.
	 *
	 * @param Array[FormFormat] $forms the list of FormFormat elements
	 */
	private function _generateFormsJSON($forms) {

		$json = '{success:true,data:[';

		foreach ($forms as $form) {
			// Add the criteria
			$json .= "{".$form->toJSON().',criteria:[';
			foreach ($form->criteriaList as $field) {
				$json .= '{'.$field->toCriteriaJSON();
				// For the SELECT field, get the list of options
				if ($field->type == "CODE") {
					$options = $this->metadataModel->getOptions($field->data);
					$json .= ',p:{options:[';
					foreach ($options as $option) {
						$json .= '['.json_encode($option->code).','.json_encode($option->label).'],';
					}
					$json = substr($json, 0, -1);
					$json .= ']}';
				}
				// For the RANGE field, get the min and max values
				if ($field->type == "RANGE") {
					$range = $this->metadataModel->getRange($field->data);
					$json .= ',p:{min:'.$range->min.',max:'.$range->max.'}';
				}
				$json .= '},';
			}
			if (count($form->criteriaList) > 0) {
				$json = substr($json, 0, -1);
			}
			// Add the columns
			$json .= '],columns:[';
			foreach ($form->resultsList as $field) {
				$json .= '{'.$field->toResultJSON().'},';
			}
			if (count($form->resultsList) > 0) {
				$json = substr($json, 0, -1);
			}
			$json .= ']},';
		}
		if (count($forms) > 0) {
			$json = substr($json, 0, -1);
		}
		$json = $json.']}';

		return $json;
	}

	/**
	 * AJAX function : Get the list of available forms and criterias for the dataset
	 */
	public function ajaxgetformsAction() {
		$this->logger->debug('ajaxgetformsAction');

		$datasetId = $this->getRequest()->getPost('datasetId');
		$requestName = $this->getRequest()->getPost('requestName');
		$this->logger->debug('datasetId : '.$datasetId, $this->schema);
		$this->logger->debug('requestName : '.$requestName, $this->schema);

		if (!empty($requestName)) {
			$forms = $this->_ajaxgetpredefinedrequest($requestName);
		} else {
			$forms = $this->metadataModel->getForms($datasetId, $this->schema);
			foreach ($forms as $form) {
				// Fill each form with the list of criterias and results
				$form->criteriaList = $this->metadataModel->getFormFields($datasetId, $form->format, $this->schema, 'criteria');
				$form->resultsList = $this->metadataModel->getFormFields($datasetId, $form->format, $this->schema, 'result');
			}
		}
		
		echo $this->_generateFormsJSON($forms);
		

		// No View, we send directly the JSON
		$this->_helper->layout()->disableLayout();
		$this->_helper->viewRenderer->setNoRender();
	}

	/**
	 * AJAX function : Get the list of available datasets
	 *
	 * @return JSON The list of forms
	 */
	public function ajaxgetdatasetsAction() {
		$datasetIds = $this->metadataModel->getDatasets();

		echo "{";
		echo "metaData:{";
		echo "root:'rows',";
		echo "fields:[";
		echo "'id',";
		echo "'label',";
		echo "'is_default'";
		echo "]";
		echo "},";
		echo "rows:".json_encode($datasetIds).'}';

		// No View, we send directly the JSON
		$this->_helper->layout()->disableLayout();
		$this->_helper->viewRenderer->setNoRender();
	}

	/**
	 * AJAX function : Get the description of the columns of the result of the query.
	 *
	 * @return JSON
	 */
	public function ajaxgetgridcolumnsAction() {
		$configuration = Zend_Registry::get("configuration");
		ini_set("max_execution_time", $configuration->max_execution_time);

		$this->logger->debug('ajaxgetgridcolumns');
		$json = "";

		// Check the validity of the POST
		if (!$this->getRequest()->isPost()) {
			$this->logger->debug('form is not a POST');
			return $this->_forward('index');
		}

		$datasetId = $this->getRequest()->getPost('datasetId');

		try {

			// Parse the input parameters
			$criterias = array();
			$columns = array();
			foreach ($_POST as $inputName => $inputValue) {
				if (strpos($inputName, "criteria__") === 0) {
					$criteriaName = substr($inputName, strlen("criteria__"));
					$criterias[$criteriaName] = $inputValue;
				}
				if (strpos($inputName, "column__") === 0) {
					$columnName = substr($inputName, strlen("column__"));
					$columns[$columnName] = $columnName;
				}
			}

			if (sizeof($columns) == 0) {
				$json = "{ success: false, errorMessage: 'At least one result column should be selected'}";
			} else {

				// Generate the SQL Request
				$sql = $this->_generateSQLRequest($datasetId, $criterias, $columns);

				// Get the website session
				$websiteSession = new Zend_Session_Namespace('website');
				$where = $websiteSession->SQLWhere;

				// Clean previously stored results
				$sessionId = session_id();
				$this->logger->debug('SessionId : '.$sessionId);
				$this->resultLocationModel->cleanPreviousResults($sessionId);

				// Run the request to store a temporary result table (for the web mapping)
				$this->resultLocationModel->fillLocationResult($where, $sessionId, $this->getLocationTable(), $this->visualisationSRS);

				// Calculate the number of lines of result
				$countResult = $this->genericModel->executeRequest("SELECT COUNT(*) as count ".$where);
				$websiteSession->count = $countResult[0]['count'];

				// Prepare the metadata information
				$metadata = array();
				$traductions = array();
				$i = 0;
				foreach ($columns as $column) {
					$split = explode("__", $column);
					$format = $split[0];
					$field = $split[1];
					$formField = $this->metadataModel->getFormField($format, $field);
					$metadata[$i] = $formField;

					// Prepare the traduction of the code lists
					if ($formField->type == "CODE") {
						$traductions[$i] = $this->metadataModel->getModeFromUnit($formField->unit);
					}
					$i++;
				}

				// Store the metadata in session
				$websiteSession->metadata = $metadata;
				$websiteSession->traductions = $traductions;
				$websiteSession->datasetId = $datasetId;

				// Send the result as a JSON String
				$json = '{success:true,';

				// Metadata
				$json .= '"columns":[';
				// Get the titles of the columns
				foreach ($metadata as $formField) {
					$json .= '{'.$formField->toJSON().', hidden:false},';
				}
				// Add the plot location in WKT
				$json .= '{name:"id",label:"Identifier of the line",inputType:"TEXT",definition:"The plot identifier", hidden:true},';
				$json .= '{name:"location_centroid",label:"Location centroid",inputType:"TEXT",definition:"The plot location", hidden:true}';
				$json .= ']}';
			}

		} catch (Exception $e) {
			$this->logger->err('Error while getting result : '.$e);
			$json = "{success:false,errorMessage:'".json_encode($e->getMessage())."'}";
		}

		echo $json;

		// Activate the result layer
		$mappingSession->activatedLayers[] = 'result_locations';

		// No View, we send directly the JSON
		$this->_helper->layout()->disableLayout();
		$this->_helper->viewRenderer->setNoRender();

	}

	/**
	 * AJAX function : Get a page of query result data.
	 *
	 * @return JSON
	 */
	public function ajaxgetgridrowsAction() {
		$this->logger->debug('ajaxgetgridrows');
		$json = "";

		try {

			// Retrieve the SQL request from the session
			$websiteSession = new Zend_Session_Namespace('website');
			$sql = $websiteSession->SQLQuery;
			$where = $websiteSession->SQLWhere;
			$countResult = $websiteSession->count;

			// Retrive the metadata
			$metadata = $websiteSession->metadata;
			$traductions = $websiteSession->traductions;

			// Get the datatable parameters
			$start = $this->getRequest()->getPost('start');
			$length = $this->getRequest()->getPost('limit');
			$sort = $this->getRequest()->getPost('sort');
			$sortDir = $this->getRequest()->getPost('dir');

			$filter = "";
			if ($sort != "") {
				$filter .= " ORDER BY ".$sort." ".$sortDir;
			}
			if (!empty($length)) {
				$filter .= " LIMIT ".$length;
			}
			if (!empty($start)) {
				$filter .= " OFFSET ".$start;
			}

			// Execute the request
			$result = $this->genericModel->executeRequest($sql.$filter);

			// Send the result as a JSON String
			$json = '{success:true,';
			$json .= 'total:'.$countResult.',';
			$json .= 'rows:[';
			foreach ($result as $line) {
				$json .= '[';
				$nbcol = sizeof($line);
				$keys = array_keys($line);
				for ($i = 0; $i < $nbcol - 2; $i++) { // the last 5 result columns are reserved
					$colName = $keys[$i]; // get the name of the column
					$value = $line[$colName];
					$formField = $metadata[$i];

					if ($formField->type == "CODE" && $value != "") {
						// Manage code traduction
						$label = isset($traductions[$i][$value]) ? $traductions[$i][$value] : '';
						$json .= json_encode($label == null ? '' : $label).',';
					} else {
						$json .= json_encode($value).',';
					}
				}

				// Add the line id
				$json .= json_encode($line['id']).',';

				// Add the plot location in WKT
				$json .= json_encode($line['location_center']); // The last column is the location center

				$json .= '],';
			}
			if (sizeof($result) != 0) {
				$json = substr($json, 0, -1);
			}
			$json .= ']}';
		} catch (Exception $e) {
			$this->logger->err('Error while getting result : '.$e);
			$json = "{success:false,errorMessage:'".json_encode($e->getMessage())."'}";
		}

		echo $json;

		// No View, we send directly the JSON
		$this->_helper->layout()->disableLayout();
		$this->_helper->viewRenderer->setNoRender();
	}

	/**
	 * Generate the SQL request to get the detailed information about a plot or a line of result.
	 *
	 * @param String $id The unique identifier of the plot or line (a concatenation of the primary keys of all involved tables)
	 * @param String $leafTable The leaf table
	 * @param String $mode if 'LINE', will generate a request corresponding to a single line of result
	 *         else it will generate a SQL query with no where clause.
	 */
	private function _generateSQLDetailRequest($id, $leafTable, $mode = 'LINE') {

		$this->logger->debug('__generateSQLDetailRequest leafTable : '.$leafTable);

		$select = "SELECT ";
		$from = " FROM ";
		$where = " WHERE (1 = 1) ";

		$uniqueId = ""; // The concatenation of columns used as an unique ID for the line
		$detailFields = array(); // the list of fields in the detail request

		$userSession = new Zend_Session_Namespace('user');
		$role = $userSession->role;
		$countryCode = $userSession->user->countryCode;

		//
		// Get the Tree associed with the leaf table
		//
		$tables = array();

		// Get the ancestors of the table and the foreign keys
		$ancestors = $this->metadataModel->getTablesTree($leafTable, null, $this->schema);

		// Reverse the order of the list and store by indexing with the table name
		// If the table is already used it will be overriden
		// The root table (Location) should appear first
		$ancestors = array_reverse($ancestors);
		foreach ($ancestors as $ancestor) {
			$tables[$ancestor->getLogicalName()] = $ancestor;
		}

		//
		// Prepare the SELECT clause
		//
		foreach ($tables as $table) {

			// Get the list of fields of the table
			$tableFields = $this->metadataModel->getTableColumnsForDisplay($table->tableFormat, $this->schema);

			foreach ($tableFields as $tableField) {

				// Get the form field corresponding to the data field.
				$formfield = $this->metadataModel->getFormField($tableField->sourceFormName, $tableField->sourceFieldName);

				$columnName = $tableField->columnName;

				if ($formfield->inputType == "DATE") {
					$select .= "to_char(".$table->getLogicalName().".".$columnName.", 'YYYY/MM/DD')";
				} else if ($formfield->inputType == "GEOM") {
					$select .= "asText(".$table->getLogicalName().".".$columnName.")";
				} else {
					$select .= $table->getLogicalName().".".$columnName;
				}

				// Build the SELECT
				$select .= " AS ".$tableField->sourceFormName."__".$tableField->sourceFieldName.", ";

				// Store the field
				$detailFields[] = $formfield;

			}
		}
		$select = substr($select, 0, -2);

		$websiteSession = new Zend_Session_Namespace('website');
		$websiteSession->detailFields = $detailFields;

		//
		// Prepare the FROM clause
		//
		// Get the root table;
		$rootTable = array_shift($tables);
		$from .= $rootTable->tableName." ".$rootTable->getLogicalName();
		if ($role->isEuropeLevel != '1') {
			// Check the user country code
			$where .= " AND ".$rootTable->tableFormat.".COUNTRY_CODE = '".trim($countryCode)."'";
		}

		// Add the joined tables
		foreach ($tables as $tableFormat => $tableTreeData) {

			// Join the table
			if ($tableTreeData->isColumnOriented == '1') {
				$from .= " LEFT JOIN ";
			} else {
				$from .= " JOIN ";
			}
			$from .= $tableTreeData->tableName." ".$tableTreeData->getLogicalName()." on (";

			// Add the foreign key
			$keys = explode(',', $tableTreeData->keys);
			foreach ($keys as $key) {
				$from .= $tableTreeData->getLogicalName().".".trim($key)." = ".$tableTreeData->parentTable.".".trim($key)." AND ";
			}
			$from = substr($from, 0, -5);

			// Create an unique Id.
			$identifiers = explode(',', $tableTreeData->identifiers);
			foreach ($identifiers as $identifier) {
				if ($uniqueId != "") {
					$uniqueId .= " || '_' || ";
				}
				$uniqueId .= $tableTreeData->getLogicalName().".".trim($identifier);
			}

			// Check the user country code
			if ($role->isEuropeLevel != '1') {
				$countryCode = $userSession->user->countryCode;
				$from .= " AND ".$tableTreeData->getLogicalName().".country_code = '".trim($countryCode)."'";
			}

			// Check is the table is column-oriented
			if ($tableTreeData->isColumnOriented == '1') {
				$from .= " AND ".$tableTreeData->getLogicalName().".variable_name = '".$tableTreeData->fieldName."'";
			}

			$from .= ") ";

		}

		// Add some hard-coded, needed fields
		$select .= ", ".$this->getLocationTable().".country_code as loc_country_code, "; // The country code (used for the mapping view)
		$select .= $this->getLocationTable().".plot_code as loc_plot_code, "; // The plot code  (used for the mapping view)
		$select .= $this->getLocationTable().".the_geom as the_geom, "; // The geom (used for the mapping view)
		$select .= 'ymin(box2d(transform('.$this->getLocationTable().'.the_geom,'.$this->visualisationSRS.'))) as location_y_min, '; // The location boundingbox (for zooming in javascript)
		$select .= 'ymax(box2d(transform('.$this->getLocationTable().'.the_geom,'.$this->visualisationSRS.'))) as location_y_max, ';
		$select .= 'xmin(box2d(transform('.$this->getLocationTable().'.the_geom,'.$this->visualisationSRS.'))) as location_x_min, ';
		$select .= 'xmax(box2d(transform('.$this->getLocationTable().'.the_geom,'.$this->visualisationSRS.'))) as location_x_max';

		// Add the identifier of the line or plot
		if ($mode == 'LINE') {
			$where .= " AND ".$uniqueId." = '".$id."'";
		}

		$sql = $select.$from.$where;

		$this->logger->debug('SQL DETAIL '.$sql);

		// Return the completed SQL request
		return $sql;
	}

	/**
	 * Generate the SQL request corresponding to a list of parameters
	 *
	 * @param String $datasetId The selected dataset
	 * @param Array[String => String] $criterias The list of criterias with their value
	 * @param Array[String => String] $columns The result columns to display
	 */
	private function _generateSQLRequest($datasetId, $criterias, $columns) {

		$this->logger->debug('_generateSQLRequest');

		// Get an access to the session
		$userSession = new Zend_Session_Namespace('user');
		$websiteSession = new Zend_Session_Namespace('website');

		// Store the criterias in session for a future use
		$websiteSession->criterias = $criterias;

		$select = "SELECT ";
		$from = " FROM ";
		$where = "WHERE (1 = 1) ";

		$firstJoinedTable = ""; // The logical name of the first table in the join
		$uniqueId = ""; // The concatenation of columns used as an unique ID for the line, for use in the detail view
		$leafTable = ""; // The logical name of the last table (leaf), for use in the detail view
		$sort = ""; // The concatenation of columns used as an unique sort order

		$role = $userSession->role;
		$countryCode = $userSession->user->countryCode;

		//
		// Get the mapping for each field
		//
		$dataCols = array();
		$dataCrits = array();
		foreach ($columns as $column) {
			$split = explode("__", $column);
			$format = $split[0];
			$field = $split[1];
			$tableField = $this->metadataModel->getFieldMapping($format, $field, $this->schema);
			$dataCols[] = $tableField;
		}
		foreach ($criterias as $criteriaName => $value) {
			$split = explode("__", $criteriaName);
			$format = $split[0];
			$field = $split[1];
			$tableField = $this->metadataModel->getFieldMapping($format, $field, $this->schema);
			$tableField->value = $value;
			$dataCrits[] = $tableField;
		}

		//
		// Build the list of needed tables and associate each field with its source table
		//
		$tables = array();
		foreach ($dataCols as $field) {
			// Get the ancestors of the table and the foreign keys
			$this->logger->debug('table : '.$field->format);
			$ancestors = $this->metadataModel->getTablesTree($field->format, $field->sourceFieldName, $this->schema);

			// Associate the field with its source table
			$field->sourceTable = $ancestors[0];

			// Reverse the order of the list and store by indexing with the table name
			// If the table is already used it will be overriden
			// The root table (Location should appear first)
			$ancestors = array_reverse($ancestors);
			foreach ($ancestors as $ancestor) {
				$tables[$ancestor->getLogicalName()] = $ancestor;
			}
		}
		foreach ($dataCrits as $field) {
			// Get the ancestors of the table and the foreign keys
			$ancestors = $this->metadataModel->getTablesTree($field->format, $field->sourceFieldName, $this->schema);

			// Associate the field with its source table
			$field->sourceTable = $ancestors[0];

			// Reverse the order of the list and store by indexing with the table name
			// If the table is already used it will be overriden
			// The root table (Location should appear first)
			$ancestors = array_reverse($ancestors);
			foreach ($ancestors as $ancestor) {
				$tables[$ancestor->getLogicalName()] = $ancestor;
			}
		}

		//
		// Prepare the SELECT clause
		//
		foreach ($dataCols as $tableField) {

			$formfield = $this->metadataModel->getFormField($tableField->sourceFormName, $tableField->sourceFieldName);

			if ($tableField->sourceTable->isColumnOriented == '1') {
				// For complementary values, stored in column_oriented tables
				if ($formfield->type == "NUMERIC") {
					$columnName = "float_value";
				} else if ($formfield->type == "INTEGER") {
					$columnName = "int_value";
				} else {
					$columnName = "text_value";
				}
			} else {
				$columnName = $tableField->columnName;
			}

			if ($formfield->inputType == "DATE") {
				$select .= "to_char(".$tableField->sourceTable->getLogicalName().".".$columnName.", 'YYYY/MM/DD')";
			} else if ($formfield->inputType == "GEOM") {
				$select .= "asText(st_transform(".$tableField->sourceTable->getLogicalName().".".$columnName.",".$this->visualisationSRS."))";
			} else {
				$select .= $tableField->sourceTable->getLogicalName().".".$columnName;
			}
			$select .= " AS ".$tableField->sourceFormName."__".$tableField->sourceFieldName.", ";
		}
		$select = substr($select, 0, -2);

		//
		// Prepare the FROM clause
		//
		// Get the root table;
		$rootTable = array_shift($tables);
		$from .= $rootTable->tableName." ".$rootTable->getLogicalName();
		if ($role->isEuropeLevel != '1') {
			// Check the user country code
			$where .= " AND ".$rootTable->tableFormat.".COUNTRY_CODE = '".trim($countryCode)."'";
		}

		// Add the joined tables
		foreach ($tables as $tableFormat => $tableTreeData) {

			// We store the table name of the firstly joined table for a later use
			if ($firstJoinedTable == "") {
				$firstJoinedTable = $tableTreeData->getLogicalName();
			}
			// We store the name of the last joined table
			$leafTable = $tableTreeData->getLogicalName();

			// Join the table
			if ($tableTreeData->isColumnOriented == '1') {
				$from .= " LEFT JOIN ";
			} else {
				$from .= " JOIN ";
			}
			$from .= $tableTreeData->tableName." ".$tableTreeData->getLogicalName()." on (";

			// Add the foreign keys
			$keys = explode(',', $tableTreeData->keys);
			foreach ($keys as $key) {
				$from .= $tableTreeData->getLogicalName().".".trim($key)." = ".$tableTreeData->parentTable.".".trim($key)." AND ";
			}
			$from = substr($from, 0, -5);

			// Create an unique Id.
			$identifiers = explode(',', $tableTreeData->identifiers);
			foreach ($identifiers as $identifier) {

				// Concatenate the column to create a unique Id
				if ($uniqueId != "") {
					$uniqueId .= " || '_' || ";
				}
				$uniqueId .= $tableTreeData->getLogicalName().".".trim($identifier);

				// Create a unique sort order
				if ($sort != "") {
					$sort .= ", ";
				}
				$sort .= $tableTreeData->getLogicalName().".".trim($identifier);
			}

			// Check the user country code
			if ($role->isEuropeLevel != '1') {
				$countryCode = $userSession->user->countryCode;
				$from .= " AND ".$tableTreeData->getLogicalName().".country_code = '".trim($countryCode)."'";
			}

			// Check is the table is column-oriented
			if ($tableTreeData->isColumnOriented == '1') {
				$from .= " AND ".$tableTreeData->getLogicalName().".variable_name = '".$tableTreeData->fieldName."'";
			}

			$from .= ") ";
		}

		//
		// Prepare the WHERE clause
		//
		foreach ($dataCrits as $tableField) {

			$formfield = $this->metadataModel->getFormField($tableField->sourceFormName, $tableField->sourceFieldName);

			if ($tableField->sourceTable->isColumnOriented == '1') {
				// For complementary values, stored in column_oriented tables
				if ($formfield->type == "NUMERIC") {
					$columnName = "float_value";
				} else if ($formfield->type == "INTEGER") {
					$columnName = "int_value";
				} else {
					$columnName = "text_value";
				}
			} else {
				$columnName = $tableField->columnName;
			}

			if ($formfield->inputType == "SELECT") {
				$optionsList = "";
				// We go thru the list of selected values (a criteria can be added more than once)
				foreach ($tableField->value as $option) {
					if ($option != "") {
						$optionsList .= "'".$option."', ";
					}
				}
				if ($optionsList != "") {
					$optionsList = substr($optionsList, 0, -2);
					$where .= " AND ".$tableField->sourceTable->getLogicalName().".".$columnName." IN (".$optionsList.")";
				}

			} else if ($formfield->inputType == "NUMERIC") {
				$numericcrit = "";
				// We go thru the list of selected values (a criteria can be added more than once)
				foreach ($tableField->value as $crit) {

					if ($crit != "") {

						// Two values separated by a dash, we make a min / max comparison
						$pos = strpos($crit, " - ");
						if ($pos != false) {

							$minValue = substr($crit, 0, $pos);
							$maxValue = substr($crit, $pos + 3);

							$numericcrit .= '(';
							$isBegin = 0;
							if (!empty($minValue)) {
								$isBegin = 1;
								$numericcrit .= $tableField->sourceTable->getLogicalName().".".$columnName." >= ".$minValue." ";
							}
							if (!empty($maxValue)) {
								if ($isBegin) {
									$numericcrit .= ' AND ';
								}
								$numericcrit .= $tableField->sourceTable->getLogicalName().".".$columnName." <= ".$maxValue." ";
							}
							$numericcrit .= ') OR ';
						} else {
							// One value, we make an equel comparison
							$numericcrit .= "(".$tableField->sourceTable->getLogicalName().".".$columnName." = ".$crit.") OR ";

						}

					}
				}
				if ($numericcrit != "") {
					$numericcrit = substr($numericcrit, 0, -4);
					$where .= " AND( ".$numericcrit.")";
				}

			} else if ($formfield->inputType == "DATE") {
				// Four formats are possible:
				// "YYYY/MM/DD" : for equal value
				// ">= YYYY/MM/DD" : for the superior value
				// "<= YYYY/MM/DD" : for the inferior value
				// "YYYY/MM/DD - YYYY/MM/DD" : for the interval
				$optionsList = "";
				// We go thru the list of selected values (a criteria can be added more than once)
				foreach ($tableField->value as $option) {
					if (!empty($option)) {
						if (strlen($option) == 10) {
							// Case "YYYY/MM/DD"
							if (Zend_Date::isDate($option, 'YYYY/MM/DD')) {
								// One value, we make an equel comparison
								$optionsList .= '(';
								$optionsList .= $tableField->sourceTable->getLogicalName().".".$columnName." = to_date('".$option."', 'YYYY/MM/DD') ";
								$optionsList .= ') OR ';
							}
						} else if (strlen($option) == 13 && substr($option, 0, 2) == '>=') {
							// Case ">= YYYY/MM/DD"
							$beginDate = substr($option, 3, 10);
							if (Zend_Date::isDate($beginDate, 'YYYY/MM/DD')) {
								$optionsList .= '(';
								$optionsList .= $tableField->sourceTable->getLogicalName().".".$columnName." >= to_date('".$beginDate."', 'YYYY/MM/DD') ";
								$optionsList .= ') OR ';
							}
						} else if (strlen($option) == 13 && substr($option, 0, 2) == '<=') {
							// Case "<= YYYY/MM/DD"
							$endDate = substr($option, 3, 10);
							if (Zend_Date::isDate($endDate, 'YYYY/MM/DD')) {
								$optionsList .= '(';
								$optionsList .= $tableField->sourceTable->getLogicalName().".".$columnName." <= to_date('".$endDate."', 'YYYY/MM/DD') ";
								$optionsList .= ') OR ';
							}
						} else if (strlen($option) == 23) {
							// Case "YYYY/MM/DD - YYYY/MM/DD"
							$beginDate = substr($option, 0, 10);
							$endDate = substr($option, 13, 10);
							if (Zend_Date::isDate($beginDate, 'YYYY/MM/DD') && Zend_Date::isDate($endDate, 'YYYY/MM/DD')) {
								$optionsList .= '(';
								$optionsList .= $tableField->sourceTable->getLogicalName().".".$columnName." >= to_date('".$beginDate."', 'YYYY/MM/DD') ";
								$optionsList .= ' AND ';
								$optionsList .= $tableField->sourceTable->getLogicalName().".".$columnName." <= to_date('".$endDate."', 'YYYY/MM/DD') ";
								$optionsList .= ') OR ';
							}
						}
					}
				}
				if (!empty($optionsList)) {
					$optionsList = substr($optionsList, 0, -4);
					$where .= " AND (".$optionsList.")";
				}

			} else if ($formfield->inputType == "CHECKBOX") {

				$optionsList = "";
				// We go thru the list of selected values (a criteria can be added more than once)
				foreach ($tableField->value as $option) {

					$optionsList .= $tableField->sourceTable->getLogicalName().".".$columnName;
					if ($option == "1") {
						$optionsList .= " = '1'";
					} else {
						$optionsList .= " = '0'";
					}
					$optionsList .= ' OR ';

				}

				$optionsList = substr($optionsList, 0, -3);
				$where .= " AND (".$optionsList.")";

			} else if ($formfield->inputType == "GEOM") {
				$optionsList = "";
				// We go thru the list of selected values (a criteria can be added more than once)
				foreach ($tableField->value as $option) {

					if ($option != "") {
						$optionsList .= "(ST_intersects(".$tableField->sourceTable->getLogicalName().".".$columnName.", transform(ST_GeomFromText('".$option."', ".$this->visualisationSRS."), ".$this->databaseSRS.")))";
						$optionsList .= ' OR ';
					}

				}
				if ($optionsList != "") {
					$optionsList = substr($optionsList, 0, -3);
					$where .= " AND (".$optionsList.")";
				}

			} else { // Default case is a STRING, we search with a ilike %%

				$optionsList = "";
				foreach ($tableField->value as $option) {
					$optionsList .= $tableField->sourceTable->getLogicalName().".".$columnName." ILIKE '%".trim($option)."%' OR ";
				}
				$optionsList = substr($optionsList, 0, -4);

				$where .= " AND (".$optionsList.")";
			}
		}

		// If needed we check on the data submission type
		if (!empty($datasetId) && $firstJoinedTable != "") {
			if ($this->schema == 'RAW_DATA') {
				$from .= " JOIN data_submission ON (data_submission.submission_id = ".$firstJoinedTable.".submission_id) ";
				$where .= " AND data_submission.request_id = '".$datasetId."' ";
			} else {
				$where .= " AND ".$firstJoinedTable.".request_id = '".$datasetId."' ";
			}
		}

		// Add some hard-coded, needed fields
		$select .= ", ".$uniqueId." as id, "; // The identifier of the line (for the details view in javascript)
		$select .= "astext(centroid(st_transform(".$this->getLocationTable().".the_geom,".$this->visualisationSRS."))) as location_center "; // The location center (for zooming in javascript)

		$sql = $select.$from.$where;

		// Store the SQL Request in session
		$websiteSession->SQLQuery = $sql;
		$websiteSession->SQLWhere = $from.$where;
		$websiteSession->leafTable = $leafTable;
		$websiteSession->sort = $sort;

		// Return the completed SQL request
		return $sql;
	}

	/**
	 * Get the parameters used to initialise the result grid.
	 */
	public function getgridparametersAction() {
		$this->logger->debug('getgridparametersAction');

		// Get the parameters from configuration file
		$configuration = Zend_Registry::get("configuration");

		$this->view->pagesize = $configuration->pagesize; // Number of lines on a page

		$userSession = new Zend_Session_Namespace('user');
		$permissions = $userSession->permissions;
		$this->view->hideExportCSV = 'true'; // By defaut the export is hidden
		$this->view->hideInterpolationMenuItem = 'true';
		$this->view->hideAggregationCsvExportMenuItem = 'true';
		$this->view->hideAggregationButton = 'true';
		if (!empty($permissions)) {
			if ($this->schema == 'RAW_DATA' && array_key_exists('EXPORT_RAW_DATA', $permissions)) {
				$this->view->hideExportCSV = 'false';
			}
			if ($this->schema == 'HARMONIZED_DATA' && array_key_exists('EXPORT_HARMONIZED_DATA', $permissions)) {
				$this->view->hideExportCSV = 'false';
			}
			if ($this->schema == 'HARMONIZED_DATA' && array_key_exists('DATA_QUERY_AGGREGATED', $permissions)) {
				$this->view->hideAggregationButton = 'false';
				$this->view->hideAggregationCsvExportMenuItem = 'false';
			}
			if ($this->schema == 'HARMONIZED_DATA' && array_key_exists('DATA_INTERPOLATION', $permissions)) {
				$this->view->hideInterpolationMenuItem = 'false';
			}

		}
		$this->_helper->layout()->disableLayout();
		$this->render('grid-parameters');
	}

	/**
	 * Get the details associed with a result location (clic on the map).
	 * @return JSON representing the detail of the result line.
	 */
	public function getmapdetailsAction() {

		$this->logger->debug('getMapDetailsAction');

		// The request is a click coming from the map
		// We get back the identifier of the location
		// id = country_code + '_' + plot_code;
		$id = $this->getRequest()->getPost('id');

		// Parse the elements of the identifier
		$split = explode("__", $id);
		$countryCode = $split[0];
		$plotCode = $split[1];

		// We get the current dataset from the session
		$websiteSession = new Zend_Session_Namespace('website');
		$datasetId = $websiteSession->datasetId;

		// Get the leaf table for the current dataset
		$leafTable = $websiteSession->leafTable;

		// Get the detailled data
		$sql = $this->_generateSQLDetailRequest($id, $leafTable, 'ALL');
		$sql .= " AND ".$this->getPlotTable().".COUNTRY_CODE = '".$countryCode."'";
		$sql .= " AND ".$this->getPlotTable().".PLOT_CODE = '".$plotCode."'";
		$result = $this->genericModel->executeRequest($sql);

		// Get back the list of fields in the detail view
		$detailFields = $websiteSession->detailFields;

		// Prepare the metadata information
		$metadata = array();
		$traductions = array();
		$i = 0;
		foreach ($detailFields as $detailField) {
			$metadata[$i] = $detailField;

			// Prepare the traduction of the code lists
			if ($detailField->type == "CODE") {
				$traductions[$i] = $this->metadataModel->getModeFromUnit($detailField->unit);
			}
			$i++;
		}

		// Return the detailled information about the plot
		$fields = "";

		// Run thru the resultset one time to get the content of the first table values
		$line = $result[0]; // Get only the first line
		$nbcol = sizeof($line);
		$keys = array_keys($line);
		$col0 = $metadata[0]; // Get the name of the first form
		$firstFormName = $col0->format;
		$hasdetailledInfo = false; // Indicate that the resultset has more columns than those of the root table

		$fields .= "{title:'Plot data', is_array:false, fields:[";
		for ($i = 0; $i < $nbcol - 7; $i++) { // the last 7 result columns are reserved
			$colName = $keys[$i]; // get the name of the column
			$value = $line[$colName];
			$formField = $metadata[$i];

			if ($formField->format == $firstFormName) {
				if ($formField->type == "CODE" && $value != "") {
					// Manage code traduction
					$label = $traductions[$i][$value];
					$fields .= "{label:".json_encode($formField->label).", value : ".json_encode($label)."}, ";
				} else {
					$fields .= "{label:".json_encode($formField->label).", value : ".json_encode($value)."}, ";
				}
			} else {
				$hasdetailledInfo = true;
			}

		}
		$fields = substr($fields, 0, -2);
		$fields .= "]}";

		// Run thru the resultset a second time to get other values
		if ($hasdetailledInfo) {
			$isFirstTime = true;
			foreach ($result as $line) {
				$nbcol = sizeof($line);
				$keys = array_keys($line);
				$col0 = $metadata[0]; // Get the name of the first form
				$firstFormName = $col0->format;

				if ($isFirstTime) { // Add the column definition
					$fields .= ",{title:'Detailled info', is_array:true, columns:[";
					for ($i = 0; $i < $nbcol - 7; $i++) { // the last 7 result columns are reserved
						$colName = $keys[$i]; // get the name of the column
						$value = $line[$colName];
						$formField = $metadata[$i];

						if ($formField->format != $firstFormName) { // Add he column only if not from the root table
							$fields .= "{name:".json_encode($colName).", label:".json_encode($formField->label)."}, ";
						}
					}
					$fields = substr($fields, 0, -2);
					$fields .= "], rows:[";
					$isFirstTime = false;
				}
				$fields .= "[";
				for ($i = 0; $i < $nbcol - 7; $i++) { // the last 7 result columns are reserved
					$colName = $keys[$i]; // get the name of the column
					$value = $line[$colName];
					$formField = $metadata[$i];

					if ($formField->format != $firstFormName) {
						if ($formField->type == "CODE" && $value != "") {
							// Manage code traduction
							$label = $traductions[$i][$value];
							$fields .= json_encode($label).", ";
						} else {
							$fields .= json_encode($value).", ";
						}
					}
				}
				$fields = substr($fields, 0, -2); // remove the last comma
				$fields .= "],";
			}
			if ($fields != "") {
				$fields = substr($fields, 0, -1); // remove the last comma
			}
			$fields .= ']}';
		}

		$bb = $this->_setupBoundingBox($line);
		$bb2 = $this->_setupBoundingBox($line, 200000); // Prepare an overview bbox

		$locationPlotCode = $line['loc_plot_code'];

		$json = "{title:'Plot ".$locationPlotCode."', formats:[";
		$json .= $fields;
		$json .= "],";
		$json .= "map:[{title:'image',";
		$json .= "url:'".$this->baseUrl."/proxy/gettile?";
		$json .= "&LAYERS=".(empty($this->detailsLayers) ? '' : $this->detailsLayers[0]);
		$json .= "&TRANSPARENT=true";
		$json .= "&FORMAT=image%2FPNG";
		$json .= "&SERVICE=WMS";
		$json .= "&VERSION=1.1.1";
		$json .= "&REQUEST=GetMap";
		$json .= "&STYLES=";
		$json .= "&EXCEPTIONS=application%2Fvnd.ogc.se_inimage";
		$json .= "&SRS=EPSG%3A".$this->visualisationSRS;
		$json .= "&BBOX=".$bb['location_x_min'].",".$bb['location_y_min'].",".$bb['location_x_max'].",".$bb['location_y_max'];
		$json .= "&WIDTH=300";
		$json .= "&HEIGHT=300";
		$json .= "&map.scalebar=STATUS+embed";
		$json .= "&sessionid=".session_id();
		$json .= "&plot_code=".$locationPlotCode."'},";
		$json .= "{title:'image',";
		$json .= "url:'".$this->baseUrl."/proxy/gettile?";
		$json .= "&LAYERS=".(empty($this->detailsLayers) ? '' : $this->detailsLayers[1]);
		$json .= "&TRANSPARENT=true";
		$json .= "&FORMAT=image%2FPNG";
		$json .= "&SERVICE=WMS";
		$json .= "&VERSION=1.1.1";
		$json .= "&REQUEST=GetMap";
		$json .= "&STYLES=";
		$json .= "&EXCEPTIONS=application%2Fvnd.ogc.se_inimage";
		$json .= "&SRS=EPSG%3A".$this->visualisationSRS;
		$json .= "&BBOX=".$bb2['location_x_min'].",".$bb2['location_y_min'].",".$bb2['location_x_max'].",".$bb2['location_y_max'];
		$json .= "&WIDTH=300";
		$json .= "&HEIGHT=300";
		$json .= "&sessionid=".session_id();
		$json .= "&CLASS=REDSTAR";
		$json .= "&map.scalebar=STATUS+embed";
		$json .= "&plot_code=".$locationPlotCode."'}]}";
		echo $json;

		// No View, we send directly the JSON
		$this->_helper->layout()->disableLayout();
		$this->_helper->viewRenderer->setNoRender();

	}

	/**
	 * Get the details associed with a result line (clic on the "detail button").
	 *
	 * @param String $id The identifier of the line
	 * @param String $leafTable The name of the lowest table in the hierarchy
	 * @return JSON representing the detail of the result line.
	 */
	public function getdetailsAction($id = null, $leafTable = null) {

		$this->logger->debug('getDetailsAction : '.$id."_".$leafTable);

		// Get the identifier of the line from the session
		if ($id == null) {
			$id = $this->getRequest()->getPost('id');
		}

		// Get the identifier of the leaf table from the session
		$websiteSession = new Zend_Session_Namespace('website');
		if ($leafTable == null) {
			$leafTable = $websiteSession->leafTable;
		}

		$this->logger->debug('getDetailsAction : '.$id."_".$leafTable);

		// Get the detailled data
		$sql = $this->_generateSQLDetailRequest($id, $leafTable);
		$result = $this->genericModel->executeRequest($sql);

		// Get back the list of fields in the detail view
		$detailFields = $websiteSession->detailFields;

		// Prepare the metadata information
		$metadata = array();
		$traductions = array();
		$i = 0;
		foreach ($detailFields as $detailField) {
			$metadata[$i] = $detailField;

			// Prepare the traduction of the code lists
			if ($detailField->type == "CODE") {
				$traductions[$i] = $this->metadataModel->getModeFromUnit($detailField->unit);
			}
			$i++;
		}

		// Return the detailled information about the plot
		$fields = "";
		$line = $result[0];
		$nbcol = sizeof($line);
		$keys = array_keys($line);
		for ($i = 0; $i < $nbcol - 7; $i++) { // the last 4 result columns are reserved
			$colName = $keys[$i]; // get the name of the column
			$value = $line[$colName];
			$formField = $metadata[$i];

			if ($formField->type == "CODE" && $value != "") {
				// Manage code traduction
				$label = $traductions[$i][$value];
				$fields .= "{label:".json_encode($formField->label).", value : ".json_encode($label)."}, ";
			} else {
				$fields .= "{label:".json_encode($formField->label).", value : ".json_encode($value)."}, ";
			}
		}
		$fields = substr($fields, 0, -2);

		$bb = $this->_setupBoundingBox($line);
		$bb2 = $this->_setupBoundingBox($line, 200000); // Prepare an overview bbox

		$locationPlotCode = $line['loc_plot_code'];

		$json = "{title:'".$locationPlotCode."', formats:[{title:'Résultats détaillés', is_array:false, fields:[";
		$json .= $fields;
		$json .= "]}], ";
		$json .= "map:[{title:'image',";
		$json .= "url:'".$this->baseUrl."/proxy/gettile?";
		$json .= "&LAYERS=".(empty($this->detailsLayers) ? '' : $this->detailsLayers[0]);
		$json .= "&TRANSPARENT=true";
		$json .= "&FORMAT=image%2FPNG";
		$json .= "&SERVICE=WMS";
		$json .= "&VERSION=1.1.1";
		$json .= "&REQUEST=GetMap";
		$json .= "&STYLES=";
		$json .= "&EXCEPTIONS=application%2Fvnd.ogc.se_inimage";
		$json .= "&SRS=EPSG%3A".$this->visualisationSRS;
		$json .= "&BBOX=".$bb['location_x_min'].",".$bb['location_y_min'].",".$bb['location_x_max'].",".$bb['location_y_max'];
		$json .= "&WIDTH=300";
		$json .= "&HEIGHT=300";
		$json .= "&map.scalebar=STATUS+embed";
		$json .= "&sessionid=".session_id();
		$json .= "&plot_code=".$locationPlotCode."'},";
		$json .= "{title:'image',";
		$json .= "url:'".$this->baseUrl."/proxy/gettile?";
		$json .= "&LAYERS=".(empty($this->detailsLayers) ? '' : $this->detailsLayers[1]);
		$json .= "&TRANSPARENT=true";
		$json .= "&FORMAT=image%2FPNG";
		$json .= "&SERVICE=WMS";
		$json .= "&VERSION=1.1.1";
		$json .= "&REQUEST=GetMap";
		$json .= "&STYLES=";
		$json .= "&EXCEPTIONS=application%2Fvnd.ogc.se_inimage";
		$json .= "&SRS=EPSG%3A".$this->visualisationSRS;
		$json .= "&BBOX=".$bb2['location_x_min'].",".$bb2['location_y_min'].",".$bb2['location_x_max'].",".$bb2['location_y_max'];
		$json .= "&WIDTH=300";
		$json .= "&HEIGHT=300";
		$json .= "&sessionid=".session_id();
		$json .= "&CLASS=REDSTAR";
		$json .= "&map.scalebar=STATUS+embed";
		$json .= "&plot_code=".$locationPlotCode."'}]}";

		echo $json;

		// No View, we send directly the JSON
		$this->_helper->layout()->disableLayout();
		$this->_helper->viewRenderer->setNoRender();
	}

	/**
	 * Setup the BoundingBox.
	 *
	 * @param String $line the line containing the bounding box
	 * @param Integer $minSize the minimum size of the bounding box
	 * @return Array the setup BoundingBox
	 */
	private function _setupBoundingBox($line, $minSize = 10000) {

		$locationXmin = $line['location_x_min'];
		$locationYmin = $line['location_y_min'];
		$locationXmax = $line['location_x_max'];
		$locationYmax = $line['location_y_max'];
		$diffX = $locationXmax - $locationXmin;
		$diffY = $locationYmax - $locationYmin;

		//Enlarge the bb if it's too small (like for the point)
		if ($diffX < $minSize) {
			$addX = ($minSize - $diffX) / 2;
			$locationXmin = $locationXmin - $addX;
			$locationXmax = $locationXmax + $addX;
			$diffX = $minSize;
		}
		if ($diffY < $minSize) {
			$addY = ($minSize - $diffY) / 2;
			$locationYmin = $locationYmin - $addY;
			$locationYmax = $locationYmax + $addY;
			$diffY = $minSize;
		}

		//Setup the bb like a square
		$diffXY = $diffX - $diffY;
		if ($diffXY < 0) {
			//The bb is highter than large
			$locationXmin = $locationXmin + $diffXY / 2;
			$locationXmax = $locationXmax - $diffXY / 2;
		} else {
			//The bb is larger than highter
			$locationYmin = $locationYmin - $diffXY / 2;
			$locationYmax = $locationYmax + $diffXY / 2;
		}
		return array(
			'location_x_min' => $locationXmin,
			'location_y_min' => $locationYmin,
			'location_x_max' => $locationXmax,
			'location_y_max' => $locationYmax);
	}

	/**
	 * Returns a csv file corresponding to the requested data.
	 */
	public function gridCsvExportAction() {

		$this->logger->debug('gridCsvExportAction');

		// Configure memory and time limit because the program ask a lot of resources
		$configuration = Zend_Registry::get("configuration");
		ini_set("memory_limit", $configuration->memory_limit);
		ini_set("max_execution_time", $configuration->max_execution_time);
		$maxLines = 5000;

		// Define the header of the response
		$this->getResponse()->setHeader('Content-Type', 'text/csv;charset=UTF-8;application/force-download;', true);
		$this->getResponse()->setHeader('Content-disposition', 'attachment; filename=DataExport.csv', true);

		$websiteSession = new Zend_Session_Namespace('website');
		$sql = $websiteSession->SQLQuery;

		// Count the number of lines
		$total = $websiteSession->count;
		$this->logger->debug('Expected lines : '.$total);

		if ($sql == null) {
			$this->_print('// No Data');
		} else if ($total > 65535) {
			$this->_print('// Too many result lines');
		} else {

			// Prepend the Byte Order Mask to inform Excel that the file is in UTF-8
			if ($configuration->charset == 'UTF-8') {
				echo(chr(0xEF));
				echo(chr(0xBB));
				echo(chr(0xBF));
			}

			// Retrive the metadata
			$metadata = $websiteSession->metadata;
			$traductions = $websiteSession->traductions;

			// Display the default message
			$this->_print('// *************************************************'."\n");
			$this->_print('// Data Export'."\n");
			$this->_print('// *************************************************'."\n\n");

			// Export the column names
			$this->_print('// ');
			foreach ($metadata as $column) {
				$this->_print($column->label.';');
			}
			$this->_print("\n");

			// Get the order parameters
			$sort = $this->getRequest()->getPost('sort');
			$sortDir = $this->getRequest()->getPost('dir');

			$filter = "";
			if ($sort != "") {
				$filter .= " ORDER BY ".$sort." ".$sortDir." "; // Sort using the user choice first
				$filter .= ", ".$websiteSession->sort; // The add the key columns to the sort order to ensure consistency
			}

			// Define the max number of lines returned
			$limit = " LIMIT ".$maxLines." ";

			$count = 0;
			$page = 0;
			$finished = false;
			while (!$finished) {

				// Pb with memory limit, with PHP 5.2 we don't have a garbage collector

				// Define the position of the cursor in the dataset
				$offset = " OFFSET ".($page * $maxLines)." ";

				// Execute the request
				$this->logger->debug('reading data ... page '.$page);
				$result = $this->genericModel->executeRequest($sql.$filter.$limit.$offset);

				// Export the lines of data
				foreach ($result as $line) {
					$nbcol = sizeof($line);
					$keys = array_keys($line);
					for ($i = 0; $i < $nbcol - 2; $i++) { // the last 2 result columns are reserved
						$colName = $keys[$i]; // get the name of the column
						$value = $line[$colName];
						$formField = $metadata[$i];
						if ($formField->type == "STRING") {
							echo '"'.($value == null ? '' : $value).'";';
						} else if ($formField->type == "CODE") {
							// Manage code traduction
							if (!empty($value) && !empty($traductions[$i][$value])) {
								$label = $traductions[$i][$value];
							} else {
								$label = '';
							}
						} else {
							echo $value.';';
						}
					}
					echo "\n";
					$count++;
				}

				// Check we have read everything
				if ($count == $total) {
					$finished = true;
				}

				$page++;

			}
		}

		$this->_helper->layout()->disableLayout();
		$this->_helper->viewRenderer->setNoRender();
	}

	/**
	 * Convert and display the UTF-8 encoded string to the configured charset
	 * @param $output The string to encode and to display
	 */
	private function _print($output) {
		$configuration = Zend_Registry::get("configuration");
		echo iconv("UTF-8", $configuration->charset, $output);
	}

	/**
	 * AJAX function : Return the results features bounding box in order to zoom on the features.
	 *
	 * @return JSON.
	 */
	public function ajaxgetresultsbboxAction() {
		$this->logger->debug('ajaxgetresultsbboxAction');
		$json = "";

		try {
			// Execute the request
			$resultsbbox = $this->resultLocationModel->getResultsBBox(session_id());

			// Send the result as a JSON String
			$json = '{success:true,';
			$json .= 'resultsbbox:\''.$resultsbbox.'\'}';
		} catch (Exception $e) {
			$this->logger->err('Error while getting result : '.$e);
			$json = "{success:false,errorMessage:'".json_encode($e->getMessage())."'}";
		}
		echo $json;

		// No View, we send directly the JSON
		$this->_helper->layout()->disableLayout();
		$this->_helper->viewRenderer->setNoRender();
	}
}
