<?php

namespace OGAMBundle\Services;

use OGAMBundle\Entity\Generic\DataObject;
use Doctrine\ORM\EntityManager;
use OGAMBundle\Entity\Metadata\TableFormat;
use OGAMBundle\Entity\Metadata\TableField;

/**
 *
 * @author FBourcier
 *        
 */
class GenericService {
	/**
	 * The logger.
	 *
	 * @var Logger
	 */
	private $logger;
	
	/**
	 * The models.
	 * @var EntityManager
	 */
	private $metadataModel;
	
	/**
	 * The projection systems.
	 * @var String
	 */
	private $visualisationSRS;
	
	/**
	 * 
	 */
	private $configation;
	/**
	 * 
	 */
	function __construct($em, $configuration, $logger)
	{
		// Initialise the logger
		$this->logger = $logger;
		
		// Initialise the metadata models
		$this->metadataModel = $em;
		
		$this->configuration = $configuration;
		
		// Configure the projection systems
		$this->visualisationSRS = $configuration->getConfig('srs_visualisation', '3857');
	}
	
	/**
	 * Build an empty data object.
	 *
	 * @param String $schema
	 *        	the name of the schema
	 * @param String $format
	 *        	the name of the format
	 * @param String $datasetId
	 *        	the dataset identifier
	 * @return Application_Object_Generic_DataObject the DataObject structure (with no values set)
	 */
	public function buildDataObject($schema, $format, $datasetId = null) {
	
		// Prepare a data object to be filled
		$data = new DataObject();
	
		$data->datasetId = $datasetId;
	
		// Get the description of the table
		$data->tableFormat = $this->metadataModel->getRepository(TableFormat::class)->findOneBy(array('schemaCode'=> $schema,'format'=> $format));
	
		// Get all the description of the Table Fields corresponding to the format
		$tableFields = $this->metadataModel->getRepository(TableField::class)->getTableFields($schema, $format, $datasetId);
	
		// Separate the keys from other values
		foreach ($tableFields as $tableField) {
			if (in_array($tableField->data, $data->tableFormat->primaryKeys)) {
				// Primary keys are displayed as info fields
				$data->addInfoField($tableField);
			} else {
				// Editable fields are displayed as form fields
				$data->addEditableField($tableField);
			}
		}
	
		return $data;
	}
	
	/**
	 * Build the SELECT clause.
	 *
	 * @param Array[TableFields] $tableFields
	 *        	a list of result columns.
	 * @return String the SELECT part of the SQL query
	 */
	public function buildSelect($tableFields) {
		$sql = "";
	
		// Iterate through the fields
		foreach ($tableFields as $field) {
			$sql .= $this->buildSelectItem($field) . ", ";
		}
	
		// Remove the last comma
		$sql = substr($sql, 0, -2);
	
		return $sql;
	}
	
	/**
	 * Build the SELECT part for one field.
	 *
	 * @param TableField $field
	 *        	a table field descriptor.
	 * @param Array $options
	 *        	options about formatting
	 *        	"geometry_format" => "wkt" / "gml" (default "wkt")
	 *        	"geometry_srs" => output SRS for geometry fields (default 4326)
	 *        	"date_format" => SQL date format for date fields (default 'YYYY/MM/DD')
	 *        	"datetime_format" => SQL date format for datetime field (default like date_format; to use ISO 8601 : 'YYYY-MM-DD"T"HH24:MI:SSTZ')
	 *        	"time_format"=>'HH24:mi:ss'
	 * @return String the SELECT part corresponding to the field.
	 */
	public function buildSelectItem($field, $options = array()) {
		$sql = "";
	
		// Merge $options with defaults
		$defaults = array(
				"geometry_format" => "wkt",
				"geometry_srs" => $this->visualisationSRS,
				"gml_version" => 3,
				"gml_precision" => 15,
				"gml_options" => 0,
				"gml_prefix" => 'null',
				"gml_id" => 'null',
				"date_format" => 'YYYY/MM/DD',
				"datetime_format" => 'YYYY/MM/DD',
				"time_format"=>'HH24:mi:ss',
		);
		$options = array_replace($defaults, $options);
	
		$fieldName = $field->format . "." . $field->columnName;
	
		if ($field->type === "DATE") {
			if ($field->unit === "DateTime") {
				$sql .= "to_char(" . $fieldName . ", '" . $options['datetime_format'] . "') as " . $field->getName();
			} else {
				$sql .= "to_char(" . $fieldName . ", '" . $options['date_format'] . "') as " . $field->getName();
			}
		} else if ($field->type === "GEOM") {
			// Location is used for visualisation - don't change it
			$sql .= "st_asText(st_transform(" . $fieldName . "," . $this->visualisationSRS . ")) as location, ";
			// Special case for THE_GEOM
			switch ($options['geometry_format']) {
				case "gml":
					$sql .= "st_asGML(" . $options['gml_version'] . ", st_transform($fieldName," . $options['geometry_srs'] . ")" . ", " . $options['gml_precision'] . ", " . $options['gml_options'] . ", " . $options['gml_prefix'] . ", " . $options['gml_id'] . ") as " . $field->getName() . ", ";
					break;
				case "wkt":
				default:
					$sql .= "st_asText(st_transform(" . $fieldName . "," . $options['geometry_srs'] . ")) as " . $field->getName() . ", ";
			}
			$sql .= "st_ymin(box2d(st_transform(" . $fieldName . "," . $this->visualisationSRS . '))) as ' . $field->getName() . '_y_min, ';
			$sql .= "st_ymax(box2d(st_transform(" . $fieldName . "," . $this->visualisationSRS . '))) as ' . $field->getName() . '_y_max, ';
			$sql .= "st_xmin(box2d(st_transform(" . $fieldName . "," . $this->visualisationSRS . '))) as ' . $field->getName() . '_x_min, ';
			$sql .= "st_xmax(box2d(st_transform(" . $fieldName . "," . $this->visualisationSRS . '))) as ' . $field->getName() . '_x_max ';
		} else if ($field->type === 'TIME') {
			$sql .= "to_char(" . $fieldName . ", '" . $options['time_format'] . "') as " . $field->getName();
		} else {
			$sql .= $fieldName . " as " . $field->getName();
		}
	
		return $sql;
	}
	
	/**
	 * Build the WHERE clause corresponding to a list of criterias.
	 *
	 * @param String $schemaCode
	 *        	the schema.
	 * @param Array[Application_Object_Metadata_TableField] $criterias
	 *        	the criterias.
	 * @return String the WHERE part of the SQL query
	 */
	public function buildWhere($schemaCode, $criterias) {
		$sql = "";
	
		// Build the WHERE clause with the info from the PK.
		foreach ($criterias as $tableField) {
			$sql .= $this->buildWhereItem($schemaCode, $tableField, true); // exact match
		}
	
		return $sql;
	}
	
	/**
	 * Build the WHERE clause corresponding to one criteria.
	 *
	 * @param String $schemaCode
	 *        	the schema.
	 * @param TableField $tableField
	 *        	a criteria.
	 * @param Boolean $exact
	 *        	if true, will use an exact equal (no like %% and no IN (xxx) for trees).
	 * @return String the WHERE part of the SQL query (ex : 'AND BASAL_AREA = 6.05')
	 */
	public function buildWhereItem($schemaCode, $tableField, $exact = false) {
		$sql = "";
	
		$value = $tableField->value;
		$column = $tableField->format . "." . $tableField->columnName;
	
		// Set the projection for the geometries in this schema
		$configuration = $this->configation;
		if ($schemaCode === 'RAW_DATA') {
			$databaseSRS = $configuration->getConfig('srs_raw_data', '4326');
		} else if ($schemaCode === 'HARMONIZED_DATA') {
			$databaseSRS = $configuration->getConfig('srs_harmonized_data', '3857');
		} else {
			throw new \InvalidArgumentException('Invalid schema code.');
		}
		//TODO use or implement queryBuilder ?
		//$builder = $this->metadataModel->getConnection()->getExpressionBuilder();

		if ($value !== null && $value !== '' && $value !== array()) {
	
			switch ($tableField->type) {
	
				case "BOOLEAN":
					// Value is 1 or 0, stored in database as a char(1)
					if (is_array($value)) {
						$value = $value[0];
						$sql .= " AND " . $column . " = '" . $value . "'";
					} else if (is_bool($value)) {
						$sql .= " AND " . $column . " = '" . $value . "'";
					} else {
						$sql .= " AND " . $column . " = '" . $value . "'";
					}
					break;
	
				case "DATE":
					// Numeric values
					if (is_array($value)) {
						// Case of a list of values
						$sql2 = '';
						foreach ($value as $val) {
							if (!empty($val)) {
								$sql2 .= $this->_buildDateWhereItem($tableField, $val) . " OR ";
							}
						}
						if ($sql2 !== '') {
							$sql2 = substr($sql2, 0, -4); // remove the last OR
							$sql .= " AND (" . $sql2 . ")";
						}
					} else {
						// Single value
						if (!empty($value)) {
							$sql .= " AND " . $this->_buildDateWhereItem($tableField, $value);
						}
					}
					break;
				case "TIME":
					// time values
					if (is_array($value)) {
						// Case of a list of values
						$sql2 = '';
						foreach ($value as $val) {
							if (!empty($val)) {
								$sql2 .= $this->_buildTimeWhereItem($tableField, $val) . " OR ";
							}
						}
						if ($sql2 !== '') {
							$sql2 = substr($sql2, 0, -4); // remove the last OR
							$sql .= " AND (" . $sql2 . ")";
						}
					} else {
						// Single value
						if (!empty($value)) {
							$sql .= " AND " . $this->_buildTimeWhereItem($tableField, $value);
						}
					}
					break;
				case "INTEGER":
				case "NUMERIC":
					// Numeric values
					if (is_array($value)) {
	
						// Case of a list of values
						$sql2 = '';
						foreach ($value as $val) {
							if ($val !== null && $val !== '') {
								$sql2 .= $this->_buildNumericWhereItem($tableField, $val) . " OR ";
							}
						}
						if ($sql2 !== '') {
							$sql2 = substr($sql2, 0, -4); // remove the last OR
						}
						$sql .= " AND (" . $sql2 . ")";
					} else {
						// Single value
						if (is_numeric($value) || is_string($value)) {
							$sql .= " AND (" . $this->_buildNumericWhereItem($tableField, $value) . ")";
						}
					}
					break;
				case "ARRAY":
	
					// Case of a code in a generic TREE
					if ($tableField->subtype === 'TREE') {
	
						if (is_array($value)) {
							$value = $value[0];
						}
	
						if ($exact) {
							$sql .= " AND " . $column . " = '" . $value . "'";
						} else {
							// Get all the children of a selected node
							$nodeCodes = $this->metadataModel->getTreeChildrenCodes($tableField->unit, $value, 0);
	
							// Case of a list of values
							$stringValue = $this->_arrayToSQLString($nodeCodes);
							$sql .= " AND " . $column . " && " . $stringValue;
						}
					} else if ($tableField->subtype === 'TAXREF') {
						// Case of a code in a Taxonomic referential
						if (is_array($value)) {
							$value = $value[0];
						}
	
						if ($exact) {
							$sql .= " AND " . $column . " = '" . $value . "'";
						} else {
							// Get all the children of a selected taxon
							$nodeCodes = $this->metadataModel->getTaxrefChildrenCodes($tableField->unit, $value, 0);
	
							// Case of a list of values
							$stringValue = $this->_arrayToSQLString($nodeCodes);
							$sql .= " AND " . $column . " && " . $stringValue;
						}
					} else {
	
						$stringValue = $this->_arrayToSQLString($value);
						if (is_array($value)) {
							// Case of a list of values
							if ($exact) {
								$sql .= " AND " . $column . " = " . $stringValue;
							} else {
								$sql .= " AND " . $column . " && " . $stringValue;
							}
						} else if (is_string($value)) {
							// Single value
							if ($exact) {
								$sql .= " AND " . $column . " = " . $stringValue;
							} else {
								$sql .= " AND '" . $value . "' = ANY(" . $column . ")";
							}
						}
					}
	
					break;
				case "CODE":
	
					// Case of a code in a generic TREE
					if ($tableField->subtype === 'TREE') {
	
						if (is_array($value)) {
							$value = $value[0];
						}
	
						if ($exact) {
							$sql .= " AND " . $column . " = '" . $value . "'";
						} else {
							// Get all the children of a selected node
							$nodeCodes = $this->metadataModel->getTreeChildrenCodes($tableField->unit, $value, 0);
	
							$sql2 = '';
							foreach ($nodeCodes as $nodeCode) {
								$sql2 .= "'" . $nodeCode . "', ";
							}
							$sql2 = substr($sql2, 0, -2); // remove last comma
	
							$sql .= " AND " . $column . " IN (" . $sql2 . ")";
						}
					} else if ($tableField->subtype === 'TAXREF') {
						// Case of a code in a Taxonomic referential
						if (is_array($value)) {
							$value = $value[0];
						}
	
						if ($exact) {
							$sql .= " AND " . $column . " = '" . $value . "'";
						} else {
	
							// Get all the children of a selected taxon
							$nodeCodes = $this->metadataModel->getTaxrefChildrenCodes($tableField->unit, $value, 0);
	
							$sql2 = '';
							foreach ($nodeCodes as $nodeCode) {
								$sql2 .= "'" . $nodeCode . "', ";
							}
							$sql2 = substr($sql2, 0, -2); // remove last comma
	
							$sql .= " AND " . $column . " IN (" . $sql2 . ")";
						}
					} else {
	
						// String
						if (is_array($value)) {
							// Case of a list of values
							$values = '';
							foreach ($value as $val) {
								if ($val !== null && $val !== '' && is_string($val)) {
									$values .= "'" . $val . "', ";
								}
							}
							if ($values !== '') {
								$values = substr($values, 0, -2); // remove the last comma
								$sql .= " AND " . $column . " IN (" . $values . ")";
							}
						} else {
							// Single value
							$sql .= " AND " . $column . " = '" . $value . "'";
						}
					}
					break;
				case "GEOM":
					if (is_array($value)) {
						// Case of a list of geom
						$sql .= " AND (";
						$oradded = false;
						foreach ($value as $val) {
							if ($val !== null && $val !== '' && is_string($val)) {
								if ($exact) {
									$sql .= "ST_Equals(" . $column . ", ST_Transform(ST_GeomFromText('" . $val . "', " . $this->visualisationSRS . "), " . $databaseSRS . "))";
								} else {
									// The ST_Buffer(0) is used to correct the "Relate Operation called with a LWGEOMCOLLECTION type" error.
									$sql .= "ST_Intersects(" . $column . ", ST_Buffer(ST_Transform(ST_GeomFromText('" . $val . "', " . $this->visualisationSRS . "), " . $databaseSRS . "), 0))";
								}
								$sql .= " OR ";
								$oradded = true;
							}
						}
						if ($oradded) {
							$sql = substr($sql, 0, -4); // remove the last OR
						}
						$sql .= ")";
					} else {
						if (is_string($value)) {
							if ($exact) {
								$sql .= " AND (ST_Equals(" . $column . ", ST_Transform(ST_GeomFromText('" . $value . "', " . $this->visualisationSRS . "), " . databaseSRS . ")))";
							} else {
								$sql .= " AND (ST_Intersects(" . $column . ", ST_Buffer(ST_Transform(ST_GeomFromText('" . $value . "', " . $this->visualisationSRS . "), " . $databaseSRS . "), 0)))";
							}
						}
					}
					break;
				case "STRING":
				default:
					// String
					if (is_array($value)) {
						// Case of a list of values
						$sql .= " AND (";
						$oradded = false;
						foreach ($value as $val) {
							if ($val !== null && $val !== '' && is_string($val)) {
								if ($exact) {
									$sql .= $column . " = '" . $val . "'";
								} else {
									$sql .= $column . " ILIKE '%" . $val . "%'";
								}
								$sql .= " OR ";
								$oradded = true;
							}
						}
						if ($oradded) {
							$sql = substr($sql, 0, -4); // remove the last OR
						}
						$sql .= ")";
					} else {
						if (is_string($value)) {
							// Single value
							$sql .= " AND (" . $column;
							if ($exact) {
								$sql .= " = '" . $value . "'";
							} else {
								$sql .= " ILIKE '%" . $value . "%'";
							}
							$sql .= ")";
						}
					}
					break;
			}
		}
	
		return $sql;
	}
	private function validateDate($date, $format = 'Y-m-d H:i:s')
	{
		$d = \DateTime::createFromFormat($format, $date);
		return $d && $d->format($format) == $date;
	}
	/**
	 * Build a WHERE criteria for a single date value.
	 *
	 * @param TableField $tableField
	 *        	a criteria field.
	 * @param String $value
	 *        	a date criterium.
	 *
	 *        	Examples of values :
	 *        	YYYY/MM/DD : for equality
	 *        	>= YYYY/MM/DD : for the superior value
	 *        	<= YYYY/MM/DD : for the inferior value
	 *        	YYYY/MM/DD - YYYY/MM/DD : for the interval
	 */
	private function _buildDateWhereItem($tableField, $value) {
		$sql = "";
		$value = trim($value);
		$column = $tableField->format . "." . $tableField->columnName;
	
		if (!empty($value)) {
			if (strlen($value) === 10) {
				// Case "YYYY/MM/DD"
				if ($this->validateDate($value, 'Y/m/d')) {
					// One value, we make an equality comparison
					$sql .= "(" . $column . " = to_date('" . $value . "', 'YYYY/MM/DD'))";
				}
			} else if (strlen($value) === 13 && substr($value, 0, 2) === '>=') {
				// Case ">= YYYY/MM/DD"
				$beginDate = substr($value, 3, 10);
				if ($this->validateDate($beginDate, 'Y/m/d')) {
					$sql .= "(" . $column . " >= to_date('" . $beginDate . "', 'YYYY/MM/DD'))";
				}
			} else if (strlen($value) === 13 && substr($value, 0, 2) === '<=') {
				// Case "<= YYYY/MM/DD"
				$endDate = substr($value, 3, 10);
				if ($this->validateDate($endDate, 'Y/m/d')) {
					$sql .= "(" . $column . " <= to_date('" . $endDate . "', 'YYYY/MM/DD'))";
				}
			} else if (strlen($value) === 23) {
				// Case "YYYY/MM/DD - YYYY/MM/DD"
				$beginDate = substr($value, 0, 10);
				$endDate = substr($value, 13, 10);
				if ($this->validateDate($beginDate, 'Y/m/d') && $this->validateDate($endDate, 'Y/m/d')) {
					$sql .= "(" . $column . " >= to_date('" . $beginDate . "', 'YYYY/MM/DD') AND " . $column . " <= to_date('" . $endDate . "', 'YYYY/MM/DD'))";
				}
			}
		}
	
		if ($sql === "") {
			throw new \Exception("Invalid data format");
		}
	
		return $sql;
	}
	/**
	 * Build a WHERE criteria for a single time value.
	 *
	 * @param TableField $tableField a criteria field.
	 * @param String $value a time criterium.
	 *
	 * @tutorial examples of values :
	 *        	HH:mm:ss : for equality
	 *        	>= HH:mm:ss : for the superior value
	 *        	<= HH:mm:ss : for the inferior value
	 *        	HH:mm:ss - HH:mm:ss : for the interval
	 */
	private function _buildTimeWhereItem($tableField, $value) {
		$sql = "";
		$timeFormat= 'HH:mm:ss';
		$gtOperator= '>=';
		$ltOperator = '<=';
		$value = trim($value);
		$column = $tableField->format . "." . $tableField->columnName;
	
		if (!empty($value)) {
			if (strlen($value) === strlen($timeFormat)) {
				// Case "HH:mm:ss"
				if ($this->validateDate($value, 'H:i:s')) {
					// One value, we make an equality comparison
					$sql .= "(" . $column . " = TIME '" . $value . "')";
				}
			} else if (strlen($value) === strlen("$gtOperator $timeFormat") && strpos($value, $gtOperator) === 0) {
				// Case ">= HH:mm:ss"
				$beginDate = substr($value, - strlen($timeFormat));
				if ($this->validateDate($beginDate, 'H:i:s')) {
					$sql .= "(" . $column . " >= TIME '" . $beginDate . "')";
				}
			} else if (strlen($value) === strlen("$ltOperator $timeFormat") && strpos($value, $ltOperator) === 0) {
				// Case "<= HH:mm:ss"
				$endDate = substr($value, - strlen($timeFormat));
				if ($this->validateDate($endDate, 'H:i:s')) {
					$sql .= "(" . $column . " <= TIME '" . $endDate . "')";
				}
			} else if (strlen($value) === strlen("$timeFormat - $timeFormat")) {
				// Case "HH:mm:ss - HH:mm:ss"
				$beginDate = substr($value, 0, strlen($timeFormat));
				$endDate = substr($value, -strlen($timeFormat));
				if ($this->validateDate($beginDate, 'H:i:s') && $this->validateDate($endDate, 'H:i:s')) {
					$sql .= "(" . $column . " >= TIME '" . $beginDate . "' AND " . $column . " <= TIME '" . $endDate . "')";
				}
			}
		}
	
		if ($sql === "") {
			throw new \Exception("Invalid data format");
		}
	
		return $sql;
	}
	

	/**
	 * Build a WHERE criteria for a single numeric value.
	 *
	 * @param Application_Object_Metadata_TableField $tableField
	 *        	a criteria field.
	 * @param String $value
	 *        	a numeric criterium.
	 *
	 *        	Examples of values :
	 *        	12
	 *        	12.5
	 *        	12.5 - 17.9 (will generate a min - max criteria)
	 */
	private function _buildNumericWhereItem($tableField, $value) {
		$sql = "";
		$posBetween = strpos($value, " - ");
		$posInf = strpos($value, "<=");
		$posSup = strpos($value, ">=");
	
		// Cas où les 2 valeurs sont présentes
		if ($posBetween !== false) {
	
			$minValue = substr($value, 0, $posBetween);
			$maxValue = substr($value, $posBetween + 3);
			$sql2 = '';
	
			if (($minValue !== null) && ($minValue !== '')) {
				$sql2 .= $tableField->format . "." . $tableField->columnName . " >= " . $minValue;
			}
			if (($maxValue !== null) && ($maxValue !== '')) {
				if ($sql2 !== '') {
					$sql2 .= ' AND ';
				}
				$sql2 .= $tableField->format . "." . $tableField->columnName . " <= " . $maxValue;
			}
			$sql .= '(' . $sql2 . ')';
		} else if ($posInf !== false) {
			// Cas où on a juste un max
			$maxValue = trim(substr($value, $posInf + 2));
			if (($maxValue !== null) && ($maxValue !== '')) {
				$sql .= $tableField->format . "." . $tableField->columnName . " <= " . $maxValue;
			}
		} else if ($posSup !== false) {
			// Cas où on a juste un min
			$minValue = trim(substr($value, $posSup + 2));
			if (($minValue !== null) && ($minValue !== '')) {
				$sql .= $tableField->format . "." . $tableField->columnName . " >= " . $minValue;
			}
		} else {
			// One value, we make an equality comparison
			$sql .= $tableField->format . "." . $tableField->columnName . " = " . $value;
		}
	
		return $sql;
	}
}