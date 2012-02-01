<?php
/**
 * © French National Forest Inventory
 * Licensed under EUPL v1.1 (see http://ec.europa.eu/idabc/eupl).
 */
require_once 'AbstractOGAMController.php';

/**
 * QueryController is the controller that manages the query module.
 * @package controllers
 */
class QueryController extends AbstractOGAMController {

	/**
	 * The models.
	 */
	protected $metadataModel;
	protected $genericModel;
	protected $resultLocationModel;
	protected $predefinedRequestModel;
	protected $taxonomicModel;

	/**
	 * The generic service.
	 */
	protected $genericService;

	/**
	 * The query service.
	 */
	protected $queryService;

	/**
	 * Check if the authorization is valid this controler.
	 *
	 * @throws an Exception if the user doesn't have the rights
	 */
	function preDispatch() {

		parent::preDispatch();

		// Check if the user can query data
		$userSession = new Zend_Session_Namespace('user');
		$permissions = $userSession->permissions;
		if (empty($permissions) || !array_key_exists('DATA_QUERY', $permissions)) {
			throw new Zend_Auth_Exception('Permission denied for right : DATA_QUERY');
		}
		
		$websiteSession = new Zend_Session_Namespace('website');
		$schema = $websiteSession->schema;

		// Check if the user has access to the schema
		$schemas = $userSession->schemas;
		if (!in_array($schema, $schemas)) {
			throw new Zend_Auth_Exception('Permission denied for schema : '.$schema);
		}
	}

	/**
	 * Initialise the controler
	 */
	public function init() {
		parent::init();

		// Load the redirector helper
		$this->_redirector = $this->_helper->getHelper('Redirector');

		// Check if the schema is specified in the request
		$websiteSession = new Zend_Session_Namespace('website');
		$schema = $this->_request->getParam("SCHEMA");

		if ($schema != null) {
			$websiteSession->schema = $schema;
		}

		$this->logger->debug('init schema : '.$websiteSession->schema);

		// Set the current module name
		$websiteSession = new Zend_Session_Namespace('website');
		$websiteSession->module = "query";
		$websiteSession->moduleLabel = "Query Data (".$websiteSession->schema.")";
		$websiteSession->moduleURL = "query";

		// Initialise the models
		$this->metadataModel = new Genapp_Model_Metadata_Metadata();
		$this->taxonomicModel = new Genapp_Model_Referential_TaxonomicReferential();
		$this->genericModel = new Genapp_Model_Generic_Generic();
		$this->resultLocationModel = new Application_Model_Mapping_ResultLocation();
		$this->predefinedRequestModel = new Application_Model_Website_PredefinedRequest();

		// Declare the service used to build generic info from the metadata
		$this->genericService = new Genapp_Service_GenericService();

		// Declare the service used to manage the query module
		$this->queryService = new Genapp_Service_QueryService($websiteSession->schema);

		// Reinit the actie layers
		$mappingSession = new Zend_Session_Namespace('mapping');
		$mappingSession->activatedLayers = array();

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

		// Check if the parameter of the default page is set
		if ($this->_request->getParam("default") == "predefined") {
			$this->logger->debug('defaultTab predefined');
			$this->view->defaultTab = 'predefined';
		}

		$this->render('show-query-form');
	}

	/**
	 * AJAX function : Get the list of available predefined requests.
	 *
	 * @return JSON
	 */
	public function ajaxgetpredefinedrequestlistAction() {
		$this->logger->debug('ajaxgetpredefinedrequestlist');

		$sort = $this->_getParam('sort');
		$dir = $this->_getParam('dir');

		echo $this->queryService->getPredefinedRequestList($sort, $dir);

		// No View, we send directly the JSON
		$this->_helper->layout()->disableLayout();
		$this->_helper->viewRenderer->setNoRender();
		$this->getResponse()->setHeader('Content-type', 'application/json');
	}

	/**
	 * AJAX function : Get the criteria of a predefined requests.
	 *
	 * @return JSON
	 */
	public function ajaxgetpredefinedrequestcriteriaAction() {
		$this->logger->debug('ajaxgetpredefinedrequestcriteria');

		$requestName = $this->_getParam('request_name');

		echo $this->queryService->getPredefinedRequestCriteria($requestName);

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

		// Check the validity of the POST
		if (!$this->getRequest()->isPost()) {
			$this->logger->debug('form is not a POST');
			return $this->_forward('index');
		}

		$datasetId = $this->getRequest()->getPost('datasetId');

		try {

			// Create the predefined request object
			$predefinedRequest = new Application_Object_Website_PredefinedRequest();
			$predefinedRequest->datasetID = $datasetId;
			$websiteSession = new Zend_Session_Namespace('website');
			$predefinedRequest->schemaCode = $websiteSession->schema;
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

						$field = new Application_Object_Website_PredefinedField();
						$field->format = $criteriaFormat;
						$field->data = $criteriaData;
						$field->value = $inputValue;

						if (isset($predefinedRequest->criteriaList[$field->getName()])) {
							$predefinedRequest->criteriaList[$field->getName()]->value .= ";".$field->value;
						} else {
							$predefinedRequest->criteriaList[$field->getName()] = $field;
						}
					}
				}
				if (strpos($inputName, "column__") === 0) {

					// This is a result column
					$columnName = substr($inputName, strlen("column__"));

					$pos = strpos($columnName, "__");
					$columnFormat = substr($columnName, 0, $pos);
					$columnData = substr($columnName, $pos + 2);

					$field = new Application_Object_Website_PredefinedField();
					$field->format = $columnFormat;
					$field->data = $columnData;

					$predefinedRequest->resultsList[$field->getName()] = $field;
				}
			}

			// Save the request
			$this->predefinedRequestModel->savePredefinedRequest($predefinedRequest);

			return "{success:true}";

		} catch (Exception $e) {
			$this->logger->err('Error while getting result : '.$e);
			return "{success:false,errorMessage:'".json_encode($e->getMessage())."'}";
		}

		// No View, we send directly the JSON
		$this->_helper->layout()->disableLayout();
		$this->_helper->viewRenderer->setNoRender();
		$this->getResponse()->setHeader('Content-type', 'application/json');

	}

	/**
	 * AJAX function : Get the list of available form criteria and result fields for the dataset/request.
	 */
	public function ajaxgetqueryformAction() {
		$this->logger->debug('ajaxgetqueryformAction');

		$datasetId = $this->getRequest()->getPost('datasetId');
		$requestName = $this->getRequest()->getPost('requestName');

		echo $this->queryService->getQueryForm($datasetId, $requestName);

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

		echo $this->queryService->getDatasets();

		// No View, we send directly the JSON
		$this->_helper->layout()->disableLayout();
		$this->_helper->viewRenderer->setNoRender();
		$this->getResponse()->setHeader('Content-type', 'application/json');
	}

	/**
	 * Check if a criteria is empty.
	 *
	 * @param Undef $criteria
	 * @return true if empty
	 */
	private function _isEmptyCriteria($criteria) {
		if (is_array($criteria)) {
			$emptyArray = true;
			foreach ($criteria as $value) {
				if ($value != "") {
					$emptyArray = false;
				}
			}
			return $emptyArray;
		} else {
			return ($criteria == "");
		}
	}

	/**
	 * AJAX function : Get the description of the columns of the result of the query.
	 *
	 * @param Boolean $withSQL indicate that we want the server to return the generated SQL
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

		// Check the validity of the POST
		if (!$this->getRequest()->isPost()) {
			$this->logger->debug('form is not a POST');
			return $this->_forward('index');
		}

		$datasetId = $this->getRequest()->getPost('datasetId');

		try {

			// Parse the input parameters and create a request object
			$formQuery = new Genapp_Object_Generic_FormQuery();
			$formQuery->datasetId = $datasetId;
			foreach ($_POST as $inputName => $inputValue) {
				if (strpos($inputName, "criteria__") === 0 && !$this->_isEmptyCriteria($inputValue)) {
					$this->logger->debug('POST var added');
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

			// Call the service to get the definition of the columns
			echo $this->queryService->getResultColumns($datasetId, $formQuery, $withSQL);

		} catch (Exception $e) {
			$this->logger->err('Error while getting result : '.$e);
			echo '{"success":false,errorMessage:"'.json_encode($e->getMessage()).'"}';
		}

		// Activate the result layer
		$this->mappingSession->activatedLayers[] = 'result_locations';

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

		// Get the datatable parameters
		$start = $this->getRequest()->getPost('start');
		$length = $this->getRequest()->getPost('limit');
		$sort = $this->getRequest()->getPost('sort');
		$sortDir = $this->getRequest()->getPost('dir');

		echo $this->queryService->getResultRows($start, $length, $sort, $sortDir);

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

		$userSession = new Zend_Session_Namespace('user');
		$permissions = $userSession->permissions;

		$websiteSession = new Zend_Session_Namespace('website');
		$schema = $websiteSession->schema;

		$this->view->hideGridCsvExportMenuItem = 'true'; // By default the export is hidden
		$this->view->hideGridDataEditButton = 'true';
		$this->view->checkEditionRights = 'false'; // By default, we don't check for rights on the data

		$this->view->userProviderId = $userSession->user->providerId;

		if (!empty($permissions)) {
			if ($schema == 'RAW_DATA' && array_key_exists('EXPORT_RAW_DATA', $permissions)) {
				$this->view->hideGridCsvExportMenuItem = 'false';
			}
			if ($schema == 'HARMONIZED_DATA' && array_key_exists('EXPORT_HARMONIZED_DATA', $permissions)) {
				$this->view->hideGridCsvExportMenuItem = 'false';
			}
			if (($schema == 'RAW_DATA' || $schema == 'HARMONIZED_DATA') && array_key_exists('DATA_EDITION', $permissions)) {
				$this->view->hideGridDataEditButton = 'false';
			}
			if (!array_key_exists('DATA_EDITION_OTHER_PROVIDER', $permissions)) {
				$this->view->checkEditionRights = 'true';
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

		// Get the names of the layers to display in the details panel
		$configuration = Zend_Registry::get("configuration");
		$detailsLayers = $configuration->query_details_layers->toArray();

		// Get the current dataset to filter the results
		$websiteSession = new Zend_Session_Namespace('website');
		$datasetId = $websiteSession->datasetId;

		// Get the identifier of the line from the session
		if ($id == null) {
			$id = $this->getRequest()->getPost('id');
		}

		echo $this->queryService->getDetails($id, $detailsLayers, $datasetId);

		// No View, we send directly the JSON
		$this->_helper->layout()->disableLayout();
		$this->_helper->viewRenderer->setNoRender();
		$this->getResponse()->setHeader('Content-type', 'application/json');
	}

	/**
	 * Return the node children
	 *
	 * @return JSON representing the detail of the children.
	 */
	public function ajaxgetchildrenAction() {
		$id = $this->getRequest()->getPost('id');
		$this->logger->debug('ajaxgetchildrenAction : '.$id);

		echo $this->queryService->ajaxgetchildren($id);

		// No View, we send directly the JSON
		$this->_helper->layout()->disableLayout();
		$this->_helper->viewRenderer->setNoRender();
		$this->getResponse()->setHeader('Content-type', 'application/json');
	}

	/**
	 * Returns a csv file corresponding to the requested data.
	 */
	public function csvExportAction() {

		$this->logger->debug('gridCsvExportAction');

		$userSession = new Zend_Session_Namespace('user');
		$permissions = $userSession->permissions;
		
		$websiteSession = new Zend_Session_Namespace('website');
		$schema = $websiteSession->schema;

		// Configure memory and time limit because the program ask a lot of resources
		$configuration = Zend_Registry::get("configuration");
		ini_set("memory_limit", $configuration->memory_limit);
		ini_set("max_execution_time", $configuration->max_execution_time);
		$maxLines = 5000;

		// Define the header of the response
		$this->getResponse()->setHeader('Content-Type', 'text/csv;charset='.$configuration->csvExportCharset.';application/force-download;', true);
		$this->getResponse()->setHeader('Content-disposition', 'attachment; filename=DataExport.csv', true);

		if (array_key_exists('EXPORT_RAW_DATA', $permissions)) {

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
				if ($configuration->csvExportCharset == 'UTF-8') {
					echo(chr(0xEF));
					echo(chr(0xBB));
					echo(chr(0xBF));
				}

				// Retrive the session-stored info
				$resultColumns = $websiteSession->resultColumns; // array of TableField

				// Prepare the needed traductions and the form info
				$traductions = array();
				foreach ($resultColumns as $tableField) {

					$key = strtolower($tableField->getName());

					if ($tableField->type == "CODE" || $tableField->type == "ARRAY") {
						if ($tableField->subtype == "DYNAMIC") {
							$traductions[$key] = $this->metadataModel->getDynamodeLabels($tableField->unit);
						} else if ($tableField->subtype == "TREE") {
							$traductions[$key] = $this->metadataModel->getTreeLabels($tableField->unit);
						} else if ($tableField->subtype == "TAXREF") {
							$traductions[$key] = $this->taxonomicReferentialModel->getTaxrefLabels($tableField->unit);
						} else {
							$traductions[$key] = $this->metadataModel->getModeLabels($tableField->unit);
						}
					}

					// Get the full description of the form field
					$formFields[$key] = $this->genericService->getTableToFormMapping($tableField);
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
					$formField = new Genapp_Object_Metadata_FormField();
					$formField->format = $split[0];
					$formField->data = $split[1];
					$tableField = $this->genericService->getFormToTableMapping($schema, $formField);
					$key = $tableField->getName();
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

					// Define the position of the cursor in the dataset
					$offset = " OFFSET ".($page * $maxLines)." ";

					// Execute the request
					$this->logger->debug('reading data ... page '.$page);
					$result = $this->genericModel->executeRequest($sql.$filter.$limit.$offset);

					// Export the lines of data
					foreach ($result as $line) {

						foreach ($resultColumns as $tableField) {

							$key = strtolower($tableField->getName());
							$value = $line[$key];
							$formField = $formFields[$key];

							if ($value == null) {
								$this->_print(';');
							} else {
								if ($tableField->type == "CODE") {
									// Manage code traduction
									$label = isset($traductions[$key][$value]) ? $traductions[$key][$value] : '';
									$this->_print('"'.$label.'";');
								} else if ($tableField->type == "ARRAY") {
									// Split the array items
									$arrayValues = explode(",", preg_replace("@[{-}]@", "", $value));
									$label = '';
									foreach ($arrayValues as $arrayValue) {
										$label .= isset($traductions[$key][$arrayValue]) ? $traductions[$key][$arrayValue] : '';
										$label .= ',';
									}
									if ($label != '') {
										$label = substr($label, 0, -1);
									}
									$label = '['.$label.']';
									$this->_print('"'.$label.'";');

								} else if ($formField->inputType == "NUMERIC") {
									// Numeric value
									if ($formField->decimals != null && $formField->decimals != "") {
										$value = number_format($value, $formField->decimals);
									}
									$this->_print($value.';');
								} else {
									// Dafault case : String value
									$this->_print('"'.$value.'";');
								}
							}
						}
						$this->_print("\n");
						$count++;
					}

					// Check we have read everything
					if ($count == $total) {
						$finished = true;
					}

					$page++;

				}
			}
		} else {
			$this->_print('// No Permissions');
		}

		$this->_helper->layout()->disableLayout();
		$this->_helper->viewRenderer->setNoRender();
	}

	/**
	 * Returns a kml file corresponding to the requested data.
	 */
	public function kmlExportAction() {

		$this->logger->debug('gridCsvExportAction');

		$userSession = new Zend_Session_Namespace('user');
		$permissions = $userSession->permissions;
		
		$websiteSession = new Zend_Session_Namespace('website');
		$schema = $websiteSession->schema;

		// Configure memory and time limit because the program ask a lot of resources
		$configuration = Zend_Registry::get("configuration");
		ini_set("memory_limit", $configuration->memory_limit);
		ini_set("max_execution_time", $configuration->max_execution_time);
		$maxLines = 5000;

		// Define the header of the response
		$this->getResponse()->setHeader('Content-Type', 'application/vnd.google-earth.kml+xml;charset='.$configuration->csvExportCharset.';application/force-download;', true);
		$this->getResponse()->setHeader('Content-disposition', 'attachment; filename=DataExport.kml', true);

		if (($schema == 'RAW_DATA' && array_key_exists('EXPORT_RAW_DATA', $permissions)) || ($schema == 'HARMONIZED_DATA' && array_key_exists('EXPORT_HARMONIZED_DATA', $permissions))) {

			$websiteSession = new Zend_Session_Namespace('website');
			$select = $websiteSession->SQLSelect;
			$fromwhere = $websiteSession->SQLFromWhere;
			$sql = $select.', ST_AsKML(the_geom) AS KML '.$fromwhere;

			// Count the number of lines
			$total = $websiteSession->count;
			$this->logger->debug('Expected lines : '.$total);

			if ($sql == null) {
				$this->_print('// No Data');
			} else if ($total > 65535) {
				$this->_print('// Too many result lines');
			} else {

				// Retrive the session-stored info
				$resultColumns = $websiteSession->resultColumns; // array of TableField

				// Prepare the needed traductions and the form info
				$traductions = array();
				foreach ($resultColumns as $tableField) {

					$key = strtolower($tableField->getName());

					if ($tableField->type == "CODE" || $tableField->type == "ARRAY") {
						if ($tableField->subtype == "DYNAMIC") {
							$traductions[$key] = $this->metadataModel->getDynamodeLabels($tableField->unit);
						} else if ($tableField->subtype == "TREE") {
							$traductions[$key] = $this->metadataModel->getTreeLabels($tableField->unit);
						} else if ($tableField->subtype == "TAXREF") {
							$traductions[$key] = $this->taxonomicReferentialModel->getTaxrefLabels($tableField->unit);
						} else {
							$traductions[$key] = $this->metadataModel->getModeLabels($tableField->unit);
						}
					}

					// Get the full description of the form field
					$formFields[$key] = $this->genericService->getTableToFormMapping($tableField);
				}

				// Display the default message
				$this->_print('<?xml version="1.0" encoding="UTF-8"?>'."\n");
				$this->_print('<kml xmlns="http://www.opengis.net/kml/2.2">'."\n");
				$this->_print('<Document>'."\n");

				// Get the order parameters
				$sort = $this->getRequest()->getPost('sort');
				$sortDir = $this->getRequest()->getPost('dir');

				$filter = "";

				if ($sort != "") {
					// $sort contains the form format and field
					$split = explode("__", $sort);
					$formField = new Genapp_Object_Metadata_FormField();
					$formField->format = $split[0];
					$formField->data = $split[1];
					$tableField = $this->genericService->getFormToTableMapping($schema, $formField);
					$key = $tableField->getName();
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

					// Define the position of the cursor in the dataset
					$offset = " OFFSET ".($page * $maxLines)." ";

					// Execute the request
					$this->logger->debug('reading data ... page '.$page);
					$result = $this->genericModel->executeRequest($sql.$filter.$limit.$offset);

					// Export the lines of data
					foreach ($result as $line) {

						$this->_print("<ExtendedData>");
						foreach ($resultColumns as $tableField) {


							$key = strtolower($tableField->getName());
							$value = $line[$key];
							$formField = $formFields[$key];

							$label = $formField->label;

							if ($value == null) {
								$value = "";
							} else {
								if ($tableField->type == "CODE") {
									// Manage code traduction
									$value = isset($traductions[$key][$value]) ? $traductions[$key][$value] : '';
								} else if ($tableField->type == "ARRAY") {
									// Split the array items
									$arrayValues = explode(",", preg_replace("@[{-}]@", "", $value));
									$value = '';
									foreach ($arrayValues as $arrayValue) {
										$value .= isset($traductions[$key][$arrayValue]) ? $traductions[$key][$arrayValue] : '';
										$value .= ',';
									}
									if ($label != '') {
										$value = substr($value, 0, -1);
									}
									$value = '['.$value.']';

								} else if ($formField->inputType == "NUMERIC") {
									// Numeric value
									if ($formField->decimals != null && $formField->decimals != "") {
										$value = number_format($value, $formField->decimals);
									}
								}
							}


							$this->_print('<Data name="'.$label.'">');
							$this->_print('<value>'.$value.'</value>');
							$this->_print('</Data>');

						}
						$this->_print("</ExtendedData>");

						$this->_print("<Placemark>".$line['kml']."</Placemark>");

						$this->_print("\n");
						$count++;
					}

					// Check we have read everything
					if ($count == $total) {
						$finished = true;
					}

					$page++;

				}

				$this->_print('</Document>'."\n");
				$this->_print('</kml>'."\n");
			}
		} else {
			$this->_print('// No Permissions');
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
		echo iconv("UTF-8", $configuration->csvExportCharset, $output);
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

	/**
	 * AJAX function : Nodes of a tree under a given node and for a given unit.
	 *
	 * @return JSON.
	 */
	public function ajaxgettreenodesAction() {
		$this->logger->debug('ajaxgettreenodesAction');

		$unit = $this->getRequest()->getParam('unit');
		$code = $this->getRequest()->getPost('node');
		$depth = $this->getRequest()->getParam('depth');

		$tree = $this->metadataModel->getTreeModes($unit, $code, $depth);

		// Send the result as a JSON String
		echo '['.$tree->toJSON().']';

		// No View, we send directly the JSON
		$this->_helper->layout()->disableLayout();
		$this->_helper->viewRenderer->setNoRender();
		$this->getResponse()->setHeader('Content-type', 'application/json');
	}

	/**
	 * AJAX function : Nodes of a taxonomic referential under a given node.
	 *
	 * @return JSON.
	 */
	public function ajaxgettaxrefnodesAction() {
		$this->logger->debug('ajaxgettaxrefnodesAction');

		$code = $this->getRequest()->getPost('node');
		$depth = $this->getRequest()->getParam('depth');

		$tree = $this->taxonomicModel->getTaxrefModes($code, $depth);

		// Send the result as a JSON String
		echo '['.$tree->toJSON().']';

		// No View, we send directly the JSON
		$this->_helper->layout()->disableLayout();
		$this->_helper->viewRenderer->setNoRender();
		$this->getResponse()->setHeader('Content-type', 'application/json');
	}

	/**
	 * AJAX function : Return the list of available codes for a dynamic list.
	 *
	 * @return JSON.
	 */
	public function ajaxgetdynamiccodesAction() {
		$this->logger->debug('ajaxgetdynamiccodesAction');

		$unit = $this->getRequest()->getParam('unit');
		$query = $this->getRequest()->getParam('query');

		$this->logger->debug('$unit : '.$unit);
		$this->logger->debug('$query : '.$query);

		$codes = $this->metadataModel->getDynamodeLabels($unit, null, $query);

		// Send the result as a JSON String
		$json = '{"codes":[';
		foreach ($codes as $code => $label) {
			$json .= '{"code":'.json_encode($code).', "label":'.json_encode($label).'},';
		}
		if (!empty($codes)) {
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
	* AJAX function : Return the list of available codes for a MODE unit.
	*
	* @return JSON.
	*/
	public function ajaxgetcodesAction() {
		$this->logger->debug('ajaxgetdynamiccodesAction');
	
		$unit = $this->getRequest()->getParam('unit');
	
		$this->logger->debug('$unit : '.$unit);
	
		$codes = $this->metadataModel->getModeLabels($unit);
	
		// Send the result as a JSON String
		$json = '{"codes":[';
		foreach ($codes as $code => $label) {
			$json .= '{"code":'.json_encode($code).', "label":'.json_encode($label).'},';
		}
		if (!empty($codes)) {
			$json = substr($json, 0, -1);
		}
		$json .= ']}';
	
		echo $json;
	
		// No View, we send directly the JSON
		$this->_helper->layout()->disableLayout();
		$this->_helper->viewRenderer->setNoRender();
		$this->getResponse()->setHeader('Content-type', 'application/json');
	}
}
