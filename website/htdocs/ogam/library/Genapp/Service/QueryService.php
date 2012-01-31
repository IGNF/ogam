<?php
/**
 * © French National Forest Inventory
 * Licensed under EUPL v1.1 (see http://ec.europa.eu/idabc/eupl).
 */

/**
 * The Query Service.
 *
 * This service handles the queries used to feed the query interface with ajax requests.
 *
 * @package service
 */
class Genapp_Service_QueryService {

	/**
	 * The logger.
	 */
	var $logger;

	/**
	 * The models.
	 */
	var $metadataModel;
	var $taxonomicReferentialModel;
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
	 * @param String $schema the schema
	 */
	function Genapp_Service_QueryService($schema) {

		// Initialise the logger
		$this->logger = Zend_Registry::get("logger");

		// Initialise the metadata models
		$this->metadataModel = new Genapp_Model_Metadata_Metadata();
		$this->taxonomicReferentialModel = new Genapp_Model_Referential_TaxonomicReferential();
		$this->genericModel = new Genapp_Model_Generic_Generic();
		$this->resultLocationModel = new Application_Model_Mapping_ResultLocation();
		$this->predefinedRequestModel = new Application_Model_Website_PredefinedRequest();

		// The service used to build generic info from the metadata
		$this->genericService = new Genapp_Service_GenericService();

		// Configure the schema
		$this->schema = $schema;
	}

	/**
	 * Generate the JSON structure corresponding to a list of result and criteria columns.
	 *
	 * @param Array[FormFormat] $forms the list of FormFormat elements
	 */
	private function _generateQueryFormsJSON($forms) {

		$json = '{"success":true,"data":[';

		foreach ($forms as $form) {
			// Add the criteria
			$json .= '{'.$form->toJSON().',"criteria":[';
			foreach ($form->criteriaList as $field) {
				$json .= '{'.$field->toCriteriaJSON();
				// For the SELECT field, get the list of options
				if ($field->type == "CODE" || $field->type == "ARRAY") {

					if ($field->subtype == "MODE") {
						$options = $this->metadataModel->getModes($field->unit);
						$json .= ',"params":{"options":[';
						foreach ($options as $code => $label) {
							$json .= '['.json_encode($code).','.json_encode($label).'],';
						}
						$json = substr($json, 0, -1);
						$json .= ']}';
					}
					// For DYNAMIC and TREE modes, the list is populated using an ajax request
				}
				// For the RANGE field, get the min and max values
				if ($field->type == "NUMERIC" && $field->subtype == "RANGE") {
					$range = $this->metadataModel->getRange($field->unit);
					$json .= ',"params":{"min":'.$range->min.',"max":'.$range->max.'}';
				}
				$json .= '},';

			}
			if (count($form->criteriaList) > 0) {
				$json = substr($json, 0, -1);
			}
			// Add the columns
			$json .= '],"columns":[';
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
	 * Generate the JSON structure corresponding to a field to edit.
	 *
	 * @param FormField $field a form field
	 */
	private function _generateEditFieldJSON($formField) {

		$json = "{";

		// For the SELECT field, get the list of options
		if ($formField->type == "CODE" || $formField->type == "ARRAY") {

			// Get the modes => Label
			if ($formField->subtype == "DYNAMIC") {
				$modes = $this->metadataModel->getDynamodes($formField->unit);
			} else if ($formField->subtype == "TREE" ) {
				$modes = $this->metadataModel->getTreeLabels($formField->unit, $formField->value);
			} else if ($formField->subtype == "TAXREF") {
				$modes = $this->taxonomicReferentialModel->getTaxrefLabels($formField->unit, $formField->value);
			} else {
				$modes = $this->metadataModel->getModes($formField->unit);
			}

			// Populate the label of the currently selected value
			if ($formField->type == "ARRAY") {
				$labels = array();
				if (isset($formField->value)) {
					foreach ($formField->value as $mode) {
						if (isset($modes[$mode])) {
							$labels[] = $modes[$mode];
						}
					}
					$formField->valueLabel = $labels;
				}
			} else {
				if (isset($modes[$formField->value])) {
					$formField->valueLabel = $modes[$formField->value];
				}
			}

			$json .= $formField->toEditJSON();

			// Populate the list of available values
			if ($formField->subtype == "MODE") {
				$json .= ',"params":{"options":[';
				foreach ($modes as $code => $label) {
					$json .= '['.json_encode($code).','.json_encode($label).'],';
				}
				$json = substr($json, 0, -1);
				$json .= ']}';
			}
			// For DYNAMIC and TREE modes, the list is populated using an ajax request


		} else {
			$json .= $formField->toEditJSON();
		}


		// For the RANGE field, get the min and max values
		if ($formField->type == "NUMERIC" && $formField->subtype == "RANGE") {
			$range = $this->metadataModel->getRange($formField->unit);
			$json .= ',"params":{"min":'.$range->min.',"max":'.$range->max.'}';
		}
		$json .= "},";

		return $json;
	}

	/**
	 * Generate the JSON structure corresponding to a list of edit fields.
	 *
	 * @param DataObject $data the data object to edit
	 */
	private function _generateEditFormJSON($data) {

		$json = '{"success":true,"data":[';

		foreach ($data->getFields() as $tablefield) {
			$formField = $this->genericService->getTableToFormMapping($tablefield); // get some info about the form
			if (!empty($formField)) {
				$formField->value = $tablefield->value;
				$formField->editable = $tablefield->isEditable;
				$formField->insertable = $tablefield->isInsertable;
				$formField->data = $tablefield->data; 			// The name of the data is the table one
				$formField->format = $tablefield->format; 			// The name of the data is the table one

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
	 * @param String $requestName The request name
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

		$json = '{"metaData":{';
		$json .= '"root":"rows",';
		$json .= '"fields":[';
		$json .= '"id",';
		$json .= '"label",';
		$json .= '"is_default"';
		$json .= ']';
		$json .= '},';
		$json .= '"rows":[';

		foreach ($datasetIds as $dataset) {
			$json .= '{'.$dataset->toJSON().'},';
		}
		$json = substr($json, 0, -1); // remove last comma

		json_encode($datasetIds);


		$json .= ']}';

		return $json;
	}

	/**
	 * Get the list of available forms and criterias for the dataset.
	 *
	 * @param String $datasetId the identifier of the selected dataset
	 * @param String $requestName the name of the predefined request if available
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
	 * @param DataObject $data the data object to edit
	 * @return JSON.
	 */
	public function getEditForm($data) {
		$this->logger->debug('getEditForm');

		return $this->_generateEditFormJSON($data);

	}

	/**
	 * Get the description of the columns of the result of the query.
	 *
	 * @param String $datasetId the dataset identifier
	 * @param FormQuery $formQuery the form request object
	 * @param Boolean $withSQL indicate that we want the server to return the genetared SQL
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

		if (sizeof($formQuery->results) == 0) {
			$json = '{"success": false, "errorMessage": "At least one result column should be selected"}';
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
			$locationTableInfo = $this->metadataModel->getTableFormat($this->schema, $locationField->format);

			// Run the request to store a temporary result table (for the web mapping)
			$this->resultLocationModel->fillLocationResult($fromwhere, $sessionId, $locationField, $locationTableInfo, $visualisationSRS);

			// Calculate the number of lines of result
			$countResult = $this->genericModel->executeRequest("SELECT COUNT(*) as count ".$fromwhere);

			// TODO : Move this part somewhere else

			// Get the website session
			$websiteSession = new Zend_Session_Namespace('website');
			// Store the metadata in session for subsequent requests
			$websiteSession->resultColumns = $queryObject->editableFields;
			$websiteSession->datasetId = $datasetId;
			$websiteSession->SQLSelect = $select;
			$websiteSession->SQLFromWhere = $fromwhere;
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
				$json .= '{'.$formField->toJSON().', "hidden":false},';
			}
			// Add the identifier of the line
			$json .= '{"name":"id","label":"Identifier of the line","inputType":"TEXT","definition":"The plot identifier", "hidden":true}';
			// Add the plot location in WKT
			$json .= ',{"name":"location_centroid","label":"Location centroid","inputType":"TEXT","definition":"The plot location", "hidden":true}';


			// Right management : add the provider id of the data
			$userSession = new Zend_Session_Namespace('user');
			$providerId = $userSession->user->providerId;
			$permissions = $userSession->permissions;
			if (!array_key_exists('DATA_EDITION_OTHER_PROVIDER',$permissions)) {
				$json .= ',{"name":"_provider_id","label":"Provider","inputType":"TEXT","definition":"The provider", "hidden":true}';
			}

			$json .= ']';



			if ($withSQL) {
				$json .= ', "SQL":'.json_encode($select.$fromwhere);
			}
			$json .= '}';
		}

		return $json;

	}

	/**
	 * Get a page of query result data.
	 *
	 * @param Integer $start the start line number
	 * @param Integer $length the size of a page
	 * @param String $sort the sort column
	 * @param String $sortDir the sort direction (ASC or DESC)
	 * @return JSON
	 */
	public function getResultRows($start, $length, $sort, $sortDir) {
		$this->logger->debug('getResultRows');
		$json = "";

		try {

			// Retrieve the SQL request from the session
			$websiteSession = new Zend_Session_Namespace('website');
			$select = $websiteSession->SQLSelect;
			$fromwhere = $websiteSession->SQLFromWhere;
			$countResult = $websiteSession->count;

			// Retrive the session-stored info
			$resultColumns = $websiteSession->resultColumns; // array of TableField

			$filter = "";
			if ($sort != "") {
				// $sort contains the form format and field
				$split = explode("__", $sort);
				$formField = new Genapp_Object_Metadata_FormField();
				$formField->format = $split[0];
				$formField->data = $split[1];
				$tableField = $this->genericService->getFormToTableMapping($this->schema, $formField);
				$key = $tableField->getName();
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

				$key = strtolower($tableField->getName());

				if ($tableField->type == "CODE" || $tableField->type == "ARRAY") {
					if ($tableField->subtype == "DYNAMIC") {
						$traductions[$key] = $this->metadataModel->getDynamodes($tableField->unit);
					} else if ($tableField->subtype == "TREE") {
						$traductions[$key] = $this->metadataModel->getTreeLabels($tableField->unit);
					} else if ($tableField->subtype == "TAXREF") {
						$traductions[$key] = $this->taxonomicReferentialModel->getTaxrefLabels($tableField->unit);
					} else {
						$traductions[$key] = $this->metadataModel->getModes($tableField->unit);
					}
				}
			}

			// Send the result as a JSON String
			$json = '{"success":true,';
			$json .= '"total":'.$countResult.',';
			$json .= '"rows":[';
			foreach ($result as $line) {
				$json .= '[';

				foreach ($resultColumns as $tableField) {

					$key = strtolower($tableField->getName());
					$value = $line[$key];

					// Manage code traduction
					if ($tableField->type == "CODE" && $value != "") {
						$label = isset($traductions[$key][$value]) ? $traductions[$key][$value] : '';
						$json .= json_encode($label == null ? '' : $label).',';
					} else if ($tableField->type == "ARRAY" && $value != "") {
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

						$json .= json_encode($label == null ? '' : $label).',';
					} else {
						$json .= json_encode($value).',';
					}
				}

				// Add the line id
				$json .= json_encode($line['id']);

				// Add the plot location in WKT
				$json .= ','.json_encode($line['location_centroid']); // The last column is the location center

				// Right management : add the provider id of the data
				$userSession = new Zend_Session_Namespace('user');
				$providerId = $userSession->user->providerId;
				$permissions = $userSession->permissions;
				if (!array_key_exists('DATA_EDITION_OTHER_PROVIDER',$permissions)) {
					$json .= ','.json_encode($line['_provider_id']);
				}

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

		return $json;

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
	 * @param String $id The identifier of the line
	 * @param String $detailLayers The names of the layers used to display the images in the detail panel.
	 * @param String $datasetId The identifier of the dataset (to filter data)
	 * @return JSON representing the detail of the result line.
	 */
	public function getDetails($id, $detailLayers, $datasetId = null) {

		$this->logger->debug('getDetails : '.$id);

		// Get the base URL
		$baseUrl = Zend_Controller_Front::getInstance()->getBaseUrl();

		// Configure the projection systems
		$configuration = Zend_Registry::get("configuration");
		$visualisationSRS = $configuration->srs_visualisation;

		// Transform the identifier in an array
		$keyMap = $this->_decodeId($id);

		// Prepare a data object to be filled
		$data = $this->genericService->buildDataObject($keyMap["SCHEMA"], $keyMap["FORMAT"], null);

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

		// Look for a geometry object in order to calculate a bounding box
		// Look for the plot location
		$bb = null;
		$bb2 = null;
		$locationTable = null;
		foreach ($data->getFields() as $field) {
			if ($field->unit == "GEOM") {
				// define a bbox around the location
				$bb = $this->_setupBoundingBox($field->xmin, $field->xmax, $field->ymin, $field->ymax);

				// Prepare an overview bbox
				$bb2 = $this->_setupBoundingBox($field->xmin, $field->xmax, $field->ymin, $field->ymax, 200000);

				$locationTable = $data;
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

						$locationTable = $ancestor;
						break;
					}
				}
			}
		}

		// Defines the panel title and the mapsserver parameters.
		$mapservParams = '';
		$title = '';
		foreach ($locationTable->getInfoFields() as $primaryKey) {
			$mapservParams .= '&'.$primaryKey->columnName.'='.$primaryKey->value;
			if ($title !== '') {
				$title .= '_';
			}
			$title .= $primaryKey->value;
		}

		// Title of the detail message
		$json = "{title:'".$title."', ";
		$json .= "formats:[";
		// List all the formats, starting with the ancestors
		foreach ($ancestors as $ancestor) {
			$ancestorJSON = $this->genericService->datumToDetailJSON($ancestor, $datasetId);
			if ($ancestorJSON !== '') {
				$json .= $ancestorJSON.',';
			}
		}
		// Add the current data
		$dataJSON = $this->genericService->datumToDetailJSON($data, $datasetId);
		if ($dataJSON !== '') {
			$json .= $dataJSON;
		}

		$json .= "], ";
		$json .= "maps:[";
		if (!empty($detailLayers)) {
			if ($detailLayers[0] != "") {
				$json .= "{title:'image',";
				$json .= "url:'".$baseUrl."/proxy/gettile?";
				$json .= "&LAYERS=".(empty($detailLayers) ? '' : $detailLayers[0]);
				$json .= "&TRANSPARENT=true";
				$json .= "&FORMAT=image%2FPNG";
				$json .= "&SERVICE=WMS";
				$json .= "&VERSION=1.1.1";
				$json .= "&REQUEST=GetMap";
				$json .= "&STYLES=";
				$json .= "&EXCEPTIONS=application%2Fvnd.ogc.se_inimage";
				$json .= "&SRS=EPSG%3A".$visualisationSRS;
				$json .= "&BBOX=".$bb['x_min'].",".$bb['y_min'].",".$bb['x_max'].",".$bb['y_max'];
				$json .= "&WIDTH=300";
				$json .= "&HEIGHT=300";
				$json .= "&map.scalebar=STATUS+embed";
				$json .= "&SESSION_ID=".session_id();
				$json .= $mapservParams;
				$json .= "'}"; // end of detail map
			}
			if ($detailLayers[1] != "") {
				$json .= ",{title:'overview',";
				$json .= "url:'".$baseUrl."/proxy/gettile?";
				$json .= "&LAYERS=".(empty($detailLayers) ? '' : $detailLayers[1]);
				$json .= "&TRANSPARENT=true";
				$json .= "&FORMAT=image%2FPNG";
				$json .= "&SERVICE=WMS";
				$json .= "&VERSION=1.1.1";
				$json .= "&REQUEST=GetMap";
				$json .= "&STYLES=";
				$json .= "&EXCEPTIONS=application%2Fvnd.ogc.se_inimage";
				$json .= "&SRS=EPSG%3A".$visualisationSRS;
				$json .= "&BBOX=".$bb2['x_min'].",".$bb2['y_min'].",".$bb2['x_max'].",".$bb2['y_max'];
				$json .= "&WIDTH=300";
				$json .= "&HEIGHT=300";
				$json .= "&SESSION_ID=".session_id();
				$json .= "&map.scalebar=STATUS+embed";
				$json .= $mapservParams;
				$json .= "'}"; // end of overview map
			}
		}
		$json .= "]"; // end of maps
		$json .= "}";

		return $json;

	}

	/**
	 * Return the node children
	 *
	 * @param String $id The identifier of the line
	 * @return JSON representing the detail of the children.
	 */
	public function ajaxgetchildren($id) {
		$keyMap = $this->_decodeId($id);

		// Patch RTM TODO: trouver une autre solution
		// $keyMap["FORMAT"] = 'LOCATION_COMPL_DATA';

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
	 * @param String $sort The column used as a sort order
	 * @param String $dir The sort direction (ASC or DESC)
	 * @return JSON The list of predefined requests
	 */
	public function getPredefinedRequestList($sort, $dir) {

		// Get the predefined values for the forms
		$predefinedRequestList = $this->predefinedRequestModel->getPredefinedRequestList($this->schema, $dir, $sort);

		// Generate the JSON string
		$total = count($predefinedRequestList);
		$json = '{"success":true, "total":'.$total.',"rows":[';

		foreach ($predefinedRequestList as $predefinedRequest) {
			$json .= $predefinedRequest->toJSON().",";
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
	 * @param String $requestName the request name
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
			if ($criteria->type == "CODE" || $criteria->type == "ARRAY") {

				if ($criteria->subtype == "MODE") {
					// For MODE subtypes we get the list of values
					$options = $this->metadataModel->getModes($criteria->unit);
					$json .= ',"params":{"options":[';
					foreach ($options as $code => $label) {
						$json .= '['.json_encode($code).','.json_encode($label).'],';
					}
					$json = substr($json, 0, -1);
					$json .= ']}';
				}
				// For DYNAMIC and TREE subtypes, the list is populated using an ajax request
			} else if ($criteria->type == "NUMERIC" && $criteria->subtype == "RANGE") {
				// For the RANGE field, get the min and max values
				$range = $this->metadataModel->getRange($criteria->unit);
				$json .= ',"params":{"min":'.$range->min.',"max":'.$range->max.'}';
			} else {
				$json .= ',{}'; // no options
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
