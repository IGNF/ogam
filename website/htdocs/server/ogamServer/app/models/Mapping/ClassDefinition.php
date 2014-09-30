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
 * This is the model for managing SLD classes.
 * @package models
 */
class Application_Model_Mapping_ClassDefinition extends Zend_Db_Table_Abstract {

	var $logger;

	/**
	 * Initialisation
	 */
	public function init() {

		// Initialise the logger
		$this->logger = Zend_Registry::get("logger");
	}

	/**
	 * Get the definition of a data classes for a vector layer.
	 *
	 * @param String $data the logical name of the data
	 * @return Array[ClassItem] The classes
	 */
	public function getClassDefinition($data) {
		$db = $this->getAdapter();

		
		$req = " SELECT *
			   	 FROM class_definition
			   	 WHERE data = ?
			   	 ORDER BY max_value";

		Zend_Registry::get("logger")->info('getClassDefinition : '.$req);

		$select = $db->prepare($req);
		$select->execute(array($data));

		$result = array();
		foreach ($select->fetchAll() as $row) {
			$class = new Application_Object_Mapping_ClassItem();
			$class->minValue = $row['min_value'];
			$class->maxValue = $row['max_value'];
			$class->color = $row['color'];
			$class->label = $row['label'];
			$result[] = $class;
		}

		return $result;
	}

	/**
	 * Get the definition of a data classes for a raster layer.
	 * 
	 * Warning : There is no min_value, mapserv use the previous value. 
	 *
	 * @param String $data the logical name of the data
	 * @return Array[ClassItem] The classes
	 */
	public function getRasterClassDefinition($data) {
		$db = $this->getAdapter();

		
		$req = " SELECT *
			   	 FROM raster_class_definition
			   	 WHERE data = ?
			   	 ORDER BY value";

		Zend_Registry::get("logger")->info('getRasterClassDefinition : '.$req);

		$select = $db->prepare($req);
		$select->execute(array($data));

		$result = array();
		foreach ($select->fetchAll() as $row) {
			$class = new Application_Object_Mapping_ClassItem();
			$class->maxValue = $row['value'];
			$class->color = $row['color'];
			$class->label = $row['label'];
			$result[] = $class;
		}

		return $result;
	}
	
	

}
