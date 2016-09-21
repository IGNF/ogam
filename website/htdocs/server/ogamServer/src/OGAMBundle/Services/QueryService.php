<?php

namespace OGAMBundle\Services;

use OGAMBundle\Entity\Metadata\Dataset;
use OGAMBundle\Entity\Metadata\FormFormat;
use OGAMBundle\Entity\Metadata\FormField;
use OGAMBundle\Entity\Metadata\TableField;
use OGAMBundle\Entity\Metadata\Unit;

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

	function __construct($em, $genericService, $configuration, $logger, $locale, $user, $schema)
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

		// Initialise the metadata models
		$this->metadataModel = $em;
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
	    $field->name = $formField->getName();
	    $field->label = $formField->getLabel();
	    $field->unit = $formField->getData()->getUnit()->getUnit();
	    $field->type = $formField->getData()->getUnit()->getType();
	    $field->subtype = $formField->getData()->getUnit()->getSubType();
	    
	    
	    $field->isPK = in_array($tableField->getData()->getData(), $tableField->getFormat()->getPrimaryKeys(), true) ? '1' : '0';
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
	        $range = $field->getData()->getUnit()->getRange();
	        $field->params = ["min"=>$range->getMin(), "max"=>  $range->getMax()];
	    }
	    
	    if ($field->inputType === 'RADIO' && $field->type === 'CODE') {
	        
	       $opts = $this->metadataModel->getRepository(Unit::class)->getModes($formField->getUnit());

	       $field->options = array_column($opts, 'label', 'code');
	    }
	    
	    return $field;
	}
	
	/**
	 * TODO: AJAX function : Get the predefined request.
	 *
	 * @param String $requestName
	 *        	The request name
	 * @return Forms
	 *
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
	 * TODO: Generate the JSON structure corresponding to a list of criteria and columns.
	 *
	 * @param Array[FormFormat] $forms
	 *        	the list of FormFormat elements
	 *
	private function _generateQueryFormsJSON($forms) {
		$json = '{"success":true,"data":[';
	
		foreach ($forms as $form) {
			// Add the criteria
			$json .= '{' . $form->toJSON() . ',"criteria":[';
			$json .= $this->_generateQueryFormCriteriaJSON($form->criteriaList);
			// Add the columns
			$json .= '],"columns":[';
			$json .= $this->_generateQueryFormColumnsJSON($form->resultsList);
			$json .= ']},';
		}
		if (count($forms) > 0) {
			$json = substr($json, 0, -1);
		}
		$json = $json . ']}';
	
		return $json;
	}*/
}