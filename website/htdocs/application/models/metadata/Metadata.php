<?php
/**
 * © French National Forest Inventory
 * Licensed under EUPL v1.1 (see http://ec.europa.eu/idabc/eupl).
 */
require_once 'metadata/FileField.php';
require_once 'metadata/FormField.php';
require_once 'metadata/FormFormat.php';
require_once 'metadata/DatasetFile.php';
require_once 'metadata/TableField.php';
require_once 'metadata/TableTreeData.php';
require_once 'metadata/TableFormat.php';
require_once 'metadata/Range.php';
require_once 'metadata/Mode.php';

/**
 * This is the Metadata model.
 * @package models
 */
class Model_Metadata extends Zend_Db_Table_Abstract {

	var $logger;

	/**
	 * Initialisation
	 */
	public function init() {

		// Initialise the logger
		$this->logger = Zend_Registry::get("logger");

		$cacheFrontendOptions = array(
			'lifetime' => 7200, // Cache lifetime in seconds
			'automatic_serialization' => true
		);

		$configuration = Zend_Registry::get("configuration");
		$this->cacheDir = $configuration->cachedDir;
		$this->useCache = $configuration->useCache;
		$cacheBackendOptions = array(
			'cache_dir' => $this->cacheDir // Cache directory
		);

		// créer un objet Zend_Cache_Core
		$this->cache = Zend_Cache::factory('Core', 'File', $cacheFrontendOptions, $cacheBackendOptions);
	}

	/**
	 * Get the unit modes
	 *
	 * @param String $unit The unit
	 * @return Array[mode => label]
	 */
	public function getModes($unit) {
		$db = $this->getAdapter();
		$req = "SELECT code, label FROM mode WHERE unit = ? ORDER BY position, code";

		$this->logger->info('getModes : '.$req);

		$select = $db->prepare($req);
		$select->execute(array($unit));

		$result = array();
		foreach ($select->fetchAll() as $row) {
			$result[$row['code']] = $row['label'];
		}

		return $result;
	}

	/**
	 * Get the mode and its label.
	 *
	 * @param String $unit The unit
	 * @param String $mode The mode
	 * @return Array[mode => label]
	 */
	public function getMode($unit, $mode) {
		$db = $this->getAdapter();
		$req = "SELECT code, label FROM mode WHERE unit = ? AND code = ? ORDER BY position, code";

		$this->logger->info('getMode : '.$req);

		$select = $db->prepare($req);
		$select->execute(array($unit, $mode));

		$result = array();
		foreach ($select->fetchAll() as $row) {
			$result[$row['code']] = $row['label'];
		}
		return $result;
	}

	/**
	 * Get the available datasets.
	 *
	 * @return Array[dataset_id => label]
	 */
	public function getDatasets() {
		$db = $this->getAdapter();
		$req = "SELECT dataset_id as id, label, is_default ";
		$req .= " FROM dataset";
		$req .= " ORDER BY dataset_id";

		$this->logger->info('getDatasets : '.$req);

		$select = $db->prepare($req);
		$select->execute(array());

		return $select->fetchAll();
	}

	/**
	 * Get the requested files for a data submission for a given dataset.
	 *
	 * @param String $datasetId The identifier of the dataset
	 * @return Array[DatasetFile]
	 */
	public function getRequestedFiles($datasetId) {
		$db = $this->getAdapter();
		$req = " SELECT format, file_type, label ";
		$req .= " FROM dataset_files ";
		$req .= " LEFT JOIN file_format using (format) ";
		$req .= " WHERE dataset_id = ? ";
		$req .= " ORDER BY position";

		$this->logger->info('getRequestedFiles : '.$req);

		$select = $db->prepare($req);
		$select->execute(array($datasetId));

		$result = array();
		foreach ($select->fetchAll() as $row) {
			$datasetFile = new DatasetFile();
			$datasetFile->fileType = $row['file_type'];
			$datasetFile->format = $row['format'];
			$datasetFile->label = $row['label'];
			$result[] = $datasetFile;
		}
		return $result;
	}

	/**
	 * Get the list of requested fields for the file.
	 *
	 * @param String $fileFormat the file format
	 * @return Array[FormField]
	 */
	public function getFileFields($fileFormat) {

		$db = $this->getAdapter();

		$this->logger->debug('getFileFields : '.$fileFormat);

		// Get the fields specified by the format
		$req = "SELECT file_field.*, data.label as label, data.unit, unit.type as type, data.definition as definition ";
		$req .= " FROM file_field ";
		$req .= " LEFT JOIN data on (file_field.data = data.data) ";
		$req .= " LEFT JOIN unit on (data.unit = unit.unit) ";
		$req .= " WHERE format = ? ";
		$req .= " ORDER BY position ASC";

		$this->logger->info('getFileFields : '.$req);

		$select = $db->prepare($req);
		$select->execute(array($fileFormat));

		$result = array();
		foreach ($select->fetchAll() as $row) {
			$fileField = new FileField();
			$fileField->data = $row['data'];
			$fileField->format = $row['format'];
			$fileField->label = $row['label'];
			$fileField->unit = $row['unit'];
			$fileField->type = $row['type'];
			$fileField->definition = $row['definition'];
			$fileField->isMandatory = $row['is_mandatory'];
			$fileField->mask = $row['mask'];
			$result[] = $fileField;
		}

		return $result;
	}

	/**
	 * Get the list of table fields for a given table format.
	 * If the dataset is specified, we filter on the fields of the dataset.
	 *
	 * @param String $datasetID the dataset identifier (optional)
	 * @param String $schema the schema identifier
	 * @param String $format the format
	 * @return Array[TableField]
	 */
	public function getTableFields($datasetID, $schema, $format) {

		$db = $this->getAdapter();

		$this->logger->debug('getTableFields : '.$datasetID.'_'.$schema.'_'.$format);

		$key = 'getTableFields_'.$datasetID.'_'.$schema.'_'.$format;
		if ($this->useCache) {
			$cachedResult = $this->cache->load($key);
		}

		if (empty($cachedResult)) {

			// Get the fields specified by the format
			$req = "SELECT table_field.*, data.label, data.unit, unit.type, data.definition ";
			$req .= " FROM table_field ";
			$req .= " LEFT JOIN dataset_fields on (table_field.format = dataset_fields.format AND table_field.data = dataset_fields.data) ";
			$req .= " LEFT JOIN data on (table_field.data = data.data) ";
			$req .= " LEFT JOIN unit on (data.unit = unit.unit) ";
			$req .= " WHERE (1=1)";
			if ($datasetID != null) {
				$req .= " AND dataset_fields.dataset_id = ? ";
			}
			$req .= " AND dataset_fields.schema_code = ? ";
			$req .= " AND table_field.format = ? ";

			$this->logger->info('getTableFields : '.$req);

			$select = $db->prepare($req);
			if ($datasetID != null) {
				$select->execute(array($datasetID, $schema, $format));
			} else {
				$select->execute(array($schema, $format));
			}

			$result = array();
			foreach ($select->fetchAll() as $row) {
				$tableField = new TableField();
				$tableField->data = $row['data'];
				$tableField->format = $row['format'];
				$tableField->columnName = $row['column_name'];
				$tableField->isCalculated = $row['is_calculated'];
				$tableField->isAggregatable = $row['is_aggregatable'];
				$tableField->label = $row['label'];
				$tableField->unit = $row['unit'];
				$tableField->type = $row['type'];
				$tableField->definition = $row['definition'];

				$result[$tableField->data] = $tableField;
			}

			if ($this->useCache) {
				$this->cache->save($result, $key);
			}
			return $result;
		} else {
			return $cachedResult;
		}
	}

	/**
	 * Get the information about a table format.
	 *
	 * @param String $schema the schema identifier
	 * @param String $format the format
	 * @return TableFormat
	 */
	public function getTableFormat($schema, $format) {

		$db = $this->getAdapter();

		$this->logger->debug('getTableFormat : '.$schema.' '.$format);

		$key = 'getTableFormat'.$schema.'_'.$format;
		if ($this->useCache) {
			$cachedResult = $this->cache->load($key);
		}

		if (empty($cachedResult)) {

			// Get the fields specified by the format
			$req = "SELECT * ";
			$req .= " FROM table_format ";
			$req .= " WHERE schema_code = ? ";
			$req .= " AND format = ? ";

			$this->logger->info('getTableFormat : '.$req);

			$select = $db->prepare($req);
			$select->execute(array($schema, $format));

			$row = $select->fetch();

			$tableFormat = new TableFormat();
			$tableFormat->format = $format;
			$tableFormat->schemaCode = $schema;
			$tableFormat->tableName = $row['table_name'];
			$tableFormat->primaryKeys = explode(",", $row['primary_key']);

			if ($this->useCache) {
				$this->cache->save($tableFormat, $key);
			}
			return $tableFormat;
		} else {
			return $cachedResult;
		}
	}

	/**
	 * Get the forms used by a dataset.
	 *
	 * @param String $datasetId The identifier of the dataset
	 * @param String $schemaCode The logical name of the schema (RAW_DATA or HARMONIZED_DATA)
	 * @return Array[FormFormat]
	 */
	public function getForms($datasetId, $schemaCode) {

		$key = 'getForms_'.$datasetId."_".$schemaCode;
		if ($this->useCache) {
			$cachedResult = $this->cache->load($key);
		}

		if (empty($cachedResult)) {

			$db = $this->getAdapter();
			$req = " SELECT distinct form_format.format, form_format.label, form_format.definition, position ";
			$req .= " FROM ( ";
			$req .= "       SELECT DISTINCT field_mapping.src_format as format ";
			$req .= "       FROM dataset ";
			$req .= "       LEFT JOIN dataset_fields USING (dataset_id) ";
			$req .= "       LEFT JOIN field_mapping ON ( ";
			$req .= "                      dataset_fields.format = field_mapping.dst_format ";
			$req .= "                      AND dataset_fields.data = field_mapping.dst_data ";
			$req .= "                      AND field_mapping.mapping_type = 'FORM') ";
			$req .= "       WHERE src_format IS NOT NULL";
			$req .= "       AND schema_code = ?";
			if (!empty($datasetId)) {
				$req .= " AND dataset_id = ?";
			}
			$req .= "      ) as foo ";
			$req .= "      LEFT JOIN form_format on (form_format.format = foo.format) ";
			$req .= "      ORDER BY position";

			$this->logger->info('getForms : '.$req);

			$select = $db->prepare($req);
			if (!empty($datasetId)) {
				$select->execute(array($schemaCode, $datasetId));
			} else {
				$select->execute(array($schemaCode));
			}

			$result = array();
			foreach ($select->fetchAll() as $row) {
				$formFormat = new FormFormat();
				$formFormat->format = $row['format'];
				$formFormat->label = $row['label'];
				$formFormat->definition = $row['definition'];
				$result[] = $formFormat;
			}
			if ($this->useCache) {
				$this->cache->save($result, $key);
			}
			return $result;
		} else {
			return $cachedResult;
		}
	}

	/**
	 * Get the fields for a given Form that can be used as a result.
	 *
	 * @param String $dataset the name of the dataset
	 * @param String $formFormat the name of the form format
	 * @param String $schema the name of the database schema
	 * @param String $mode if 'criteria' we're looking for a criteria, if 'result' we're looking for a result.
	 * @return Array[FormField]
	 */
	public function getFormFields($dataset, $formFormat, $schema, $mode) {

		$this->logger->info('getFormFields : '.$dataset.' '.$formFormat.' '.$schema);

		$key = 'getFormFields_'.$mode.'_'.$dataset.'_'.$formFormat.'_'.$schema;
		if ($this->useCache) {
			$cachedResult = $this->cache->load($key);
		}
		if (empty($cachedResult)) {

			$db = $this->getAdapter();

			$param = array();

			// Select the list of available fields for the table (excepted the FK)
			$req = " SELECT DISTINCT form_field.*, data.label, data.definition, unit.type, unit.unit ";
			$req .= " FROM form_field ";
			$req .= " LEFT JOIN data using (data) ";
			$req .= " LEFT JOIN unit using (unit) ";

			// Check the field format
			$req .= " WHERE format = ?";
			$param[] = $formFormat;

			// Check the field type (result or criteria)
			if ($mode == "result") {
				$req .= " AND is_result = '1'";
			} else if ($mode == "criteria") {
				$req .= " AND is_criteria = '1'";
			}

			// If a dataset has been selected, filter the available options
			// TODO : Do the mapping FROM -> TABLE
			if (!empty($dataset)) {
				$req .= " AND (data IN ( ";
				$req .= " SELECT data ";
				$req .= " FROM dataset_fields ";
				$req .= " LEFT JOIN field_mapping on (dataset_fields.format = field_mapping.dst_format AND dataset_fields.data = field_mapping.dst_data AND mapping_type='FORM') ";
				$req .= " WHERE dataset_id = ? ";
				$req .= " AND schema_code = ? ";
				$req .= " AND src_format = ? ";
				$req .= " ) )";
				$param[] = $dataset;
				$param[] = $schema;
				$param[] = $formFormat;
			}

			$req .= " ORDER BY position";

			$this->logger->info('getFormFields : '.$req);

			$select = $db->prepare($req);
			$select->execute($param);

			$result = array();
			foreach ($select->fetchAll() as $row) {
				$formField = new FormField();
				$formField->data = $row['data'];
				$formField->format = $formFormat;
				$formField->label = $row['label'];
				$formField->inputType = $row['input_type'];
				$formField->definition = $row['definition'];
				$formField->isCriteria = $row['is_criteria'];
				$formField->isResult = $row['is_result'];
				$formField->type = $row['type'];
				$formField->unit = $row['unit'];
				$formField->isDefaultResult = $row['is_default_result'];
				$formField->isDefaultCriteria = $row['is_default_criteria'];
				$formField->defaultValue = $row['default_value'];
				$formField->decimals = $row['decimals'];
				$formField->mask = $row['mask'];
				$result[] = $formField;
			}

			if ($this->useCache) {
				$this->cache->save($result, $key);
			}
			return $result;
		} else {
			return $cachedResult;
		}

	}

	/**
	 * Get the description of a form field.
	 *
	 * @param String $formFormat The logical name of the form
	 * @param String $formFieldName The logical name of the field
	 * @return FormField
	 */
	public function getFormField($formFormat, $formFieldName) {

		$key = 'formfield_'.$formFormat.'_'.$formFieldName;
		if ($this->useCache) {
			$cachedResult = $this->cache->load($key);
		}
		if (empty($cachedResult)) {

			$this->logger->info('getFormField : '.$formFormat.", ".$formFieldName);
			$db = $this->getAdapter();
			$req = " SELECT form_field.*, data.label, data.definition, unit.type, unit.unit ";
			$req .= " FROM form_field ";
			$req .= " LEFT JOIN data using (data) ";
			$req .= " LEFT JOIN unit using (unit) ";
			$req .= " WHERE data = ? ";
			$req .= " AND   format = ?";

			$select = $db->prepare($req);
			$select->execute(array($formFieldName, $formFormat));

			$row = $select->fetch();
			$formField = new FormField();
			$formField->name = $formFieldName;
			$formField->data = $row['data'];
			$formField->format = $formFormat;
			$formField->isCriteria = $row['is_criteria'];
			$formField->isResult = $row['is_result'];
			$formField->inputType = $row['input_type'];
			$formField->isDefaultResult = $row['is_default_result'];
			$formField->isDefaultCriteria = $row['is_default_criteria'];
			$formField->defaultValue = $row['default_value'];
			$formField->definition = $row['definition'];
			$formField->label = $row['label'];
			$formField->type = $row['type'];
			$formField->unit = $row['unit'];
			$formField->decimals = $row['decimals'];
			$formField->mask = $row['mask'];

			$this->logger->info('formField->format : '.$formField->format);

			if ($this->useCache) {
				$this->cache->save($formField, $key);
			}
			return $formField;
		} else {
			return $cachedResult;
		}
	}

	/**
	 * Get the range of a field.
	 *
	 * @param String $data the data
	 * @return Range
	 */
	public function getRange($data) {

		$this->logger->info('getRange : '.$data);

		$db = $this->getAdapter();
		$req = "SELECT min, max
                FROM data
                LEFT JOIN range USING (unit)
                WHERE data.data = ?";

		$this->logger->info('getRange : '.$req);

		$select = $db->prepare($req);
		$select->execute(array($data));

		$row = $select->fetch();
		$range = new Range();
		$range->min = $row['min'];
		$range->max = $row['max'];

		return $range;
	}

	/**
	 * Get the list of available columns of a table.
	 *
	 * @param String $format the logical name of the table
	 * @return array[TableField]
	 */
	public function getTableColumnsForDisplay($format) {
		$db = $this->getAdapter();
		$req = " SELECT field_mapping.src_data, field_mapping.src_format, field_mapping.dst_data, field_mapping.dst_format, table_field.column_name, data.label, data.definition, unit.type, unit.unit ";
		$req .= " FROM table_field ";
		$req .= " LEFT JOIN field_mapping on (field_mapping.dst_format = table_field.format AND field_mapping.dst_data = table_field.data) ";
		$req .= " LEFT JOIN form_field on (field_mapping.src_format = form_field.format AND field_mapping.src_data = form_field.data) ";
		$req .= " LEFT JOIN data on (table_field.data = data.data) ";
		$req .= " LEFT JOIN unit on (data.unit = unit.unit)";
		$req .= " WHERE table_field.format = ? ";
		$req .= " AND mapping_type = 'FORM' ";
		$req .= " AND form_field.is_result = '1'";

		$this->logger->info('getTableColumnsForDisplay : '.$req);

		$select = $db->prepare($req);
		$select->execute(array($format));

		$result = array();
		foreach ($select->fetchAll() as $row) {
			$tableField = new TableField();
			$tableField->sourceFormName = $row['src_format'];
			$tableField->sourceFieldName = $row['src_data'];
			$tableField->data = $row['dst_data'];
			$tableField->format = $row['dst_format'];
			$tableField->label = $row['label'];
			$tableField->definition = $row['definition'];
			$tableField->unit = $row['unit'];
			$tableField->columnName = $row['column_name'];
			$result[] = $tableField;
		}

		return $result;
	}

	/**
	 * Get the database field corresponding to the asked form field.
	 *
	 * @param FormField $formField the form field
	 * @param String $schema the name of the schema (RAW_DATA or HARMONIZED_DATA)
	 * @return TableField
	 */
	public function getFormToTableMapping($formField, $schema) {

		$this->logger->info('getFormToTableMapping : '.$formField->format." ".$formField->data." ".$schema);

		$key = 'formtotablemapping_'.$formField->format.'_'.$formField->data.'_'.$schema;
		if ($this->useCache) {
			$cachedResult = $this->cache->load($key);
		}
		if (empty($cachedResult)) {

			$db = $this->getAdapter();
			$req = " SELECT table_field.*, data.label, data.definition, unit.unit, unit.type ";
			$req .= " FROM field_mapping ";
			$req .= " LEFT JOIN table_field on (field_mapping.dst_format = table_field.format AND field_mapping.dst_data = table_field.data) ";
			$req .= " LEFT JOIN dataset_fields on (dataset_fields.format = table_field.format AND dataset_fields.data = table_field.data) ";
			$req .= " LEFT JOIN data on (table_field.data = data.data)";
			$req .= " LEFT JOIN unit on (data.unit = unit.unit)";
			$req .= " WHERE src_format = ? ";
			$req .= " AND src_data = ? ";
			$req .= " AND schema_code = ? ";
			$req .= " AND mapping_type = 'FORM'";

			$this->logger->info('getFormToTableMapping : '.$req);

			$select = $db->prepare($req);
			$select->execute(array($formField->format, $formField->data, $schema));

			$row = $select->fetch();
			$tableField = new TableField();
			$tableField->data = $row['data'];
			$tableField->format = $row['format'];
			$tableField->columnName = $row['column_name'];
			$tableField->isCalculated = $row['is_calculated'];
			$tableField->isAggregatable = $row['is_aggregatable'];
			$tableField->label = $row['label'];
			$tableField->unit = $row['unit'];
			$tableField->type = $row['type'];
			$tableField->definition = $row['definition'];

			if ($this->useCache) {
				$this->cache->save($tableField, $key);
			}
			return $tableField;
		} else {
			return $cachedResult;
		}
	}

	/**
	 * Get the form field corresponding to the table field.
	 *
	 * @param TableField $tableField the table field
	 * @return array[FormField]
	 */
	public function getTableToFormMapping($tableField) {

		$this->logger->info('getTableToFormMapping : '.$tableField->format." ".$tableField->data);

		$key = 'getTableToFormMapping'.$tableField->format.'_'.$tableField->data;
		if ($this->useCache) {
			$cachedResult = $this->cache->load($key);
		}
		if (empty($cachedResult)) {

			$db = $this->getAdapter();
			$req = " SELECT form_field.*, data.label, data.definition, unit.unit, unit.type ";
			$req .= " FROM form_field ";
			$req .= " LEFT JOIN field_mapping on (field_mapping.src_format = form_field.format AND field_mapping.src_data = form_field.data AND mapping_type = 'FORM') ";
			$req .= " LEFT JOIN data on (form_field.data = data.data)";
			$req .= " LEFT JOIN unit on (data.unit = unit.unit)";
			$req .= " WHERE field_mapping.dst_format = ? ";
			$req .= " AND field_mapping.dst_data = ? ";

			$this->logger->info('getTableToFormMapping : '.$req);

			$select = $db->prepare($req);
			$select->execute(array($tableField->format, $tableField->data));

			$row = $select->fetch();
			$formField = new FormField();
			$formField->data = $row['data'];
			$formField->format = $row['format'];
			$formField->label = $row['label'];
			$formField->inputType = $row['input_type'];
			$formField->definition = $row['definition'];
			$formField->isCriteria = $row['is_criteria'];
			$formField->isResult = $row['is_result'];
			$formField->type = $row['type'];
			$formField->unit = $row['unit'];
			$formField->isDefaultResult = $row['is_default_result'];
			$formField->isDefaultCriteria = $row['is_default_criteria'];
			$formField->defaultValue = $row['default_value'];
			$formField->decimals = $row['decimals'];
			$formField->mask = $row['mask'];

			if ($this->useCache) {
				$this->cache->save($formField, $key);
			}
			return $formField;
		} else {
			return $cachedResult;
		}
	}

	/**
	 * Get the ancestors of the table format in the table tree.
	 *
	 * @param String $tableFormat the table format
	 * @param String $fieldName the name of the field that is using this table (used for complementary data)
	 * @param String $schemaCode the name of the schema
	 * @return array[TableTreeData]
	 * @throws Exception if the table is not found
	 */
	public function getTablesTree($tableFormat, $fieldName, $schemaCode) {

		$this->logger->info('getTablesTree : tableFormat:'.$tableFormat.' fieldName:'.$fieldName.' schemaCode:'.$schemaCode);

		$key = 'getTablesTree_'.$tableFormat.'_'.$fieldName.'_'.$schemaCode;
		if ($this->useCache) {
			$cachedResult = $this->cache->load($key);
		}
		if (empty($cachedResult)) {

			$result = array();

			$db = $this->getAdapter();
			$req = " SELECT child_table, parent_table, join_key, primary_key, table_format.table_name ";
			$req .= " FROM table_tree ";
			$req .= " LEFT JOIN table_format on (child_table = table_format.format) ";
			$req .= " WHERE child_table = ? ";
			$req .= " AND table_tree.schema_code = ?";

			$this->logger->info('getTablesTree : '.$req);

			$select = $db->prepare($req);
			$select->execute(array($tableFormat, $schemaCode));

			$row = $select->fetch();

			if (empty($row)) {
				$this->logger->err("Table ancestor cannot be found");
				throw new Exception("Table ancestor cannot be found");
			}

			$tableTreeData = new TableTreeData();
			$tableTreeData->tableFormat = $row['child_table'];
			$tableTreeData->parentTable = $row['parent_table'];
			$tableTreeData->keys = $row['join_key'];
			$tableTreeData->identifiers = $row['primary_key'];
			$tableTreeData->tableName = $row['table_name'];
			$tableTreeData->fieldName = $fieldName;

			$result[] = $tableTreeData;

			// Recursively call the function if needed
			if ($tableTreeData->parentTable != "*") {
				$result = array_merge($result, $this->getTablesTree($tableTreeData->parentTable, $fieldName, $schemaCode));
			}

			if ($this->useCache) {
				$this->cache->save($result, $key);
			}
			return $result;
		} else {
			return $cachedResult;
		}
	}

	/**
	 * Get fields available for aggregation or interpolation.
	 *
	 * @param String $datasetId the dataset identifier
	 * @param Array[TableTreeData] $availableTables the available tables
	 * @param String $schema the schema
	 * @return Array[Field]
	 */
	public function getQuantitativeFields($datasetId, $availableTables, $schema) {

		$this->logger->info('getQuantitativeFields : '.$datasetId);

		$db = $this->getAdapter();

		// Get the list of available formats
		$formats = "";
		foreach ($availableTables as $availableTable) {
			$formats .= "'".$availableTable->tableFormat."', ";
		}
		$formats = substr($formats, 0, -2);
		$this->logger->info('availableTables : '.$formats);

		// Prepare the request
		$req = " SELECT dataset_fields.format, data.data, data.label, unit.unit, unit.type ";
		$req .= " FROM dataset_fields ";
		$req .= " LEFT JOIN data using (data) ";
		$req .= " LEFT JOIN unit using (unit) ";
		$req .= " LEFT JOIN table_field on (dataset_fields.format = table_field.format and data.data = table_field.data) ";
		$req .= " WHERE dataset_id = ? ";
		$req .= " AND schema_code = '".$schema."' ";
		$req .= " AND dataset_fields.format IN (".$formats.") ";
		$req .= " AND table_field.is_aggregatable = '1' ";
		$req .= " AND type IN ('NUMERIC', 'RANGE') ";

		$this->logger->info('getQuantitativeFields : '.$req);

		$select = $db->prepare($req);
		$select->execute(array($datasetId));

		$result = array();
		foreach ($select->fetchAll() as $row) {
			$field = new Field();
			$field->data = $row['data'];
			$field->format = $row['format'];
			$field->label = $row['label'];
			$field->unit = $row['unit'];
			$field->type = $row['type'];

			$result[] = $field;
		}

		return $result;
	}
}
