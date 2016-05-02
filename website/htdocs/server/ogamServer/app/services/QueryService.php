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
 * The Query Service.
 *
 * This service handles the queries used to feed the query interface with ajax requests.
 *
 * @package Application_Service
 */
class Application_Service_QueryService {

	/**
	 * The logger.
	 *
	 * @var Zend_Log
	 */
	var $logger;

	/**
	 * The models.
	 */
	var $metadataModel;
	var $genericModel;
	var $resultLocationModel;
	var $predefinedRequestModel;

	/**
	 * The generic service
	 */
	var $genericService;

	/**
	 * The schema.
	 */
	var $schema;

	/**
	 * Constructor.
	 *
	 * @param String $schema
	 *        	the schema
	 */
	function Application_Service_QueryService($schema) {

		// Initialise the logger
		$this->logger = Zend_Registry::get("logger");

		// Initialise the metadata models
		$this->metadataModel = new Application_Model_Metadata_Metadata();
		$this->genericModel = new Application_Model_Generic_Generic();
		$this->resultLocationModel = new Application_Model_Mapping_ResultLocation();
		$this->predefinedRequestModel = new Application_Model_Website_PredefinedRequest();
		$this->layersModel = new Application_Model_Mapping_Layers();
		$this->servicesModel = new Application_Model_Mapping_Services();

		// The service used to build generic info from the metadata
		$this->genericService = new Application_Service_GenericService();

		// Configure the schema
		$this->schema = $schema;
	}

	/**
	 * Generate the JSON structure corresponding to a list of result and criteria columns.
	 *
	 * @param Array[FormFormat] $forms
	 *        	the list of FormFormat elements
	 */
	private function _generateQueryFormsJSON($forms) {
		$json = '{"success":true,"data":[';

		foreach ($forms as $form) {
			// Add the criteria
			$json .= '{' . $form->toJSON() . ',"criteria":[';
			foreach ($form->criteriaList as $field) {
				$json .= '{' . $field->toCriteriaJSON();
				// For the RANGE field, get the min and max values
				if ($field->type == "NUMERIC" && $field->subtype == "RANGE") {
					$range = $this->metadataModel->getRange($field->unit);
					$json .= ',"params":{"min":' . $range->min . ',"max":' . $range->max . '}';
				}
				$json .= '},';
			}
			if (count($form->criteriaList) > 0) {
				$json = substr($json, 0, -1);
			}
			// Add the columns
			$json .= '],"columns":[';
			foreach ($form->resultsList as $field) {
				$json .= '{' . $field->toResultJSON() . '},';
			}
			if (count($form->resultsList) > 0) {
				$json = substr($json, 0, -1);
			}
			$json .= ']},';
		}
		if (count($forms) > 0) {
			$json = substr($json, 0, -1);
		}
		$json = $json . ']}';

		return $json;
	}

	/**
	 * Convert a java/javascript-style date format to a PHP date format.
	 *
	 * @param String $format
	 *        	the format in java style
	 * @return String the format in PHP style
	 */
	private function _convertDateFormat($format) {
		$format = str_replace("yyyy", "Y", $format);
		$format = str_replace("yy", "y", $format);
		$format = str_replace("MMMMM", "F", $format);
		$format = str_replace("MMMM", "F", $format);
		$format = str_replace("MMM", "M", $format);
		$format = str_replace("MM", "m", $format);
		$format = str_replace("EEEEEE", "l", $format);
		$format = str_replace("EEEEE", "l", $format);
		$format = str_replace("EEEE", "l", $format);
		$format = str_replace("EEE", "D", $format);
		$format = str_replace("dd", "d", $format);
		$format = str_replace("HH", "H", $format);
		$format = str_replace("hh", "h", $format);
		$format = str_replace("mm", "i", $format);
		$format = str_replace("ss", "s", $format);
		$format = str_replace("A", "a", $format);
		$format = str_replace("S", "u", $format);

		return $format;
	}

	/**
	 * Generate the JSON structure corresponding to a field to edit.
	 *
	 * Fill the JSON object with complementary information from the metadata and referential databases (labels).
	 *
	 * @param FormField $field
	 *        	a form field
	 */
	private function _generateEditFieldJSON($formField) {
		$json = "{";

		// Set the default value
		if ($formField->value == null) {
			if ($formField->defaultValue == '%LOGIN%') {

				// Set the currently loggued user
				$userSession = new Zend_Session_Namespace('user');
				$user = $userSession->user;
				$formField->value = $user->login;
			} else if ($formField->defaultValue == '%TODAY%') {

				// Set the current date
				if ($formField->mask != null) {
					$formField->value = date($this->_convertDateFormat($formField->mask));
				} else {
					$formField->value = date($this->_convertDateFormat('yyyy-MM-dd'));
				}
			} else {
				$formField->value = $formField->defaultValue;
			}
		}

		$json .= $formField->toEditJSON();

		// For the RANGE field, get the min and max values
		if ($formField->type == "NUMERIC" && $formField->subtype == "RANGE") {
			$range = $this->metadataModel->getRange($formField->unit);
			$json .= ',"params":{"min":' . $range->min . ',"max":' . $range->max . '}';
		}
		$json .= "},";

		return $json;
	}

	/**
	 * Generate the JSON structure corresponding to a list of edit fields.
	 *
	 * @param Application_Object_Generic_DataObject $data
	 *        	the data object to edit
	 */
	private function _generateEditFormJSON($data) {
		$json = '{"success":true,"data":[';

		foreach ($data->getInfoFields() as $tablefield) {
			$formField = $this->genericService->getTableToFormMapping($tablefield); // get some info about the form
			if (!empty($formField)) {
				$formField->isPK = "1";
				$formField->value = $tablefield->value;
				$formField->valueLabel = $tablefield->valueLabel;
				$formField->editable = $tablefield->isEditable;
				$formField->insertable = $tablefield->isInsertable;
				$formField->required = !$tablefield->isCalculated; // If the field is not calculated and if it is part of the key
				$formField->data = $tablefield->data; // The name of the data is the table one
				$formField->format = $tablefield->format; // The name of the data is the table one

				$json .= $this->_generateEditFieldJSON($formField, $tablefield);
			}
		}
		foreach ($data->getEditableFields() as $tablefield) {
			$formField = $this->genericService->getTableToFormMapping($tablefield); // get some info about the form
			if (!empty($formField)) {
				$formField->isPK = "0";
				$formField->value = $tablefield->value;
				$formField->valueLabel = $tablefield->valueLabel;
				$formField->editable = $tablefield->isEditable;
				$formField->insertable = $tablefield->isInsertable;
				$formField->required = $tablefield->isMandatory;
				$formField->data = $tablefield->data; // The name of the data is the table one
				$formField->format = $tablefield->format; // The name of the data is the table one

				$json .= $this->_generateEditFieldJSON($formField, $tablefield);
			}
		}

		$json = substr($json, 0, -1);

		$json .= ']}';

		return $json;
	}

	/**
	 * AJAX function : Get the predefined request.
	 *
	 * @param String $requestName
	 *        	The request name
	 * @return Forms
	 */
	private function _getPredefinedRequest($requestName) {
		$this->logger->debug('_getPredefinedRequest');

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

				if (array_key_exists($criteria->getName(), $savedRequest->criteriaList)) {
					$criteria->isDefaultCriteria = '1';
					$criteria->defaultValue = $savedRequest->criteriaList[$criteria->getName()]->value;
				}
			}

			foreach ($form->resultsList as $result) {
				$result->isDefaultResult = '0';

				if (array_key_exists($result->getName(), $savedRequest->resultsList)) {
					$result->isDefaultResult = '1';
				}
			}
		}

		// return the forms
		return $forms;
	}

	/**
	 * Get the list of available datasets.
	 *
	 * @return JSON The list of datasets
	 */
	public function getDatasets() {
		$datasetIds = $this->metadataModel->getDatasetsForDisplay();

		$json = '[ ';

		foreach ($datasetIds as $dataset) {
			$json .= '{' . $dataset->toJSON() . '},';
		}
		$json = substr($json, 0, -1); // remove last comma

		$json .= ']';

		return $json;
	}

	/**
	 * Get the list of available forms and criterias for the dataset.
	 *
	 * @param String $datasetId
	 *        	the identifier of the selected dataset
	 * @param String $requestName
	 *        	the name of the predefined request if available
	 * @return JSON.
	 */
	public function getQueryForm($datasetId, $requestName) {
		$this->logger->debug('getQueryForm');

		if (!empty($requestName)) {
			// If request name is filled then we are coming from the predefined request screen
			// and we build the form corresponding to the request
			$forms = $this->_getPredefinedRequest($requestName);
		} else {
			// Otherwise we get all the fields available with their default value
			$forms = $this->metadataModel->getForms($datasetId, $this->schema);
			foreach ($forms as $form) {
				// Fill each form with the list of criterias and results
				$form->criteriaList = $this->metadataModel->getFormFields($datasetId, $form->format, $this->schema, 'criteria');
				$form->resultsList = $this->metadataModel->getFormFields($datasetId, $form->format, $this->schema, 'result');
			}
		}

		return $this->_generateQueryFormsJSON($forms);
	}

	/**
	 * Get the form fields for a data to edit.
	 *
	 * @param Application_Object_Generic_DataObject $data
	 *        	the data object to edit
	 * @return JSON.
	 */
	public function getEditForm($data) {
		$this->logger->debug('getEditForm');

		return $this->_generateEditFormJSON($data);
	}

	/**
	 * Get the description of the columns of the result of the query.
	 *
	 * @param String $datasetId
	 *        	the dataset identifier
	 * @param FormQuery $formQuery
	 *        	the form request object
	 * @param Boolean $withSQL
	 *        	indicate that we want the server to return the genetared SQL
	 * @return JSON
	 */
	public function getResultColumns($datasetId, $formQuery, $withSQL = false) {
		$this->logger->debug('getResultColumns');

		$json = "";

		// Configure the projection systems
		$configuration = Zend_Registry::get("configuration");
		$visualisationSRS = $configuration->srs_visualisation;

		// Transform the form request object into a table data object
		$queryObject = $this->genericService->getFormQueryToTableData($this->schema, $formQuery);

		if (count($formQuery->results) === 0) {
			$json = '{"success": false, "errorMessage": "At least one result column should be selected"}';
		} else {

			// Generate the SQL Request
			$select = $this->genericService->generateSQLSelectRequest($this->schema, $queryObject);
			$from = $this->genericService->generateSQLFromRequest($this->schema, $queryObject);
			$where = $this->genericService->generateSQLWhereRequest($this->schema, $queryObject);
			$SQLPkey = $this->genericService->generateSQLPrimaryKey($this->schema, $queryObject);

			$this->logger->debug('$select : ' . $select);
			$this->logger->debug('$from : ' . $from);
			$this->logger->debug('$where : ' . $where);

			// Clean previously stored results
			$sessionId = session_id();
			$this->logger->debug('SessionId : ' . $sessionId);
			$this->resultLocationModel->cleanPreviousResults($sessionId);

			// Identify the field carrying the location information
			$tables = $this->genericService->getAllFormats($this->schema, $queryObject);
			$locationField = $this->metadataModel->getGeometryField($this->schema, array_keys($tables));
			$locationTableInfo = $this->metadataModel->getTableFormat($this->schema, $locationField->format);

			// Run the request to store a temporary result table (for the web mapping)
			$this->resultLocationModel->fillLocationResult($from . $where, $sessionId, $locationField, $locationTableInfo, $visualisationSRS);

			// Calculate the number of lines of result
			$countResult = $this->genericModel->executeRequest("SELECT COUNT(*) as count " . $from . $where);

			// TODO : Move this part somewhere else

			// Get the website session
			$websiteSession = new Zend_Session_Namespace('website');
			// Store the metadata in session for subsequent requests
			$websiteSession->resultColumns = $queryObject->editableFields;
			$websiteSession->datasetId = $datasetId;
			$websiteSession->locationField = $locationField;
			$websiteSession->SQLSelect = $select;
			$websiteSession->SQLFrom = $from;
			$websiteSession->SQLWhere = $where;
			$websiteSession->SQLPkey = $SQLPkey;
			$websiteSession->queryObject = $queryObject;
			$websiteSession->count = $countResult[0]['count']; // result count
			$websiteSession->schema = $this->schema;

			// Send the result as a JSON String
			$json = '{"success":true,';

			// Metadata
			$json .= '"columns":[';
			// Get the titles of the columns
			foreach ($formQuery->results as $formField) {

				// Get the full description of the form field
				$formField = $this->metadataModel->getFormField($formField->format, $formField->data);

				// Export the JSON
				$json .= '{' . $formField->toJSON() . ', "hidden":false},';
			}
			// Add the identifier of the line
			$json .= '{"name":"id","label":"Identifier of the line","inputType":"TEXT","definition":"The plot identifier", "hidden":true}';
			// Add the plot location in WKT
			$json .= ',{"name":"location_centroid","label":"Location centroid","inputType":"TEXT","definition":"The plot location", "hidden":true}';

			// Right management : add the provider id of the data
			$userSession = new Zend_Session_Namespace('user');
			if (!$userSession->user->isAllowed('DATA_EDITION_OTHER_PROVIDER')) {
				$json .= ',{"name":"_provider_id","label":"Provider","inputType":"TEXT","definition":"The provider", "hidden":true}';
			}

			$json .= ']';

			if ($withSQL) {
				$json .= ', "SQL":' . json_encode($select . $from . $where);
			}
			$json .= '}';
		}

		return $json;
	}

	/**
	 * Get a page of query result data.
	 *
	 * @param Integer $start
	 *        	the start line number
	 * @param Integer $length
	 *        	the size of a page
	 * @param String $sort
	 *        	the sort column
	 * @param String $sortDir
	 *        	the sort direction (ASC or DESC)
	 * @return JSON
	 */
	public function getResultRows($start, $length, $sort, $sortDir) {
		$this->logger->debug('getResultRows');
		$json = "";

		try {

			// Retrieve the SQL request from the session
			$websiteSession = new Zend_Session_Namespace('website');
			$select = $websiteSession->SQLSelect;
			// Il ne doit pas y avoir de DISTINCT pour pouvoir faire un Index Scan
			$select = str_replace(" DISTINCT", "", $select);

			$from = $websiteSession->SQLFrom;
			$where = $websiteSession->SQLWhere;

			// Subquery (for getting desired rows)
			$pKey = $websiteSession->SQLPkey;
			$subquery = "SELECT " . $pKey . $from . $where;

			$order = "";
			if ($sort != "") {
				// $sort contains the form format and field
				$split = explode("__", $sort);
				$formField = new Application_Object_Metadata_FormField();
				$formField->format = $split[0];
				$formField->data = $split[1];
				$tableField = $this->genericService->getFormToTableMapping($this->schema, $formField);
				$key = $tableField->format . "." . $tableField->data;
				$order .= " ORDER BY " . $key . " " . $sortDir;
			} else {
				$order .= " ORDER BY " . $pKey;
			}

			$filter = "";
			if (!empty($length)) {
				$filter .= " LIMIT " . $length;
			}
			if (!empty($start)) {
				$filter .= " OFFSET " . $start;
			}

			// Build complete query
			$query = $select . $from . " WHERE (" . $pKey . ") IN (" . $subquery . $order . $filter . ")" . $order;

			// Execute the request
			$result = $this->genericModel->executeRequest($query);

			// Retrive the session-stored info
			$resultColumns = $websiteSession->resultColumns; // array of TableField
			$countResult = $websiteSession->count;

			// Send the result as a JSON String
			$json = '{"success":true,';
			$json .= '"total":' . $countResult . ',';
			$json .= '"rows":[';
			foreach ($result as $line) {
				$json .= '[';

				foreach ($resultColumns as $tableField) {

					$key = strtolower($tableField->getName());
					$value = $line[$key];

					// Manage code traduction
					if ($tableField->type === "CODE" && $value != "") {
						$label = $this->genericService->getValueLabel($tableField, $value);
						$json .= json_encode($label == null ? '' : $label) . ',';
					} else if ($tableField->type === "ARRAY" && $value != "") {
						// Split the array items
						$arrayValues = explode(",", preg_replace("@[{-}]@", "", $value));
						$label = '';
						foreach ($arrayValues as $arrayValue) {
							$label .= $this->genericService->getValueLabel($tableField, $arrayValue);
							$label .= ',';
						}
						if ($label != '') {
							$label = substr($label, 0, -1);
						}
						$label = '[' . $label . ']';

						$json .= json_encode($label == null ? '' : $label) . ',';
					} else {
						$json .= json_encode($value) . ',';
					}
				}

				// Add the line id
				$json .= json_encode($line['id']);

				// Add the plot location in WKT
				$json .= ',' . json_encode($line['location_centroid']); // The last column is the location center

				// Right management : add the provider id of the data
				$userSession = new Zend_Session_Namespace('user');
				if (!$userSession->user->isAllowed('DATA_EDITION_OTHER_PROVIDER')) {
					$json .= ',' . json_encode($line['_provider_id']);
				}

				$json .= '],';
			}
			if (sizeof($result) != 0) {
				$json = substr($json, 0, -1);
			}
			$json .= ']}';
		} catch (Exception $e) {
			$this->logger->err('Error while getting result : ' . $e);
			$json = '{"success":false,"errorMessage":"' . json_encode($e->getMessage()) . '"}';
		}

		return $json;
	}

	/**
	 * Decode the identifier
	 *
	 * @param String $id
	 * @return Array the decoded id
	 */
	private function _decodeId($id) {
		// Transform the identifier in an array
		$keyMap = array();
		$idElems = explode("/", $id);
		$i = 0;
		$count = count($idElems);
		while ($i < $count) {
			$keyMap[$idElems[$i]] = $idElems[$i + 1];
			$i += 2;
		}
		return $keyMap;
	}

	/**
	 * Get the details associed with a result line (clic on the "detail button").
	 *
	 * @param String $id
	 *        	The identifier of the line
	 * @param String $detailsLayers
	 *        	The names of the layers used to display the images in the detail panel.
	 * @param String $datasetId
	 *        	The identifier of the dataset (to filter data)
	 * @return JSON representing the detail of the result line.
	 */
	public function getDetails($id, $detailsLayers, $datasetId = null) {
		$this->logger->debug('getDetails : ' . $id);
		return json_encode($this->getFullDetailsData($id, $detailsLayers));
	}

	/**
	 * Get the details associed with a result line (clic on the "detail button").
	 *
	 * @param String $id
	 *        	The identifier of the line
	 * @param String $detailsLayers
	 *        	The names of the layers used to display the images in the detail panel.
	 * @param String $datasetId
	 *        	The identifier of the dataset (to filter data)
	 * @param boolean $proxy
	 *        	If true, use the proxy to fetch mapserver
	 * @return array Array that represents the details of the result line.
	 */
	public function getDetailsData($id, $detailsLayers, $datasetId = null, $proxy = true) {
		$this->logger->debug('getDetailsData : ' . $id);

		// Transform the identifier in an array
		$keyMap = $this->_decodeId($id);

		// Prepare a data object to be filled
		$data = $this->genericService->buildDataObject($keyMap['SCHEMA'], $keyMap['FORMAT'], null);

		// Complete the primary key info with the session values
		foreach ($data->infoFields as $infoField) {
			if (!empty($keyMap[$infoField->data])) {
				$infoField->value = $keyMap[$infoField->data];
			}
		}

		// Get the detailled data
		$this->genericModel->getDatum($data);

		// The data ancestors
		$ancestors = $this->genericModel->getAncestors($data);
		$ancestors = array_reverse($ancestors);

		// Look for a geometry object in order to calculate a bounding box
		// Look for the plot location
		$bb = null;
		$bb2 = null;
		$locationTable = null;
		foreach ($data->getFields() as $field) {
			if ($field->type === 'GEOM') {
				// define a bbox around the location
				$bb = Application_Object_Mapping_BoundingBox::createBoundingBox($field->xmin, $field->xmax, $field->ymin, $field->ymax);

				// Prepare an overview bbox
				$bb2 = Application_Object_Mapping_BoundingBox::createBoundingBox($field->xmin, $field->xmax, $field->ymin, $field->ymax, 50000);

				$locationTable = $data;
				break;
			}
		}
		if ($bb == null) {
			foreach ($ancestors as $ancestor) {
				foreach ($ancestor->getFields() as $field) {
					if ($field->type === 'GEOM') {
						// define a bbox around the location
						$bb = Application_Object_Mapping_BoundingBox::createBoundingBox($field->xmin, $field->xmax, $field->ymin, $field->ymax);

						// Prepare an overview bbox
						$bb2 = Application_Object_Mapping_BoundingBox::createBoundingBox($field->xmin, $field->xmax, $field->ymin, $field->ymax, 200000);

						$locationTable = $ancestor;
						break;
					}
				}
			}
		}

		// Defines the mapsserver parameters.
		$mapservParams = '';
		foreach ($locationTable->getInfoFields() as $primaryKey) {
			$mapservParams .= '&' . $primaryKey->columnName . '=' . $primaryKey->value;
		}

		// Title of the detail message
		$dataDetails = array();
		$dataDetails['formats'] = array();

		// List all the formats, starting with the ancestors
		foreach ($ancestors as $ancestor) {
			$ancestorJSON = $this->genericService->datumToDetailJSON($ancestor, $datasetId);
			if ($ancestorJSON !== '') {
				$dataDetails['formats'][] = json_decode($ancestorJSON, true);
			}
		}

		// Add the current data
		$dataJSON = $this->genericService->datumToDetailJSON($data, $datasetId);
		if ($dataJSON !== '') {
			$dataDetails['formats'][] = json_decode($dataJSON, true);
		}

		// Defines the panel title
		$titlePK = '';
		foreach ($data->infoFields as $infoField) {
			if ($titlePK !== '') {
				$titlePK .= '_';
			}
			$titlePK .= $infoField->value;
		}
		$dataInfo = end($dataDetails['formats']);
		$dataDetails['title'] = $dataInfo['title'] . ' (' . $titlePK . ')';

		// Add the localisation maps
		if (!empty($detailsLayers)) {
			if ($detailsLayers[0] != '') {
				$url = array();
				$url = explode(";", ($this->getDetailsMapUrl(empty($detailsLayers) ? '' : $detailsLayers[0], $bb, $mapservParams, $proxy)));

				$dataDetails['maps1'] = array(
					'title' => 'image'
				);

				// complete the array with the urls of maps1
				$dataDetails['maps1']['urls'][] = array();
				$urlCount = count($url);
				for ($i = 0; $i < $urlCount; $i ++) {
					$dataDetails['maps1']['urls'][$i]['url'] = $url[$i];
				}
			}

			if ($detailsLayers[1] != '') {
				$url = array();
				$url = explode(";", ($this->getDetailsMapUrl(empty($detailsLayers) ? '' : $detailsLayers[1], $bb2, $mapservParams, $proxy)));
				$dataDetails['maps2'] = array(
					'title' => 'overview'
				);

				// complete the array with the urls of maps2
				$dataDetails['maps2']['urls'][] = array();
				for ($i = 0; $i < count($url); $i ++) {
					$dataDetails['maps2']['urls'][$i]['url'] = $url[$i];
				}
			}
		}

		return $dataDetails;
	}

	/**
	 * Get the full details (with children) associed with a result line (clic on the "detail button").
	 *
	 * @param String $id
	 *        	The identifier of the line
	 * @param String $detailsLayers
	 *        	The names of the layers used to display the images in the detail panel.
	 * @param String $datasetId
	 *        	The identifier of the dataset (to filter data)
	 * @param boolean $proxy
	 *        	If true, use the proxy to fetch mapserver
	 * @return array Array that represents the details of the result line.
	 */
	public function getFullDetailsData($id, $detailsLayers, $datasetId = null, $proxy = true) {
		$this->logger->debug('getFullDetailsData : ' . $id);

		// Transform the identifier in an array
		$keyMap = $this->_decodeId($id);

		// Prepare a data object to be filled
		$data = $this->genericService->buildDataObject($keyMap['SCHEMA'], $keyMap['FORMAT'], null);

		// Complete the primary key info with the session values
		foreach ($data->infoFields as $infoField) {
			if (!empty($keyMap[$infoField->data])) {
				$infoField->value = $keyMap[$infoField->data];
			}
		}

		// Get the detailled data
		$this->genericModel->getDatum($data);

		// The data ancestors
		$ancestors = $this->genericModel->getAncestors($data);
		$ancestors = array_reverse($ancestors);

		// Look for a geometry object in order to calculate a bounding box
		// Look for the plot location
		$bb = null;
		$bb2 = null;
		$locationTable = null;
		foreach ($data->getFields() as $field) {
			if ($field->type === 'GEOM') {
				// define a bbox around the location
				$bb = Application_Object_Mapping_BoundingBox::createBoundingBox($field->xmin, $field->xmax, $field->ymin, $field->ymax);

				// Prepare an overview bbox
				$bb2 = Application_Object_Mapping_BoundingBox::createBoundingBox($field->xmin, $field->xmax, $field->ymin, $field->ymax, 50000);

				$locationTable = $data;
				break;
			}
		}
		if ($bb == null) {
			foreach ($ancestors as $ancestor) {
				foreach ($ancestor->getFields() as $field) {
					if ($field->type === 'GEOM') {
						// define a bbox around the location
						$bb = Application_Object_Mapping_BoundingBox::createBoundingBox($field->xmin, $field->xmax, $field->ymin, $field->ymax);

						// Prepare an overview bbox
						$bb2 = Application_Object_Mapping_BoundingBox::createBoundingBox($field->xmin, $field->xmax, $field->ymin, $field->ymax, 200000);

						$locationTable = $ancestor;
						break;
					}
				}
			}
		}

		// Defines the mapsserver parameters.
		$mapservParams = '';
		foreach ($locationTable->getInfoFields() as $primaryKey) {
			$mapservParams .= '&' . $primaryKey->columnName . '=' . $primaryKey->value;
		}

		// Title of the detail message
		$dataDetails = array();
		$dataDetails['formats'] = array();

		// List all the formats, starting with the ancestors
		foreach ($ancestors as $ancestor) {
			$ancestorJSON = $this->genericService->datumToDetailJSON($ancestor, $datasetId);
			if ($ancestorJSON !== '') {
				$dataDetails['formats'][] = json_decode($ancestorJSON, true);
			}
		}

		// Add the current data
		$dataJSON = $this->genericService->datumToDetailJSON($data, $datasetId);
		if ($dataJSON !== '') {
			$dataDetails['formats'][] = json_decode($dataJSON, true);
		}

		// Defines the panel title
		$titlePK = '';
		foreach ($data->infoFields as $infoField) {
			if ($titlePK !== '') {
				$titlePK .= '_';
			}
			$titlePK .= $infoField->value;
		}
		$dataInfo = end($dataDetails['formats']);
		$dataDetails['title'] = $dataInfo['title'] . ' (' . $titlePK . ')';

		// Add the localisation maps
		if (!empty($detailsLayers)) {
			if ($detailsLayers[0] != '') {
				$url = array();
				$url = explode(";", ($this->getDetailsMapUrl(empty($detailsLayers) ? '' : $detailsLayers[0], $bb, $mapservParams, $proxy)));

				$dataDetails['maps1'] = array(
					'title' => 'image'
				);

				// complete the array with the urls of maps1
				$dataDetails['maps1']['urls'][] = array();
				$urlCount = count($url);
				for ($i = 0; $i < $urlCount; $i ++) {
					$dataDetails['maps1']['urls'][$i]['url'] = $url[$i];
				}
			}

			if ($detailsLayers[1] != '') {
				$url = array();
				$url = explode(";", ($this->getDetailsMapUrl(empty($detailsLayers) ? '' : $detailsLayers[1], $bb2, $mapservParams, $proxy)));
				$dataDetails['maps2'] = array(
					'title' => 'overview'
				);

				// complete the array with the urls of maps2
				$dataDetails['maps2']['urls'][] = array();
				for ($i = 0; $i < count($url); $i ++) {
					$dataDetails['maps2']['urls'][$i]['url'] = $url[$i];
				}
			}
		}
		// Prepare a data object to be filled
		$data2 = $this->genericService->buildDataObject($keyMap["SCHEMA"], $keyMap["FORMAT"], null);

		// Complete the primary key
		foreach ($data2->infoFields as $infoField) {
			if (!empty($keyMap[$infoField->data])) {
				$infoField->value = $keyMap[$infoField->data];
			}
		}
		// Get children too
		$websiteSession = new Zend_Session_Namespace('website');
		$children = $this->genericModel->getChildren($data2, $websiteSession->datasetId);

		// Add the children
		foreach ($children as $listChild) {
			$dataArray = $this->genericService->dataToGridDetailArray($id, $listChild);
			$dataArray != null ? $dataDetails['children'][] = $dataArray : null;
		}

		return $dataDetails;
	}

	/**
	 * Generate an URL for the details map.
	 *
	 * @param Array $detailsLayers
	 *        	List of layers to display
	 * @param Application_Model_Mapping_BoundingBox $bb
	 *        	bounding box
	 * @param Array $mapservParams
	 *        	Parameters for mapserver
	 * @param Boolean $proxy
	 * @return String
	 */
	protected function getDetailsMapUrl($detailsLayers, $bb, $mapservParams, $proxy = true) {
		$configuration = Zend_Registry::get('configuration');

		// Configure the projection systems
		$visualisationSRS = $configuration->srs_visualisation;
		$baseUrls = '';

		// Get the base urls for the services
		if (!$proxy) {
			$detailServices = $this->servicesModel->getPrintServices();
		} else {
			$detailServices = $this->servicesModel->getDetailServices();
		}

		// Get the server name for the layers
		$layerNames = explode(",", $detailsLayers);
		// $serviceLayerNames = "";
		$versionWMS = "";

		foreach ($layerNames as $layerName) {

			$layer = $this->layersModel->getLayer($layerName);
			$serviceLayerName = $layer->serviceLayerName;

			// Get the base Url for detail service
			if (!$proxy) {
				$detailServiceName = $layer->printServiceName;
			} else {
				if ($layer->detailServiceName != '') {
					$detailServiceName = $layer->detailServiceName;
				}
			}

			foreach ($detailServices as $detailService) {

				if ($detailService->serviceName == $detailServiceName) {

					$service = json_decode($detailService->serviceConfig)->{'params'}->{'SERVICE'};
					$baseUrl = json_decode($detailService->serviceConfig)->{'urls'}[0];

					if ($service === 'WMS') {

						$baseUrls .= $baseUrl . 'LAYERS=' . $serviceLayerName;
						$baseUrls .= '&TRANSPARENT=true';
						$baseUrls .= '&FORMAT=image%2Fpng';
						$baseUrls .= '&SERVICE='.json_decode($detailService->serviceConfig)->{'params'}->{'SERVICE'};
						$baseUrls .= '&VERSION='.json_decode($detailService->serviceConfig)->{'params'}->{'VERSION'};
						$baseUrls .= '&REQUEST='.json_decode($detailService->serviceConfig)->{'params'}->{'REQUEST'};
						$baseUrls .= '&STYLES=';
						$baseUrls .= '&BBOX=' . $bb->xmin . ',' . $bb->ymin . ',' . $bb->xmax . ',' . $bb->ymax;
						$baseUrls .= '&WIDTH=300';
						$baseUrls .= '&HEIGHT=300';
						$baseUrls .= '&map.scalebar=STATUS+embed';
						$baseUrls .= '&SESSION_ID=' . session_id();
						$baseUrls .= $mapservParams;
	        				$versionWMS = json_decode($detailService->serviceConfig)->{'params'}->{'VERSION'};
						if (substr_compare($versionWMS, '1.3', 0, 3) === 0) {
							$baseUrls .='&CRS=EPSG%3A'.$visualisationSRS;
						} elseif (substr_compare($versionWMS, '1.0', 0, 3) === 0 || substr_compare($versionWMS, '1.1', 0, 3) === 0) {
							$baseUrls .= '&SRS=EPSG%3A'.$visualisationSRS;
						} else {
							$this->logger->err("WMS version unsupported, please change the WMS version for the '$layerName' layer.");
						}
						$baseUrls .=';';

					} elseif ($service === 'WMTS') {

						$this->logger->err("WMTS service unsupported, please change the detail service for the '$layerName' layer.");

						// TODO : Gets the tileMatrix, tileCol, tileRow corresponding to the bb
						/*
						$baseUrls .= $baseUrl . 'LAYER=' . $serviceLayerName;
						$baseUrls .= '&SERVICE='.json_decode($detailService->serviceConfig)->{'params'}->{'SERVICE'};
						$baseUrls .= '&VERSION='.json_decode($detailService->serviceConfig)->{'params'}->{'VERSION'};
						$baseUrls .= '&REQUEST='.json_decode($detailService->serviceConfig)->{'params'}->{'REQUEST'};
						$baseUrls .= '&STYLE='.json_decode($detailService->serviceConfig)->{'params'}->{'STYLE'};
						$baseUrls .= '&FORMAT='.json_decode($detailService->serviceConfig)->{'params'}->{'FORMAT'};
						$baseUrls .= '&TILEMATRIXSET='.json_decode($detailService->serviceConfig)->{'params'}->{'TILEMATRIXSET'};
						$baseUrls .= '&TILEMATRIX='.$tileMatrix;
						$baseUrls .= '&TILECOL='.$tileCol;
						$baseUrls .= '&TILEROW='.$tileRow;
						$baseUrls .=';';
						*/

					} else {
						$this->logger->err("'$service' service unsupported, please change the detail service for the '$layerName' layer.");
					}
				}
			}
		}
		if ($baseUrls != "") {
			$baseUrls = substr($baseUrls, 0, -1); // remove last semicolon
		}

		return $baseUrls;
	}

	/**
	 * Return the node children
	 *
	 * @param String $id
	 *        	The identifier of the line
	 * @return JSON representing the detail of the children.
	 */
	public function ajaxgetchildren($id) {
		$keyMap = $this->_decodeId($id);

		// Prepare a data object to be filled
		$data = $this->genericService->buildDataObject($keyMap["SCHEMA"], $keyMap["FORMAT"], null);

		// Complete the primary key
		foreach ($data->infoFields as $infoField) {
			if (!empty($keyMap[$infoField->data])) {
				$infoField->value = $keyMap[$infoField->data];
			}
		}

		// Get children too
		$websiteSession = new Zend_Session_Namespace('website');
		$children = $this->genericModel->getChildren($data, $websiteSession->datasetId);

		// Add the children
		$json = "";
		if (!empty($children)) {
			foreach ($children as $listChild) {
				$json .= $this->genericService->dataToGridDetailJSON($id, $listChild);
			}
		} else {
			$json .= '{success:true, id:null, title:null, hasChild:false, columns:[], fields:[], data:[]}';
		}
		return $json;
	}

	/**
	 * Get the list of available predefined requests.
	 *
	 * @param String $sort
	 *        	The column used as a sort order
	 * @param String $dir
	 *        	The sort direction (ASC or DESC)
	 * @return JSON The list of predefined requests
	 */
	public function getPredefinedRequestList($sort, $dir) {

		// Get the predefined values for the forms
		$predefinedRequestList = $this->predefinedRequestModel->getPredefinedRequestList($this->schema, $dir, $sort);

		// Generate the JSON string
		$total = count($predefinedRequestList);
		$json = '{"success":true, "total":' . $total . ',"rows":[';

		foreach ($predefinedRequestList as $predefinedRequest) {
			$json .= $predefinedRequest->toJSON() . ",";
		}
		if (!empty($predefinedRequestList)) {
			$json = substr($json, 0, -1); // remove the last colon
		}

		$json .= ']}';

		return $json;
	}

	/**
	 * Get the criteria of a predefined requests.
	 *
	 * @param String $requestName
	 *        	the request name
	 * @return JSON
	 */
	public function getPredefinedRequestCriteria($requestName) {
		$this->logger->debug('getPredefinedRequestCriteria');

		// Get the predefined values for the forms
		$predefinedRequestCriterias = $this->predefinedRequestModel->getPredefinedRequestCriteria($requestName);

		// Generate the JSON string
		$total = count($predefinedRequestCriterias);
		$json = '{"success":true, "criteria":[';

		foreach ($predefinedRequestCriterias as $criteria) {

			$json .= '{';
			$json .= $criteria->toCriteriaJSON();

			// add some specific options
			if ($criteria->type == "NUMERIC" && $criteria->subtype == "RANGE") {
				// For the RANGE field, get the min and max values
				$range = $this->metadataModel->getRange($criteria->unit);
				$json .= ',"params":{"min":' . $range->min . ',"max":' . $range->max . '}';
			}

			if ($criteria->type == "CODE" && ($criteria->subtype == "TAXREF" || $criteria->type == "TREE")) {
				// For the TAXREF and TREE field, get the default value (because the datastore is not initialised)
				$labels = $this->metadataModel->getTaxrefLabels($criteria->unit, $criteria->defaultValue);
				$label = $labels[$criteria->defaultValue];

				$json .= ',"params":{"valueLabel":"' . $label . '"}';
			}

			$json .= '},';
		}

		if ($total != 0) {
			$json = substr($json, 0, -1);
		}

		$json .= ']}';

		return $json;
	}
}
