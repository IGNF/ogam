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
 * This is a model allowing to access a java service.
 * 
 * @package models
 */
class Application_Model_AbstractService_AbstractService {

	var $logger;

	/**
	 * Class constructor
	 */
	function Application_Model_AbstractService_AbstractService() {
		
		// Initialise the logger
		$this->logger = Zend_Registry::get("logger");
	}

	/**
	 * Parse an error response.
	 *
	 * @param
	 *        	String the XML body
	 * @return an error object.
	 * @throws an exception if the return message is not a valid XML
	 */
	protected function parseErrorMessage($body) {
		try {
			// Parse la chaîne en un arbre DOM
			$dom = new SimpleXMLElement($body, LIBXML_NOERROR); // Suppress warnings
		} catch (Exception $e) {
			$this->logger->debug("Error during parsing: " . $e->getMessage());
			throw new Exception("Error during parsing: " . $e->getMessage());
		}
		
		$error = new Application_Object_Error();
		$error->errorCode = $dom->ErrorCode;
		$error->errorMessage = $dom->ErrorMessage;
		
		return $error;
	}

	/**
	 * Parse a valid response where a value is expected as a result.
	 *
	 * @param
	 *        	String the XML body
	 * @return the value.
	 * @throws an exception if the return message is not a valid XML
	 */
	protected function parseValueResponse($body) {
		try {
			// Parse la chaîne en un arbre DOM
			$dom = new SimpleXMLElement($body); // Suppress warnings
		} catch (Exception $e) {
			$this->logger->debug("Error during parsing: " . $e->getMessage());
			throw new Exception("Error during parsing: " . $e->getMessage());
		}
		
		return (string) $dom->Value;
	}

	/**
	 * Parse a response indicating the status of the process.
	 *
	 * @param
	 *        	String the XML body
	 * @return ProcessStatus the status.
	 * @throws an exception if the return message is not a valid XML
	 */
	protected function parseStatusResponse($body) {
		try {
			// Parse la chaîne en un arbre DOM
			$dom = new SimpleXMLElement($body);
		} catch (Exception $e) {
			$this->logger->debug("Error during parsing: " . $e->getMessage());
			throw new Exception("Error during parsing: " . $e->getMessage());
		}
		
		$status = new Application_Object_ProcessStatus();
		$status->status = (string) $dom->Value;
		
		if ($dom->TaskName !== null && $dom->TaskName !== "") {
			$status->taskName = (string) $dom->TaskName;
			$status->currentCount = (string) $dom->CurrentCount;
			$status->totalCount = (string) $dom->TotalCount;
		}
		
		return $status;
	}
}
