<?php
/**
 * © French National Forest Inventory
 * Licensed under EUPL v1.1 (see http://ec.europa.eu/idabc/eupl).
 */

/**
 * AbstractQueryController is the controller that manages the query module.
 * @package controllers
 */
abstract class Genapp_Controller_AbstractQueryController extends Genapp_Controller_AbstractOGAMController {

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
	 * Name of the layer used to display the images in the details panel.
	 */
	protected $detailsLayers;

	/**
	 * The models
	 */
	protected $metadataModel;
	protected $genericModel;
	protected $resultLocationModel;
	protected $predefinedRequestModel;

	/**
	 * The generic service
	 */
	protected $genericService;

	/**
	 * Initialise the controler
	 */
	public function init() {
		parent::init();

		// Load the redirector helper
		$this->_redirector = $this->_helper->getHelper('Redirector');

		// Initialise the models
		$this->metadataModel = new Genapp_Model_DbTable_Metadata_Metadata();
		$this->genericModel = new Genapp_Model_DbTable_Generic_Generic();
		$this->resultLocationModel = new Application_Model_DbTable_Mapping_ResultLocation();
		$this->predefinedRequestModel = new Application_Model_DbTable_Website_PredefinedRequest();

		// The generic service
		$this->genericService = new Genapp_Model_Generic_GenericService();

		// Reinit the activated layers
		$mappingSession = new Zend_Session_Namespace('mapping');
		$mappingSession->activatedLayers = array();

		// Configure the projection systems
		$configuration = Zend_Registry::get("configuration");
		$this->visualisationSRS = $configuration->srs_visualisation;

	}

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
		$predefinedRequestList = $this->predefinedRequestModel->getPredefinedRequestList($this->schema, $dir, $sort);

		// Generate the JSON string
		$total = count($predefinedRequestList);
		echo '{success:true, total:'.$total.',rows:[';

		$json = "";
		foreach ($predefinedRequestList as $predefinedRequest) {
			$json .= $predefinedRequest->toJSON().",";
		}
		if (strlen($json) > 1) {
			$json = substr($json, 0, -1); // remove the last colon
		}
		echo $json;

		echo ']}';

		// No View, we send directly the JSON
		$this->_helper->layout()->disableLayout();
		$this->_helper->viewRenderer->setNoRender();
		$this->getResponse()->setHeader('Content-type', 'application/json');
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

				$options = $this->metadataModel->getModes($criteria->unit);
				$json .= ',{options:[';
				foreach ($options as $code => $label) {
					$json .= '["'.$code.'","'.$label.'"],';
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
		$this->getResponse()->setHeader('Content-type', 'application/json');
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
			$predefinedRequest = new Application_Model_Website_PredefinedRequest();
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

						$field = new Application_Model_Website_PredefinedField();
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

					$field = new Application_Model_Website_PredefinedField();
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
		$this->getResponse()->setHeader('Content-type', 'application/json');

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
				if ($field->type == "CODE" || $field->type == "ARRAY") {
					$options = $this->metadataModel->getModes($field->unit);
					$json .= ',p:{options:[';
					foreach ($options as $code => $label) {
						$json .= '['.json_encode($code).','.json_encode($label).'],';
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

		// If request name is filled then we are coming from the predefined request screen
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
		$this->getResponse()->setHeader('Content-type', 'application/json');
	}

	/**
	 * AJAX function : Get the list of available datasets
	 *
	 * @return JSON The list of forms
	 */
	public function ajaxgetdatasetsAction() {
		$datasetIds = $this->metadataModel->getDatasetsForDisplay();

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
		$this->getResponse()->setHeader('Content-type', 'application/json');
	}

	/**
	 * AJAX function : Get the description of the columns of the result of the query.
	 *
	 * @param Boolean $withSQL indicate that we want the server to return the genetared SQL
	 * @return JSON
	 */
	public function ajaxgetresultcolumnsAction($withSQL = false) {
		$this->logger->debug('ajaxgetresultcolumns');

		// withSQL flag value
		if ($withSQL == null) {
			$withSQL = $this->getRequest()->getPost('withSQL');
		}

		$configuration = Zend_Registry::get("configuration");
		ini_set("max_execution_time", $configuration->max_execution_time);

		$json = "";

		// Check the validity of the POST
		if (!$this->getRequest()->isPost()) {
			$this->logger->debug('form is not a POST');
			return $this->_forward('index');
		}

		$datasetId = $this->getRequest()->getPost('datasetId');

		try {

			// Parse the input parameters and create a request object
			$formQuery = new Genapp_Model_Generic_FormQuery();
			$formQuery->datasetId = $datasetId;
			foreach ($_POST as $inputName => $inputValue) {
				if (strpos($inputName, "criteria__") === 0) {
					$criteriaName = substr($inputName, strlen("criteria__"));
					$split = explode("__", $criteriaName);
					$formQuery->addCriteria($split[0], $split[1], $inputValue);
				}
				if (strpos($inputName, "column__") === 0) {
					$columnName = substr($inputName, strlen("column__"));
					$split = explode("__", $columnName);
					$formQuery->addResult($split[0], $split[1]);
				}
			}

			// Transform the form request object into a table data object
			$queryObject = $this->genericService->getFormQueryToTableData($this->schema, $formQuery);

			if (sizeof($formQuery->results) == 0) {
				$json = "{ success: false, errorMessage: 'At least one result column should be selected'}";
			} else {

				// Generate the SQL Request
				$select = $this->genericService->generateSQLSelectRequest($this->schema, $queryObject);
				$fromwhere = $this->genericService->generateSQLFromWhereRequest($this->schema, $queryObject);

				$this->logger->debug('$select : '.$select);
				$this->logger->debug('$fromwhere : '.$fromwhere);

				// Clean previously stored results
				$sessionId = session_id();
				$this->logger->debug('SessionId : '.$sessionId);
				$this->resultLocationModel->cleanPreviousResults($sessionId);

				// Identify the field carrying the location information
				$tables = $this->genericService->getAllFormats($this->schema, $queryObject);
				$locationField = $this->metadataModel->getLocationTableFields($this->schema, array_keys($tables));

				// Run the request to store a temporary result table (for the web mapping)
				$this->resultLocationModel->fillLocationResult($fromwhere, $sessionId, $locationField->format, $this->visualisationSRS);

				// Calculate the number of lines of result
				$countResult = $this->genericModel->executeRequest("SELECT COUNT(*) as count FROM result_location WHERE session_id = '".$sessionId."'");

				// Get the website session
				$websiteSession = new Zend_Session_Namespace('website');
				// Store the metadata in session for subsequent requests
				$websiteSession->resultColumns = $queryObject->editableFields;
				$websiteSession->datasetId = $datasetId;
				$websiteSession->SQLSelect = $select;
				$websiteSession->SQLFromWhere = $fromwhere;
				$websiteSession->queryObject = $queryObject;
				$websiteSession->count = $countResult[0]['count'];
				$websiteSession->locationFormat = $locationField->format;
				$websiteSession->schema = $this->schema;

				// Send the result as a JSON String
				$json = '{success:true,';

				// Metadata
				$json .= '"columns":[';
				// Get the titles of the columns
				foreach ($formQuery->results as $formField) {

					// Get the full description of the form field
					$formField = $this->metadataModel->getFormField($formField->format, $formField->data);

					// Export the JSON
					$json .= '{'.$formField->toJSON().', hidden:false},';
				}
				// Add the identifier of the line
				$json .= '{name:"id",label:"Identifier of the line",inputType:"TEXT",definition:"The plot identifier", hidden:true},';
				// Add the plot location in WKT
				$json .= '{name:"location_centroid",label:"Location centroid",inputType:"TEXT",definition:"The plot location", hidden:true}';
				$json .= ']';
				if ($withSQL) {
					$json .= ', "SQL":'.json_encode($select.$fromwhere);
				}
				$json .= '}';
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
		$this->getResponse()->setHeader('Content-type', 'application/json');

	}

	/**
	 * AJAX function : Get a page of query result data.
	 *
	 * @return JSON
	 */
	public function ajaxgetresultrowsAction() {
		$this->logger->debug('ajaxgetresultrows');
		$json = "";

		try {

			// Retrieve the SQL request from the session
			$websiteSession = new Zend_Session_Namespace('website');
			$select = $websiteSession->SQLSelect;
			$fromwhere = $websiteSession->SQLFromWhere;
			$countResult = $websiteSession->count;

			// Retrive the session-stored info
			$resultColumns = $websiteSession->resultColumns; // array of TableField

			// Get the datatable parameters
			$start = $this->getRequest()->getPost('start');
			$length = $this->getRequest()->getPost('limit');
			$sort = $this->getRequest()->getPost('sort');
			$sortDir = $this->getRequest()->getPost('dir');

			$filter = "";
			if ($sort != "") {
				// $sort contains the form format and field
				$split = explode("__", $sort);
				$formField = new Genapp_Model_Metadata_FormField();
				$formField->format = $split[0];
				$formField->data = $split[1];
				$tableField = $this->genericService->getFormToTableMapping($this->schema, $formField);
				$key = $tableField->format.'__'.$tableField->data;
				$filter .= " ORDER BY ".$key." ".$sortDir.", id";
			} else {
				$filter .= " ORDER BY id"; // default sort to ensure consistency
			}
			if (!empty($length)) {
				$filter .= " LIMIT ".$length;
			}
			if (!empty($start)) {
				$filter .= " OFFSET ".$start;
			}

			// Execute the request
			$result = $this->genericModel->executeRequest($select.$fromwhere.$filter);

			// Prepare the needed traductions
			$traductions = array();
			foreach ($resultColumns as $tableField) {
				if ($tableField->type == "CODE") {
					$traductions[strtolower($tableField->format.'__'.$tableField->data)] = $this->metadataModel->getModes($tableField->unit);
				}
			}

			// Send the result as a JSON String
			$json = '{success:true,';
			$json .= 'total:'.$countResult.',';
			$json .= 'rows:[';
			foreach ($result as $line) {
				$json .= '[';

				foreach ($resultColumns as $tableField) {

					$key = strtolower($tableField->format.'__'.$tableField->data);
					$value = $line[$key];

					if ($tableField->type == "CODE" && $value != "") {
						// Manage code traduction
						$label = isset($traductions[$key][$value]) ? $traductions[$key][$value] : '';
						$json .= json_encode($label == null ? '' : $label).',';
					} else {
						$json .= json_encode($value).',';
					}
				}

				// Add the line id
				$json .= json_encode($line['id']).',';

				// Add the plot location in WKT
				$json .= json_encode($line['location_centroid']); // The last column is the location center

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
		$this->getResponse()->setHeader('Content-type', 'application/json');
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
		$this->getResponse()->setHeader('Content-type', 'application/javascript');
	}

	/**
	 * Get the details associed with a result line (clic on the "detail button").
	 *
	 * @param String $id The identifier of the line
	 * @return JSON representing the detail of the result line.
	 */
	public function getdetailsAction($id = null) {

		$this->logger->debug('getDetailsAction : '.$id);

		// Get the identifier of the line from the session
		if ($id == null) {
			$id = $this->getRequest()->getPost('id');
		}

		// Transform the identifier in an array
		$keyMap = array();
		$idElems = explode("/", $id);
		$i = 0;
		$count = count($idElems);
		while ($i < $count) {
			$keyMap[$idElems[$i]] = $idElems[$i + 1];
			$i += 2;
		}

		// Prepare a data object to be filled
		$data = $this->genericService->buildDataObject($keyMap["SCHEMA"], $keyMap["FORMAT"], null, true);

		// Complete the primary key info with the session values
		foreach ($data->infoFields as $infoField) {
			if (!empty($keyMap[$infoField->data])) {
				$infoField->value = $keyMap[$infoField->data];
			}
		}

		// Get the detailled data
		$result = $this->genericModel->getDatum($data);

		// The data ancestors
		$ancestors = $this->genericModel->getAncestors($data, true);
		$ancestors = array_reverse($ancestors);

		// Get children too
		$children = $this->genericModel->getChildren($data);

		// Look for a geometry object in order to calculate a bounding box
		// Look for the plot location
		$bb = null;
		$bb2 = null;
		foreach ($data->getFields() as $field) {
			if ($field->unit == "GEOM") {
				// define a bbox around the location
				$bb = $this->_setupBoundingBox($field->xmin, $field->xmax, $field->ymin, $field->ymax);

				// Prepare an overview bbox
				$bb2 = $this->_setupBoundingBox($field->xmin, $field->xmax, $field->ymin, $field->ymax, 200000);
				break;
			}
		}
		if ($bb == null) {
			foreach ($ancestors as $ancestor) {
				foreach ($ancestor->getFields() as $field) {
					if ($field->unit == "GEOM") {
						// define a bbox around the location
						$bb = $this->_setupBoundingBox($field->xmin, $field->xmax, $field->ymin, $field->ymax);

						// Prepare an overview bbox
						$bb2 = $this->_setupBoundingBox($field->xmin, $field->xmax, $field->ymin, $field->ymax, 200000);
						break;
					}
				}
			}
		}

		// Title of the detail message
		$json = "{title:'Detail', ";
		$json .= "formats:[";
		// List all the formats, starting with the ancestors
		foreach ($ancestors as $ancestor) {
			$json .= $this->genericService->datumToDetailJSON($ancestor).",";
		}
		// Add the current data
		$json .= $this->genericService->datumToDetailJSON($data);

		// Add the children
		if (!empty($children)) {
			foreach ($children as $format => $listChild) {
				$json .= $this->genericService->dataToDetailJSON($format, $listChild);
			}
		}

		$json .= "], ";
		$json .= "maps:[{title:'image',";
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
		$json .= "&BBOX=".$bb['x_min'].",".$bb['y_min'].",".$bb['x_max'].",".$bb['y_max'];
		$json .= "&WIDTH=300";
		$json .= "&HEIGHT=300";
		$json .= "&map.scalebar=STATUS+embed";
		$json .= "&sessionid=".session_id();
		$json .= "'},"; // end of map
		$json .= "{title:'overview',";
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
		$json .= "&BBOX=".$bb2['x_min'].",".$bb2['y_min'].",".$bb2['x_max'].",".$bb2['y_max'];
		$json .= "&WIDTH=300";
		$json .= "&HEIGHT=300";
		$json .= "&sessionid=".session_id();
		$json .= "&CLASS=REDSTAR";
		$json .= "&map.scalebar=STATUS+embed";
		$json .= "'}"; // end of overview map
		$json .= "]"; // end of maps
		$json .= "}";

		echo $json;

		// No View, we send directly the JSON
		$this->_helper->layout()->disableLayout();
		$this->_helper->viewRenderer->setNoRender();
		$this->getResponse()->setHeader('Content-type', 'application/json');
	}
	/**
	 * Setup the BoundingBox.
	 *
	 * @param Integer $xmin x min position
	 * @param Integer $xmax x max position
	 * @param Integer $ymin y min position
	 * @param Integer $ymax y max position
	 * @return Array the setup BoundingBox
	 */
	private function _setupBoundingBox($xmin, $xmax, $ymin, $ymax, $minSize = 10000) {

		$diffX = $xmax - $xmin;
		$diffY = $ymax - $ymin;

		//Enlarge the bb if it's too small (like for the point)
		if ($diffX < $minSize) {
			$addX = ($minSize - $diffX) / 2;
			$xmin = $xmin - $addX;
			$xmax = $xmax + $addX;
			$diffX = $minSize;
		}
		if ($diffY < $minSize) {
			$addY = ($minSize - $diffY) / 2;
			$ymin = $ymin - $addY;
			$ymax = $ymax + $addY;
			$diffY = $minSize;
		}

		//Setup the bb like a square
		$diffXY = $diffX - $diffY;
		if ($diffXY < 0) {
			//The bb is highter than large
			$xmin = $xmin + $diffXY / 2;
			$xmax = $xmax - $diffXY / 2;
		} else {
			//The bb is larger than highter
			$ymin = $ymin - $diffXY / 2;
			$ymax = $ymax + $diffXY / 2;
		}
		return array(
			'x_min' => $xmin,
			'y_min' => $ymin,
			'x_max' => $xmax,
			'y_max' => $ymax);
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
		$select = $websiteSession->SQLSelect;
		$fromwhere = $websiteSession->SQLFromWhere;
		$sql = $select.$fromwhere;

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

			// Retrive the session-stored info
			$resultColumns = $websiteSession->resultColumns; // array of TableField

			// Prepare the needed traductions
			$traductions = array();
			foreach ($resultColumns as $tableField) {
				if ($tableField->type == "CODE") {
					$traductions[strtolower($tableField->format.'__'.$tableField->data)] = $this->metadataModel->getModes($tableField->unit);
				}
			}
			// Display the default message
			$this->_print('// *************************************************'."\n");
			$this->_print('// Data Export'."\n");
			$this->_print('// *************************************************'."\n\n");

			// Export the column names
			$this->_print('// ');
			foreach ($resultColumns as $tableField) {
				$this->_print($tableField->label.';');
			}
			$this->_print("\n");

			// Get the order parameters
			$sort = $this->getRequest()->getPost('sort');
			$sortDir = $this->getRequest()->getPost('dir');

			$filter = "";

			if ($sort != "") {
				// $sort contains the form format and field
				$split = explode("__", $sort);
				$formField = new Genapp_Model_Metadata_FormField();
				$formField->format = $split[0];
				$formField->data = $split[1];
				$tableField = $this->genericService->getFormToTableMapping($this->schema, $formField);
				$key = $tableField->format.'__'.$tableField->data;
				$filter .= " ORDER BY ".$key." ".$sortDir.", id";
			} else {
				$filter .= " ORDER BY id";
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

					foreach ($resultColumns as $tableField) {

						$key = strtolower($tableField->format.'__'.$tableField->data);
						$value = $line[$key];

						if ($tableField->type == "CODE" && $value != "") {
							// Manage code traduction
							$label = isset($traductions[$key][$value]) ? $traductions[$key][$value] : '';
							echo '"'.$label.'";';
						} else {
							echo '"'.($value == null ? '' : $value).'";';
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
		$this->getResponse()->setHeader('Content-type', 'application/json');
	}
}
