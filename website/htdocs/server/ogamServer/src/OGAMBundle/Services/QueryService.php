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
use OGAMBundle\OGAMBundle;
use OGAMBundle\Entity\Generic\GenericField;
use OGAMBundle\Entity\Generic\EditionForm;

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
	    $mappingSet = $queryForm->getFieldMappingSet();

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
        $tables = $this->genericService->getAllFormats($this->schema, $mappingSet->getFieldMappingArray());
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
	    $mappingSet = $queryForm->getFieldMappingSet();
	
        // Generate the SQL Request
        $select = $this->genericService->generateSQLSelectRequest($this->schema, $queryForm->getColumns(), $mappingSet, $userInfos);
        $from = $this->genericService->generateSQLFromRequest($this->schema, $mappingSet);
        $where = $this->genericService->generateSQLWhereRequest($this->schema, $queryForm->getCriteria(), $mappingSet, $userInfos);
        $sqlPKey = $this->genericService->generateSQLPrimaryKey($this->schema, $mappingSet);

        // Identify the field carrying the location information
        $tables = $this->genericService->getAllFormats($this->schema, $mappingSet->getFieldMappingArray());
        $locationField = $this->metadataModel->getRepository(TableField::class)->getGeometryField($this->schema, array_keys($tables), $this->locale);

        $this->logger->debug('$select : ' . $select);
        $this->logger->debug('$from : ' . $from);
        $this->logger->debug('$where : ' . $where);

        // Calculate the number of lines of result
        $countResult = $this->_getQueryResultsCount($from, $where);

        // Store the metadata in session for subsequent requests
        //$session->set('query_schema', $this->schema); used?
        //$session->set('query_queryForm', $queryForm); still done into the action ajaxbuildrequest
        $session->set('query_QueryFormMappingSet', $select);
        $session->set('query_SQLSelect', $select);
        $session->set('query_SQLFrom', $from);
        $session->set('query_SQLWhere', $where);
        $session->set('query_SQLPkey', $sqlPKey);
        //$session->set('query_locationField', $locationField); used?
        $session->set('query_Count', $countResult); // result count
        
        //old
        //$session->set('queryObject', $queryObject);
        //$session->set('resultColumns', $queryObject->editableFields); Not need can be find with $queryForm->getColumns()
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
	 * Set the fields mappings for the provided schema into the query form.
	 *
	 * @param string $schema
	 * @param \OGAMBundle\Entity\Generic\QueryForm $queryForm
	 *        	the list of query form fields
	 */
	public function setQueryFormFieldsMappings($queryForm) {
	    $mappingSet = $this->genericService->getFieldsMappings($this->schema, $queryForm->getCriteria());
	    $mappingSet->addFieldMappingSet($this->genericService->getFieldsMappings($this->schema, $queryForm->getColumns()));
	    $queryForm->setFieldMappingSet($mappingSet);
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
	 * @param Session $session
	 *        	the current session
	 * @param Array $userInfos
	 *        	Few user informations
	 * @return JSON
	 */
	public function getResultRows($start, $length, $sort, $sortDir, $session, $userInfos) {
	    $this->logger->debug('getResultRows');
	
        // Get the request from the session
        $queryForm = $session->get('query_QueryForm');
        // Get the mappings for the query form fields
        $this->setQueryFormFieldsMappings($queryForm);
        
        // Retrieve the SQL request from the session
        $select = $session->get('query_SQLSelect');
        // Il ne doit pas y avoir de DISTINCT pour pouvoir faire un Index Scan
        $select = str_replace(" DISTINCT", "", $select);

        $from = $session->get('query_SQLFrom');
        $where = $session->get('query_SQLWhere');

        // Subquery (for getting desired rows)
        $pKey = $session->get('query_SQLPkey');
        $subquery = "SELECT " . $pKey . $from . $where;

        $order = "";
        if (!empty($sort)) {
            // $sort contains the form format and field
            $split = explode("__", $sort);
            $formField = new GenericField($split[0], $split[1]);
            $dstField =  $queryForm->getFieldMappingSet()->getDstField($formField);
            $key = $dstField->getFormat() . "." . $dstField->getData();
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
        $result = $this->_getQueryResults($query);

        // Retrive the session-stored info
        $columnsDstFields = $queryForm->getColumnsDstFields();

        $resultRows = [];
        foreach ($result as $line) {
            $resultRow = [];
            foreach ($columnsDstFields as $columnDstField) {

                $tableField = $columnDstField->getMetadata();
                $key = strtolower($tableField->getName());
                $value = $line[$key];

                // Manage code traduction
                if ($tableField->getData()->getUnit()->getType() === "CODE" && $value != "") {
                    $label = $this->genericService->getValueLabel($tableField, $value);
                    $resultRow[] = $label === null ? '' : $label;
                } else if ($tableField->getData()->getUnit()->getType() === "ARRAY" && $value != "") {
                    // Split the array items
                    $arrayValues = explode(",", preg_replace("@[{-}]@", "", $value));
                    $label = '';
                    foreach ($arrayValues as $arrayValue) {
                        $label .= $this->genericService->getValueLabel($tableField, $arrayValue);
                        $label .= ',';
                    }
                    if ($label !== '') {
                        $label = substr($label, 0, -1);
                    }
                    $label = '[' . $label . ']';

                    $resultRow[] = $label === null ? '' : $label;
                } else {
                    $resultRow[] = $value;
                }
            }

            // Add the line id
            $resultRow[] = $line['id'];

            // Add the plot location in WKT
            $resultRow[] = $line['location_centroid']; // The last column is the location center

            // Right management : add the provider id of the data
            if (!$userInfos['DATA_QUERY_OTHER_PROVIDER']) {
                $resultRow[] = $line['_provider_id'];
            }
            
            $resultRows[] = $resultRow;
        }
	
	    return $resultRows;
	}
	
	/**
	 * Return the query result(s)
	 *
	 * @param string $sql The sql of the query
	 * @return array The result(s)
	 */
	private function _getQueryResults ($sql) {
	    $conn = $this->doctrine->getManager()->getConnection();
	    $stmt = $conn->prepare($sql);
	    $stmt->execute();
	    $result = $stmt->fetchAll();
	    return $result;
	}

	/*********************** EDITION ******************************************************/

	/**
	 * Get the form fields for a data to edit.
	 *
	 * @param EditionForm $data
	 *        	the data object to edit
	 * @return array Serializable.
	 */
	public function getEditForm($data) {
	    $this->logger->debug('getEditForm');
	
	    
	    return $this->_generateEditForm($data);
	}
	
	/**
	 * Generate the JSON structure corresponding to a list of edit fields.
	 *
	 * @param EditionForm $data the data object to edit
	 * @return array normalize value
	 */
	private function _generateEditForm($data) {
	    $return = new \ArrayObject();
	   /// beurk !! stop go view json
	    foreach ($data->getPkFields() as $tablefield) {
	        $formField = $this->genericService->getTableToFormMapping($tablefield); // get some info about the form
	        if (!empty($formField)) {
	            $return->append($this->_generateEditField($formField, $tablefield));
	        }
	    }
	    foreach ($data->getFields() as $tablefield) {
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
	 * @param GenericField $formEntryField
	 * @param GenericField $tableRowField
	 */
	private function _generateEditField($formEntryField, $tableRowField) {
	    $tableField = $tableRowField->getMetadata();
	    $formField = $formEntryField->getMetadata();
	    
	    $field = new \stdClass();
	    $field->inputType = $formField->getInputType();
	    $field->decimals = $formField->getDecimals();
	    $field->defaultValue = $formField->getDefaultValue();

	    $field->unit = $formField->getData()->getUnit()->getUnit();
	    $field->type = $formField->getData()->getUnit()->getType();
	    $field->subtype = $formField->getData()->getUnit()->getSubType();
	    
	    $field->name = $tableRowField->getId();
	    $field->label = $tableField->getLabel();
	    
	    $field->isPK = in_array($tableField->getData()->getData(), $tableField->getFormat()->getPrimaryKeys(), true) ? '1' : '0';
	    if($tableField->getData()->getUnit() === $formField->getData()->getUnit()) {
	        $this->logger->info('query_service :: table field and form field has not the same unit ?!');
	    }
	    
	    $field->value = $tableRowField->getValue();
	    $field->valueLabel = $tableRowField->getValueLabel();
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