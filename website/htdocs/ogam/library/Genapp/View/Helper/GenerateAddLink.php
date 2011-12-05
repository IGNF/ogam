<?php

/**
 * Helper for the generation of links.
 *
 * @package    Zend_View
 * @subpackage Helper
 */
class Genapp_View_Helper_GenerateAddLink extends Zend_View_Helper_Abstract {

	/**
	 * Generate a link corresponding to a data object
	 *
	 * @param String $schema The schema
	 * @param String $format The format
	 * @param Array $infoFields The primary keys
	 * @return the HTML link
	 */
	function generateAddLink($schema, $format, $infoFields) {

		// Build the URL to link to the parent items
		$urlArray = array('controller' => 'dataedition', 'action' => 'show-add-data');

		// Add the schema
		$urlArray['SCHEMA'] = $schema;

		// Add the format		
		$urlArray['FORMAT'] = $format;

		// Add the PK elements
		foreach ($infoFields as $infoField) {
			$urlArray[$infoField->data] = $infoField->value;
		}

		// output the result
		return $this->view->url($urlArray, null, true);
	}

}
