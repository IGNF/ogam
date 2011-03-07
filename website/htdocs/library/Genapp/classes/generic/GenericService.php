<?php
/**
 * © French National Forest Inventory
 * Licensed under EUPL v1.1 (see http://ec.europa.eu/idabc/eupl).
 */

/**
 * The Generic Service.
 *
 * This service handles transformations between data objects.
 *
 * @package classes
 */
class GenericService {

	/**
	 * The logger.
	 */
	var $logger;

	/**
	 * The models.
	 */
	var $genericModel;
	var $metadataModel;

	/**
	 * Constructor.
	 */
	function __construct() {

		// Initialise the logger
		$this->logger = Zend_Registry::get("logger");

		// Initialise the metadata models
		$this->genericModel = new Model_Generic();
		$this->metadataModel = new Model_Metadata();
	}

	/**
	 * Serialize the data object as a JSON string.
	 *
	 * @param DataObject $data the data object we're looking at.
	 * @return JSON
	 */
	public function datumToDetailJSON($data) {

		$this->logger->info('datumToDetailJSON');

		$json = "{title:'".$data->tableFormat->format."', is_array:false, fields:[";
		$fields = "";
		foreach ($data->getFields() as $tableField) {

			// Get the form field correspondnig to the table field
			$form = $this->getTableToFormMapping($tableField, true);

			// Add the corresponding JSON
			if ($form != null) {
				$fields .= $form->toDetailJSON().",";
			}
		}
		// remove last comma
		if ($fields != "") {
			$fields = substr($fields, 0, -1);
		}
		$json .= $fields."]}";

		return $json;
	}

	/**
	 * Serialize a list of data objects as a JSON array.
	 *
	 * @param Strig $title the title
	 * @param List[DataObject] $data the data object we're looking at.
	 * @return JSON
	 */
	public function dataToDetailJSON($title, $data) {

		$this->logger->info('dataToDetailJSON : '.$title);

		$json = "";

		if (!empty($data)) {

			$firstData = $data[0];

			// create the JSON object
			$json .= ",{title:'".$title."', is_array:true, columns:[";

			// add the colums description
			foreach ($firstData->editableFields as $field) {
				$json .= "{name:".json_encode($field->data).", label:".json_encode($field->label)."}, ";
			}
			$json = substr($json, 0, -2);
			$json .= "], rows:[";

			// dump each row values
			foreach ($data as $datum) {
				$json .= "["; // new line
				foreach ($datum->editableFields as $field) {

					// get the form field corresponding to the table field
					$json .= json_encode($field->value).", ";
				}
				$json = substr($json, 0, -2);
				$json .= "], "; // end of line
			}
			$json = substr($json, 0, -2);
			$json .= "]"; // end of rows
			$json .= "}"; // end the object
		}

		return $json;
	}

	/**
	 * Get the form field corresponding to the table field.
	 *
	 * @param TableField $tableField the table field
	 * @param Boolean $copyValues is true the values will be copied
	 * @return array[FormField]
	 */
	public function getTableToFormMapping($tableField, $copyValues = false) {

		$this->logger->info('dataToDetailJSON : '.$tableField->data);

		// Get the description of the form field
		$formField = $this->metadataModel->getTableToFormMapping($tableField);
		if ($formField != null) {
			$formField = clone $formField;
		}

		// Copy the value
		if ($copyValues == true && $formField != null && $tableField->value != null) {

			// Copy the value
			$formField->value = $tableField->value;

			// Fill the label
			if ($formField->type == "CODE") {
				$formField->valueLabel = $this->metadataModel->getMode($tableField->unit, $tableField->value);
			} else {
				$formField->valueLabel = $tableField->value;
			}

		}

		return $formField;
	}

}

?>