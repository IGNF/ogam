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
 * View for the creation of a new data.
 * @package views
 */
$generateAddLink = function ($schema, $format, $infoFields) {

	// Build the URL to link to the parent items
	$urlArray = array(
//		'controller' => 'dataedition',
//		'action' => 'show-add-data'
	);

	// Add the schema
	$urlArray['SCHEMA'] = $schema;

	// Add the format
	$urlArray['FORMAT'] = $format;

	// Add the PK elements
	foreach ($infoFields as $infoField) {
		$urlArray[$infoField->getData()->getData()] = $infoField->value;
	}
	
	$uri='';
	foreach(array_filter($urlArray) as $key=>$val){
		$uri .= "/$key/$val";
	}
	// output the result
	return '#edition-add' .$uri;
};
	
$generateEditLink=function ($data) use ($view) {

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
				$val .= $view->escape($value) . ", ";
			}
			$fields[$field->getLabel()] = substr($val, 0, -2);
		} else {
			$fields[$field->getLabel()] = $view->escape($field->valueLabel);
		}
	}
	// output the result
	return array(
		'url' => '#edition-edit'.$data->getId(),
		'text' => $view->escape($data->tableFormat->getLabel()),
		'fields' => $fields
	);
};
?>
[
<?php
$patch = array(
    'xclass' => 'OgamDesktop.view.edition.Panel'
);

// Unique identifier of the data
$patch['dataId'] = $dataId;
// mode
$patch['mode'] = $mode;

// message
if (! empty($message)) {
    $patch['message'] = $message;
}

// parentsLinks
if (! empty($ancestors)) {
    $parentsLinks = array();
    foreach (array_reverse($ancestors) as $ancestor) {
        $parentsLinks[] = $generateEditLink($ancestor);
    }
    $patch['parentsLinks'] = $parentsLinks;
}

// dataTitle
$patch['dataTitle'] = $view->escape($tableFormat->getLabel());

// disableDeleteButton
$childCount = 0;
foreach ($children as $childTable) {
    $childCount += count($childTable);
}

$patch['disableDeleteButton'] = ($childCount > 0);

// childrenConfigOptions
$childrenConfigOptions = array();
foreach ($childrenTableLabels as $childFormat => $childTableLabel) {
    $configOptions = array();
    // $configOptions['buttonAlign'] = 'center';
    $configOptions['title'] = $view->escape($childTableLabel);
    
    // Add the edit links for each child of the current item
    $childrenLinks = array();
    if (! empty($children)) {
        foreach ($children[$childFormat] as $child) {
            $childrenLinks[] = $generateEditLink($child);
        }
        $configOptions['childrenLinks'] = $childrenLinks;
    }
    if (empty($childrenLinks)) {
        $content = $view['translator']->trans('No %value% found.');
        $configOptions['html'] = str_replace('%value%', strtolower($view->escape($childTableLabel)), $content);
    }
    
    // Add link to a new child
    $configOptions['AddChildURL'] = $generateAddLink($data->tableFormat->getSchemaCode(), $childFormat, $data->getInfoFields());
    
    array_push($childrenConfigOptions, $configOptions);
}
$patch['childrenConfigOptions'] = $childrenConfigOptions;

echo json_encode($patch);
?>
 ]