<?php

/**
 * Helper for the generation of links.
 *
 * @package    Zend_View
 * @subpackage Helper
 */
class Genapp_View_Helper_GenerateEditLink extends Zend_View_Helper_Abstract {

	/**
	 * Generate a link corresponding to a data object
	 *
	 * @param DataObject $data
	 * @return the HTML link
	 */
	function generateEditLink($data) {

		$tableFormat = $data->tableFormat->format;

		// Build the URL to link to the parent items
		$urlArray = array('controller' => 'dataedition', 'action' => 'show-edit-data');

		// Add the schema
		$urlArray['SCHEMA'] = $data->tableFormat->schemaCode;

		// Add the format		
		$urlArray['FORMAT'] = $tableFormat;

		// Add the PK elements
		foreach ($data->infoFields as $infoField) {
			$urlArray[$infoField->data] = $infoField->value;
		}

		// Add the other elements as a tooltip
		$tooltip = "";
		foreach ($data->getFields() as $field) {
			$tooltip .= $field->data.": ".$field->value."<br/>";
		}

		// output the result
		return '<a href="'.$this->view->url($urlArray, null, true).'" class="tooltip">Edit '.$data->tableFormat->label.'<em><span></span>'.$tooltip.'</em></a>';
	}

}
