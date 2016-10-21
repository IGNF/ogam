<?php

namespace OGAMBundle\Services;

use Doctrine\ORM\EntityManager;
use OGAMBundle\Entity\Metadata\TableFormat;
use OGAMBundle\Entity\Metadata\TableField;
use OGAMBundle\Entity\Metadata\FormField;
use OGAMBundle\OGAMBundle;
use OGAMBundle\Entity\Metadata\TableTree;
use OGAMBundle\Entity\Generic\GenericFieldMapping;
use OGAMBundle\Entity\Generic\GenericField;
use OGAMBundle\Entity\Generic\GenericFieldMappingSet;
use OGAMBundle\Entity\Generic\QueryForm;
use OGAMBundle\Repository\Metadata\DynamodeRepository;
use OGAMBundle\Entity\Metadata\Mode;
use OGAMBundle\Entity\Metadata\Dynamode;
use OGAMBundle\Entity\Metadata\ModeTree;
use OGAMBundle\Entity\Metadata\Unit;
use OGAMBundle\Entity\Generic\GenericTableFormat;
use OGAMBundle\Entity\Generic\GenericGeomField;

/**
 *
 * The Generic Service.
 *
 * This service handles transformations between data objects and generate generic SQL requests from the metadata.
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
	 * The locale.
	 *
	 * @var locale
	 */
	private $locale;
	
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
	 * @var ConfigurationManager
	 */
	private $configuration;
	/**
	 * 
	 */
	function __construct($em, $configuration, $logger, $locale)
	{
		// Initialise the logger
		$this->logger = $logger;
		
		// Initialise the locale
		$this->locale = $locale;
		
		// Initialise the metadata models
		$this->metadataModel = $em;
		
		$this->configuration = $configuration;
		
		// Configure the projection systems
		$this->visualisationSRS = $configuration->getConfig('srs_visualisation', '3857');
	}
	
	/**
	 * Build an empty data object.
	 *
	 * @param String $schema the name of the schema
	 * @param String $format the name of the format
	 * @param String $datasetId the dataset identifier
	 * @return GenericTableFormat the DataObject structure (with no values set)
	 */
	public function buildGenericTableFormat($schema, $format, $datasetId = null) {
	
		// Get the description of the table
		$tableFormat = $this->metadataModel->getRepository(TableFormat::class)->findOneBy(array('schema'=> $schema,'format'=> $format));

		// Prepare a data object to be filled
		$gTable = new GenericTableFormat($datasetId, $tableFormat);

		// Get all the description of the Table Fields corresponding to the format
		$tableFields = $this->metadataModel->getRepository(TableField::class)->getTableFields($schema, $format, $datasetId, $this->locale);
	
		// Separate the keys from other values
		foreach ($tableFields as $tableField) {
		    $format = $tableField->getFormat()->getFormat();
		    $data = $tableField->getData()->getData();
		    if ($tableField->getData()->getUnit()->getType() !== "GEOM") {
		        $tableRowField = new GenericField($format, $data);
		    } else {
		        $tableRowField = new GenericGeomField($format, $data);
		    }
		    $tableRowField->setMetadata($tableField, $this->locale);
			if (in_array($tableRowField->getData(), $gTable->getTableFormat()->getPrimaryKeys())) {
				// Primary keys are displayed as info fields
			    
				$gTable->addIdField($tableRowField);
			} else {
				// Editable fields are displayed as form fields
				$gTable->addField($tableRowField);
			}
		}
	
		return $gTable;
	}
	
	/**
	 * Return an Array object corresponding to a SQL string.
	 *
	 * Example : {"Boynes", "Ascoux"} => Array ( [0] => Boynes, [1] => Ascoux )
	 *
	 * @param String $value
	 *        	an array of values.
	 * @return the String representation of the array
	 */
	public function stringToArray($value) {
	    $values = str_replace("{", "", $value);
	    $values = str_replace("}", "", $values);
	    $values = str_replace('"', "", $values);
	    $values = trim($values);
	    $valuesArray = explode(",", $values);
	
	    foreach ($valuesArray as $v) {
	        $v = trim($v);
	    }
	
	    return $valuesArray;
	}
	/**
	 * Find the labels corresponding to the code value.
	 *
	 * @param TableField $tableField a table field descriptor
	 * @param [String|Array] $value a value
	 * @return String or Array The labels
	 */
	public function getValueLabel(TableField $tableField, $value) {
	
	    // If empty, no label
	    if ($value === null || $value === '') {
	        return "";
	    }
	
	    // By default we keep the value as a label
	    $valueLabel = $value;
	
	    // For the CODE and ARRAY fields, we get the labels in the metadata
	    $unit = $tableField->getData()->getUnit();
	    if ($unit->getType() === "CODE" || $unit->getType() === "ARRAY") {
	
	        // Get the modes => Label
	        if ($unit->getSubtype() === "DYNAMIC") {
	            $modes =  $this->metadataModel->getRepository(Unit::class)->getModesLabel($unit, $value, $this->locale);
	        } else if ($unit->getSubtype() === "TREE") {
	            $modes = $this->metadataModel->getRepository(ModeTree::class)->getTreeLabels($unit->getUnit(), $value, $this->locale);
	        } else if ($unit->getSubtype() === "TAXREF") {
	            $modes =  $this->metadataModel->getRepository(Unit::class)->getModesLabel($unit, $value, $this->locale);
	        } else {
	            $modes =   $this->metadataModel->getRepository(Unit::class)->getModesLabel($unit, $value,  $this->locale);
	        }

	        // Populate the labels of the currently selected values
	        if (is_array($value)) {
	            $labels = array();
	            if (isset($value)) {
	                foreach ($value as $mode) {
	                    if (isset($modes[$mode])) {
	                        $labels[] = $modes[$mode];
	                    }
	                }
	                $valueLabel = $labels;
	            }
	        } else {
	            if (isset($modes[$value])) {
	                $valueLabel = $modes[$value];
	            }
	        }
	    }
	
	    return $valueLabel;
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
	
		$fieldName = $field->getFormat()->getFormat() . '.' . $field->getColumnName();
	    $unit =$field->getData()->getUnit();
		if ($unit->getType() === "DATE") {
			if ($unit->getUnit() === "DateTime") {
				$sql .= "to_char(" . $fieldName . ", '" . $options['datetime_format'] . "') as " . $field->getName();
			} else {
				$sql .= "to_char(" . $fieldName . ", '" . $options['date_format'] . "') as " . $field->getName();
			}
		} else if ($unit->getType() === "GEOM") {
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
		} else if ($unit->getType() === 'TIME') {
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
	 * @param Array[GenericField] $criterias
	 *        	the criterias.
	 * @return String the WHERE part of the SQL query
	 */
	public function buildWhere($schemaCode, $criterias) {
		$sql = "";
	
		// Build the WHERE clause with the info from the PK.
		foreach ($criterias as $tableField) {
			$sql .= $this->buildWhereItem($schemaCode, $tableField->getMetadata(), $tableField->getValue(), true); // exact match
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
	public function buildWhereItem($schemaCode, $tableField, $value, $exact = false) {
		$sql = "";

		$column = $tableField->getFormat()->getFormat() . "." . $tableField->getColumnName();
	
		// Set the projection for the geometries in this schema
		$configuration = $this->configuration;
		if ($schemaCode === 'RAW_DATA') {
			$databaseSRS = $configuration->getConfig('srs_raw_data', '4326');
		} else if ($schemaCode === 'HARMONIZED_DATA') {
			$databaseSRS = $configuration->getConfig('srs_harmonized_data', '3857');
		} else {
			throw new \InvalidArgumentException('Invalid schema code.');
		}
		//TODO use or implement queryBuilder ?
		//$builder = $this->metadataModel->getConnection()->getExpressionBuilder();
        $unit = $tableField->getData()->getUnit();
		if ($value !== null && $value !== '' && $value !== array()) {
	
			switch ($unit->getType()) {
	
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
					if ($unit->getSubtype() === 'TREE') {
	
						if (is_array($value)) {
							$value = $value[0];
						}
	
						if ($exact) {
							$sql .= " AND " . $column . " = '" . $value . "'";
						} else {
							// Get all the children of a selected node
							$nodeCodes = $this->metadataModel->getTreeChildrenCodes($unit, $value, 0);
	
							// Case of a list of values
							$stringValue = $this->_arrayToSQLString($nodeCodes);
							$sql .= " AND " . $column . " && " . $stringValue;
						}
					} else if ($unit->getSubtype() === 'TAXREF') {
						// Case of a code in a Taxonomic referential
						if (is_array($value)) {
							$value = $value[0];
						}
	
						if ($exact) {
							$sql .= " AND " . $column . " = '" . $value . "'";
						} else {
							// Get all the children of a selected taxon
							$nodeCodes = $this->metadataModel->getTaxrefChildrenCodes($unit, $value, 0);
	
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
					if ($unit->getSubtype() === 'TREE') {
	
						if (is_array($value)) {
							$value = $value[0];
						}
	
						if ($exact) {
							$sql .= " AND " . $column . " = '" . $value . "'";
						} else {
							// Get all the children of a selected node
							$nodeCodes = $this->metadataModel->getTreeChildrenCodes($unit, $value, 0);
	
							$sql2 = '';
							foreach ($nodeCodes as $nodeCode) {
								$sql2 .= "'" . $nodeCode . "', ";
							}
							$sql2 = substr($sql2, 0, -2); // remove last comma
	
							$sql .= " AND " . $column . " IN (" . $sql2 . ")";
						}
					} else if ($unit->getSubtype() === 'TAXREF') {
						// Case of a code in a Taxonomic referential
						if (is_array($value)) {
							$value = $value[0];
						}
	
						if ($exact) {
							$sql .= " AND " . $column . " = '" . $value . "'";
						} else {
	
							// Get all the children of a selected taxon
							$nodeCodes = $this->metadataModel->getTaxrefChildrenCodes($unit, $value, 0);
	
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
		$column = $tableField->getFormat()->getFormat() . "." . $tableField->getColumnName();
	
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
		$column = $tableField->getFormat()->getFormat() . "." . $tableField->getColumnName();
	
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
	 * @param TableField $tableField
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
				$sql2 .= $tableField->getFormat()->getFormat() . "." . $tableField->getColumnName() . " >= " . $minValue;
			}
			if (($maxValue !== null) && ($maxValue !== '')) {
				if ($sql2 !== '') {
					$sql2 .= ' AND ';
				}
				$sql2 .= $tableField->getFormat()->getFormat() . "." . $tableField->getColumnName() . " <= " . $maxValue;
			}
			$sql .= '(' . $sql2 . ')';
		} else if ($posInf !== false) {
			// Cas où on a juste un max
			$maxValue = trim(substr($value, $posInf + 2));
			if (($maxValue !== null) && ($maxValue !== '')) {
				$sql .= $tableField->getFormat()->getFormat() . "." . $tableField->getColumnName() . " <= " . $maxValue;
			}
		} else if ($posSup !== false) {
			// Cas où on a juste un min
			$minValue = trim(substr($value, $posSup + 2));
			if (($minValue !== null) && ($minValue !== '')) {
				$sql .= $tableField->getFormat()->getFormat() . "." . $tableField->getColumnName() . " >= " . $minValue;
			}
		} else {
			// One value, we make an equality comparison
			$sql .= $tableField->getFormat()->getFormat() . "." . $tableField->getColumnName() . " = " . $value;
		}
	
		return $sql;
	}
	
	/**
	 * Return the SQL String representation of an array.
	 *
	 * Example : Array ( [0] => Boynes, [1] => Ascoux ) => {"Boynes", "Ascoux"}
	 *
	 * @param Array[String] $value
	 *        	an array of values.
	 * @return the String representation of the array
	 */
	private function _arrayToSQLString($arrayValues) {
	    $string = "'{";
	
	    if (is_array($arrayValues)) {
	        foreach ($arrayValues as $value) {
	            $string .= '"' . $value . '",';
	        }
	        if (!empty($arrayValues)) {
	            $string = substr($string, 0, -1); // Remove last comma
	        }
	    } else {
	        $string .= $arrayValues;
	    }
	    $string .= "}'";
	
	    return $string;
	}
	

	/**
	 * Build the update part of a SQL request corresponding to a table field.
	 *
	 * @param string $schema the schema.
	 * @param GenericField $tableField a criteria.
	 * @return String the update part of the SQL query (ex : BASAL_AREA = 6.05)
	 */
	public function buildSQLValueItem($schema, $tableField) {
	    $sql = "";
	
	    $value = $tableField->getValue();
	    //$column = $tableField->getColumnName();

	    // Set the projection for the geometries in this schema
	    $configuration = $this->configuration;
	    if ($schema === 'RAW_DATA') {
	        $databaseSRS = $configuration->getConfig('srs_raw_data', '4326');
	    } else if ($schema === 'HARMONIZED_DATA') {
	        $databaseSRS = $configuration->getConfig('srs_harmonized_data', '3857');
	    } else {
	        throw new \InvalidArgumentException('Invalid schema code.');
	    }
	
	    switch ($tableField->getMetadata()->getData()->getUnit()->getType()) {
	
	        case "BOOLEAN":
	            // Value is 1 or 0, stored in database as a char(1)
	            $sql = ($value == true ? '1' : '0');
	            break;
	        case "DATE":
	            if ($value == "") {
	                $sql = "NULL";
	            } else {
	                $sql = " to_date('" . $value . "', 'YYYY/MM/DD')";
	            }
	            break;
	        case "TIME":
	                if ($value == "") {
	                    $sql = "NULL";
	                } else {
	                    $sql = "'" . $value . "'";
	                }
	                break;
	        case "INTEGER":
	        case "NUMERIC":
	        case "RANGE":
	            if ($value === "") {
	                $sql = "NULL";
	            } else {//0 is valid here
	                $value = str_replace(",", ".", $value);
	                $sql = $value;
	            }
	            break;
	        case "ARRAY":
	            $sql = $this->_arrayToSQLString($value);
	            break;
	        case "CODE":
	            $sql = "'" . $value . "'";
	            break;
	        case "GEOM":
	            if ($value == "") {
	                $sql = "NULL";
	            } else {
	                $sql = " ST_transform(ST_GeomFromText('" . $value . "', " . $this->visualisationSRS . "), " . $databaseSRS . ")";
	            }
	            break;
	        case "STRING":
	        default:
	            // Single value
	            $sql = "'" . $value . "'";
	            break;
	    }
	
	    return $sql;
	}
	
	/**
	 * Get the form field corresponding to the table field.
	 *
	 * @param GenericField $tableRowField the a valuable table row field
	 * @param Boolean $copyValues is true the values will be copied
	 * @return GenericField
	 */
	public function getTableToFormMapping($tableRowField, $copyValues = false) {
	
	    $tableField = $tableRowField->getMetadata();
	    // Get the description of the form field
	    $req = "SELECT ff 
FROM OGAMBundle\Entity\Metadata\FormField ff
JOIN OGAMBundle\Entity\Metadata\FieldMapping fm 
WHERE fm.mappingType = 'FORM' AND fm.srcData = ff.data and fm.srcFormat = ff.format and fm.dstFormat = :format and fm.dstData = :data";
	    $formField = $this->metadataModel->createQuery($req)->setParameters(array('format'=>$tableField->getFormat()->getFormat(), 'data'=>$tableField->getData()->getData()))->getOneOrNullResult();
	    $valuedField = null;
	    // Clone the object to avoid modifying existing object
	    if ($formField !== null) {
	        $valuedField = new GenericField($formField->getFormat()->getFormat(), $formField->getData()->getData());
	        $valuedField->setMetadata($formField, $this->locale);
	    }
	
	    // Copy the values
	    if ($copyValues === true && $formField !== null && $tableRowField->getValue() !== null) {
	
	        // Copy the value and label
	        $valuedField->setValue($tableRowField->getValue());
	        $valuedField->setValueLabel($tableRowField->getValueLabel());
	    }
	
	    return $valuedField;
	}
	
	/**
	 * Return the fields mappings in the provided schema
	 * 
	 * @param string $schema
	 * @param [\OGAMBundle\Entity\Generic\GenericField] $formFields
	 * @return GenericFieldMappingSet
	 */
	public function getFieldsMappings($schema, $formFields) {
	    $fieldsMappings = [];
	    foreach ($formFields as $formField) {
	        // Get the description of the corresponding table field
	        $tableField = $this->metadataModel->getRepository(TableField::class)->getFormToTableMapping($schema, $formField, $this->locale);
	        $dstField = new GenericField($tableField->getFormat()->getFormat(), $tableField->getData()->getData());
	        $dstField->setMetadata($tableField, $this->locale);
	
	        // Create the field mapping
	        $fieldMapping = new GenericFieldMapping($formField, $dstField, $schema);
	        $fieldsMappings[] = $fieldMapping;
	    }
	    
	    return new GenericFieldMappingSet($fieldsMappings, $schema);
	}

	
	/**
	 * Get the hierarchy of tables needed for a data object.
	 *
	 * @param String $schema
	 *        	the schema
	 * @param OgamBundle\Entity\Generic\GenericFieldMapping $fieldsMappings
	 *        	the fields mappings
	 * @return Array[String => TableTreeData] The list of formats (including ancestors) potentially used
	 */
	public function getAllFormats($schema, $fieldsMappings) {
	    $this->logger->info('getAllFormats : ' . $schema);
	
	    // Prepare the list of needed tables
	    $tables = array();
	    foreach ($fieldsMappings as $fieldMapping) {
	        $TableFormat = $fieldMapping->getDstField()->getFormat();
	        if (!array_key_exists($TableFormat, $tables)) {
	
	            // Get the ancestors of the table
	            $ancestors = $this->metadataModel->getRepository(TableTree::class)->getAncestors($TableFormat, $schema);
	
	            // Reverse the order of the list and store by indexing with the table name
	            // The root table (LOCATION) should appear first
	            $ancestors = array_reverse($ancestors);
	            foreach ($ancestors as $ancestor) {
	                $tables[$ancestor->getTableFormat()->getFormat()] = $ancestor;
	            }
	        }
	    }
	
	    return $tables;
	}

	/**
	 * Generate the SQL request corresponding the distinct locations of the query result.
	 *
	 * @param String $schema
	 *        	the schema
	 * @param [OgamBundle\Entity\Generic\GenericField] $formFields
	 *        	a form fields array
	 * @param OgamBundle\Entity\Generic\GenericFieldMappingSet $mappingSet
	 *        	the field mapping set
	 * @param Array $userInfos
	 *        	Few user informations
	 * @param Array $options
	 *        	formatting options for the returned fields (see buildSelectItem)
	 * @return String a SQL request
	 */
	public function generateSQLSelectRequest($schema, $formFields, GenericFieldMappingSet $mappingSet, $userInfos, $options = array()) {
	    $this->logger->debug('generateSQLSelectRequest');
	
	    //
	    // Prepare the SELECT clause
	    //
	    $select = "SELECT DISTINCT "; // The "distinct" is for the case where we have some criteria but no result columns selected on the last table
	    foreach ($formFields as $formField) {
	        $tableField = $mappingSet->getDstField($formField)->getMetadata();
	        $select .= $this->buildSelectItem($tableField, $options) . ", ";
	    }
	    $select = substr($select, 0, -2);
	
	    //
	    // Create a unique identifier for each line
	    // We use the last column of the leaf table
	    //
	    // Get the leaf table
	    $tables = $this->getAllFormats($schema, $mappingSet->getFieldMappingArray());
	    $rootTable = reset($tables);
	    $reversedTable = array_reverse($tables); // Only variables should be passed by reference
	    $leafTable = array_shift($reversedTable);
	
	    // Get the root table fields
	    $rootTableFields = $this->metadataModel->getRepository(TableField::class)->getTableFields($schema, $rootTable->getTableFormat()->getFormat(), null, $this->locale);
	    $hasColumnProvider = array_key_exists('PROVIDER_ID', $rootTableFields);
	
	    $uniqueId = "'SCHEMA/" . $schema . "/FORMAT/" . $leafTable->getTableFormat()->getFormat() . "'";
	
	    $keys = $leafTable->getTableFormat()->getPrimaryKeys();
	    foreach ($keys as $key) {
	        // Concatenate the column to create a unique Id
	        $uniqueId .= " || '/' || '" . $key . "/' ||" . $leafTable->getTableFormat()->getFormat() . "." . $key;
	    }
	    $select .= ", " . $uniqueId . " as id";
	
	    // Detect the column containing the geographical information
	    $locationField = $this->metadataModel->getRepository(TableField::class)->getGeometryField($schema, array_keys($tables), $this->locale);
	
	    // Add the location centroid (for zooming on the map)
	    $select .= ", st_astext(st_centroid(st_transform(" . $locationField->getFormat()->getFormat() . "." . $locationField->getColumnName() . "," . $this->visualisationSRS . "))) as location_centroid ";
	
	    // Right management
	    // Get back the provider id of the data
	    if (!$userInfos['DATA_EDITION_OTHER_PROVIDER'] && $hasColumnProvider) {
	        $select .= ", " . $leafTable->getTableFormat()->getFormat() . ".provider_id as _provider_id";
	    }
	
	    // Return the completed SQL request
	    return $select;
	}

	/**
	 * Generate the FROM clause of the SQL request corresponding to a list of parameters.
	 *
	 * @param String $schema
	 *        	the schema
	 * @param OgamBundle\Entity\Generic\GenericFieldMappingSet $mappingSet
	 *        	the field mapping set
	 * @return String a SQL request
	 */
	public function generateSQLFromRequest($schema, GenericFieldMappingSet $mappingSet) {
	    $this->logger->debug('generateSQLFromRequest');
	
	    //
	    // Prepare the FROM clause
	    //
	
	    // Prepare the list of needed tables
	    $tables = $this->getAllFormats($schema, $mappingSet->getFieldMappingArray());
	
	    // Add the root table;
	    $rootTable = array_shift($tables);
	    $from = " FROM " . $rootTable->getTableFormat()->getTableName() . " " . $rootTable->getTableFormat()->getFormat();
	
	    // Add the joined tables
	    $i = 0;
	    foreach ($tables as $tableTreeData) {
	        $i ++;
	
	        // Join the table
	        $from .= " JOIN " . $tableTreeData->getTableFormat()->getTableName() . " " . $tableTreeData->getTableFormat()->getFormat() . " on (";
	
	        // Add the join keys
	        $keys = $tableTreeData->getJoinKeys();
	        foreach ($keys as $key) {
	            $from .= $tableTreeData->getTableFormat()->getFormat() . "." . trim($key) . " = " . $tableTreeData->getParentTableFormat()->getFormat() . "." . trim($key) . " AND ";
	        }
	        $from = substr($from, 0, -5);
	        $from .= ") ";
	    }
	
	    return $from;
	}
	
	/**
	 * Generate the WHERE clause of the SQL request corresponding to a list of parameters.
	 *
	 * @param String $schema
	 *        	the schema
	 * @param [OgamBundle\Entity\Generic\GenericField] $formFields
	 *        	a form fields array
	 * @param OgamBundle\Entity\Generic\GenericFieldMappingSet $mappingSet
	 *        	the field mapping set
	 * @return String a SQL request
	 */
	public function generateSQLWhereRequest($schemaCode, $formFields, GenericFieldMappingSet $mappingSet, $userInfos) {
	    $this->logger->debug('generateSQLWhereRequest');
	
	    // Prepare the list of needed tables
	    $tables = $this->getAllFormats($schemaCode, $mappingSet->getFieldMappingArray());
	
	    // Add the root table;
	    $rootTable = array_shift($tables);
	
	    // Get the root table fields
	    $rootTableFields = $this->metadataModel->getRepository(TableField::class)->getTableFields($schemaCode, $rootTable->getTableFormat()->getFormat(), null, $this->locale);
	    $hasColumnProvider = array_key_exists('PROVIDER_ID', $rootTableFields);
	
	    //
	    // Prepare the WHERE clause
	    //
	    $where = " WHERE (1 = 1)";
	    foreach ($formFields as $formField) {
	        $tableField = $mappingSet->getDstField($formField)->getMetadata();
	        $where .= $this->buildWhereItem($schemaCode, $tableField, $formField->getValue(), false);
	    }
	
	    // Right management
	    // Check the provider id of the logged user
        if (!$userInfos['DATA_QUERY_OTHER_PROVIDER'] && $hasColumnProvider) {
            $where .= " AND " . $rootTable->getTableFormat()->getFormat() . ".provider_id = '" . $userInfos['providerId'] . "'";
        }
	
	    // Return the completed SQL request
	    return $where;
	}
	
	/**
	 * Generate the primary key of the left table of the query.
	 * Fields composing the pkey are prefixed with the table label
	 *
	 * @param String $schema
	 *        	the schema
	 * @param OgamBundle\Entity\Generic\GenericFieldMappingSet $mappingSet
	 *        	the field mapping set
	 * @return String a primary key
	 */
	public function generateSQLPrimaryKey($schema, $mappingSet) {
	    $this->logger->debug('generateSQLPrimaryKey');
	
	    // Get the left table;
	    $tables = $this->getAllFormats($schema, $mappingSet->getFieldMappingArray());
	    $leafTable = array_pop($tables);
	
	    $keys = $leafTable->getTableFormat()->getPrimaryKeys();
	    foreach ($keys as $index => $key) {
	        $keys[$index] = $leafTable->getTableFormat()->getFormat() . "." . $key;
	    }
	
	    return implode(',', $keys);
	}
	
	/**
	 * Serialize a list of data objects as an array for a display into a Ext.GridPanel.
	 *
	 * @param String $id
	 *        	the id for the returned dataset
	 * @param List[DataObject] $data
	 *        	the data object we're looking at.
	 * @return ARRAY
	 */
	public function dataToGridDetailArray($id, $data) {
	    $this->logger->info('dataToDetailArray');
	
	    if (!empty($data)) {
	
	        // The columns config to setup the grid columnModel
	        $columns = array(
	            array(
	
	                'header' => 'Informations',
	                'dataIndex' => 'informations',
	                'editable' => false,
	                'tooltip' => 'Informations',
	                'width' => 150,
	                'type' => 'STRING'
	            )
	        );
	
	        // The fields config to setup the store reader
	        $locationFields = array(
	            'id',
	            'informations'
	        );
	        // The data to full the store
	        $locationsData = array();
	        $firstData = $data[0];
	
	        // Dump each row values
	        foreach ($data as $datum) {
	            $locationData = array();
	            // Addition of the row id
	            $locationData[0] = $datum->getId();
	            $locationData[1] = "";
	            foreach ($datum->getIdFields() as $field) {
	                $locationData[1] .= $field->getValueLabel() . ', ';
	            }
	
	            if ($locationData[1] !== "") {
	                $locationData[1] = substr($locationData[1], 0, -2);
	            }
	            $formFields = $this->getFormFieldsOrdered($datum->getFields());
	            foreach ($formFields as $formField) {
	                // We keep only the result fields (The columns availables)
	                array_push($locationData, $formField->getValueLabel());
	            }
	            array_push($locationsData, $locationData);
	        }
	
	        // Add the colums description
	        foreach ($formFields as $field) {
	            // Set the column model and the location fields
	            $dataIndex = $firstData->getTableFormat()->getFormat() . '__' . $field->getData();
	
	            $column = array(
	                'header' => $field->getMetadata()->getData()->getLabel(),
	                'dataIndex' => $dataIndex,
	                'editable' => false,
	                'tooltip' => $field->getMetadata()->getData()->getDefinition(),
	                'width' => 150,
	                'type' => $field->getMetadata()->getData()->getUnit()->getType()
	            );
	            array_push($columns, $column);
	            array_push($locationFields, $dataIndex);
	        }
	
	        // Check if the table has a child table
	        $hasChild = false;
	        $children = $this->metadataModel->getRepository(TableTree::class)->getChildrenTableLabels($firstData->getTableFormat());
	        if (!empty($children)) {
	            $hasChild = true;
	        }
	        $out = Array();
	        $out['id'] = $id;
	        $out['title'] = $firstData->getTableFormat()->getLabel() . ' (' . count($locationsData) . ')';
	        $out['hasChild'] = $hasChild;
	        $out['columns'] = array_values($columns);
	        $out['fields'] = array_values($locationFields);
	        $out['data'] = array_values($locationsData);
	        return $out;
	    } else {
	        return null;
	    }
	}
	
	/**
	 * Return the form fields mapped to the table fields and ordered by position
	 *
	 * @param array $tableFields
	 *        	The table fields
	 * @return array The form fields ordered
	 */
	public function getFormFieldsOrdered(array $tableFields) {
	    $fieldsOrdered = array();
	    foreach ($tableFields as $tableField) {
	        // Get the form field corresponding to the table field
	        $formField = $this->getTableToFormMapping($tableField, true);
	        if ($formField !== null && $formField->getMetadata()->getIsResult()) {
	            $fieldsOrdered[] = $formField;
	        }
	    }
	    return array_values($fieldsOrdered);
	}
}