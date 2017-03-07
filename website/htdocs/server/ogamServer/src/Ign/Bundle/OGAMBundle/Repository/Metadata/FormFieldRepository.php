<?php
namespace Ign\Bundle\OGAMBundle\Repository\Metadata;

use Doctrine\ORM\Query\ResultSetMappingBuilder;
use Ign\Bundle\OGAMBundle\Entity\Metadata\Unit;
use Doctrine\Common\Collections\Criteria;
use Ign\Bundle\OGAMBundle\Entity\Metadata\FormField;

/**
 * FormFieldRepository
 *
 * This class was generated by the Doctrine ORM. Add your own custom
 * repository methods below.
 */
class FormFieldRepository extends \Doctrine\ORM\EntityRepository {

	/**
	 * Get the description of a form field.
	 *
	 * @param String $format
	 *        	The logical name of the form
	 * @param String $data
	 *        	The logical name of the field
	 * @param String $locale
	 *        	the locale
	 * @return Application_Object_Metadata_FormField
	 */
	public function getFormField($format, $data, $locale) {
		$rsm = new ResultSetMappingBuilder($this->_em);
		$rsm->addRootEntityFromClassMetadata($this->_entityName, 'ff');
		
		$sql = " SELECT form_field.*";
		$sql .= " FROM form_field ";
		$sql .= " LEFT JOIN data using (data) ";
		$sql .= " LEFT JOIN unit using (unit) ";
		$sql .= " LEFT JOIN translation t ON (lang = ? AND table_format = 'DATA' AND row_pk = data.data) ";
		$sql .= " WHERE format = ? ";
		$sql .= " AND   data = ?";
		
		$query = $this->_em->createNativeQuery($sql, $rsm);
		$query->setParameters(array(
			$locale,
			$format,
			$data
		));
		
		$field = $query->getSingleResult();
		$inputType = $field->getInputType();
		
		// Get the mandatory codes to display the field (RADIO)
		if ($inputType === 'RADIO') {
			$unit = $field->getData()->getUnit();
			$unit->setModes($this->_em->getRepository(Unit::class)
				->getModes($unit, $locale));
		}
		
		// Get the default value(s) code(s) (TREE and TAXREF)
		if (($inputType === 'TREE' || $inputType === 'TAXREF') && $field->getDefaultValue() !== null) {
			$unit = $field->getData()->getUnit();
			$unit->setModes($this->_em->getRepository(Unit::class)
				->getModesFilteredByCode($unit, $field->getDefaultValue(), $locale));
		}
		
		return $field;
	}

	/**
	 * Get the fields for a given form.
	 *
	 * @param String $dataset
	 *        	the name of the dataset
	 * @param String $formFormat
	 *        	the name of the form format
	 * @param String $schema
	 *        	the name of the database schema
	 * @param String $locale
	 *        	the locale
	 * @param String $query
	 *        	the filter text entered by the user (optional)
	 * @param Integer $start
	 *        	the number of the first row to return (optional)
	 * @param Integer $limit
	 *        	the max number of row to return (optional)
	 * @param String $fieldsType
	 *        	if 'criteria' we're looking for a criteria, if 'result' we're looking for a result.
	 * @return Array[Application_Object_Metadata_FormField]
	 */
	public function getFormFields($dataset, $formFormat, $schema, $locale, $query = null, $start = null, $limit = null, $fieldsType = null) {
		$rsm = new ResultSetMappingBuilder($this->_em);
		$rsm->addRootEntityFromClassMetadata(FormField::class, 'ff');
		
		$param = array();
		
		// Select the list of available fields for the table (excepted the FK)
		$sql = " SELECT DISTINCT form_field.*";
		$sql .= " FROM form_field ";
		$sql .= " LEFT JOIN data using (data) ";
		$sql .= " LEFT JOIN translation t ON (lang = ? AND table_format = 'DATA' AND row_pk = data.data) ";
		$param[] = $locale;
		
		// Check the field format
		$sql .= " WHERE format = ?";
		$param[] = $formFormat;
		if ($query != null) {
			$sql .= " AND unaccent(COALESCE(t.label, data.label)) ilike unaccent(?)";
			$param[] = '%' . $query . '%';
		}
		
		// Check the field type (result or criteria)
		switch ($fieldsType) {
			case 'criteria':
				$sql .= " AND is_criteria = '1'";
				break;
			case 'result':
				$sql .= " AND is_result = '1'";
				break;
			case null:
				break;
			default:
				throw new \InvalidArgumentException('Wrong field type. The valid field types are : "criteria" or "result".');
		}
		
		// If a dataset has been selected, filter the available options
		if (!empty($dataset)) {
			$sql .= " AND (data IN ( ";
			$sql .= " SELECT data ";
			$sql .= " FROM dataset_fields ";
			$sql .= " LEFT JOIN field_mapping on (dataset_fields.format = field_mapping.dst_format AND dataset_fields.data = field_mapping.dst_data AND mapping_type='FORM') ";
			$sql .= " WHERE dataset_id = ? ";
			$sql .= " AND schema_code = ? ";
			$sql .= " AND src_format = ? ";
			$sql .= " ) )";
			$param[] = $dataset;
			$param[] = $schema;
			$param[] = $formFormat;
		}
		
		$sql .= " ORDER BY form_field.position";
		
		if ($start !== null && $limit !== null) {
			$sql .= " LIMIT ? OFFSET ? ";
			$param[] = $limit;
			$param[] = $start;
		}
		
		$query = $this->_em->createNativeQuery($sql, $rsm);
		$query->setParameters($param);
		
		$formFields = $query->getResult();
		
		foreach ($formFields as $field) {
			// Get the mandatory codes to display the field (RADIO)
			if ($field->getInputType() === 'RADIO') {
				$unit = $field->getData()->getUnit();
				$unit->setModes($this->_em->getRepository(Unit::class)
					->getModes($unit, $locale));
			}
		}
		
		return $formFields;
	}

	/**
	 * Get the fields for a given form.
	 *
	 * @param String $dataset
	 *        	the name of the dataset
	 * @param String $formFormat
	 *        	the name of the form format
	 * @param String $schema
	 *        	the name of the database schema
	 * @param String $locale
	 *        	the locale
	 * @param String $query
	 *        	the filter text entered by the user (optional)
	 * @param String $fieldsType
	 *        	if 'criteria' we're looking for a criteria, if 'result' we're looking for a result.
	 * @return Array[Application_Object_Metadata_FormField]
	 */
	public function getFormFieldsCount($dataset, $formFormat, $schema, $locale, $query = null, $fieldsType = null) {
		$rsm = new ResultSetMappingBuilder($this->_em);
		$rsm->addScalarResult('count', 'count', 'integer');
		
		$param = array();
		
		// Select the list of available fields for the table (excepted the FK)
		$sql = " SELECT count(*) as count";
		$sql .= " FROM form_field ";
		$sql .= " LEFT JOIN data using (data) ";
		$sql .= " LEFT JOIN translation t ON (lang = ? AND table_format = 'DATA' AND row_pk = data.data) ";
		$param[] = $locale;
		
		// Check the field format
		$sql .= " WHERE format = ?";
		$param[] = $formFormat;
		if ($query != null) {
			$sql .= " AND unaccent(COALESCE(t.label, data.label)) ilike unaccent(?)";
			$param[] = '%' . $query . '%';
		}
		
		// Check the field type (result or criteria)
		switch ($fieldsType) {
			case 'criteria':
				$sql .= " AND is_criteria = '1'";
				break;
			case 'result':
				$sql .= " AND is_result = '1'";
				break;
			case null:
				break;
			default:
				throw new \InvalidArgumentException('Wrong field type. The valid field types are : "criteria" or "result".');
		}
		
		// If a dataset has been selected, filter the available options
		if (!empty($dataset)) {
			$sql .= " AND (data IN ( ";
			$sql .= " SELECT data ";
			$sql .= " FROM dataset_fields ";
			$sql .= " LEFT JOIN field_mapping on (dataset_fields.format = field_mapping.dst_format AND dataset_fields.data = field_mapping.dst_data AND mapping_type='FORM') ";
			$sql .= " WHERE dataset_id = ? ";
			$sql .= " AND schema_code = ? ";
			$sql .= " AND src_format = ? ";
			$sql .= " ) )";
			$param[] = $dataset;
			$param[] = $schema;
			$param[] = $formFormat;
		}
		
		$query = $this->_em->createNativeQuery($sql, $rsm);
		$query->setParameters($param);
		
		return $query->getSingleScalarResult();
	}
}
