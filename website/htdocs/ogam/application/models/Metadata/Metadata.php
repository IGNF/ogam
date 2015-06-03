<?php
require_once APPLICATION_PATH . '/objects/Metadata/TableField.php';

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
 * This is the Metadata model.
 *
 * @package models
 */
class Application_Model_Metadata_Metadata extends Zend_Db_Table_Abstract {

	var $logger;

	/**
	 * Initialisation
	 */
	public function init() {
		
		// Initialise the logger
		$this->logger = Zend_Registry::get("logger");
		
		$configuration = Zend_Registry::get("configuration");
		$this->useCache = $configuration->useCache;
		
		$this->cache = $this->getDefaultMetadataCache();
		
		$translate = Zend_Registry::get('Zend_Translate');
		$this->lang = strtoupper($translate->getAdapter()->getLocale());
	}

	/**
	 * Get the unit modes.
	 *
	 * @param String $unit
	 *        	The unit
	 * @param
	 *        	String or Array $code
	 *        	a code
	 * @param String $query
	 *        	a part of a label
	 * @return Array[mode => label]
	 */
	public function getModeLabels($unit, $code = null, $query = null) {
		$key = $this->_formatCacheKey('getModeLabels_' . $unit);
		
		$this->logger->debug($key);
		
		// No cache to avoid to increase the number of cache files for all combination
		$tableFormat = $this->getTableFormatFromTableName('METADATA', 'MODE');
		
		$db = $this->getAdapter();
		$req = "SELECT code, COALESCE(t.label, m.label) as label ";
		$req .= " FROM mode m";
		$req .= " LEFT JOIN translation t ON lang = '" . $this->lang . "' AND table_format = '" . $tableFormat->format . "' AND row_pk = m.unit || ',' || m.code";
		$req .= " WHERE unit = ? ";
		if (!empty($query)) {
			$req .= " AND COALESCE(t.label, m.label) ilike '" . $query . "%'";
		}
		if ($code != null) {
			if (is_array($code)) {
				$req .= " AND code IN ('" . implode("','", $code) . "')";
			} else {
				$req .= " AND code = '" . $code . "'";
			}
		}
		$req .= " ORDER BY position, code";
		
		$this->logger->info('getModeLabels : ' . $req);
		
		$select = $db->prepare($req);
		$select->execute(array(
			$unit
		));
		
		$result = array();
		foreach ($select->fetchAll() as $row) {
			$result[$row['code']] = $row['label'];
		}
		
		return $result;
	}

	/**
	 * Get the available schemas.
	 *
	 * @return Array[schemaCode]
	 */
	public function getSchemas() {
		$db = $this->getAdapter();
		$req = "SELECT schema_code, schema_name, COALESCE(t.label, ts.label) as label, COALESCE(t.definition, ts.description) as description";
		$req .= " FROM table_schema ts";
		$req .= " LEFT JOIN translation t ON (lang = '" . $this->lang . "' AND table_format = 'TABLE_SCHEMA' AND row_pk = schema_code) ";
		$req .= " WHERE schema_code NOT IN ('METADATA', 'PUBLIC', 'WEBSITE') ORDER BY ts";
		
		$this->logger->info('getSchemas : ' . $req);
		
		$select = $db->prepare($req);
		$select->execute(array());
		
		$result = array();
		foreach ($select->fetchAll() as $row) {
			$schema = new Application_Object_Metadata_Schema();
			$schema->code = $row['schema_code'];
			$schema->name = $row['schema_name'];
			$schema->label = $row['label'];
			$schema->description = $row['description'];
			
			$result[$schema->code] = $schema;
		}
		
		return $result;
	}

	/**
	 * Get the label of a mode.
	 *
	 * @param String $unit
	 *        	The unit
	 * @param String $mode
	 *        	The mode
	 * @return String label
	 */
	public function getMode($unit, $mode) {
		$key = $this->_formatCacheKey('getMode_' . $unit . '_' . $mode . '_' . $this->lang);
		
		$this->logger->debug($key);
		
		if ($this->useCache) {
			$cachedResult = $this->cache->load($key);
		}
		
		if (empty($cachedResult)) {
			
			$db = $this->getAdapter();
			$req = "SELECT code, COALESCE(t.label, m.label) as label";
			$req .= " FROM mode m";
			$req .= " LEFT JOIN translation t ON (lang = '" . $this->lang . "' AND table_format = 'MODE' AND row_pk = m.unit || ',' || m.code) ";
			$req .= " WHERE unit = ? AND code = ? ORDER BY position, code";
			
			$this->logger->info('getMode : ' . $req);
			
			$select = $db->prepare($req);
			$select->execute(array(
				$unit,
				$mode
			));
			
			$row = $select->fetch();
			if ($row) {
				$result = $row['label'];
			} else {
				$result = null;
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
	 * Get the labels and modes for a tree unit.
	 *
	 * @param String $unit
	 *        	The unit
	 * @param String $value
	 *        	the searched value (optional)
	 * @return Array[mode => label]
	 */
	public function getTreeLabels($unit, $value = null) {
		if (is_array($value)) {
			$key = $this->_formatCacheKey('getTreeLabels_' . $unit . '_' . implode("_", $value));
		} else {
			$key = $this->_formatCacheKey('getTreeLabels_' . $unit . '_' . $value);
		}
		
		$this->logger->debug($key);
		
		// No cache to avoid to increase the number of cache files for all combination
		
		$db = $this->getAdapter();
		$req = "SELECT code, COALESCE(t.label, mt.label) as label ";
		$req .= " FROM mode_tree mt";
		$req .= " LEFT JOIN translation t ON (lang = '" . $this->lang . "' AND table_format = 'MODE_TREE' AND row_pk = mt.unit || ',' || mt.code) ";
		$req .= " WHERE unit = ?";
		if ($value != null) {
			if (is_array($value)) {
				$req .= " AND code IN ('" . implode("','", $value) . "')";
			} else {
				$req .= " AND code = '" . $value . "'";
			}
		}
		$req .= " ORDER BY position, code";
		
		$this->logger->info('getTreeLabels : ' . $req);
		
		$select = $db->prepare($req);
		$select->execute(array(
			$unit
		));
		
		$result = array();
		foreach ($select->fetchAll() as $row) {
			$result[$row['code']] = $row['label'];
		}
		
		return $result;
	}

	/**
	 * Return the labels and modes for a tree unit filtered by query.
	 *
	 * @param String $unit
	 *        	The unit
	 * @param String $query
	 *        	the searched text (optional)
	 * @param String $start
	 *        	the number of the first row to return (optional)
	 * @param String $limit
	 *        	the max number of row to return (optional)
	 * @return Array[code => label]
	 */
	public function getTreeModes($unit, $query, $start = null, $limit = null) {
		$key = $this->_formatCacheKey('getTreeModes_' . $unit . '_' . $query . '_' . $start . '_' . $limit);
		
		$this->logger->debug($key);
		
		$db = $this->getAdapter();
		$req = "SELECT code, COALESCE(t.label, mt.label) as label ";
		$req .= " FROM mode_tree mt";
		$req .= " LEFT JOIN translation t ON (lang = '" . $this->lang . "' AND table_format = 'MODE_TREE' AND row_pk = mt.unit || ',' || mt.code)";
		$req .= " WHERE unit = ?";
		if ($query != null) {
			$req .= " AND unaccent_string(COALESCE(t.label, mt.label)) ilike unaccent_string('%" . $query . "%')";
		}
		$req .= " ORDER BY position, code";
		if ($start != null && $limit != null) {
			$req .= " LIMIT " . $limit . " OFFSET " . $start;
		}
		
		$this->logger->info('getTreeModes : ' . $req);
		
		$select = $db->prepare($req);
		$select->execute(array(
			$unit
		));
		
		$result = array();
		foreach ($select->fetchAll() as $row) {
			$result[$row['code']] = $row['label'];
		}
		
		return $result;
	}

	/**
	 * Get the count of modes for a tree unit filtered by query.
	 *
	 * @param String $unit
	 *        	The unit
	 * @param String $query
	 *        	the searched text (optional)
	 * @return Integer
	 */
	public function getTreeModesCount($unit, $query) {
		$key = $this->_formatCacheKey('getTreeModesCount_' . $unit . '_' . $query);
		
		$this->logger->debug($key);
		
		$db = $this->getAdapter();
		$req = "SELECT count(code) ";
		$req .= " FROM mode_tree ";
		$req .= " WHERE unit = ?";
		if ($query != null) {
			$req .= " AND unaccent_string(label) ilike unaccent_string('%" . $query . "%')";
		}
		
		$this->logger->info('getTreeModesCount : ' . $req);
		
		$select = $db->prepare($req);
		$select->execute(array(
			$unit
		));
		
		$result = array();
		
		return $select->fetchColumn(0);
	}

	/**
	 * Get the unit modes for a dynamic list.
	 *
	 * @param String $unit
	 *        	The unit
	 * @param String $code
	 *        	A code
	 * @param String $query
	 *        	an optional query filter
	 * @return Array[mode => label]
	 */
	public function getDynamodeLabels($unit, $code = null, $query = null) {
		if (is_array($code)) {
			$keycode = implode("_", $code);
		} else {
			$keycode = $code;
		}
		$key = $this->_formatCacheKey('getDynamodeLabels_' . $unit . '_' . $keycode . '_' . $query);
		
		$this->logger->debug($key);
		
		// No cache to avoid to increase the number of cache files for all combination
		
		$db = $this->getAdapter();
		$req = $this->_getDynamodeSQL($unit);
		
		$req2 = "SELECT * ";
		$req2 .= " FROM (" . $req . ") as foo ";
		$req2 .= " WHERE (1 = 1) ";
		if (!empty($query)) {
			$req2 .= " AND label ilike '" . $query . "%'";
		}
		if ($code != null) {
			if (is_array($code)) {
				$req2 .= " AND code IN ('" . implode("','", $code) . "')";
			} else {
				$req2 .= " AND code = '" . $code . "'";
			}
		}
		
		$this->logger->info('getDynamodeLabels : ' . $req2);
		
		$select = $db->prepare($req2);
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
	 * @param String $unit
	 *        	The unit
	 * @return String the SQL query, that should return an ordered list of code / label.
	 */
	private function _getDynamodeSQL($unit) {
		$db = $this->getAdapter();
		$req = "SELECT sql FROM dynamode WHERE unit = ?";
		
		$this->logger->info('_getDynamodeSQL : ' . $req);
		
		$select = $db->prepare($req);
		$select->execute(array(
			$unit
		));
		
		$row = $select->fetch();
		
		if (!empty($row)) {
			return $row['sql'];
		} else {
			throw new Exception("There is no SQL query defined for UNIT " . $unit);
		}
	}

	/**
	 * Get the unit modes from a tree.
	 *
	 * Return a hierarchy of nodes
	 *
	 * @param String $unit
	 *        	The unit
	 * @param String $parentcode
	 *        	The identifier of the start node in the tree (by default the root node is *)
	 * @param Integer $levels
	 *        	The number of levels of depth (if 0 then no limitation)
	 * @return Application_Object_Metadata_TreeNode
	 */
	public function getTreeChildren($unit, $parentcode = '*', $levels = 1) {
		$key = $this->_formatCacheKey('getTreeChildren_' . $unit . '_' . $parentcode . '_' . $levels . '_' . $this->lang);
		
		$this->logger->debug($key);
		
		if ($this->useCache) {
			$cachedResult = $this->cache->load($key);
		}
		
		if (empty($cachedResult)) {
			
			$db = $this->getAdapter();
			$req = "WITH RECURSIVE node_list( unit, code, parent_code, label, definition, position, is_leaf, level) AS ( ";
			$req .= "	    SELECT unit, code, parent_code, label, definition, position, is_leaf, 1 ";
			$req .= "		FROM mode_tree ";
			$req .= "		WHERE unit = ? ";
			$req .= "		AND parent_code = ? ";
			$req .= "	UNION ALL ";
			$req .= "		SELECT child.unit, child.code, child.parent_code, child.label, child.definition, child.position, child.is_leaf, level + 1 ";
			$req .= "		FROM mode_tree child ";
			$req .= "		INNER JOIN node_list on (child.parent_code = node_list.code) ";
			$req .= "		WHERE child.unit = ? ";
			if ($levels != 0) {
				$req .= "		AND level < " . $levels . " ";
			}
			$req .= "	) ";
			$req .= "	SELECT parent_code, code, COALESCE(t.label, nl.label) as label, is_leaf";
			$req .= "	FROM node_list nl";
			$req .= "	LEFT JOIN translation t ON (lang = '" . $this->lang . "' AND table_format = 'MODE_TREE' AND row_pk = nl.unit || ',' || nl.code) ";
			$req .= "	ORDER BY level, position, code "; // level is used to ensure correct construction of the structure
			
			$this->logger->info('getTreeChildren : ' . $unit . ' ' . $parentcode);
			$this->logger->info('getTreeChildren : ' . $req);
			
			$select = $db->prepare($req);
			
			$select->execute(array(
				$unit,
				$parentcode,
				$unit
			));
			
			$resultTree = new Application_Object_Metadata_TreeNode(); // The root is empty
			foreach ($select->fetchAll() as $row) {
				
				$parentCode = $row['parent_code'];
				
				// Build the new node
				$tree = new Application_Object_Metadata_TreeNode();
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
			
			if ($this->useCache) {
				$this->cache->save($resultTree, $key);
			}
			return $resultTree;
		} else {
			return $cachedResult;
		}
	}

	/**
	 * Get all the children codes from a node of a tree.
	 *
	 * Return an array of codes.
	 *
	 * @param String $unit
	 *        	The unit
	 * @param String $code
	 *        	The identifier of the start node in the tree (by default the root node is *)
	 * @param Integer $levels
	 *        	The number of levels of depth (if 0 then no limitation)
	 * @return Array[String]
	 */
	public function getTreeChildrenCodes($unit, $code = '*', $levels = 1) {
		$key = $this->_formatCacheKey('getTreeChildrenCodes_' . $unit . '_' . $code . '_' . $levels);
		
		$this->logger->debug($key);
		
		if ($this->useCache) {
			$cachedResult = $this->cache->load($key);
		}
		
		if (empty($cachedResult)) {
			
			$db = $this->getAdapter();
			$req = "WITH RECURSIVE node_list( unit, code, parent_code, label, definition, position, is_leaf, level) AS ( ";
			$req .= "	    SELECT unit, code, parent_code, label, definition, position, is_leaf, 1 ";
			$req .= "		FROM mode_tree ";
			$req .= "		WHERE unit = ? ";
			$req .= "		AND code = ? ";
			$req .= "	UNION ALL ";
			$req .= "		SELECT child.unit, child.code, child.parent_code, child.label, child.definition, child.position, child.is_leaf, level + 1 ";
			$req .= "		FROM mode_tree child ";
			$req .= "		INNER JOIN node_list on (child.parent_code = node_list.code) ";
			$req .= "		WHERE child.unit = ? ";
			if ($levels != 0) {
				$req .= "		AND level < " . $levels . " ";
			}
			$req .= "	) ";
			$req .= "	SELECT * ";
			$req .= "	FROM node_list ";
			$req .= "	ORDER BY level, position, code "; // level is used to ensure correct construction of the structure
			
			$this->logger->info('getTreeChildrenCodes : ' . $req);
			
			$select = $db->prepare($req);
			$select->execute(array(
				$unit,
				$code,
				$unit
			));
			
			$result = array();
			foreach ($select->fetchAll() as $row) {
				$result[] = $row['code'];
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
	 * Read a dataset object from a result line.
	 *
	 * @param Result $row        	
	 * @return Application_Object_Metadata_Dataset
	 */
	private function _readDataSet($row) {
		$dataset = new Application_Object_Metadata_Dataset();
		$dataset->id = $row['id'];
		$dataset->label = $row['label'];
		$dataset->definition = $row['definition'];
		$dataset->isDefault = $row['is_default'];
		
		return $dataset;
	}

	/**
	 * Get the available datasets for display.
	 *
	 * @return Array[Application_Object_Metadata_Dataset]
	 */
	public function getDatasetsForDisplay() {
		$db = $this->getAdapter();
		$req = "SELECT DISTINCT dataset_id as id, COALESCE(t.label, d.label) as label, COALESCE(t.definition, d.definition) as definition, is_default ";
		$req .= " FROM dataset d";
		$req .= " LEFT JOIN translation t ON lang = '" . $this->lang . "' AND table_format = 'METADATA' AND row_pk = dataset_id";
		$req .= " INNER JOIN dataset_fields using (dataset_id) ";
		
		// Check the role restrictions
		$userSession = new Zend_Session_Namespace('user');
		$params = array();
		if ($userSession != null && $userSession->user != null) {
			$role = $userSession->user->role;
			$req .= ' WHERE (dataset_id NOT IN (SELECT dataset_id FROM dataset_role_restriction WHERE role_code = ?))';
			$params[] = $role->code;
		}
		
		$req .= " ORDER BY dataset_id";
		
		$this->logger->info('getDatasetsForDisplay : ' . $req);
		
		$select = $db->prepare($req);
		$select->execute($params);
		
		$result = array();
		foreach ($select->fetchAll() as $row) {
			$dataset = $this->_readDataSet($row);
			$result[$dataset->id] = $dataset;
		}
		
		return $result;
	}

	/**
	 * Get the available datasets for upload.
	 *
	 * @return Array[Application_Object_Metadata_Dataset]
	 */
	public function getDatasetsForUpload() {
		$db = $this->getAdapter();
		$req = "SELECT DISTINCT dataset_id as id, COALESCE(t.label, d.label) as label, COALESCE(t.definition, d.definition) as definition, is_default ";
		$req .= " FROM dataset d";
		$req .= " LEFT JOIN translation t ON (lang = '" . $this->lang . "' AND table_format = 'DATASET' AND row_pk = dataset_id) ";
		$req .= " INNER JOIN dataset_files using (dataset_id) ";
		
		// Check the role restrictions
		$userSession = new Zend_Session_Namespace('user');
		$params = array();
		if ($userSession != null && $userSession->user != null) {
			$role = $userSession->user->role;
			$req .= ' WHERE (dataset_id NOT IN (SELECT dataset_id FROM dataset_role_restriction WHERE role_code = ?))';
			$params[] = $role->code;
		}
		
		$req .= " ORDER BY dataset_id";
		
		$this->logger->info('getDatasetsForUpload : ' . $req);
		
		$select = $db->prepare($req);
		$select->execute($params);
		
		$result = array();
		foreach ($select->fetchAll() as $row) {
			$dataset = $this->_readDataSet($row);
			$result[$dataset->id] = $dataset;
		}
		return $result;
	}

	/**
	 * Get the requested files for a data submission for a given dataset.
	 *
	 * @param String $datasetId
	 *        	The identifier of the dataset
	 * @return Array[Application_Object_Metadata_DatasetFile]
	 */
	public function getRequestedFiles($datasetId) {
		$db = $this->getAdapter();
		$req = " SELECT format, file_type, COALESCE(t.label, file_format.label) as label ";
		$req .= " FROM dataset_files";
		$req .= " LEFT JOIN translation t ON (lang = '" . $this->lang . "' AND table_format = 'FILE_FORMAT' AND row_pk = format)";
		$req .= " LEFT JOIN file_format using (format) ";
		$req .= " WHERE dataset_id = ? ";
		$req .= " ORDER BY position";
		
		$this->logger->info('getRequestedFiles : ' . $req);
		
		$select = $db->prepare($req);
		$select->execute(array(
			$datasetId
		));
		
		$result = array();
		foreach ($select->fetchAll() as $row) {
			$datasetFile = new Application_Object_Metadata_DatasetFile();
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
	 * @param String $fileFormat
	 *        	the file format
	 * @return Array[Application_Object_Metadata_FileField]
	 */
	public function getFileFields($fileFormat) {
		$db = $this->getAdapter();
		
		$this->logger->debug('getFileFields : ' . $fileFormat);
		
		// Get the fields specified by the format
		$req = "SELECT file_field.*, COALESCE(t.label, data.label) as label, data.unit, unit.type as type, unit.subtype as subtype, COALESCE(t.definition, data.definition) as definition ";
		$req .= " FROM file_field ";
		$req .= " LEFT JOIN data on (file_field.data = data.data) ";
		$req .= " LEFT JOIN unit on (data.unit = unit.unit) ";
		$req .= " LEFT JOIN translation t ON (lang = '" . $this->lang . "' AND table_format = 'DATA' AND row_pk = data.data) ";
		$req .= " WHERE format = ? ";
		$req .= " ORDER BY position ASC";
		
		$this->logger->info('getFileFields : ' . $req);
		
		$select = $db->prepare($req);
		$select->execute(array(
			$fileFormat
		));
		
		$result = array();
		foreach ($select->fetchAll() as $row) {
			$fileField = new Application_Object_Metadata_FileField();
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
	 * Read a table field object from a result line.
	 *
	 * @param Result $row        	
	 * @return Application_Object_Metadata_FormField
	 */
	private function _readTableField($row) {
		$tableField = new Application_Object_Metadata_TableField();
		$tableField->data = $row['data'];
		$tableField->format = $row['format'];
		$tableField->columnName = $row['column_name'];
		$tableField->isCalculated = $row['is_calculated'];
		$tableField->isEditable = $row['is_editable'];
		$tableField->isInsertable = $row['is_insertable'];
		$tableField->isMandatory = $row['is_mandatory'];
		$tableField->position = $row['position'];
		$tableField->label = $row['label'];
		$tableField->unit = $row['unit'];
		$tableField->type = $row['type'];
		$tableField->subtype = $row['subtype'];
		$tableField->definition = $row['definition'];
		
		return $tableField;
	}

	/**
	 * Get the list of table fields for a given table format.
	 * If the dataset is specified, we filter on the fields of the dataset.
	 *
	 * @param String $schema
	 *        	the schema identifier
	 * @param String $format
	 *        	the format
	 * @param String $datasetID
	 *        	the dataset identifier (optional)
	 * @return Array[Application_Object_Metadata_TableField]
	 */
	public function getTableFields($schema, $format, $datasetID = null) {
		$this->logger->debug('getTableFields : ' . $datasetID . '_' . $schema . '_' . $format . '_' . $this->lang);
		
		$key = $this->_formatCacheKey('getTableFields_' . $datasetID . '_' . $schema . '_' . $format . '_' . $this->lang);
		if ($this->useCache) {
			$cachedResult = $this->cache->load($key);
		}
		
		if (empty($cachedResult)) {
			
			$db = $this->getAdapter();
			
			// Get the fields specified by the format
			$req = "SELECT DISTINCT table_field.*, COALESCE(t.label, data.label) as label, data.unit, unit.type, unit.subtype, COALESCE(t.definition, data.definition) as definition ";
			$req .= " FROM table_field ";
			if ($datasetID != null) {
				$req .= " LEFT JOIN dataset_fields on (table_field.format = dataset_fields.format AND table_field.data = dataset_fields.data) ";
			}
			$req .= " LEFT JOIN table_format on (table_format.format = table_field.format) ";
			$req .= " LEFT JOIN data on (table_field.data = data.data) ";
			$req .= " LEFT JOIN unit on (data.unit = unit.unit) ";
			$req .= " LEFT JOIN translation t ON (lang = '" . $this->lang . "' AND table_format = 'DATA' AND row_pk = data.data) ";
			$req .= " WHERE (1=1)";
			if ($datasetID != null) {
				$req .= " AND dataset_fields.dataset_id = ? ";
			}
			$req .= " AND table_format.schema_code = ? ";
			$req .= " AND table_field.format = ? ";
			$req .= " ORDER BY table_field.position ";
			
			$this->logger->info('getTableFields : ' . $req);
			
			$select = $db->prepare($req);
			if ($datasetID != null) {
				$select->execute(array(
					$datasetID,
					$schema,
					$format
				));
			} else {
				$select->execute(array(
					$schema,
					$format
				));
			}
			
			$result = array();
			foreach ($select->fetchAll() as $row) {
				$tableField = $this->_readTableField($row);
				
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
	 * We always take the GEOM column the lowest in the hierarchy of tables.
	 *
	 * @param String $schema
	 *        	the schema identifier
	 * @param Array[String] $tables
	 *        	a list of table formats
	 * @return Application_Object_Metadata_TableField
	 * @throws an exceptionif the tables contain no geographical information
	 */
	public function getGeometryField($schema, $tables) {
		$db = $this->getAdapter();
		
		$this->logger->debug('getGeometryField : ' . $schema);
		
		// We do the seach table by table in the inverse order
		foreach (array_reverse($tables) as $tableName) {
			
			// Get the fields specified by the format
			$req = "SELECT DISTINCT table_field.*, COALESCE(t.label, data.label) as label, data.unit, unit.type, unit.subtype, COALESCE(t.definition, data.definition) as definition ";
			$req .= " FROM table_field ";
			$req .= " LEFT JOIN table_format on (table_field.format = table_format.format) ";
			$req .= " LEFT JOIN data on (table_field.data = data.data) ";
			$req .= " LEFT JOIN unit on (data.unit = unit.unit) ";
			$req .= " LEFT JOIN translation t ON (t.lang = '" . $this->lang . "' AND t.table_format = table_field.format AND t.row_pk = data.data)";
			$req .= " WHERE table_field.format = ? ";
			$req .= " AND table_format.schema_code = ? ";
			$req .= " AND data.unit = 'GEOM' ";
			
			$this->logger->info('getTableFields : ' . $req);
			
			$select = $db->prepare($req);
			$select->execute(array(
				$tableName,
				$schema
			));
			
			$row = $select->fetch();
			if ($row) {
				$tableField = $this->_readTableField($row);
				return $tableField;
			}
		}
		
		// No GEOM column found
		throw new Exception("No geographical information detected");
	}

	/**
	 * Get the information about a table format.
	 *
	 * @param String $schema
	 *        	the schema identifier
	 * @param String $format
	 *        	the format
	 * @return Application_Object_Metadata_TableFormat
	 */
	public function getTableFormat($schema, $format) {
		$db = $this->getAdapter();
		
		$this->logger->debug('getTableFormat : ' . $schema . ' ' . $format . '_' . $this->lang);
		
		$key = $this->_formatCacheKey('getTableFormat' . $schema . '_' . $format . '_' . $this->lang);
		if ($this->useCache) {
			$cachedResult = $this->cache->load($key);
		}
		
		if (empty($cachedResult)) {
			
			// Get the fields specified by the format
			$req = "SELECT table_name, COALESCE(t.label, tf.label) as label, primary_key ";
			$req .= " FROM table_format tf";
			$req .= " LEFT JOIN translation t ON lang = '" . $this->lang . "' AND table_format = 'TABLE_FORMAT' AND row_pk = format";
			$req .= " WHERE schema_code = ? ";
			$req .= " AND format = ? ";
			
			$this->logger->info('getTableFormat : ' . $req);
			
			$select = $db->prepare($req);
			$select->execute(array(
				$schema,
				$format
			));
			
			$row = $select->fetch();
			
			$tableFormat = new Application_Object_Metadata_TableFormat();
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
	 * Get the information about a table format from the physical table name.
	 *
	 * This function is used in the proxy controller because we receive a physical table name from mapserver.
	 *
	 * @param String $schema
	 *        	the schema code
	 * @param String $table
	 *        	the table name
	 * @return Application_Object_Metadata_TableFormat
	 */
	public function getTableFormatFromTableName($schema, $table) {
		$db = $this->getAdapter();
		
		$this->logger->debug('getTableFormatFromTableName : ' . $schema . ' ' . $table . '_' . $this->lang);
		
		$key = $this->_formatCacheKey('getTableFormatFromTableName_' . $schema . '_' . $table . '_' . $this->lang);
		
		if ($this->useCache) {
			$cachedResult = $this->cache->load($key);
		}
		
		if (empty($cachedResult)) {
			
			// Get the fields specified by the format
			$req = "SELECT format, schema_code, table_name, COALESCE(t.label, tf.label) as label, primary_key ";
			$req .= " FROM table_format tf";
			$req .= " LEFT JOIN translation t ON lang = '" . $this->lang . "' ";
			// We can't use getTableFormatFromTableName() function here to avoid infinity loop
			$req .= " AND table_format = (SELECT format FROM table_format WHERE schema_code = 'TABLE_FORMAT') ";
			$req .= " AND row_pk = format";
			$req .= " WHERE schema_code = ? ";
			$req .= " AND table_name = upper(?) ";
			
			$this->logger->info('getTableFormat : ' . $req);
			
			$select = $db->prepare($req);
			$select->execute(array(
				$schema,
				$table
			));
			
			$row = $select->fetch();
			
			$tableFormat = new Application_Object_Metadata_TableFormat();
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
	 * @param String $datasetId
	 *        	The identifier of the dataset
	 * @param String $schemaCode
	 *        	The logical name of the schema (RAW_DATA or HARMONIZED_DATA)
	 * @return Array[Application_Object_Metadata_FormFormat]
	 */
	public function getForms($datasetId, $schemaCode) {
		$key = $this->_formatCacheKey('getForms_' . $datasetId . "_" . $schemaCode . '_' . $this->lang);
		$this->logger->info('getForms : ' . $key);
		
		if ($this->useCache) {
			$cachedResult = $this->cache->load($key);
		}
		
		if (empty($cachedResult)) {
			
			$db = $this->getAdapter();
			$req = " SELECT distinct form_format.format, COALESCE(t.label, form_format.label) as label, COALESCE(t.definition, form_format.definition) as definition, position ";
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
			$req .= "      LEFT JOIN translation t ON (lang = '" . $this->lang . "' AND table_format = 'FORM_FORMAT' AND row_pk = form_format.format) ";
			$req .= "      ORDER BY position";
			
			$this->logger->info('getForms : ' . $req);
			
			$select = $db->prepare($req);
			if (!empty($datasetId)) {
				$select->execute(array(
					$schemaCode,
					$datasetId
				));
			} else {
				$select->execute(array(
					$schemaCode
				));
			}
			
			$result = array();
			foreach ($select->fetchAll() as $row) {
				$formFormat = new Application_Object_Metadata_FormFormat();
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
	 * @param String $dataset
	 *        	the name of the dataset
	 * @param String $formFormat
	 *        	the name of the form format
	 * @param String $schema
	 *        	the name of the database schema
	 * @param String $mode
	 *        	if 'criteria' we're looking for a criteria, if 'result' we're looking for a result.
	 * @return Array[Application_Object_Metadata_FormField]
	 */
	public function getFormFields($dataset, $formFormat, $schema, $mode) {
		$this->logger->info('getFormFields : ' . $dataset . ' ' . $formFormat . ' ' . $schema . '_' . $this->lang);
		
		$key = $this->_formatCacheKey('getFormFields_' . $mode . '_' . $dataset . '_' . $formFormat . '_' . $schema . '_' . $this->lang);
		if ($this->useCache) {
			$cachedResult = $this->cache->load($key);
		}
		if (empty($cachedResult)) {
			
			$db = $this->getAdapter();
			
			$param = array();
			
			// Select the list of available fields for the table (excepted the FK)
			$req = " SELECT DISTINCT form_field.*, COALESCE(t.label, data.label) as label, COALESCE(t.definition, data.definition) as definition, unit.type, unit.subtype, unit.unit ";
			$req .= " FROM form_field ";
			$req .= " LEFT JOIN data using (data) ";
			$req .= " LEFT JOIN unit using (unit) ";
			$req .= " LEFT JOIN translation t ON (lang = '" . $this->lang . "' AND table_format = 'DATA' AND row_pk = data.data) ";
			
			// Check the field format
			$req .= " WHERE format = ?";
			$param[] = $formFormat;
			
			// Check the field type (result or criteria)
			if ($mode == "result") {
				$req .= " AND is_result = '1'";
			} else {
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
			
			$this->logger->info('getFormFields : ' . $req);
			
			$select = $db->prepare($req);
			$select->execute($param);
			
			$result = array();
			foreach ($select->fetchAll() as $row) {
				$formField = $this->_readFormField($row);
				
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
	 * Read a form field object from a result line.
	 *
	 * @param Result $row        	
	 * @return Application_Object_Metadata_FormField
	 */
	private function _readFormField($row) {
		$formField = new Application_Object_Metadata_FormField();
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
		$formField->position = $row['position'];
		
		return $formField;
	}

	/**
	 * Get the description of a form field.
	 *
	 * @param String $format
	 *        	The logical name of the form
	 * @param String $data
	 *        	The logical name of the field
	 * @return Application_Object_Metadata_FormField
	 */
	public function getFormField($format, $data) {
		$key = $this->_formatCacheKey('formfield_' . $format . '_' . $data . '_' . $this->lang);
		if ($this->useCache) {
			$cachedResult = $this->cache->load($key);
		}
		if (empty($cachedResult)) {
			
			$this->logger->info('getFormField : ' . $format . ", " . $data);
			
			$db = $this->getAdapter();
			$req = " SELECT form_field.*, COALESCE(t.label, data.label) as label, COALESCE(t.definition, data.definition) as definition, unit.type, unit.subtype, unit.unit ";
			$req .= " FROM form_field ";
			$req .= " LEFT JOIN data using (data) ";
			$req .= " LEFT JOIN unit using (unit) ";
			$req .= " LEFT JOIN translation t ON (lang = '" . $this->lang . "' AND table_format = 'DATA' AND row_pk = data.data) ";
			$req .= " WHERE format = ? ";
			$req .= " AND   data = ?";
			
			$select = $db->prepare($req);
			$select->execute(array(
				$format,
				$data
			));
			
			$row = $select->fetch();
			$formField = $this->_readFormField($row);
			
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
	 * @param String $unit
	 *        	the unit
	 * @return Application_Object_Metadata_Range
	 */
	public function getRange($unit) {
		$this->logger->info('getRange : ' . $unit);
		
		$db = $this->getAdapter();
		$req = "SELECT min, max ";
		$req .= " FROM range ";
		$req .= " WHERE unit = ?";
		
		$this->logger->info('getRange : ' . $req);
		
		$select = $db->prepare($req);
		$select->execute(array(
			$unit
		));
		
		$row = $select->fetch();
		if ($row) {
			$range = new Application_Object_Metadata_Range();
			$range->min = $row['min'];
			$range->max = $row['max'];
			return $range;
		} else {
			return null;
		}
	}

	/**
	 * Get the database field corresponding to the asked form field.
	 *
	 * @param String $schema
	 *        	the name of the schema (RAW_DATA or HARMONIZED_DATA)
	 * @param FormField $formField
	 *        	the form field
	 * @return Application_Object_Metadata_TableField
	 */
	public function getFormToTableMapping($schema, $formField) {
		$this->logger->info('getFormToTableMapping : ' . $formField->format . " " . $formField->data . " " . $schema . '_' . $this->lang);
		
		$key = $this->_formatCacheKey('formtotablemapping_' . $formField->format . '_' . $formField->data . '_' . $schema . '_' . $this->lang);
		if ($this->useCache) {
			$cachedResult = $this->cache->load($key);
		}
		if (empty($cachedResult)) {
			
			$db = $this->getAdapter();
			$req = " SELECT table_field.*, COALESCE(t.label, data.label) as label, COALESCE(t.definition, data.definition) as definition, unit.unit, unit.type, unit.subtype ";
			$req .= " FROM field_mapping ";
			$req .= " LEFT JOIN table_field on (field_mapping.dst_format = table_field.format AND field_mapping.dst_data = table_field.data) ";
			$req .= " LEFT JOIN dataset_fields on (dataset_fields.format = table_field.format AND dataset_fields.data = table_field.data) ";
			$req .= " LEFT JOIN data on (table_field.data = data.data)";
			$req .= " LEFT JOIN unit on (data.unit = unit.unit)";
			$req .= " LEFT JOIN translation t ON (lang = '" . $this->lang . "' AND table_format = 'DATA' AND row_pk = data.data) ";
			$req .= " WHERE src_format = ? ";
			$req .= " AND src_data = ? ";
			$req .= " AND schema_code = ? ";
			$req .= " AND mapping_type = 'FORM'";
			$req .= " ORDER BY table_field.position ";
			
			$this->logger->info('getFormToTableMapping : ' . $req);
			
			$select = $db->prepare($req);
			$select->execute(array(
				$formField->format,
				$formField->data,
				$schema
			));
			
			$row = $select->fetch();
			$tableField = $this->_readTableField($row);
			
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
	 * @param TableField $tableField
	 *        	the table field
	 * @return Array[Application_Object_Metadata_FormField]
	 */
	public function getTableToFormMapping($tableField) {
		$this->logger->info('getTableToFormMapping : ' . $tableField->format . " " . $tableField->data . ' ' . $this->lang);
		
		$key = $this->_formatCacheKey('getTableToFormMapping' . $tableField->format . '_' . $tableField->data . '_' . $this->lang);
		
		// Get the form description corresponding to the table field
		$result = null;
		if ($this->useCache) {
			$result = $this->cache->load($key);
		}
		if (empty($result)) {
			
			$db = $this->getAdapter();
			$req = " SELECT form_field.*, COALESCE(t.label, data.label) as label, COALESCE(t.definition, data.definition) as definition, unit.unit, unit.type, unit.subtype ";
			$req .= " FROM form_field ";
			$req .= " LEFT JOIN field_mapping on (field_mapping.src_format = form_field.format AND field_mapping.src_data = form_field.data AND mapping_type = 'FORM') ";
			$req .= " LEFT JOIN data on (form_field.data = data.data)";
			$req .= " LEFT JOIN unit on (data.unit = unit.unit)";
			$req .= " LEFT JOIN form_format on (form_format.format = form_field.format)";
			$req .= " LEFT JOIN translation t ON (lang = '" . $this->lang . "' AND table_format = 'DATA' AND row_pk = data.data) ";
			$req .= " WHERE field_mapping.dst_format = ? ";
			$req .= " AND field_mapping.dst_data = ? ";
			$req .= " ORDER BY form_format.position, form_field.position ";
			
			$this->logger->info('getTableToFormMapping : ' . $req);
			
			$select = $db->prepare($req);
			$select->execute(array(
				$tableField->format,
				$tableField->data
			));
			
			$row = $select->fetch();
			
			if (!empty($row)) {
				$formField = $this->_readFormField($row);
				
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
	 * @param String $tableFormat
	 *        	the table format
	 * @param String $schemaCode
	 *        	the name of the schema
	 * @return Array[Application_Object_Metadata_TableTreeData]
	 * @throws Exception if the table is not found
	 */
	public function getTablesTree($tableFormat, $schemaCode) {
		$this->logger->info('getTablesTree : tableFormat:' . $tableFormat . ' schemaCode:' . $schemaCode);
		
		$key = $this->_formatCacheKey('getTablesTree_' . $tableFormat . '_' . $schemaCode);
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
			
			$this->logger->info('getTablesTree : ' . $req);
			
			$select = $db->prepare($req);
			$select->execute(array(
				$tableFormat,
				$schemaCode
			));
			
			$row = $select->fetch();
			
			if (empty($row)) {
				$this->logger->err("Table ancestor cannot be found");
				throw new Exception("Table ancestor cannot be found");
			}
			
			$tableTreeData = new Application_Object_Metadata_TableTreeData();
			$tableTreeData->tableFormat = $row['child_table'];
			$tableTreeData->parentTable = $row['parent_table'];
			$tableTreeData->keys = $row['join_key'];
			$tableTreeData->identifiers = $row['primary_key'];
			$tableTreeData->tableName = $row['table_name'];
			
			$result[] = $tableTreeData;
			
			// Recursively call the function if needed
			if ($tableTreeData->parentTable != "*") {
				$result = array_merge($result, $this->getTablesTree($tableTreeData->parentTable, $schemaCode));
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
	 * Get the labels of the children tables of a line of data.
	 *
	 * @param TableFormat $tableFormat
	 *        	the table format we're looking at.
	 * @return Array[String => String] The labels for each table format.
	 */
	public function getChildrenTableLabels($tableFormat) {
		$db = $this->getAdapter();
		
		$childrenLabels = array();
		
		Zend_Registry::get("logger")->info('getChildren');
		
		// Get the children of the current table
		$sql = "SELECT TABLE_TREE.child_table as format, COALESCE(t.label, TABLE_FORMAT.label) as label ";
		$sql .= " FROM TABLE_TREE ";
		$sql .= " LEFT JOIN TABLE_FORMAT on (TABLE_TREE.child_table = TABLE_FORMAT.format) ";
		$sql .= " LEFT JOIN translation t ON (lang = '" . $this->lang . "' AND table_format = 'TABLE_FORMAT' AND row_pk = TABLE_FORMAT.format) ";
		$sql .= " WHERE TABLE_TREE.SCHEMA_CODE = '" . $tableFormat->schemaCode . "'";
		$sql .= " AND parent_table = '" . $tableFormat->format . "'";
		
		Zend_Registry::get("logger")->info('getChildren : ' . $sql);
		
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

	/**
	 *
	 * Format the provided string to use it like a cache key
	 *
	 * @param String $key        	
	 * @return String
	 */
	private function _formatCacheKey($key) {
		$key = str_replace('*', '_', $key); // Zend cache doesn't like special characters
		$key = str_replace(' ', '_', $key);
		$key = str_replace('-', '_', $key);
		$key = str_replace('.', '_', $key);
		
		return $key;
	}

	/**
	 * Get the taxons.
	 *
	 * Return a hierarchy of taxons
	 *
	 * @param String $unit
	 *        	The unit
	 * @param String $parentcode
	 *        	The identifier of the start node in the tree (by default the root node is *)
	 * @param Integer $levels
	 *        	The number of levels of depth (if 0 then no limitation), relative to the root node
	 * @return Application_Object_Metadata_TreeNode
	 */
	public function getTaxrefChildren($unit, $parentcode = '*', $levels = 1) {
		$key = $this->_formatCacheKey('getTaxrefChildren_' . $unit . '_' . $parentcode . '_' . $levels);
		
		$this->logger->debug($key);
		
		if ($this->useCache) {
			$cachedResult = $this->cache->load($key);
		}
		
		if (empty($cachedResult)) {
			
			$db = $this->getAdapter();
			
			$req = "WITH RECURSIVE node_list( unit, code, parent_code, name, complete_name, vernacular_name, is_reference, is_leaf, level) AS (  ";
			$req .= "	    SELECT unit, code, parent_code, name, complete_name, vernacular_name, is_reference, is_leaf, 1";
			$req .= "		FROM mode_taxref ";
			$req .= "		WHERE unit = ? ";
			$req .= "		AND parent_code = ? ";
			$req .= "	UNION ALL ";
			$req .= "		SELECT child.unit, child.code, child.parent_code, child.name, child.complete_name, child.vernacular_name, child.is_reference, child.is_leaf, level + 1 ";
			$req .= "		FROM mode_taxref child ";
			$req .= "		INNER JOIN node_list on (child.parent_code = node_list.code AND child.unit = node_list.unit) ";
			$req .= "		WHERE child.unit = ? ";
			if ($levels != 0) {
				$req .= "		AND level < " . $levels . " ";
			}
			$req .= "	) ";
			$req .= "	SELECT * ";
			$req .= "	FROM node_list ";
			$req .= "	ORDER BY level, parent_code, name "; // level is used to ensure correct construction of the structure
			
			$this->logger->info('getTaxrefChildren : ' . $parentcode);
			$this->logger->info('getTaxrefChildren : ' . $req);
			
			$select = $db->prepare($req);
			
			$select->execute(array(
				$unit,
				$parentcode,
				$unit
			));
			
			$rows = $select->fetchAll();
			
			if (!empty($rows)) {
				$resultTree = new Application_Object_Metadata_TreeNode(); // The root is empty
				foreach ($rows as $row) {
					
					$parentCode = $row['parent_code'];
					
					// Build the new node
					$tree = new Application_Object_Metadata_TaxrefNode();
					$tree->code = $row['code'];
					$tree->name = $row['name'];
					$tree->completeName = $row['complete_name'];
					$tree->vernacularName = $row['vernacular_name'];
					$tree->isLeaf = $row['is_leaf'];
					$tree->isReference = $row['is_reference'];
					
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
			} else {
				$resultTree = null;
			}
			
			if ($this->useCache) {
				$this->cache->save($resultTree, $key);
			}
			return $resultTree;
		} else {
			return $cachedResult;
		}
	}

	/**
	 * Get the taxons labels.
	 *
	 * @param String $unit
	 *        	the unit of the referential
	 * @param String $value
	 *        	the value searched (optional)
	 * @return Array[String, String]
	 */
	public function getTaxrefLabels($unit, $value = null) {
		$key = $this->_formatCacheKey('getTaxrefLabels_' . $unit . '_' . $value);
		
		$this->logger->debug($key);
		
		// No cache to avoid to increase the number of cache files for all combination
		
		$db = $this->getAdapter();
		
		$req = "	SELECT code, name ";
		$req .= "	FROM mode_taxref ";
		$req .= "	WHERE unit = ? ";
		if ($value != null) {
			if (is_array($value)) {
				$req .= " AND code IN ('" . implode("','", $value) . "')";
			} else {
				$req .= " AND code = '" . $value . "'";
			}
		}
		$req .= "	ORDER BY name ";
		
		$this->logger->info('getTaxrefLabels ' . $req);
		
		$select = $db->prepare($req);
		$select->execute(array(
			$unit
		));
		
		$result = array();
		foreach ($select->fetchAll() as $row) {
			$result[$row['code']] = $row['name'];
		}
		
		return $result;
	}

	/**
	 * Return the code and name for a taxref filtered by query.
	 *
	 * @param String $unit
	 *        	The unit
	 * @param String $query
	 *        	the searched text (optional)
	 * @param String $start
	 *        	the number of the first row to return (optional)
	 * @param String $limit
	 *        	the max number of row to return (optional)
	 * @return Array[Application_Object_Metadata_TaxrefNode]
	 */
	public function getTaxrefModes($unit, $query = null, $start = null, $limit = null) {
		$key = $this->_formatCacheKey('getTaxrefModes_' . $unit . '_' . $query . '_' . $start . '_' . $limit);
		
		$this->logger->debug($key);
		
		if ($this->useCache) {
			$cachedResult = $this->cache->load($key);
		}
		
		if (empty($cachedResult)) {
			
			$db = $this->getAdapter();
			
			// TODO : Performances à améliorer
			// TODO : Tri par pertinence
			$req = " SELECT code, is_leaf, is_reference, name, complete_name, vernacular_name ";
			$req .= " FROM mode_taxref ";
			$req .= " WHERE unit = ? ";
			$req .= " AND (name ilike '%" . $query . "%' ";
			$req .= "      OR complete_name ilike '%" . $query . "%' ";
			$req .= "      OR vernacular_name ilike '%" . $query . "%')";
			$req .= " ORDER BY name ";
			
			if ($start != null && $limit != null) {
				$req .= " LIMIT " . $limit . " OFFSET " . $start;
			}
			
			$this->logger->info('getTaxrefModes :' . $req);
			
			$select = $db->prepare($req);
			$select->execute(array(
				$unit
			));
			
			$result = array();
			foreach ($select->fetchAll() as $row) {
				
				// Build the new node
				$node = new Application_Object_Metadata_TaxrefNode();
				$node->code = $row['code'];
				$node->name = $row['name'];
				$node->completeName = $row['complete_name'];
				$node->vernacularName = $row['vernacular_name'];
				$node->isLeaf = $row['is_leaf'];
				$node->isReference = $row['is_reference'];
				
				$result[] = $node;
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
	 * Return the count of code for a taxref filtered by query.
	 *
	 * @param String $unit
	 *        	The unit
	 * @param String $query
	 *        	the searched text (optional)
	 * @return Integer
	 */
	public function getTaxrefModesCount($unit, $query = null) {
		$key = $this->_formatCacheKey('getTaxrefModesCount_' . $unit . '_' . $query);
		
		$this->logger->debug($key);
		
		if ($this->useCache) {
			$cachedResult = $this->cache->load($key);
		}
		
		if (empty($cachedResult)) {
			
			$db = $this->getAdapter();
			
			$req = "	SELECT count(code) ";
			$req .= "	FROM mode_taxref ";
			$req .= "	WHERE unit = ? ";
			if ($query != null) {
				$req .= " AND name ilike '%" . $query . "%' or complete_name ilike '%" . $query . "%' or vernacular_name ilike '%" . $query . "%'";
			}
			
			$this->logger->info('getTaxrefModesCount :' . $req);
			
			$select = $db->prepare($req);
			$select->execute(array(
				$unit
			));
			
			$result = $select->fetchColumn(0);
			
			if ($this->useCache) {
				$this->cache->save($result, $key);
			}
			return $result;
		} else {
			return $cachedResult;
		}
	}

	/**
	 * Get all the children codes from the reference taxon of a taxon.
	 *
	 * Return an array of codes.
	 *
	 * @param String $unit
	 *        	The unit
	 * @param String $code
	 *        	The identifier of the start node in the tree (by default the root node is *)
	 * @param Integer $levels
	 *        	The number of levels of depth (if 0 then no limitation)
	 * @return Array[String]
	 */
	public function getTaxrefChildrenCodes($unit, $code = '*', $levels = 1) {
		$key = $this->_formatCacheKey('getTaxrefChildrenCodes_' . $unit . '_' . $code . '_' . $levels);
		
		$this->logger->debug($key);
		
		if ($this->useCache) {
			$cachedResult = $this->cache->load($key);
		}
		
		if (empty($cachedResult)) {
			
			$this->logger->info('getTaxrefChildrenCodes : ' . $code . '_' . $levels);
			$db = $this->getAdapter();
			$req = "WITH RECURSIVE node_list( code, level) AS ( ";
			$req .= "	    SELECT code, 1 "; // we get the reference taxon as a base for the search
			$req .= "		FROM mode_taxref ";
			$req .= "		WHERE unit = ? ";
			$req .= "		AND code = ? ";
			$req .= "	UNION ALL ";
			$req .= "		SELECT child.code, level + 1 ";
			$req .= "		FROM mode_taxref child ";
			$req .= "		INNER JOIN node_list on (child.parent_code = node_list.code) ";
			$req .= "		WHERE child.unit = ? ";
			if ($levels != 0) {
				$req .= "		AND level < " . $levels . " ";
			}
			$req .= "	) ";
			$req .= "	SELECT * ";
			$req .= "	FROM node_list ";
			$req .= "	ORDER BY level, code "; // level is used to ensure correct construction of the structure
			
			$this->logger->info('getTaxrefChildrenCodes : ' . $req);
			
			$select = $db->prepare($req);
			$select->execute(array(
				$unit,
				$code,
				$unit
			));
			
			$result = array();
			foreach ($select->fetchAll() as $row) {
				$result[] = $row['code'];
			}
			
			if ($this->useCache) {
				$this->cache->save($result, $key);
			}
			return $result;
		} else {
			return $cachedResult;
		}
	}
}
