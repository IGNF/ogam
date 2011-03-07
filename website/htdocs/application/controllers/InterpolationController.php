<?php
/**
 * © French National Forest Inventory 
 * Licensed under EUPL v1.1 (see http://ec.europa.eu/idabc/eupl).
 */ 
require_once 'AbstractAnalysisController.php';
require_once LIBRARY_PATH.'/Genapp/models/metadata/Metadata.php';
require_once APPLICATION_PATH.'/models/mapping/Grids.php';
require_once APPLICATION_PATH.'/models/interpolation_service/InterpolationService.php';

/**
 * InterpolationController is the controller that manages the data interpolation process.
 * @package controllers
 */
class InterpolationController extends AbstractAnalysisController {

	/**
	 * Initialise the controler
	 */
	public function init() {
		parent::init();

		// Set the current module name
		$websiteSession = new Zend_Session_Namespace('website');
		$websiteSession->module = "interpolation";
		$websiteSession->moduleLabel = "Data Interpolation";
		$websiteSession->moduleURL = "interpolation";

		// Load the redirector helper
		$this->_redirector = $this->_helper->getHelper('Redirector');

		// Initialise the model
		$this->metadataModel = new Model_Metadata();
		$this->gridsModel = new Model_Grids();
		$this->interpolationServiceModel = new Model_InterpolationService();

	}

	/**
	 * Check if the authorization is valid this controler.
	 */
	function preDispatch() {

		parent::preDispatch();

		$userSession = new Zend_Session_Namespace('user');
		$permissions = $userSession->permissions;
		if (empty($permissions) || !array_key_exists('DATA_INTERPOLATION', $permissions)) {
			$this->_redirector->gotoUrl('/');
		}
	}

	/**
	 * The "index" action is the default action for all controllers.
	 */
	public function indexAction() {
		$this->logger->debug('Data interpolation index');

		$this->render('index');
	}

	/**
	 * Build and return the form used to select the interpolation parameters.
	 *
	 * @param String $datasetId the dataset identifier
	 * @throws an exception if no request is currently done by the user
	 */
	private function _getInterpolationParametersForm($datasetId) {

		$form = new Zend_Form();
		$form->setAction($this->baseUrl.'/interpolation/validate-interpolation-variable-form');
		$form->setMethod('post');

		//
		// Get the available quantitative variables
		//
		$valueElement = $form->createElement('select', 'INTERPOLATION_VARIABLE');
		$valueElement->setLabel('Value to aggregate');
		$valueElement->setRequired(true);

		// TODO : Remove hardcoded reference to the SPECIES_DATA table
		$ancestors = $this->metadataModel->getTablesTree('SPECIES_DATA', null, 'RAW_DATA');

		// List all the available interpolation fields (for a given dataset and a list of tables)
		$values = $this->metadataModel->getQuantitativeFields($datasetId, $ancestors, 'RAW_DATA');

		$valuesList = array();
		foreach ($values as $value) {
			$valuesList['SPECIES_DATA__'.$value->data] = $value->label;
		}
		$valueElement->addMultiOptions($valuesList);

		//
		// Get the list of available interpolation grids
		//
		$gridElement = $form->createElement('select', 'GRID_NAME');
		$gridElement->setLabel('Grid');
		$gridElement->setRequired(true);
		$grids = $this->metadataModel->getModes('INTERPOLATION_GRID');
		$gridElement->addMultiOptions($grids);

		//
		// Get the list of available interpolation methods
		//
		$methodElement = $form->createElement('select', 'METHOD');
		$methodElement->setLabel('Interpolation Method');
		$methodElement->setRequired(true);
		$methods = $this->metadataModel->getModes('INTERPOLATION_METHOD');
		$methodElement->addMultiOptions($methods);

		//
		// Get the list of available interpolation grids
		//
		$maxdistElement = $form->createElement('text', 'MAXDIST');
		$maxdistElement->setLabel('Max distance (in meters)');
		$maxdistElement->setRequired(true);
		$maxdistElement->setValue(5000);

		// Add elements to form:
		$form->addElement($valueElement);
		$form->addElement($gridElement);
		$form->addElement($methodElement);
		$form->addElement($maxdistElement);

		return $form;
	}

	/**
	 * Validate the interpolation variables form.
	 *
	 * @return a view
	 */
	private function _validateInterpolationVariableFormAction() {
		$this->logger->debug('validateinterpolationVariableFormAction');

		// Get back the dataset id from the session
		$interpolationSession = new Zend_Session_Namespace('website');
		$datasetId = $interpolationSession->datasetId;

		// Check the validity of the POST
		if (!$this->getRequest()->isPost()) {
			$this->errorMsg = 'form is not a POST';
			$this->logger->debug($this->errorMsg);
			return false;
		}

		// Check the validity of the Form
		$form = $this->_getInterpolationParametersForm($datasetId);
		if (!$form->isValid($_POST)) {
			$this->errorMsg = 'form is not valid';
			$this->logger->debug($this->errorMsg);
			return false;
		}

		// Get the selected values
		$values = $form->getValues();
		$variable = $values['INTERPOLATION_VARIABLE'];
		$gridName = $values['GRID_NAME'];
		$method = $values['METHOD'];
		$maxdist = $values['MAXDIST'];

		// Interpolate the data
		$this->_interpolateData($variable, $gridName, $method, $maxdist);

		return true;
	}

	/**
	 * Validate the aggregation variables form.
	 */
	public function ajaxValidateInterpolationVariableFormAction() {

		$this->logger->debug('ajaxValidateInterpolationVariableFormAction');

		// Get back the datasetId
		$websiteSession = new Zend_Session_Namespace('website');
		$datasetId = $websiteSession->datasetId;
		if (!$this->_validateInterpolationVariableFormAction($datasetId)) {
			echo '{success:false, errorMsg:\''.$this->errorMsg.'\'}';
		} else {
			// Get the layer name to active
			echo '{success:true, layerName:\'interpolation_result\'}';
		}

		// No View, we send directly the JSON
		$this->_helper->layout()->disableLayout();
		$this->_helper->viewRenderer->setNoRender();
	}

	/**
	 * Interpolate data.
	 *
	 * @param String $variable The quantitative variable to interpolate
	 * @param String $gridName The logical name of the grid where to interpolate
	 * @param String $method The interpolation method
	 * @param String $maxdist The max distance used to take plots into account
	 */
	private function _interpolateData($variable, $gridName, $method, $maxdist) {

		// Get back the dataset id from the session
		$interpolationSession = new Zend_Session_Namespace('website');
		$datasetId = $interpolationSession->datasetId;

		// Get the configuration info
		$configuration = Zend_Registry::get("configuration");
		$interpolationUploadDir = $configuration->interpolationUploadDir;

		// TODO : Remove hardcoded reference to the SPECIES_DATA table
		$ancestors = $this->metadataModel->getTablesTree('SPECIES_DATA', null, 'RAW_DATA');

		// List all the available aggregation fields (for a given dataset and a list of tables)
		$fields = $this->metadataModel->getQuantitativeFields($datasetId, $ancestors, 'RAW_DATA');

		// Find the value field info (Field)
		foreach ($fields as $field) {
			if ($variable == $field->format.'__'.$field->data) {
				$selectedField = $field;
			}
		}

		// Build the file name from the layer name
		$layerName = 'interpolation_result';
		$filename = $this->_generateSafeFileName($layerName);
		$filename = $interpolationUploadDir.DIRECTORY_SEPARATOR.$filename.".csv";
		$this->logger->debug('Filename '.$filename);

		// Generate the FROM/WHERE part of the query corresponding to the criterias
		$sqlWhere = $this->generateSQLWHERERequest($selectedField, $datasetId);

		// Launch the interpolation process
		$this->logger->debug('Launch the interpolation process');
		$this->interpolationServiceModel->interpolateData($datasetId, $sqlWhere, $selectedField->format, $selectedField->data, $layerName, $method, $gridName, $maxdist);

	}

	/**
	 * Generate a safe filename from a string.
	 *
	 * @param String $filename a filename
	 * @return the safe version of the filename
	 */
	private function _generateSafeFileName($filename) {
		$filename = strtolower($filename);
		$filename = str_replace("#", "_", $filename);
		$filename = str_replace(" ", "_", $filename);
		$filename = str_replace("'", "", $filename);
		$filename = str_replace('"', "", $filename);
		$filename = str_replace("&", "and", $filename);
		$filename = str_replace("/", "_", $filename);
		$filename = str_replace("\"", "_", $filename);
		$filename = str_replace("? ", "", $filename);
		$filename = str_replace("__", "_", $filename);
		return $filename;
	}

	/**
	 * AJAX function : Get the list of available grids.
	 *
	 * @return JSON The list of forms
	 */
	public function ajaxgetgridsAction() {

		// Get the list of grids
		$grids = $this->metadataModel->getModes('INTERPOLATION_GRID');

		$gridsList = array();
		foreach ($grids as $code => $label) {
			$gridsList[] = array('name' => $code, 'label' => $label);
		}

		echo '{'.'metaData:{'.'root:\'rows\','.'fields:['.'\'name\','.'\'label\''.']'.'},'.'rows:'.json_encode($gridsList).'}';

		// No View, we send directly the JSON
		$this->_helper->layout()->disableLayout();
		$this->_helper->viewRenderer->setNoRender();
	}

	/**
	 * AJAX function : Get the list of available methods.
	 *
	 * @return JSON The methods list
	 */
	public function ajaxgetmethodsAction() {

		// Get the list of grids
		$methods = $this->metadataModel->getModes('INTERPOLATION_METHOD');

		$methodsList = array();
		foreach ($methods as $code => $label) {
			$methodsList[] = array('name' => $code, 'label' => $label);
		}

		echo '{'.'metaData:{'.'root:\'rows\','.'fields:['.'\'name\','.'\'label\''.']'.'},'.'rows:'.json_encode($methodsList).'}';

		// No View, we send directly the JSON
		$this->_helper->layout()->disableLayout();
		$this->_helper->viewRenderer->setNoRender();
	}

    /**
     * Return the status of the service
     */
    public function ajaxGetStatusAction(){
        $this->getStatus($this->interpolationServiceModel, 'InterpolationServlet');
    }
}
