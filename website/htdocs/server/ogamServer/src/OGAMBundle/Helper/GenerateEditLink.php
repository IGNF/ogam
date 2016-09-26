<?php
namespace OGAMBundle\Helper;

use Symfony\Component\Templating\Helper\Helper;

class GenerateEditLink extends Helper {
    /**
     * Generate a link corresponding to a data object
     *
     * @param DataObject $data
     * @return Link the HTML link
     */
    function generateEditLink($data) {

	// Build the URL to link to the parent items
	$urlArray = array(
		'controller' => 'index',
		'action' => 'index'
	);

	// Add the schema
	$urlArray['SCHEMA'] = $data->tableFormat->getSchemaCode();

	// Add the format
	$urlArray['FORMAT'] = $data->tableFormat->getFormat();

	// Add the PK elements
	foreach ($data->infoFields as $infoField) {
		$urlArray[$infoField->getData()->getData()] = $infoField->value;
	}

	// Add the fields to generate the tooltip
	$fields = array();
	foreach ($data->getFields() as $field) {
		if (is_array($field->valueLabel)) {
			$val = "";
			foreach ($field->valueLabel as $value) {
				$val .= htmlspecialchars($value, ENT_QUOTES, $this->getCharset()). ", ";
			}
			$fields[$field->getLabel()] = substr($val, 0, -2);
		} else {
			$fields[$field->getLabel()] = htmlspecialchars($field->valueLabel, ENT_QUOTES, $this->getCharset());
		}
	}
	// output the result
	return array(
		'url' => '#edition-edit'.$data->getId(),
		'text' => htmlspecialchars($data->tableFormat->getLabel(), ENT_QUOTES, $this->getCharset()),
		'fields' => $fields
	);
    }

    /**
     * @inheritdoc
     */
    public function getName() {
        return __CLASS__;
    }
}