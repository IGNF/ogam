<?php
/**
 * © French National Forest Inventory
 * Licensed under EUPL v1.1 (see http://ec.europa.eu/idabc/eupl).
 */
//require_once 'AbstractEforestController.php';
//require_once LIBRARY_PATH.'/Genapp/models/metadata/Metadata.php';
//require_once APPLICATION_PATH.'/models/mapping/Grids.php';
//require_once APPLICATION_PATH.'/models/aggregation/Aggregation.php';

/**
 * Abstract Controller that manages data interpolation or aggregation.
 *
 * @package controllers
 */
class Genapp_Controller_AbstractAnalysisController extends Genapp_Controller_AbstractEforestController {

	/**
	 * Generate the SQL FROM / WHERE request corresponding to the list of criterias selected by the user.
	 *
	 * CAUTION : This method looks a lot like the "generateSQLWHERERequest" method from GenericService, by we do LEFT JOINS instead of JOIN.
	 * TODO : Replace this method
	 *
	 * @param Field $selectedField The selected field
	 * @param String $datasetId The identifier of the dataset
	 * @return The generated SQL
	 */
	protected function generateSQLWHERERequest($selectedField, $datasetId) {

		$this->logger->debug('generateSQLWHERERequest '.$datasetId);

		// Get an access to the session
		$userSession = new Zend_Session_Namespace('user');
		$websiteSession = new Zend_Session_Namespace('website');

		// Get back the criterias
		$criterias = $websiteSession->criterias;

		$from = " FROM ";
		$where = "WHERE (1 = 1) ";

		// We will work on the raw_data schema
		$this->schema = 'RAW_DATA';

		$firstJoinedTable = ""; // The logical name of the first table in the join

		//
		// Get the mapping for each field
		//
		$dataCrits = array();
		foreach ($criterias as $criteriaName => $value) {
			$split = explode("__", $criteriaName);
			$formField = new Genapp_Model_Metadata_FormField();
			$formField->format = $split[0];
			$formField->data = $split[1];
			$tableField = $this->metadataModel->getFormToTableMapping($this->schema, $formField);
			$tableField->value = $value;
			$dataCrits[] = $tableField;
		}

		//
		// Build the list of needed tables and associate each field with its source table
		//
		$tables = array();
		foreach ($dataCrits as $field) {
			// Get the ancestors of the table and the foreign keys
			$ancestors = $this->metadataModel->getTablesTree($field->format, $field->data, $this->schema);

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

		// Add the quantitative field to aggregate, in case we need to add a new table
		$aggregateAncestors = $this->metadataModel->getTablesTree($selectedField->format, $selectedField->data, 'RAW_DATA');
		$aggregateAncestors = array_reverse($aggregateAncestors);
		foreach ($aggregateAncestors as $ancestor) {
			$tables[$ancestor->getLogicalName()] = $ancestor;
		}

		//
		// Prepare the FROM clause
		//
		// Get the root table;
		$rootTable = array_shift($tables);
		$from .= $rootTable->tableName." ".$rootTable->getLogicalName();

		// Add the joined tables
		foreach ($tables as $tableTreeData) {

			// We store the table name of the firstly joined table for a later use
			if ($firstJoinedTable == "") {
				$firstJoinedTable = $tableTreeData->getLogicalName();
			}

			// Join the table
			$from .= " LEFT JOIN ";
			$from .= $tableTreeData->tableName." ".$tableTreeData->getLogicalName()." on (";

			// Add the foreign keys
			$keys = explode(',', $tableTreeData->keys);
			foreach ($keys as $key) {
				$from .= $tableTreeData->getLogicalName().".".trim($key)." = ".$tableTreeData->parentTable.".".trim($key)." AND ";
			}
			$from = substr($from, 0, -5);

			$from .= ") ";
		}

		//
		// Prepare the WHERE clause
		//
		foreach ($dataCrits as $tableField) {

			$formfield = $this->metadataModel->getTableToFormMapping($tableField);

			$columnName = $tableField->columnName;

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

		$sql = $from.$where;

		// Return the completed SQL request
		return $sql;
	}

	/**
	 * AJAX function : Get the list of available variables.
	 *
	 * @return JSON The list of forms
	 */
	public function ajaxgetvariablesAction() {

		// Get back info from the user session
		$websiteSession = new Zend_Session_Namespace('website');

		// Get back the datadetId
		$datasetId = $websiteSession->datasetId;

		// List the available tables in the raw_data schema
		// TODO : Calculate the leafTable as the lowest available table
		$ancestors = $this->metadataModel->getTablesTree('SPECIES_DATA', null, 'RAW_DATA');

		// List all the fields available for aggregation (for a given dataset and a list of tables)
		$values = $this->metadataModel->getQuantitativeFields($datasetId, $ancestors, 'RAW_DATA');
		$valuesList = array();
		foreach ($values as $value) {
			$valuesList[] = array('name' => $value->format.'__'.$value->data, 'label' => $value->label);
		}

		echo '{'.'metaData:{'.'root:\'rows\','.'fields:['.'\'name\','.'\'label\''.']'.'},'.'rows:'.json_encode($valuesList).'}';

		// No View, we send directly the JSON
		$this->_helper->layout()->disableLayout();
		$this->_helper->viewRenderer->setNoRender();
	}

	/**
	 * Gets the integration status.
	 *
	 * @param String $serviceModel the name of the service
	 * @param String $servletName the name of the servlet
	 * @return JSON the status of the process
	 */
	protected function getStatus($serviceModel, $servletName) {
		$this->logger->debug('getStatusAction');

		// Send the cancel request to the integration server
		try {
			$status = $serviceModel->getStatus(session_id(), $servletName);

			// Echo the result as a JSON
			echo '{success:true, status:\''.$status->status.'\', taskName:\''.$status->taskName.'\', currentCount:\''.$status->currentCount.'\', totalCount:\''.$status->totalCount.'\'}';
		} catch (Exception $e) {
			$this->logger->debug('Error during get: '.$e);
			$this->view->errorMessage = $e->getMessage();
			echo '{success:false, errorMsg: \'\'}';
		}

		// No View, we send directly the javascript
		$this->_helper->layout()->disableLayout();
		$this->_helper->viewRenderer->setNoRender();
	}
}
