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
require_once 'AbstractOGAMController.php';

/**
 * QueryController is the controller that manages the query module.
 *
 * @package Application_Controller
 */
class QueryController extends AbstractOGAMController {

	/**
	 * The models.
	 */
	protected $metadataModel;

	protected $genericModel;

	protected $resultLocationModel;

	protected $predefinedRequestModel;

	/**
	 * The generic service.
	 */
	protected $genericService;

	/**
	 * The query service.
	 */
	protected $queryService;

	/**
	 * Local cache for trads.
	 *
	 * @var Array
	 */
	private $traductions = array();

	/**
	 * Check if the authorization is valid this controler.
	 *
	 * @throws an Exception if the user doesn't have the rights
	 */
	function preDispatch() {
		parent::preDispatch();

		// Check if the user can query data
		$userSession = new Zend_Session_Namespace('user');
		$user = $userSession->user;
		if (empty($user) || !$user->isAllowed('DATA_QUERY')) {
			throw new Zend_Auth_Exception('Permission denied for right : DATA_QUERY');
		}
		$websiteSession = new Zend_Session_Namespace('website');
		$schema = $websiteSession->schema;

		// Check if the user has access to the schema
		if (!$user->isSchemaAllowed($schema)) {
			throw new Zend_Auth_Exception('Permission denied for schema : "' . $schema . '"');
		}
	}

	/**
	 * Initialise the controler.
	 */
	public function init() {
		parent::init();

		// Load the redirector helper
		$this->_redirector = $this->_helper->getHelper('Redirector');

		// Check if the schema is specified in the request
		$websiteSession = new Zend_Session_Namespace('website');
		$schema = $this->_request->getParam("SCHEMA");

		// Si une valeur est demandée en URL on change le schéma
		if ($schema !== null) {
			$websiteSession->schema = $schema;
		}

		if (!isset($websiteSession->schema) || empty($websiteSession->schema)) {
			// Default value
			$websiteSession->schema = 'RAW_DATA';
		}

		$this->logger->debug('init schema : ' . $websiteSession->schema);

		// Set the current module name
		$websiteSession->module = "query";
		$websiteSession->moduleLabel = "Query Data (" . $websiteSession->schema . ")";
		$websiteSession->moduleURL = "query";

		// Initialise the models
		$this->metadataModel = new Application_Model_Metadata_Metadata();
		$this->genericModel = new Application_Model_Generic_Generic();
		$this->resultLocationModel = new Application_Model_Mapping_ResultLocation();
		$this->predefinedRequestModel = new Application_Model_Website_PredefinedRequest();

		// Declare the service used to build generic info from the metadata
		$this->genericService = new Application_Service_GenericService();

		// Declare the service used to manage the query module
		$this->queryService = new Application_Service_QueryService($websiteSession->schema);

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
		if ($this->_request->getParam("default") === "predefined") {
			$this->logger->debug('defaultTab predefined');
			$this->view->defaultTab = 'predefined';
		}

		// $this->render('show-query-form');
		// No View, we send directly the JSON
		$this->_helper->layout()->disableLayout();
		$this->_helper->viewRenderer->setNoRender();
		$redirector = Zend_Controller_Action_HelperBroker::getStaticHelper('redirector');
		$redirector->gotoUrl($this->view->baseUrl('/odp/index.html?locale=' . $this->view->locale));
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
							$predefinedRequest->criteriaList[$field->getName()]->value .= ";" . $field->value;
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

			return '{success:true}';
		} catch (Exception $e) {
			$this->logger->err('Error while getting result : ' . $e);
			return '{"success":false, "errorMessage":' . json_encode($e->getMessage()) . '}';
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

		$filters = json_decode($this->getRequest()->getQuery('filter'));

		$datasetId = $requestName = null;

		if (is_array($filters)) {
			foreach ($filters as $aFilter) {
				switch ($aFilter->property) {
					case 'processId':
						$datasetId = $aFilter->value;
						break;
					case 'requestName':
						$requestName = $aFilter->value;
						break;
					default:
						$this->logger->debug('filter unattended : ' . $aFilter->property);
				}
			}
		} else {
			$datasetId = json_decode($this->getRequest()->getQuery('datasetId'));
			$requestName = $this->getRequest()->getPost('requestName');
		}

		echo $this->queryService->getQueryForm($datasetId, $requestName);

		// No View, we send directly the JSON
		$this->_helper->layout()->disableLayout();
		$this->_helper->viewRenderer->setNoRender();
		$this->getResponse()->setHeader('Content-type', 'application/json');
	}

	/**
	 * AJAX function : Get the list of criteria or columns available for a process form.
	 */
	public function ajaxgetqueryformfieldsAction() {
		$this->logger->debug('ajaxgetqueryformfieldsAction');

		$filters = json_decode($this->getRequest()->getQuery('filter'));

		$datasetId = $form = null;

		if (is_array($filters)) {
			foreach ($filters as $aFilter) {
				switch ($aFilter->property) {
					case 'processId':
						$datasetId = $aFilter->value;
						break;
					case 'form':
						$formFormat = $aFilter->value;
						break;
					case 'fieldsType':
						$fieldsType = $aFilter->value;
						break;
					default:
						$this->logger->debug('filter unattended : ' . $aFilter->property);
				}
			}
		}

		$query = $this->getRequest()->getQuery('query');
		$start = $this->getRequest()->getQuery('start');
		$limit = $this->getRequest()->getQuery('limit');

		echo $this->queryService->getQueryFormFields($datasetId, $formFormat, $fieldsType, $query, $start, $limit);

		// No View, we send directly the JSON
		$this->_helper->layout()->disableLayout();
		$this->_helper->viewRenderer->setNoRender();
		$this->getResponse()->setHeader('Content-type', 'application/json');
	}

	/**
	 * AJAX function : Get the list of available datasets.
	 *
	 * @return JSON The list of forms
	 */
	public function ajaxgetdatasetsAction() {
		echo '{"success":true, "data":', $this->queryService->getDatasets(), '}';

		// No View, we send directly the JSON
		$this->_helper->layout()->disableLayout();
		$this->_helper->viewRenderer->setNoRender();
		$this->getResponse()->setHeader('Content-type', 'application/json');
	}

	/**
	 * Check if a criteria is empty.
	 * (not private as this function is extended in custom directory of derivated applications)
	 *
	 * @param Undef $criteria
	 * @return true if empty
	 */
	protected function isEmptyCriteria($criteria) {
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
	 * AJAX function : Builds the query.
	 *
	 * @return JSON
	 */
	public function ajaxbuildrequestAction() {
		$this->logger->debug('ajaxbuildrequestAction');

		// Check the validity of the POST
		if (!$this->getRequest()->isPost()) {
			$this->logger->debug('form is not a POST');
			return $this->_forward('index');
		}

		$datasetId = $this->getRequest()->getPost('datasetId');

		try {

			// Parse the input parameters and create a request object
			$formQuery = new Application_Object_Generic_FormQuery();
			$formQuery->datasetId = $datasetId;
			foreach ($_POST as $inputName => $inputValue) {
				if (strpos($inputName, "criteria__") === 0 && !$this->isEmptyCriteria($inputValue)) {
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

			if ($formQuery->isValid()) {
				// Store the request parameters in session
				$websiteSession = new Zend_Session_Namespace('website');
				$websiteSession->formQuery = $formQuery;

				// Activate the result layer
				$this->mappingSession->activatedLayers[] = 'result_locations';

				echo '{"success":true}';
			} else {
				$this->logger->err('Invalid request.');
				echo '{"success":false,"errorMessage":"Invalid request."}';
			}

		} catch (Exception $e) {
			$this->logger->err('Error while getting result : ' . $e);
			echo '{"success":false,"errorMessage":' . json_encode($e->getMessage()) . '}';
		}

		// No View, we send directly the JSON
		$this->_helper->layout()->disableLayout();
		$this->_helper->viewRenderer->setNoRender();
		$this->getResponse()->setHeader('Content-type', 'application/json');
	}

	/**
	 * AJAX function : Return the results features bounding box in order to zoom on the features.
	 *
	 * @return JSON.
	 */
	public function ajaxgetresultsbboxAction() {
		$this->logger->debug('ajaxgetresultsbboxAction');

		$configuration = Zend_Registry::get("configuration");
		ini_set("max_execution_time", $configuration->getConfig('max_execution_time', 480));

		try {

			// Store the request parameters in session
			$websiteSession = new Zend_Session_Namespace('website');
			$formQuery = $websiteSession->formQuery;

			// Call the service to get the definition of the columns
			$this->queryService->prepareResultLocations($formQuery);

			// Execute the request
			$resultsbbox = $this->resultLocationModel->getResultsBBox(session_id());

			// Send the result as a JSON String
			echo '{"success":true, "resultsbbox":' . json_encode($resultsbbox) . '}';
		} catch (Exception $e) {
			$this->logger->err('Error while getting result : ' . $e);
			echo '{"success":false, "errorMessage":' . json_encode($e->getMessage()) . '}';
		}

		// No View, we send directly the JSON
		$this->_helper->layout()->disableLayout();
		$this->_helper->viewRenderer->setNoRender();
		$this->getResponse()->setHeader('Content-type', 'application/json');
	}

	/**
	 * AJAX function : Get the description of the columns of the result of the query.
	 *
	 * @return JSON
	 */
	public function ajaxgetresultcolumnsAction($withSQL = false) {
		$this->logger->debug('ajaxgetresultcolumns');

		try {
			// Store the request parameters in session
			$websiteSession = new Zend_Session_Namespace('website');
			$formQuery = $websiteSession->formQuery;

			// Call the service to get the definition of the columns
			echo $this->queryService->getResultColumns($formQuery->datasetId, $formQuery);
		} catch (Exception $e) {
			$this->logger->err('Error while getting result : ' . $e);
			echo '{"success":false,"errorMessage":' . json_encode($e->getMessage()) . '}';
		}

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
		$sortObj = json_decode($sort, true)[0];

		echo $this->queryService->getResultRows($start, $length, $sortObj["property"], $sortObj["direction"]);

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
		$user = $userSession->user;

		$websiteSession = new Zend_Session_Namespace('website');
		$schema = $websiteSession->schema;

		$this->view->hideGridCsvExportMenuItem = 'true'; // By default the export is hidden
		$this->view->hideGridDataEditButton = 'true';
		$this->view->checkEditionRights = 'true'; // By default, we don't check for rights on the data

		$this->view->userProviderId = $user->provider->id;

		if ($schema == 'RAW_DATA' && $user->isAllowed('EXPORT_RAW_DATA')) {
			$this->view->hideGridCsvExportMenuItem = 'false';
		}
		if ($schema == 'HARMONIZED_DATA' && $user->isAllowed('EXPORT_HARMONIZED_DATA')) {
			$this->view->hideGridCsvExportMenuItem = 'false';
		}
		if (($schema == 'RAW_DATA' || $schema == 'HARMONIZED_DATA') && $user->isAllowed('DATA_EDITION')) {
			$this->view->hideGridDataEditButton = 'false';
		}
		if ($user->isAllowed('DATA_EDITION_OTHER_PROVIDER')) {
			$this->view->checkEditionRights = 'false';
		}

		$this->_helper->layout()->disableLayout();
		$this->render('grid-parameters');
		$this->getResponse()->setHeader('Content-type', 'application/javascript');
	}

	/**
	 * Get the details associed with a result line (clic on the "detail button").
	 *
	 * @param String $id
	 *        	The identifier of the line
	 * @return JSON representing the detail of the result line.
	 */
	public function ajaxgetdetailsAction($id = null) {
		$this->logger->debug('getDetailsAction : ' . $id);

		// Get the names of the layers to display in the details panel
		$configuration = Zend_Registry::get('configuration');

		$detailsLayers[] = $configuration->getConfig('query_details_layers1');
		$detailsLayers[] = $configuration->getConfig('query_details_layers2');

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
	 * Return the node children.
	 *
	 * @return JSON representing the detail of the children.
	 */
	public function ajaxgetchildrenAction() {
		$id = $this->getRequest()->getPost('id');
		$this->logger->debug('ajaxgetchildrenAction : ' . $id);

		echo $this->queryService->ajaxgetchildren($id);

		// No View, we send directly the JSON
		$this->_helper->layout()->disableLayout();
		$this->_helper->viewRenderer->setNoRender();
		$this->getResponse()->setHeader('Content-type', 'application/json');
	}

	/**
	 * Export the request criterias in the CSV file.
	 *
	 * @return String the criterias
	 */
	protected function csvExportCriterias() {
		$criterias = "";

		$criterias .= '// ' . $this->translator->translate('Request Criterias') . "\n";
		$websiteSession = new Zend_Session_Namespace('website');
		$formQuery = $websiteSession->formQuery;

		// List all the criterias
		foreach ($formQuery->getCriterias() as $criteria) {

			// Get the descriptor of the form field
			$formField = $this->metadataModel->getFormField($criteria->format, $criteria->data);
			$criterias .= '// ' . $formField->label . ';';

			// Get the corresponding table field
			$tableField = $this->metadataModel->getFormToTableMapping($websiteSession->schema, $formField);

			// Fill the value of the table field
			$tableField->value = $criteria->value;

			// Get the value label
			$tableField->valueLabel = $this->genericService->getValueLabel($tableField, $tableField->value);

			if (is_array($tableField->value)) {
				$criterias .= implode(', ', $tableField->valueLabel);
			} else {
				$criterias .= $tableField->valueLabel;
			}

			$criterias .= "\n";
		}

		return $criterias;
	}

	/**
	 * Get a label from a code, use a local cache mechanism.
	 *
	 * @param Application_Object_Metadata_TableField $tableField
	 *        	the field descriptor
	 * @param String $value
	 *        	the code to translate
	 */
	protected function getLabelCache($tableField, $value) {
		$label = '';
		$key = strtolower($tableField->getName());

		// Check in local cache
		if (isset($this->traductions[$key][$value])) {
			$label = $this->traductions[$key][$value];
		} else {
			// Check in database
			$trad = $this->genericService->getValueLabel($tableField, $value);

			// Put in cache
			if (!empty($trad)) {
				$label = $trad;
				$this->traductions[$key][$value] = $trad;
			}
		}

		return $label;
	}

	/**
	 * Returns a csv file corresponding to the requested data.
	 */
	public function csvExportAction() {
		$this->logger->debug('gridCsvExportAction');

		$userSession = new Zend_Session_Namespace('user');
		$user = $userSession->user;

		$websiteSession = new Zend_Session_Namespace('website');
		$schema = $websiteSession->schema;

		// Configure memory and time limit because the program ask a lot of resources
		$configuration = Zend_Registry::get("configuration");
		ini_set("memory_limit", $configuration->getConfig('memory_limit', '1024M'));
		ini_set("max_execution_time", $configuration->getConfig('max_execution_time', '480'));
		$maxLines = 5000;

		// Define the header of the response
		$charset = $configuration->getConfig('csvExportCharset', 'UTF-8');
		$this->getResponse()->setHeader('Content-Type', 'text/csv;charset=' . $charset . ';application/force-download;', true);
		$this->getResponse()->setHeader('Content-disposition', 'attachment; filename=DataExport_' . date('dmy_Hi') . '.csv', true);

		if ($user->isAllowed('EXPORT_RAW_DATA')) {

			$websiteSession = new Zend_Session_Namespace('website');
			$select = $websiteSession->SQLSelect;
			$from = $websiteSession->SQLFrom;
			$where = $websiteSession->SQLWhere;
			$sql = $select . $from . $where;

			// Count the number of lines
			$total = $websiteSession->count;
			$this->logger->debug('Expected lines : ' . $total);

			if ($sql == null) {
				$this->outputCharset('// No Data');
			} else if ($total > 65535) {
				$this->outputCharset('// Too many result lines');
			} else {

				// Prepend the Byte Order Mask to inform Excel that the file is in UTF-8
				if ($charset === 'UTF-8') {
					echo (chr(0xEF));
					echo (chr(0xBB));
					echo (chr(0xBF));
				}

				// Retrive the session-stored info
				$resultColumns = $websiteSession->resultColumns; // array of TableField

				// Prepare the form info
				$traductions = array();
				foreach ($resultColumns as $tableField) {

					$key = strtolower($tableField->getName());

					// Get the full description of the form field
					$formFields[$key] = $this->genericService->getTableToFormMapping($tableField);
				}

				// Display the default message
				$this->outputCharset('// *************************************************' . "\n");
				$this->outputCharset('// ' . $this->translator->translate('Data Export') . "\n");
				$this->outputCharset('// *************************************************' . "\n\n");

				// Request criterias
				$this->outputCharset($this->csvExportCriterias());
				$this->outputCharset("\n");

				// Export the column names
				$this->outputCharset('// ');
				foreach ($resultColumns as $tableField) {
					$this->outputCharset($tableField->label . ';');
				}
				$this->outputCharset("\n");

				// Get the order parameters
				$sort = $this->getRequest()->getPost('sort');
				$sortDir = $this->getRequest()->getPost('dir');

				$filter = "";

				if ($sort != "") {
					// $sort contains the form format and field
					$split = explode("__", $sort);
					$formField = new Application_Object_Metadata_FormField();
					$formField->format = $split[0];
					$formField->data = $split[1];
					$tableField = $this->genericService->getFormToTableMapping($schema, $formField);
					$key = $tableField->getName();
					$filter .= " ORDER BY " . $key . " " . $sortDir . ", id";
				} else {
					$filter .= " ORDER BY id";
				}

				// Define the max number of lines returned
				$limit = " LIMIT " . $maxLines . " ";

				$count = 0;
				$page = 0;
				$finished = false;
				while (!$finished) {

					// Define the position of the cursor in the dataset
					$offset = " OFFSET " . ($page * $maxLines) . " ";

					// Execute the request
					$this->logger->debug('reading data ... page ' . $page);
					$result = $this->genericModel->executeRequest($sql . $filter . $limit . $offset);

					// Export the lines of data
					foreach ($result as $line) {

						foreach ($resultColumns as $tableField) {

							$key = strtolower($tableField->getName());
							$value = $line[$key];
							$formField = $formFields[$key];

							if ($value == null) {
								$this->outputCharset(';');
							} else {
								if ($tableField->type === "CODE") {

									$label = $this->getLabelCache($tableField, $value);

									$this->outputCharset('"' . $label . '";');
								} else if ($tableField->type === "ARRAY") {
									// Split the array items
									$arrayValues = explode(",", preg_replace("@[{-}]@", "", $value));
									$label = '';
									foreach ($arrayValues as $arrayValue) {

										$label .= $this->getLabelCache($tableField, $arrayValue);
										$label .= ',';
									}
									if ($label != '') {
										$label = substr($label, 0, -1);
									}
									$label = '[' . $label . ']';
									$this->outputCharset('"' . $label . '";');
								} else if ($formField->inputType === "NUMERIC") {
									// Numeric value
									if ($formField->decimals !== null && $formField->decimals !== "") {
										$value = number_format($value, $formField->decimals, ',', '');
									}
									$this->outputCharset($value . ';');
								} else {
									// Default case : String value
									$this->outputCharset('"' . $value . '";');
								}
							}
						}
						$this->outputCharset("\n");
						$count ++;
					}

					// Check we have read everything
					if ($count == $total) {
						$finished = true;
					}

					$page ++;
				}
			}
		} else {
			$this->outputCharset('// No Permissions');
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
		$user = $userSession->user;

		$websiteSession = new Zend_Session_Namespace('website');
		$schema = $websiteSession->schema;

		// Configure memory and time limit because the program ask a lot of resources
		$configuration = Zend_Registry::get("configuration");
		ini_set("memory_limit", $configuration->getConfig('memory_limit', '1024M'));
		ini_set("max_execution_time", $configuration->getConfig('max_execution_time', '480'));
		$maxLines = 5000;

		// Define the header of the response
		$charset = $configuration->getConfig('csvExportCharset', 'UTF-8');
		$this->getResponse()->setHeader('Content-Type', 'application/vnd.google-earth.kml+xml;charset=' . $charset . ';application/force-download;', true);
		$this->getResponse()->setHeader('Content-disposition', 'attachment; filename=DataExport_' . date('dmy_Hi') . '.kml', true);

		if (($schema == 'RAW_DATA' && $user->isAllowed('EXPORT_RAW_DATA')) || ($schema == 'HARMONIZED_DATA' && $user->isAllowed('EXPORT_HARMONIZED_DATA'))) {

			$websiteSession = new Zend_Session_Namespace('website');
			$select = $websiteSession->SQLSelect;
			$from = $websiteSession->SQLFrom;
			$where = $websiteSession->SQLWhere;
			$locationField = $websiteSession->locationField;

			$sql = $select . ', ST_AsKML(' . $locationField->columnName . ') AS KML ' . $from . $where;

			// Count the number of lines
			$total = $websiteSession->count;
			$this->logger->debug('Expected lines : ' . $total);

			if ($sql == null) {
				$this->outputCharset('// No Data');
			} else if ($total > 65535) {
				$this->outputCharset('// Too many result lines');
			} else {

				// Retrive the session-stored info
				$resultColumns = $websiteSession->resultColumns; // array of TableField

				// Prepare the needed traductions and the form info
				$traductions = array();
				foreach ($resultColumns as $tableField) {

					$key = strtolower($tableField->getName());

					// Get the full description of the form field
					$formFields[$key] = $this->genericService->getTableToFormMapping($tableField);
				}

				// Display the default message
				$this->outputCharset('<?xml version="1.0" encoding="UTF-8"?>' . "\n");
				$this->outputCharset('<kml xmlns="http://www.opengis.net/kml/2.2">' . "\n");
				$this->outputCharset('<Document>' . "\n");

				// Get the order parameters
				$sort = $this->getRequest()->getPost('sort');
				$sortDir = $this->getRequest()->getPost('dir');

				$filter = "";

				if ($sort != "") {
					// $sort contains the form format and field
					$split = explode("__", $sort);
					$formField = new Application_Object_Metadata_FormField();
					$formField->format = $split[0];
					$formField->data = $split[1];
					$tableField = $this->genericService->getFormToTableMapping($schema, $formField);
					$key = $tableField->getName();
					$filter .= " ORDER BY " . $key . " " . $sortDir . ", id";
				} else {
					$filter .= " ORDER BY id";
				}

				// Define the max number of lines returned
				$limit = " LIMIT " . $maxLines . " ";

				$count = 0;
				$page = 0;
				$finished = false;
				while (!$finished) {

					// Define the position of the cursor in the dataset
					$offset = " OFFSET " . ($page * $maxLines) . " ";

					// Execute the request
					$this->logger->debug('reading data ... page ' . $page);
					$result = $this->genericModel->executeRequest($sql . $filter . $limit . $offset);

					// Export the lines of data
					foreach ($result as $line) {

						$this->outputCharset("<Placemark>");

						$this->outputCharset($line['kml']);

						$this->outputCharset("<ExtendedData>");
						foreach ($resultColumns as $tableField) {

							$key = strtolower($tableField->getName());
							$value = $line[$key];
							$formField = $formFields[$key];
							$label = $value;

							if ($value !== null) {
								if ($tableField->type === "CODE") {
									// Manage code traduction
									$label = $this->getLabelCache($tableField, $value);
								} else if ($tableField->type === "ARRAY") {
									// Split the array items
									$arrayValues = explode(",", preg_replace("@[{-}]@", "", $value));
									$label = '';
									foreach ($arrayValues as $arrayValue) {
										$label .= $this->getLabelCache($tableField, $arrayValue);
										$label .= ',';
									}
									if ($label != '') {
										$label = substr($label, 0, -1);
									}
									$label = '[' . $label . ']';
								} else if ($formField->inputType === "NUMERIC") {
									// Numeric value
									if ($formField->decimals !== null && $formField->decimals !== "") {
										$label = number_format($value, $formField->decimals);
									}
								}
							}

							$this->outputCharset('<Data name="' . $formField->label . '">');
							$this->outputCharset('<value>' . $label . '</value>');
							$this->outputCharset('</Data>');
						}
						$this->outputCharset("</ExtendedData>");

						$this->outputCharset("</Placemark>");

						$this->outputCharset("\n");
						$count ++;
					}

					// Check we have read everything
					if ($count == $total) {
						$finished = true;
					}

					$page ++;
				}

				$this->outputCharset('</Document>' . "\n");
				$this->outputCharset('</kml>' . "\n");
			}
		} else {
			$this->outputCharset('// No Permissions');
		}

		$this->_helper->layout()->disableLayout();
		$this->_helper->viewRenderer->setNoRender();
	}

	/**
	 * Returns a geoJSON file corresponding to the requested data.
	 */
	public function geojsonExportAction() {
		$this->logger->debug('geojsonExportAction');

		$userSession = new Zend_Session_Namespace('user');
		$user = $userSession->user;

		$websiteSession = new Zend_Session_Namespace('website');
		$schema = $websiteSession->schema;

		// Configure memory and time limit because the program ask a lot of resources
		$configuration = Zend_Registry::get("configuration");
		ini_set("memory_limit", $configuration->getConfig('memory_limit', '1024M'));
		ini_set("max_execution_time", $configuration->getConfig('max_execution_time', '480'));
		$maxLines = 5000;

		// Define the header of the response
		$charset = $configuration->getConfig('csvExportCharset', 'UTF-8');
		$this->getResponse()->setHeader('Content-Type', 'application/json;charset=' . $charset . ';application/force-download;', true);
		$this->getResponse()->setHeader('Content-disposition', 'attachment; filename=DataExport_' . date('dmy_Hi') . '.geojson', true);

		if (($schema == 'RAW_DATA' && $user->isAllowed('EXPORT_RAW_DATA')) || ($schema == 'HARMONIZED_DATA' && $user->isAllowed('EXPORT_HARMONIZED_DATA'))) {

			$websiteSession = new Zend_Session_Namespace('website');
			$select = $websiteSession->SQLSelect;
			$from = $websiteSession->SQLFrom;
			$where = $websiteSession->SQLWhere;
			$locationField = $websiteSession->locationField;

			$sql = $select . ', ST_AsGeoJSON(' . $locationField->columnName . ') AS geojson ' . $from . $where;

			// Count the number of lines
			$total = $websiteSession->count;
			$this->logger->debug('Expected lines : ' . $total);

			if ($sql == null) {
				$this->outputCharset('// No Data');
			} else if ($total > 65535) {
				$this->outputCharset('// Too many result lines');
			} else {

				// Retrive the session-stored info
				$resultColumns = $websiteSession->resultColumns; // array of TableField

				// Prepare the needed traductions and the form info
				$traductions = array();
				foreach ($resultColumns as $tableField) {

					$key = strtolower($tableField->getName());

					// Get the full description of the form field
					$formFields[$key] = $this->genericService->getTableToFormMapping($tableField);
				}

				// Display the default message
				$this->outputCharset('{ "type": "FeatureCollection",' . "\n");
				$this->outputCharset(' "features": [' . "\n");

				// Get the order parameters
				$sort = $this->getRequest()->getPost('sort');
				$sortDir = $this->getRequest()->getPost('dir');

				$filter = "";

				if ($sort != "") {
					// $sort contains the form format and field
					$split = explode("__", $sort);
					$formField = new Application_Object_Metadata_FormField();
					$formField->format = $split[0];
					$formField->data = $split[1];
					$tableField = $this->genericService->getFormToTableMapping($schema, $formField);
					$key = $tableField->getName();
					$filter .= " ORDER BY " . $key . " " . $sortDir . ", id";
				} else {
					$filter .= " ORDER BY id";
				}

				// Define the max number of lines returned
				$limit = " LIMIT " . $maxLines . " ";

				$count = 0;
				$page = 0;
				$finished = false;
				while (!$finished) {

					// Define the position of the cursor in the dataset
					$offset = " OFFSET " . ($page * $maxLines) . " ";

					// Execute the request
					$this->logger->debug('reading data ... page ' . $page);
					$result = $this->genericModel->executeRequest($sql . $filter . $limit . $offset);

					// Export the lines of data
					foreach ($result as $line) {

						$this->outputCharset('{"type": "Feature", ');
						$this->outputCharset('"geometry": ' . $line['geojson'] . ', ');
						$this->outputCharset('"properties": {');
						foreach ($resultColumns as $tableField) {

							$key = strtolower($tableField->getName());
							$value = $line[$key];
							$formField = $formFields[$key];

							$label = $value;

							if ($value !== null) {
								if ($tableField->type === "CODE") {
									// Manage code traduction
									$label = $this->getLabelCache($tableField, $value);
								} else if ($tableField->type === "ARRAY") {
									// Split the array items
									$arrayValues = explode(",", preg_replace("@[{-}]@", "", $value));
									$label = '';
									foreach ($arrayValues as $arrayValue) {

										$label .= $this->getLabelCache($tableField, $arrayValue);
										$label .= ',';
									}
									if ($label != '') {
										$label = substr($label, 0, -1);
									}
									$label = '[' . $label . ']';
								} else if ($formField->inputType === "NUMERIC") {
									// Numeric value
									if ($formField->decimals !== null && $formField->decimals !== "") {
										$label = number_format($value, $formField->decimals);
									}
								}
							}

							$this->outputCharset('"' . $formField->label . '": "' . $label . '", ');
						}
						$this->outputCharset("}");

						$this->outputCharset("},");

						$this->outputCharset("\n");
						$count ++;
					}

					// Check we have read everything
					if ($count == $total) {
						$finished = true;
					}

					$page ++;
				}

				$this->outputCharset(']' . "\n");
				$this->outputCharset('}' . "\n");
			}
		} else {
			$this->outputCharset('// No Permissions');
		}

		$this->_helper->layout()->disableLayout();
		$this->_helper->viewRenderer->setNoRender();
	}

	/**
	 * Convert and display the UTF-8 encoded string to the configured charset.
	 *
	 * @param $output The
	 *        	string to encode and to display
	 */
	protected function outputCharset($output) {
		$configuration = Zend_Registry::get("configuration");
		$charset = $configuration->getConfig('csvExportCharset', 'UTF-8');
		echo iconv("UTF-8", $charset, $output);
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

		$tree = $this->metadataModel->getTreeChildren($unit, $code, $depth);

		// Send the result as a JSON String
		$json = '{"success":true,';
		$json .= '"data":[' . $tree->toJSON() . ']';
		$json .= '}';
		echo $json;

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

		$unit = $this->getRequest()->getParam('unit');
		$code = $this->getRequest()->getPost('node');
		$depth = $this->getRequest()->getParam('depth');

		$tree = $this->metadataModel->getTaxrefChildren($unit, $code, $depth);

		// Send the result as a JSON String
		$json = '{"success":true,' . '"data":[' . $tree->toJSON() . ']' . '}';

		echo $json;

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
		$query = pg_escape_string($this->getRequest()->getParam('query'));

		$this->logger->debug('$unit : ' . $unit);
		$this->logger->debug('$query : ' . $query);

		$codes = $this->metadataModel->getDynamodeLabels($unit, null, $query);

		// Send the result as a JSON String
		$json = '{"success":true';
		$json .= ', "codes":[';
		foreach ($codes as $code => $label) {
			$json .= '{"code":' . json_encode($code) . ', "label":' . json_encode($label) . '},';
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
		$this->logger->debug('ajaxgetcodesAction');

		$unit = $this->getRequest()->getParam('unit');
		$query = $this->getRequest()->getParam('query');

		$this->logger->debug('$unit : ' . $unit . ' $query : ' . $query);

		$codes = $this->metadataModel->getModeLabels($unit, null, $query);

		// Send the result as a JSON String
		$json = '{"success":true';
		$json .= ', "codes":[';
		foreach ($codes as $code => $label) {
			$json .= '{"code":' . json_encode((string) $code) . ', "label":' . json_encode($label) . '},';
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
	 * AJAX function : Return the list of available codes for a MODE unit and a filter text.
	 *
	 * @return JSON.
	 */
	public function ajaxgettreecodesAction() {
		$this->logger->debug('ajaxgettreecodesAction');

		$unit = $this->getRequest()->getParam('unit');
		$query = pg_escape_string($this->getRequest()->getParam('query'));
		$start = $this->getRequest()->getParam('start');
		$limit = $this->getRequest()->getParam('limit');

		$this->logger->debug('$unit : ' . $unit);
		$this->logger->debug('$query : ' . $query);
		$this->logger->debug('$start : ' . $start);
		$this->logger->debug('$limit : ' . $limit);

		$codes = $this->metadataModel->getTreeModes($unit, $query, $start, $limit);

		if (count($codes) < $limit) {
			// optimisation
			$count = count($codes);
		} else {
			$count = $this->metadataModel->getTreeModesCount($unit, $query);
		}

		// Send the result as a JSON String
		$json = '{"success":true';
		$json .= ', "rows":[';
		foreach ($codes as $code => $label) {
			$json .= '{"code":' . json_encode($code) . ', "label":' . json_encode($label) . '},';
		}
		if (!empty($codes)) {
			$json = substr($json, 0, -1);
		}
		$json .= ']';
		$json .= ', "results":' . $count;
		$json .= '}';

		echo $json;

		// No View, we send directly the JSON
		$this->_helper->layout()->disableLayout();
		$this->_helper->viewRenderer->setNoRender();
		$this->getResponse()->setHeader('Content-type', 'application/json');
	}

	/**
	 * AJAX function : Return the list of available codes for a taxref and a filter text.
	 *
	 * @return JSON.
	 */
	public function ajaxgettaxrefcodesAction() {
		$this->logger->debug('ajaxgettaxrefcodesAction');

		$unit = $this->getRequest()->getParam('unit');
		$query = pg_escape_string($this->getRequest()->getParam('query'));
		$query = $this->genericService->removeAccents($query);
		$start = $this->getRequest()->getParam('start');
		$limit = $this->getRequest()->getParam('limit');

		$this->logger->debug('$query : ' . $query);
		$this->logger->debug('$start : ' . $start);
		$this->logger->debug('$limit : ' . $limit);

		$taxrefs = $this->metadataModel->getTaxrefModes($unit, $query, $start, $limit);

		if (count($taxrefs) < $limit) {
			// optimisation
			$count = count($taxrefs);
		} else {
			$count = $this->metadataModel->getTaxrefModesCount($unit, $query);
		}

		// Send the result as a JSON String
		$json = '{"success":true';
		$json .= ', "rows":[';
		foreach ($taxrefs as $taxref) {

			$json .= '{"code":' . json_encode($taxref->code);
			$json .= ', "label":' . json_encode($taxref->name) . '';
			$json .= ', "isReference":' . json_encode($taxref->isReference) . '';
			$json .= ', "vernacularName":' . json_encode($taxref->vernacularName) . '},';
		}
		if (!empty($taxrefs)) {
			$json = substr($json, 0, -1);
		}
		$json .= ']';
		$json .= ', "results":' . $count;
		$json .= '}';

		echo $json;

		// No View, we send directly the JSON
		$this->_helper->layout()->disableLayout();
		$this->_helper->viewRenderer->setNoRender();
		$this->getResponse()->setHeader('Content-type', 'application/json');
	}

	/**
	 * AJAX function : Return the list of a location information.
	 *
	 * @return JSON.
	 */
	public function ajaxgetlocationinfoAction() {
		$this->logger->debug('ajaxgetlocationinfoAction');

		$lon = $this->getRequest()->getParam('LON');
		$lat = $this->getRequest()->getParam('LAT');
		$sessionId = session_id();

		if ($this->resultLocationModel->getResultsCount($sessionId) == 0) {
			echo '{"success":true, "id":null, "title":null, "hasChild":false, "columns":[], "fields":[], "data":[]}';
		} else {

			$websiteSession = new Zend_Session_Namespace('website');
			$schema = $websiteSession->schema; // the schema used
			$queryObject = $websiteSession->queryObject; // the last query done

			$tables = $this->genericService->getAllFormats($schema, $queryObject); // Extract the location table from the last query
			$locationField = $this->metadataModel->getGeometryField($schema, array_keys($tables)); // Extract the location field from the available tables
			$locationTableInfo = $this->metadataModel->getTableFormat($schema, $locationField->format); // Get info about the location table

			$locations = $this->resultLocationModel->getLocationInfo($sessionId, $lon, $lat);

			if (!empty($locations)) {
				// we have at least one plot found

				// The id is used to avoid to display two time the same result (it's a id for the result dataset)
				$id = array(
					'Results'
				); // A small prefix is required here to avoid a conflict between the id when the result contain only one result
				   // The columns config to setup the grid columnModel
				$columns = array();
				// The columns max length to setup the column width
				$columnsMaxLength = array();
				// The fields config to setup the store reader
				$locationFields = array(
					'id'
				); // The id must stay the first field
				   // The data to full the store
				$locationsData = array();

				foreach ($locations as $locationsIndex => $location) {
					$locationData = array();

					// Get the locations identifiers
					$key = 'SCHEMA/' . $schema . '/FORMAT/' . $locationTableInfo->format;
					$key .= '/' . $location['pk'];
					$id[] = $key;
					$locationData[] = $key;

					$this->logger->debug('$key : ' . $key);

					// Remove the pk of the available columns
					unset($location['pk']);

					// Get the other fields
					// Setup the location data and the column max length
					foreach ($location as $columnName => $value) {
						$locationData[] = $value;
						if (empty($columnsMaxLength[$columnName])) {
							$columnsMaxLength[$columnName] = array();
						}
						$columnsMaxLength[$columnName][] = strlen($value);
					}
					// Setup the fields and columns config
					if ($locationsIndex === (count($locations) - 1)) {

						// Get the table fields
						$tableFields = $this->metadataModel->getTableFields($schema, $locationTableInfo->format, null);
						$tFOrdered = array();
						foreach ($tableFields as $tableField) {
							$tFOrdered[strtoupper($tableField->columnName)] = $tableField;
						}
						foreach ($location as $columnName => $value) {
							$tableField = $tFOrdered[strtoupper($columnName)];
							// Set the column model and the location fields
							$dataIndex = $tableField->format . '__' . $tableField->data;
							// Adds the column header to prevent it from being truncated too and 2 for the header margins
							$columnsMaxLength[$columnName][] = strlen($tableField->label) + 2;
							$column = array(
								'header' => $tableField->label,
								'dataIndex' => $dataIndex,
								'editable' => false,
								'tooltip' => $tableField->definition,
								'width' => max($columnsMaxLength[$columnName]) * 7,
								'type' => $tableField->type
							);
							$columns[] = $column;
							$locationFields[] = $dataIndex;
						}
					}
					$locationsData[] = $locationData;
				}

				// We must sort the array here because it can't be done
				// into the mapfile sql request to avoid a lower performance
				sort($id);

				// Check if the location table has a child table
				$hasChild = false;
				$children = $this->metadataModel->getChildrenTableLabels($locationTableInfo);
				if (!empty($children)) {
					$hasChild = true;
				}

				echo '{"success":true' . ', "id":' . json_encode(implode('', $id)) . ', "title":' . json_encode($locationTableInfo->label . ' (' . count($locationsData) . ')') . ', "hasChild":' . json_encode($hasChild) . ', "columns":' . json_encode($columns) . ', "fields":' . json_encode($locationFields) . ', "data":' . json_encode($locationsData) . '}';
			} else {
				echo '{"success":true, "id":null, "title":null, "hasChild":false, "columns":[], "fields":[], "data":[]}';
			}
		}
		// No View, we send directly the output
		$this->_helper->layout()->disableLayout();
		$this->_helper->viewRenderer->setNoRender();
	}

	/**
	 * Clean the result location table.
	 */
	public function ajaxresetresultlocationAction() {
		$sessionId = session_id();
		$this->resultLocationModel->cleanPreviousResults($sessionId);

		echo '{"success":true}';

		$this->_helper->layout()->disableLayout();
		$this->_helper->viewRenderer->setNoRender();
		$this->getResponse()->setHeader('Content-type', 'application/json');
	}
}
