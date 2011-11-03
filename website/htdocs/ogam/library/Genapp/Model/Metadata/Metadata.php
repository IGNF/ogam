<?php
/**
 * © French National Forest Inventory
 * Licensed under EUPL v1.1 (see http://ec.europa.eu/idabc/eupl).
 */

/**
 * This is the Metadata model.
 * @package models
 */
class Genapp_Model_Metadata_Metadata extends Zend_Db_Table_Abstract {

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
	 * Get the unit modes.
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
	 * Get the label of a mode.
	 *
	 * @param String $unit The unit
	 * @param String $mode The mode
	 * @return String label
	 */
	public function getMode($unit, $mode) {
		$db = $this->getAdapter();
		$req = "SELECT code, label FROM mode WHERE unit = ? AND code = ? ORDER BY position, code";

		$this->logger->info('getMode : '.$req);

		$select = $db->prepare($req);
		$select->execute(array($unit, $mode));

		$row = $select->fetch();
		if ($row) {
			return $row['label'];
		} else {
			return null;
		}
	}

	/**
	 * Get the labels and modes for a tree unit.
	 *
	 * @param String $unit The unit
	 * @return Array[mode => label]
	 */
	public function getTreeLabels($unit) {
		$db = $this->getAdapter();
		$req = "SELECT code, label FROM mode_tree WHERE unit = ? ORDER BY position, code";

		$this->logger->info('getTreeLabels : '.$req);

		$select = $db->prepare($req);
		$select->execute(array($unit));

		$result = array();
		foreach ($select->fetchAll() as $row) {
			$result[$row['code']] = $row['label'];
		}

		return $result;
	}

	/**
	 * Get the unit modes for a dynamic list.
	 *
	 * @param String $unit The unit
	 * @param String $query optional query filter
	 * @return Array[mode => label]
	 */
	public function getDynamodes($unit, $query = null) {
		$db = $this->getAdapter();

		$req = $this->_getDynamodeSQL($unit);

		if (!empty($query)) {
			$req = "select * from (".$req.") as foo where label ilike '".$query."%'";
		}
		$this->logger->info('getDynamicCodes : '.$req);

		$select = $db->prepare($req);
		$select->execute(array());

		$result = array();
		foreach ($select->fetchAll() as $row) {
			$result[$row['code']] = $row['label'];
		}

		return $result;
	}

	/**
	 * Get the SQL query used to find unit modes for a dynamic list.
	 *
	 * @param String $unit The unit
	 * @return String the SQL query, that should return an ordered list of code / label.
	 */
	private function _getDynamodeSQL($unit) {
		$db = $this->getAdapter();
		$req = "SELECT sql FROM dynamode WHERE unit = ?";

		$this->logger->info('_getDynamodeSQL : '.$req);

		$select = $db->prepare($req);
		$select->execute(array($unit));

		$row = $select->fetch();

		if (!empty($row)) {
			return $row['sql'];
		} else {
			throw new Exception("There is no SQL query defined for UNIT ".$unit);
		}
	}

	/**
	 * Get the unit modes from a tree.
	 *
	 * Return a hierarchy of nodes
	 *
	 * @param String $unit The unit
	 * @param String $parentcode The identifier of the start node in the tree (by default the root node is *)
	 * @param Integer $levels The number of levels of depth (if 0 then no limitation)
	 * @return Genapp_Object_Metadata_TreeNode
	 */
	public function getTreeModes($unit, $parentcode = '*', $levels = 1) {
		$db = $this->getAdapter();
		$req = "WITH RECURSIVE node_list( unit, code, parent_code, label, definition, position, is_leaf, level) AS ( ";
		$req .= "	    SELECT unit, code, parent_code, label, definition, position, is_leaf, 1 ";
		$req .= "		FROM mode_tree ";
		$req .= "		WHERE unit = ? ";
		$req .= "		AND parent_code = ? ";
		$req .= "	UNION ALL ";
		$req .= "		SELECT child.unit, child.code, child.parent_code, child.label, child.definition, child.position, child.is_leaf, level + 1 ";
		$req .= "		FROM mode_tree child ";
		$req .= "		INNER JOIN node_list on child.parent_code = node_list.code ";
		if ($levels != 0) {
			$req .= "		WHERE level < ".$levels." ";
		}
		$req .= "	) ";
		$req .= "	SELECT * ";
		$req .= "	FROM node_list ";
		$req .= "	ORDER BY level, position, code "; // level is used to ensure correct construction of the structure

		$this->logger->info('getTreeModes : '.$unit.' '.$parentcode);
		$this->logger->info('getTreeModes : '.$req);

		$select = $db->prepare($req);

		$select->execute(array($unit, $parentcode));

		$resultTree = new Genapp_Object_Metadata_TreeNode(); // The root is empty
		foreach ($select->fetchAll() as $row) {
				
			$parentCode = $row['parent_code'];
				
			$this->logger->info('getTreeModes : '.$parentCode);

			//Build the new node
			$tree = new Genapp_Object_Metadata_TreeNode();
			$tree->code = $row['code'];
			$tree->label = $row['label'];
			$tree->isLeaf = $row['is_leaf'];

			// Check if a parent can be found in the structure
			$parentNode = $resultTree->getNode($parentCode);
			if ($parentNode == null) {
				// Add the new node to the result root
				$resultTree->addChild($tree);

			} else {
				// Add it to the found parent
				$parentNode->addChild($tree);

			}

		}

		return $resultTree;
	}

	/**
	 * Get all the children codes from a node of a tree.
	 *
	 * Return an array of codes.
	 *
	 * @param String $unit The unit
	 * @param String $code The identifier of the start node in the tree (by default the root node is *)
	 * @param Integer $levels The number of levels of depth (if 0 then no limitation)
	 * @return Array[String]
	 */
	public function getTreeChildrenCodes($unit, $code = '*', $levels = 1) {
		$this->logger->info('getTreeChildrenCodes : '.$unit.'_'.$code.'_'.$levels);
		$db = $this->getAdapter();
		$req = "WITH RECURSIVE node_list( unit, code, parent_code, label, definition, position, is_leaf, level) AS ( ";
		$req .= "	    SELECT unit, code, parent_code, label, definition, position, is_leaf, 1 ";
		$req .= "		FROM mode_tree ";
		$req .= "		WHERE unit = ? ";
		$req .= "		AND code = ? ";
		$req .= "	UNION ALL ";
		$req .= "		SELECT child.unit, child.code, child.parent_code, child.label, child.definition, child.position, child.is_leaf, level + 1 ";
		$req .= "		FROM mode_tree child ";
		$req .= "		INNER JOIN node_list on child.parent_code = node_list.code ";
		if ($levels != 0) {
			$req .= "		WHERE level < ".$levels." ";
		}
		$req .= "	) ";
		$req .= "	SELECT * ";
		$req .= "	FROM node_list ";
		$req .= "	ORDER BY level, position, code "; // level is used to ensure correct construction of the structure

		$this->logger->info('getTreeChildrenCodes : '.$req);

		$select = $db->prepare($req);
		$select->execute(array($unit, $code));

		$result = array();
		foreach ($select->fetchAll() as $row) {
			$result[] = $row['code'];
		}

		return $result;
	}


	/**
	 * Get the available datasets for display.
	 *
	 * @return Array[Genapp_Object_Metadata_Dataset]
	 */
	public function getDatasetsForDisplay() {
		$db = $this->getAdapter();
		$req = "SELECT DISTINCT dataset_id as id, label, is_default ";
		$req .= " FROM dataset ";
		$req .= " INNER JOIN dataset_fields using (dataset_id) ";
		$req .= " ORDER BY dataset_id";

		$this->logger->info('getDatasetsForDisplay : '.$req);

		$select = $db->prepare($req);
		$select->execute(array());

		$result = array();
		foreach ($select->fetchAll() as $row) {
			$dataset = new Genapp_Object_Metadata_Dataset();
			$dataset->id = $row['id'];
			$dataset->label = $row['label'];
			$dataset->isDefault = $row['is_default'];
			$result[] = $dataset;
		}
		return $result;
	}

	/**
	 * Get the available datasets for upload.
	 *
	 * @return Array[Genapp_Object_Metadata_Dataset]
	 */
	public function getDatasetsForUpload() {
		$db = $this->getAdapter();
		$req = "SELECT DISTINCT dataset_id as id, label, is_default ";
		$req .= " FROM dataset ";
		$req .= " INNER JOIN dataset_files using (dataset_id) ";
		$req .= " ORDER BY dataset_id";

		$this->logger->info('getDatasetsForUpload : '.$req);

		$select = $db->prepare($req);
		$select->execute(array());
		
		$result = array();
		foreach ($select->fetchAll() as $row) {
			$dataset = new Genapp_Object_Metadata_Dataset();
			$dataset->id = $row['id'];
			$dataset->label = $row['label'];
			$dataset->isDefault = $row['is_default'];
			$result[] = $dataset;
		}
		return $result;
	}

	/**
	 * Get the requested files for a data submission for a given dataset.
	 *
	 * @param String $datasetId The identifier of the dataset
	 * @return Array[Genapp_Object_Metadata_DatasetFile]
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
			$datasetFile = new Genapp_Object_Metadata_DatasetFile();
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
	 * @return Array[Genapp_Object_Metadata_FileField]
	 */
	public function getFileFields($fileFormat) {

		$db = $this->getAdapter();

		$this->logger->debug('getFileFields : '.$fileFormat);

		// Get the fields specified by the format
		$req = "SELECT file_field.*, data.label as label, data.unit, unit.type as type, unit.subtype as subtype, data.definition as definition ";
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
			$fileField = new Genapp_Object_Metadata_FileField();
			$fileField->data = $row['data'];
			$fileField->format = $row['format'];
			$fileField->label = $row['label'];
			$fileField->unit = $row['unit'];
			$fileField->type = $row['type'];
			$fileField->subtype = $row['subtype'];
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
	 * @return Array[Genapp_Object_Metadata_TableField]
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
			$req = "SELECT DISTINCT table_field.*, data.label, data.unit, unit.type, unit.subtype, data.definition ";
			$req .= " FROM table_field ";
			if ($datasetID != null) {
				$req .= " LEFT JOIN dataset_fields on (table_field.format = dataset_fields.format AND table_field.data = dataset_fields.data) ";
			}
			$req .= " LEFT JOIN table_format on (table_format.format = table_field.format) ";
			$req .= " LEFT JOIN data on (table_field.data = data.data) ";
			$req .= " LEFT JOIN unit on (data.unit = unit.unit) ";
			$req .= " WHERE (1=1)";
			if ($datasetID != null) {
				$req .= " AND dataset_fields.dataset_id = ? ";
			}
			$req .= " AND table_format.schema_code = ? ";
			$req .= " AND table_field.format = ? ";
			$req .= " ORDER BY table_field.position ";

			$select = $db->prepare($req);
			if ($datasetID != null) {
				$select->execute(array($datasetID, $schema, $format));
			} else {
				$select->execute(array($schema, $format));
			}

			$result = array();
			foreach ($select->fetchAll() as $row) {
				$tableField = new Genapp_Object_Metadata_TableField();
				$tableField->data = $row['data'];
				$tableField->format = $row['format'];
				$tableField->columnName = $row['column_name'];
				$tableField->isCalculated = $row['is_calculated'];
				$tableField->position = $row['position'];
				$tableField->label = $row['label'];
				$tableField->unit = $row['unit'];
				$tableField->type = $row['type'];
				$tableField->subtype = $row['subtype'];
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
	 * Detect the column getting the geographical information in a list of tables.
	 * If the dataset is specified, we filter on the fields of the dataset.
	 *
	 * @param String $schema the schema identifier
	 * @param Array[String] $tables a list of formats
	 * @return Array[Genapp_Object_Metadata_TableField]
	 * @throws an exceptionif the tables contain no geographical information
	 */
	public function getLocationTableFields($schema, $tables) {

		$db = $this->getAdapter();

		$this->logger->debug('getLocationTableFields : '.$schema);

		// Get the fields specified by the format
		$req = "SELECT DISTINCT table_field.*, data.label, data.unit, unit.type, unit.subtype, data.definition ";
		$req .= " FROM table_field ";
		$req .= " LEFT JOIN table_format on (table_field.format = table_format.format) ";
		$req .= " LEFT JOIN data on (table_field.data = data.data) ";
		$req .= " LEFT JOIN unit on (data.unit = unit.unit) ";
		$req .= " WHERE table_field.format IN ( ";
		foreach ($tables as $format) {
			$req .= "'".$format."', ";
		}
		$req = substr($req, 0, -2); // remove last comma
		$req .= " ) ";
		$req .= " AND table_format.schema_code = ? ";
		$req .= " AND data.unit = 'GEOM' ";

		$this->logger->info('getTableFields : '.$req);

		$select = $db->prepare($req);
		$select->execute(array($schema));

		$row = $select->fetch();
		if ($row) {
			$tableField = new Genapp_Object_Metadata_TableField();
			$tableField->data = $row['data'];
			$tableField->format = $row['format'];
			$tableField->columnName = $row['column_name'];
			$tableField->isCalculated = $row['is_calculated'];
			$tableField->position = $row['position'];
			$tableField->label = $row['label'];
			$tableField->unit = $row['unit'];
			$tableField->type = $row['type'];
			$tableField->subtype = $row['subtype'];
			$tableField->definition = $row['definition'];
			return $tableField;
		} else {
			throw new Exception("No geographical information detected");
		}

	}

	/**
	 * Get the information about a table format.
	 *
	 * @param String $schema the schema identifier
	 * @param String $format the format
	 * @return Genapp_Object_Metadata_TableFormat
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

			$tableFormat = new Genapp_Object_Metadata_TableFormat();
			$tableFormat->format = $format;
			$tableFormat->schemaCode = $schema;
			$tableFormat->tableName = $row['table_name'];
			$tableFormat->label = $row['label'];
			$tableFormat->setPrimaryKeys($row['primary_key']);

			if ($this->useCache) {
				$this->cache->save($tableFormat, $key);
			}
			return $tableFormat;
		} else {
			return $cachedResult;
		}
	}

	/**
	 * Get the information about a table format.
	 *
	 * @param String $schema the schema code
	 * @param String $table the table name
	 * @return Genapp_Object_Metadata_TableFormat
	 */
	public function getTableFormatFromTableName($schema, $table) {

		$db = $this->getAdapter();

		$this->logger->debug('getTableFormatFromTableName : '.$schema.' '.$table);

		$key = 'getTableFormatFromTableName'.$schema.' '.$table;
		if ($this->useCache) {
			$cachedResult = $this->cache->load($key);
		}

		if (empty($cachedResult)) {

			// Get the fields specified by the format
			$req = "SELECT * ";
			$req .= " FROM table_format ";
			$req .= " WHERE schema_code = ? ";
			$req .= " AND table_name = upper(?) ";

			$this->logger->info('getTableFormat : '.$req);

			$select = $db->prepare($req);
			$select->execute(array($schema, $table));

			$row = $select->fetch();

			$tableFormat = new Genapp_Object_Metadata_TableFormat();
			$tableFormat->format = $row['format'];
			$tableFormat->schemaCode = $row['schema_code'];
			$tableFormat->tableName = $row['table_name'];
			$tableFormat->label = $row['label'];
			$tableFormat->setPrimaryKeys($row['primary_key']);

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
	 * @return Array[Genapp_Object_Metadata_FormFormat]
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
				$formFormat = new Genapp_Object_Metadata_FormFormat();
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
	 * @return Array[Genapp_Object_Metadata_FormField]
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
			$req = " SELECT DISTINCT form_field.*, data.label, data.definition, unit.type, unit.subtype, unit.unit ";
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

			$req .= " ORDER BY form_field.position";

			$this->logger->info('getFormFields : '.$req);

			$select = $db->prepare($req);
			$select->execute($param);

			$result = array();
			foreach ($select->fetchAll() as $row) {
				$formField = new Genapp_Object_Metadata_FormField();
				$formField->data = $row['data'];
				$formField->format = $formFormat;
				$formField->label = $row['label'];
				$formField->inputType = $row['input_type'];
				$formField->definition = $row['definition'];
				$formField->isCriteria = $row['is_criteria'];
				$formField->isResult = $row['is_result'];
				$formField->type = $row['type'];
				$formField->subtype = $row['subtype'];
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
	 * @param String $format The logical name of the form
	 * @param String $data The logical name of the field
	 * @return Genapp_Object_Metadata_FormField
	 */
	public function getFormField($format, $data) {

		$key = 'formfield_'.$format.'_'.$data;
		if ($this->useCache) {
			$cachedResult = $this->cache->load($key);
		}
		if (empty($cachedResult)) {

			$this->logger->info('getFormField : '.$format.", ".$data);
			$db = $this->getAdapter();
			$req = " SELECT form_field.*, data.label, data.definition, unit.type, unit.subtype, unit.unit ";
			$req .= " FROM form_field ";
			$req .= " LEFT JOIN data using (data) ";
			$req .= " LEFT JOIN unit using (unit) ";
			$req .= " WHERE format = ? ";
			$req .= " AND   data = ?";

			$select = $db->prepare($req);
			$select->execute(array($format, $data));

			$row = $select->fetch();
			$formField = new Genapp_Object_Metadata_FormField();
			$formField->data = $row['data'];
			$formField->format = $row['format'];
			$formField->isCriteria = $row['is_criteria'];
			$formField->isResult = $row['is_result'];
			$formField->inputType = $row['input_type'];
			$formField->isDefaultResult = $row['is_default_result'];
			$formField->isDefaultCriteria = $row['is_default_criteria'];
			$formField->defaultValue = $row['default_value'];
			$formField->definition = $row['definition'];
			$formField->label = $row['label'];
			$formField->type = $row['type'];
			$formField->subtype = $row['subtype'];
			$formField->unit = $row['unit'];
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
	 * Get the range of a field.
	 *
	 * @param String $data the data
	 * @return Genapp_Object_Metadata_Range
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
		if ($row) {
			$range = new Genapp_Object_Metadata_Range();
			$range->min = $row['min'];
			$range->max = $row['max'];
			return $range;
		} else {
			return null;
		}

	}

	/**
	 * Get the list of available columns of a table.
	 *
	 * @param String $format the logical name of the table
	 * @return array[Genapp_Object_Metadata_TableField]
	 */
	public function getTableColumnsForDisplay($format) {
		$db = $this->getAdapter();
		$req = " SELECT field_mapping.src_data, field_mapping.src_format, field_mapping.dst_data, field_mapping.dst_format, ";
		$req .= " table_field.column_name, data.label, data.definition, unit.type, unit.subtype, unit.unit ";
		$req .= " FROM table_field ";
		$req .= " LEFT JOIN field_mapping on (field_mapping.dst_format = table_field.format AND field_mapping.dst_data = table_field.data) ";
		$req .= " LEFT JOIN form_field on (field_mapping.src_format = form_field.format AND field_mapping.src_data = form_field.data) ";
		$req .= " LEFT JOIN data on (table_field.data = data.data) ";
		$req .= " LEFT JOIN unit on (data.unit = unit.unit)";
		$req .= " WHERE table_field.format = ? ";
		$req .= " AND mapping_type = 'FORM' ";
		$req .= " AND form_field.is_result = '1'";
		$req .= " ORDER BY table_field.position ";

		$this->logger->info('getTableColumnsForDisplay : '.$req);

		$select = $db->prepare($req);
		$select->execute(array($format));

		$result = array();
		foreach ($select->fetchAll() as $row) {
			$tableField = new Genapp_Object_Metadata_TableField();
			$tableField->sourceFormName = $row['src_format'];
			$tableField->sourceFieldName = $row['src_data'];
			$tableField->data = $row['dst_data'];
			$tableField->format = $row['dst_format'];
			$tableField->label = $row['label'];
			$tableField->definition = $row['definition'];
			$tableField->unit = $row['unit'];
			$tableField->subtype = $row['subtype'];
			$tableField->columnName = $row['column_name'];
			$result[] = $tableField;
		}

		return $result;
	}

	/**
	 * Get the database field corresponding to the asked form field.
	 *
	 * @param String $schema the name of the schema (RAW_DATA or HARMONIZED_DATA)
	 * @param FormField $formField the form field
	 * @return Genapp_Object_Metadata_TableField
	 */
	public function getFormToTableMapping($schema, $formField) {

		$this->logger->info('getFormToTableMapping : '.$formField->format." ".$formField->data." ".$schema);

		$key = 'formtotablemapping_'.$formField->format.'_'.$formField->data.'_'.$schema;
		if ($this->useCache) {
			$cachedResult = $this->cache->load($key);
		}
		if (empty($cachedResult)) {

			$db = $this->getAdapter();
			$req = " SELECT table_field.*, data.label, data.definition, unit.unit, unit.type, unit.subtype ";
			$req .= " FROM field_mapping ";
			$req .= " LEFT JOIN table_field on (field_mapping.dst_format = table_field.format AND field_mapping.dst_data = table_field.data) ";
			$req .= " LEFT JOIN dataset_fields on (dataset_fields.format = table_field.format AND dataset_fields.data = table_field.data) ";
			$req .= " LEFT JOIN data on (table_field.data = data.data)";
			$req .= " LEFT JOIN unit on (data.unit = unit.unit)";
			$req .= " WHERE src_format = ? ";
			$req .= " AND src_data = ? ";
			$req .= " AND schema_code = ? ";
			$req .= " AND mapping_type = 'FORM'";
			$req .= " ORDER BY table_field.position ";

			$this->logger->info('getFormToTableMapping : '.$req);

			$select = $db->prepare($req);
			$select->execute(array($formField->format, $formField->data, $schema));

			$row = $select->fetch();
			$tableField = new Genapp_Object_Metadata_TableField();
			$tableField->data = $row['data'];
			$tableField->format = $row['format'];
			$tableField->columnName = $row['column_name'];
			$tableField->isCalculated = $row['is_calculated'];
			$tableField->position = $row['position'];
			$tableField->label = $row['label'];
			$tableField->unit = $row['unit'];
			$tableField->type = $row['type'];
			$tableField->subtype = $row['subtype'];
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
	 * @return Array[Genapp_Object_Metadata_FormField]
	 */
	public function getTableToFormMapping($tableField) {

		$this->logger->info('getTableToFormMapping : '.$tableField->format." ".$tableField->data);

		$key = 'getTableToFormMapping'.$tableField->format.'_'.$tableField->data;

		// Get the form description corresponding to the table field
		$result = null;
		if ($this->useCache) {
			$result = $this->cache->load($key);
		}
		if (empty($result)) {

			$db = $this->getAdapter();
			$req = " SELECT form_field.*, data.label, data.definition, unit.unit, unit.type, unit.subtype ";
			$req .= " FROM form_field ";
			$req .= " LEFT JOIN field_mapping on (field_mapping.src_format = form_field.format AND field_mapping.src_data = form_field.data AND mapping_type = 'FORM') ";
			$req .= " LEFT JOIN data on (form_field.data = data.data)";
			$req .= " LEFT JOIN unit on (data.unit = unit.unit)";
			$req .= " LEFT JOIN form_format on (form_format.format = form_field.format)";
			$req .= " WHERE field_mapping.dst_format = ? ";
			$req .= " AND field_mapping.dst_data = ? ";
			$req .= " ORDER BY form_format.position, form_field.position ";

			$this->logger->info('getTableToFormMapping : '.$req);

			$select = $db->prepare($req);
			$select->execute(array($tableField->format, $tableField->data));

			$row = $select->fetch();

			if (!empty($row)) {
				$formField = new Genapp_Object_Metadata_FormField();
				$formField->data = $row['data'];
				$formField->format = $row['format'];
				$formField->label = $row['label'];
				$formField->inputType = $row['input_type'];
				$formField->definition = $row['definition'];
				$formField->isCriteria = $row['is_criteria'];
				$formField->isResult = $row['is_result'];
				$formField->type = $row['type'];
				$formField->subtype = $row['subtype'];
				$formField->unit = $row['unit'];
				$formField->isDefaultResult = $row['is_default_result'];
				$formField->isDefaultCriteria = $row['is_default_criteria'];
				$formField->defaultValue = $row['default_value'];
				$formField->decimals = $row['decimals'];
				$formField->mask = $row['mask'];
				$formField->position = $row['position'];

				if ($this->useCache) {
					$this->cache->save($formField, $key);
				}
				$result = $formField;
			}
		}

		return $result; // clone to avoid updating the values of the cached result

	}

	/**
	 * Get the ancestors of the table format in the table tree.
	 *
	 * @param String $tableFormat the table format
	 * @param String $fieldName the name of the field that is using this table (used for complementary data)
	 * @param String $schemaCode the name of the schema
	 * @return Array[Genapp_Object_Metadata_TableTreeData]
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

			$tableTreeData = new Genapp_Object_Metadata_TableTreeData();
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
	 * @return Array[Genapp_Object_Metadata_Field]
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
		$req = " SELECT dataset_fields.format, data.data, data.label, unit.unit, unit.type, unit.subtype ";
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
			$field = new Genapp_Object_Metadata_Field();
			$field->data = $row['data'];
			$field->format = $row['format'];
			$field->label = $row['label'];
			$field->unit = $row['unit'];
			$field->subtype = $row['subtype'];
			$field->type = $row['type'];

			$result[] = $field;
		}

		return $result;
	}

	/**
	 * Get the labels of the children tables of a line of data.
	 *
	 * @param TableFormat $tableFormat the table format we're looking at.
	 * @return Array[String => String] The labels for each table format.
	 */
	public function getChildrenTableLabels($tableFormat) {
		$db = $this->getAdapter();

		$childrenLabels = array();

		Zend_Registry::get("logger")->info('getChildren');

		// Get the children of the current table
		$sql = "SELECT TABLE_TREE.child_table as format, TABLE_FORMAT.label ";
		$sql .= " FROM TABLE_TREE ";
		$sql .= " LEFT JOIN TABLE_FORMAT on (TABLE_TREE.child_table = TABLE_FORMAT.format) ";
		$sql .= " WHERE TABLE_TREE.SCHEMA_CODE = '".$tableFormat->schemaCode."'";
		$sql .= " AND parent_table = '".$tableFormat->format."'";

		Zend_Registry::get("logger")->info('getChildren : '.$sql);

		$select = $db->prepare($sql);
		$select->execute();

		foreach ($select->fetchAll() as $row) {
			$format = $row['format'];
			$label = $row['label'];

			// Add to the result
			$childrenLabels[$format] = $label;

		}

		return $childrenLabels;
	}
}
