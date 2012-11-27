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

		// Add the fields to generate the tooltip
		$fields = array();
		foreach ($data->getFields() as $field) {
			if (is_array($field->valueLabel)) {
				$val = "";
				foreach ($field->valueLabel as $value) {
					$val .= $this->view->escape($value). ", ";
				}
				$fields[$field->label] = substr($val, 0, -2);
			} else {
				$fields[$field->label] = $this->view->escape($field->valueLabel);
			}

		}

		// output the result
		return array(
		    'url' => $this->view->url($urlArray, null, true),
		    'text' => $this->view->escape($data->tableFormat->label),
		    'fields' => $fields
		);
	}
}
