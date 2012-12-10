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
 * Represent a harmonization process.
 *
 * @package objects
 * @SuppressWarnings checkUnusedVariables
 */
class Application_Object_Harmonizeddata_HarmonizationProcess {

	/**
	 * The harmonization identifier
	 */
	var $harmonizationId;

	/**
	 * The provider identifier
	 */
	var $providerId;

	/**
	 * The dataset identifier
	 */
	var $datasetId;

	/**
	 * The harmonization status
	 */
	var $status;

	/**
	 * The date of the process
	 */
	var $date;

	/**
	 * The status of the raw_data
	 */
	var $submissionStatus;

	/**
	 * The identifiers of the used raw data submissions
	 */
	var $submissionIDs = array();

}
