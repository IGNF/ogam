<?php

namespace OGAMBundle\Services;

use OGAMBundle\Entity\Metadata\Dataset;
use OGAMBundle\Entity\Metadata\FormFormat;
use OGAMBundle\Entity\Metadata\FormField;

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
	 * The models.
	 * @var EntityManager
	 */
	private $metadataModel;

	function __construct($em, $configuration, $logger, $locale, $user, $schema)
	{
		// Initialise the logger
		$this->logger = $logger;

		// Initialise the locale
		$this->locale = $locale;

		// Initialise the user
		$this->user = $user;

		// Initialise the schema
		$this->schema = $schema;

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