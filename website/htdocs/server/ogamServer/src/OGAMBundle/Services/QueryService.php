<?php

namespace OGAMBundle\Services;

use OGAMBundle\Entity\Metadata\Dataset;
use OGAMBundle\Entity\Metadata\FormFormat;
use OGAMBundle\Entity\Metadata\FormField;
use OGAMBundle\Entity\Metadata\TableField;
use OGAMBundle\Entity\Metadata\Unit;
use OGAMBundle\Entity\Mapping\ResultLocation;
use OGAMBundle\Entity\Metadata\TableFormat;
use OGAMBundle\Entity\Generic\GenericFieldMappingSet;
use OGAMBundle\Entity\Generic\QueryForm;
use OGAMBundle\Repository\GenericRepository;
use Symfony\Component\HttpFoundation\Session\Session;
use Doctrine\ORM\NoResultException;

/**
 *
 * The Query Service.
 *
 * This service handles the queries used to feed the query interface with ajax requests.
 */
class QueryService {
	/**
	 * The logger.
	 *
	 * @var Logger
	 */
	private $logger;

	/**
	 * The locale.
	 *
	 * @var locale
	 */
	private $locale;

	/**
	 * The user.
	 *
	 * @var user
	 */
	private $user;

	/**
	 * The schema.
	 *
	 * @var schema
	 */
	private $schema;

	/**
	 *
	 */
	private $configation;
	/**
	 * 
	 * @var GenericService
	 */
	private $genericService;

	/**
	 * The models.
	 * @var EntityManager
	 */
	private $metadataModel;
	
	/**
	 * The doctrine service
	 * @var Service
	 */
	private $doctrine;

	function __construct($doctrine, $genericService, $configuration, $logger, $locale, $user, $schema)
	{
		// Initialise the logger
		$this->logger = $logger;

		// Initialise the locale
		$this->locale = $locale;

		// Initialise the user
		$this->user = $user;

		// Initialise the schema
		$this->schema = $schema;
		
		$this->genericService =$genericService;

		$this->configuration = $configuration;

		$this->doctrine = $doctrine;

		// Initialise the metadata models
		$this->metadataModel = $this->doctrine->getManager('metadata');
	}

	/**
	 * Get the list of available datasets.
	 *
	 * @return [OGAMBundle\Entity\Metadata\Dataset] The list of datasets
	 */
	public function getDatasets() {
		return $this->metadataModel->getRepository(Dataset::class)->getDatasetsForDisplay($this->locale, $this->user);
	}
	
	/**
	 * TODO: Get the list of available forms and criterias for the dataset.
	 *
	 * @param String $datasetId
	 *        	the identifier of the selected dataset
	 * @param String $requestName
	 *        	the name of the predefined request if available
	 * @return ??
	 */
	public function getQueryForms($datasetId, $requestName) {

		if (!empty($requestName)) {
			// If request name is filled then we are coming from the predefined request screen
			// and we build the form corresponding to the request
			// TODO: Manage that case
			/*$forms = $this->_getPredefinedRequest($requestName);
			return $this->_generateQueryFormsJSON($forms);*/
		} else {
			// Otherwise we get all the fields available with their default value
			 return $this->metadataModel->getRepository(FormFormat::class)->getFormFormats($datasetId, $this->schema, $this->locale);
		}
	}
	
	/**
	 * Copy the locations of the result in a temporary table.
	 *
	 * @param \OGAMBundle\Entity\Generic\QueryForm $queryForm
	 *        	the form request object
	 * @param Array $userInfos
	 *        	Few user informations
	 */
	public function prepareResultLocations($queryForm, $userInfos) {
	    $this->logger->debug('prepareResultLocations');
	
	    // Get the mappings for the query form fields
	    $mappingSet = $this->getQueryFormFieldsMappings($this->schema, $queryForm);

        // Configure the projection systems
        $visualisationSRS = $this->configuration->getConfig('srs_visualisation', '3857');
        $visualisationSRS = '3857';

        // Generate the SQL Request
        $from = $this->genericService->generateSQLFromRequest($this->schema, $mappingSet);
        $where = $this->genericService->generateSQLWhereRequest($this->schema, $queryForm->getCriteria(), $mappingSet, $userInfos);

        // Clean previously stored results
        $sessionId = session_id();
        $this->logger->debug('SessionId : ' . $sessionId);
        $this->doctrine->getRepository(ResultLocation::class, 'mapping')->cleanPreviousResults($sessionId);

        // Identify the field carrying the location information
        $tables = $this->genericService->getAllFormats($this->schema, $mappingSet->getFieldMappingSet());
        $locationField = $this->metadataModel->getRepository(TableField::class)->getGeometryField($this->schema, array_keys($tables), $this->locale);
        $locationTableInfo = $this->metadataModel->getRepository(TableFormat::class)->getTableFormat($this->schema, $locationField->getFormat()->getFormat(), $this->locale);

        // Run the request to store a temporary result table (for the web mapping)
        $this->doctrine->getRepository(ResultLocation::class, 'result_location')->fillLocationResult($from . $where, $sessionId, $locationField, $locationTableInfo, $visualisationSRS);
	}

	/**
	 * Build the request.
	 *
	 * @param QueryForm $queryForm
	 *        	the request form
	 * @param Array $userInfos
	 *        	Few user informations
	 * @param Session $session
	 *        	the current session
	 */
	public function buildRequest(QueryForm $queryForm, $userInfos, Session $session) {
	    $this->logger->debug('getResultColumns');

	    // Get the mappings for the query form fields
	    $mappingSet = $this->getQueryFormFieldsMappings($this->schema, $queryForm);
	
        // Generate the SQL Request
        $select = $this->genericService->generateSQLSelectRequest($this->schema, $queryForm->getColumns(), $mappingSet, $userInfos);
        $from = $this->genericService->generateSQLFromRequest($this->schema, $mappingSet);
        $where = $this->genericService->generateSQLWhereRequest($this->schema, $queryForm->getCriteria(), $mappingSet, $userInfos);
        $sqlPKey = $this->genericService->generateSQLPrimaryKey($this->schema, $mappingSet);

        // Identify the field carrying the location information
        $tables = $this->genericService->getAllFormats($this->schema, $mappingSet->getFieldMappingSet());
        $locationField = $this->metadataModel->getRepository(TableField::class)->getGeometryField($this->schema, array_keys($tables), $this->locale);

        $this->logger->debug('$select : ' . $select);
        $this->logger->debug('$from : ' . $from);
        $this->logger->debug('$where : ' . $where);

        // Calculate the number of lines of result
        $countResult = $this->_getQueryResultsCount($from, $where);

        // Store the metadata in session for subsequent requests
        //$session->set('query_schema', $this->schema); used?
        //$session->set('query_queryForm', $queryForm); used?
        $session->set('query_SQLSelect', $select);
        $session->set('query_SQLFrom', $from);
        $session->set('query_SQLWhere', $where);
        $session->set('query_SQLPkey', $sqlPKey);
        //$session->set('query_locationField', $locationField); used?
        $session->set('query_count', $countResult); // result count
        
        //old
        //$session->set('queryObject', $queryObject);
        //$session->set('resultColumns', $queryObject->editableFields);
        //$session->set('datasetId', $queryForm->getDatasetId());
	}
	
    /**
     * Return the total count of query result
     * 
     * @param string $from The FROM part of the query
     * @param string $where The WHERE part of the query
     * @throws NoResultException
     * @return integer The total count
     */
	private function _getQueryResultsCount ($from, $where) {
	    $conn = $this->doctrine->getManager()->getConnection();
	    $sql = "SELECT COUNT(*) as count " . $from . $where;
	    $stmt = $conn->prepare($sql);
	    $stmt->execute();
	    $result = $stmt->fetchColumn();
	    if($result !== FALSE && $result !== ""){
	        return $result;
	    }else {
	        throw new NoResultException('No result found for the request : ' . $sql);
	    }
	}
	
	/**
	 * Get the form fields corresponding to the columns
	 *
	 * @param QueryForm $queryForm
	 *        	the request form
	 * @param Array $userInfos
	 *        	Few user informations
	 * @return [FormField] The form fields corresponding to the columns
	 */
	public function getColumns($queryForm, $userInfos){
        $formFields = [];
        foreach ($queryForm->getColumns() as $formField) {
            // Get the full description of the form field
            $formFields[] = $this->metadataModel->getRepository(FormField::class)->getFormField($formField->getFormat(), $formField->getData(), $this->locale);
        }
	    return $formFields;
	}
	
	/**
	 * Return the queryForm fields mappings in the provided schema
	 *
	 * @param string $schema
	 * @param \OGAMBundle\Entity\Generic\QueryForm $queryForm
	 *        	the list of query form fields
	 * @return \OGAMBundle\Entity\Generic\GenericFieldMappingSet
	 */
	public function getQueryFormFieldsMappings($schema, $queryForm) {
	    $fieldsMappings = [];
	    $fieldsMappings = $this->genericService->getFieldsMappings($schema, $queryForm->getCriteria());
	    $fieldsMappings = array_merge($fieldsMappings, $this->genericService->getFieldsMappings($schema, $queryForm->getColumns()));
	    return new GenericFieldMappingSet($fieldsMappings, $schema);
	}

	/**
	 * Get the form fields for a data to edit.
	 *
	 * @param DataObject $data
	 *        	the data object to edit
	 * @return JSON.
	 */
	public function getEditForm($data) {
	    $this->logger->debug('getEditForm');
	
	    
	    return $this->_generateEditForm($data);
	}
	
	/**
	 * Generate the JSON structure corresponding to a list of edit fields.
	 *
	 * @param DataObject $data the data object to edit
	 * @return array normalize value
	 */
	private function _generateEditForm($data) {
	    $return = new \ArrayObject();
	   /// beurk !! stop go view json
	    foreach ($data->getInfoFields() as $tablefield) {
	        $formField = $this->genericService->getTableToFormMapping($tablefield); // get some info about the form
	        if (!empty($formField)) {
	            $return->append($this->_generateEditField($formField, $tablefield));
	        }
	    }
	    foreach ($data->getEditableFields() as $tablefield) {
	        $formField = $this->genericService->getTableToFormMapping($tablefield); // get some info about the form
	        if (!empty($formField)) {
	            $return->append($this->_generateEditField($formField, $tablefield));
	        }
	   }
	   return array ('success' => true, 'data' => $return->getArrayCopy());
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
	 * 
	 * @param FormField $formField
	 * @param TableField $tableField
	 */
	private function _generateEditField($formField, $tableField) {
	    $field = new \stdClass();
	    $field->inputType = $formField->getInputType();
	    $field->decimals = $formField->getDecimals();
	    $field->defaultValue = $formField->getDefaultValue();

	    $field->unit = $formField->getData()->getUnit()->getUnit();
	    $field->type = $formField->getData()->getUnit()->getType();
	    $field->subtype = $formField->getData()->getUnit()->getSubType();
	    
	    $field->name = $tableField->getName();
	    $field->label = $tableField->getLabel();
	    
	    $field->isPK = in_array($tableField->getData()->getData(), $tableField->getFormat()->getPrimaryKeys(), true) ? '1' : '0';
	    if($tableField->getData()->getUnit() === $formField->getData()->getUnit()) {
	        $this->logger->info('query_service :: table field and form field has not the same unit ?!');
	    }
	    
	    $field->value = $tableField->value;
	    $field->valueLabel = $tableField->getValueLabel();
	    $field->editable = $tableField->getIsEditable() ? '1':'0';
	    $field->insertable = $tableField->getIsInsertable() ?'1' : '0';
	    $field->required = $field->isPK ? !($tableField->getIsCalculated()) : $tableField->getIsMandatory();
	    $field->data = $tableField->getData()->getData(); // The name of the data is the table one
	    $field->format = $tableField->getFormat()->getFormat();

	    
	    if ($field->value === null) {
	        if ($field->defaultValue === '%LOGIN%') {
	            $user = $this->user;
	            $field->value = $user->login;
	        } else if ($field->defaultValue === '%TODAY%') {
	    
	            // Set the current date
	            if ($formField->mask !== null) {
	                $field->value = date($this->_convertDateFormat($formField->mask));
	            } else {
	                $field->value = date($this->_convertDateFormat('yyyy-MM-dd'));
	            }
	        } else {
	            $field->value = $field->defaultValue;
	        }
	    }
	    
	    // For the RANGE field, get the min and max values
	    if ($field->type === "NUMERIC" && $field->subtype === "RANGE") {
	        $range = $tableField->getData()->getUnit()->getRange();
	        $field->params = ["min"=>$range->getMin(), "max"=>  $range->getMax()];
	    }
	    
	    if ($field->inputType === 'RADIO' && $field->type === 'CODE') {
	        
	       $opts = $this->metadataModel->getRepository(Unit::class)->getModes($formField->getUnit());

	       $field->options = array_column($opts, 'label', 'code');
	    }
	    
	    return $field;
	}
}