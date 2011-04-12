<?php
/**
 * © French National Forest Inventory
 * Licensed under EUPL v1.1 (see http://ec.europa.eu/idabc/eupl).
 */
//require_once 'AbstractAnalysisController.php';
//require_once LIBRARY_PATH.'/Genapp/models/metadata/Metadata.php';
//require_once APPLICATION_PATH.'/models/mapping/Grids.php';
//require_once APPLICATION_PATH.'/models/aggregation/Aggregation.php';
//require_once APPLICATION_PATH.'/models/calculation_service/CalculationService.php';

/**
 * AggregationController is the controller that manages the data aggregation process.
 * @package controllers
 */
class AggregationController extends Genapp_Controller_AbstractAnalysisController {

	protected $_redirector = null;

	/**
	 * Initialise the controler
	 */
	public function init() {
		parent::init();

		// Set the current module name
		$websiteSession = new Zend_Session_Namespace('website');
		$websiteSession->module = "aggregation";
		$websiteSession->moduleLabel = "Data Aggregation";
		$websiteSession->moduleURL = "aggregation";

		// Load the redirector helper
		$this->_redirector = $this->_helper->getHelper('Redirector');

		// Initialise the model
		$this->metadataModel = new Genapp_Model_DbTable_Metadata_Metadata();
		$this->gridsModel = new Application_Model_DbTable_Mapping_Grids();
		$this->aggregationModel = new Application_Model_DbTable_Aggregation_Aggregation();
		$this->calculationServiceModel = new Application_Model_CalculationService_CalculationService();

	}

	/**
	 * Check if the authorization is valid this controler.
	 */
	function preDispatch() {

		parent::preDispatch();
	}

	/**
	 * The "index" action is the default action for all controllers.
	 */
	public function indexAction() {
		$this->logger->debug('Data aggregation index');

		$userSession = new Zend_Session_Namespace('user');
		$permissions = $userSession->permissions;
		if (empty($permissions) || !array_key_exists('DATA_AGGREGATION', $permissions)) {
			$this->_redirector->gotoUrl('/');
		}

		$this->render('index');
	}

	/**
	 * Validate the aggregation variables form.
	 */
	public function ajaxValidateAggregationVariableFormAction() {

		$this->logger->debug('ajaxValidateAggregationVariableFormAction');

		// Get back the datasetId
		$websiteSession = new Zend_Session_Namespace('website');
		$datasetId = $websiteSession->datasetId;
		if (!$this->_validateAggregationVariableFormAction($datasetId)) {
			echo '{success:false}';
		} else {
			// Get the layer name to active
			$mappingSession = new Zend_Session_Namespace('mapping');
			echo '{success:true, layerName:\''.$mappingSession->aggregatedLayer.'\'}';
		}

		// No View, we send directly the JSON
		$this->_helper->layout()->disableLayout();
		$this->_helper->viewRenderer->setNoRender();
	}

	/**
	 * Aggregate the data.
	 *
	 * @param String $sessionId The identifier of the user session
	 * @param String $variable The quantitative variable to aggregate
	 * @param String $gridName The logical name of the grid where to aggregate
	 */
	private function _aggregateData($sessionId, $variableFormat, $variableName, $gridName) {
		$this->logger->debug('_aggregateData : '.$sessionId."_".$variableFormat.".".$variableName."_".$gridName);

		// Get some details about the Grid
		$grid = $this->gridsModel->getGrid($gridName);

		// Get back the list of available values
		$websiteSession = new Zend_Session_Namespace('website');
		$datasetId = $websiteSession->datasetId;

		// List all the available tables
		$ancestors = $this->metadataModel->getTablesTree($variableFormat, null, 'RAW_DATA');

		// List all the available aggregation fields (for a given dataset and a list of tables)
		$fields = $this->metadataModel->getQuantitativeFields($datasetId, $ancestors, 'RAW_DATA');

		// Find the value field info (Field)
		foreach ($fields as $field) {
			if ($variableFormat == $field->format && $variableName == $field->data) {
				$selectedField = $field;
			}
		}

		// Generate the FROM/WHERE part of the query corresponding to the criterias
		$sqlWhere = $this->generateSQLWHERERequest($selectedField, $datasetId);

		$this->logger->debug('_aggregateData sqlWhere : '.$sqlWhere);

		// Call the calculation module
		$this->calculationServiceModel->aggregateData($sessionId, $datasetId, $selectedField, $grid, $sqlWhere);

		/* Old version : direct group by in PHP/SQL
		 // Clean previous results
		 $this->aggregationModel->cleanPreviousResults($sessionId);
		
		 // Aggregate the data and store it in the temporary result table
		 $this->aggregationModel->aggregateData($sessionId, $selectedField, $grid, $sqlWhere);
		 */

		// Register the layer as being active
		$mappingSession = new Zend_Session_Namespace('mapping');
		$mappingSession->activatedLayers[] = $grid->aggregationLayerName;
		$mappingSession->aggregatedLayer = $grid->aggregationLayerName;

		$this->logger->debug('registered : '.$grid->aggregationLayerName);

	}

	/**
	 * AJAX function : Get the list of available grids.
	 *
	 * @return JSON The list of forms
	 */
	public function ajaxgetgridsAction() {

		// Get the list of grids
		$grids = $this->gridsModel->getGrids();

		$gridsList = array();
		foreach ($grids as $grid) {
			$gridsList[] = array('name' => $grid->name, 'label' => $grid->label);
		}

		echo '{'.'metaData:{'.'root:\'rows\','.'fields:['.'\'name\','.'\'label\''.']'.'},'.'rows:'.json_encode($gridsList).'}';

		// No View, we send directly the JSON
		$this->_helper->layout()->disableLayout();
		$this->_helper->viewRenderer->setNoRender();
	}

	/**
	 * Validate the aggregation variables form.
	 */
	private function _validateAggregationVariableFormAction() {
		$this->logger->debug('_validateAggregationVariableFormAction');

		// Get the selected values
		$variable = $this->_getParam('AGGREGATE_VARIABLE');
		$gridName = $this->_getParam('GRID_NAME');

		$this->logger->debug('$gridName : '.$gridName);

		// Split the variable name and format
		$split = explode("__", $variable);
		$variableFormat = $split[0];
		$variableName = $split[1];

		$this->logger->debug('$gridName : '.$gridName);

		// Get the session id
		$sessionId = session_id();

		// Aggregate the data and store it in the temporary result table
		$this->_aggregateData($sessionId, $variableFormat, $variableName, $gridName);

		return true;
	}

	/**
	 * Return the status of the service
	 */
	public function ajaxGetStatusAction() {
		$this->getStatus($this->calculationServiceModel, 'CalculationServlet');
	}
}
