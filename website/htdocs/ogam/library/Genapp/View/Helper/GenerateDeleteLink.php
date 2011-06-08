<?php

/**
 * Helper for the generation of links.
 *
 * @package    Zend_View
 * @subpackage Helper
 */
class Genapp_View_Helper_GenerateDeleteLink extends Zend_View_Helper_Abstract {

	/**
	 * Generate a link corresponding to a data object
	 *
	 * @param DataObject $data
	 * @return the HTML link
	 */
	function generateDeleteLink($data) {

		$tableFormat = $data->tableFormat->format;

		// Build the URL to link to the parent items
		$urlArray = array('controller' => 'dataedition', 'action' => 'delete-data');

		// Add the schema
		$urlArray['SCHEMA'] = $data->tableFormat->schemaCode;

		// Add the format		
		$urlArray['FORMAT'] = $tableFormat;

		// Add the PK elements
		foreach ($data->infoFields as $infoField) {
			$urlArray[$infoField->data] = $infoField->value;
		}

		// output the result
		return '<a href="'.$this->view->url($urlArray, null, true).'"><img src="'.$this->view->baseUrl('img/bin.gif').'" /> Delete data</a>';
	}

}
