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
 * Helper for the generation of links.
 *
 * @package Application_Views_Helpers
 */
class Application_Views_Helpers_GenerateAddLink extends Zend_View_Helper_Abstract {

	/**
	 * Generate a link corresponding to a data object
	 *
	 * @param String $schema
	 *        	The schema
	 * @param String $format
	 *        	The format
	 * @param Array[Application_Object_Metadata_TableField] $infoFields
	 *        	The primary keys
	 * @return String the URL for the link
	 */
	function generateAddLink($schema, $format, $infoFields) {

		// Build the URL to link to the parent items
		$urlArray = array(
			'controller' => 'dataedition',
			'action' => 'show-add-data'
		);

		// Add the schema
		$urlArray['SCHEMA'] = $schema;

		// Add the format
		$urlArray['FORMAT'] = $format;

		// Add the PK elements
		foreach ($infoFields as $infoField) {
			$urlArray[$infoField->data] = $infoField->value;
		}

		// output the result
		return '#edition-add' . preg_replace('/^' . preg_quote('/dataedition/show-add-data', '/') . '/', '', $this->view->url($urlArray, null, true), 1);
	}
}
