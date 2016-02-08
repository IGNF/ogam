<?php
require_once TEST_PATH . 'ControllerTestCase.php';

/**
 *
 * @package services
 */
class GenericServiceTest extends ControllerTestCase {

	/**
	 * Test de la fonction getValueLabel().
	 */
	public function testGetValueLabelMode() {
		
		// On charge le modèle
		$queryService = new Application_Service_GenericService();
		
		// On crée un objet avec un code à traduire en libellé
		$field = new Application_Object_Metadata_TableField();
		$field->unit = 'SPECIES_CODE';
		$field->type = "CODE";
		$field->subtype = "MODE";
		
		// On récupère le libellé d'un code et on le vérifie
		$label = $queryService->getValueLabel($field, '031.001.041');
		$this->assertEquals('Salix caprea', $label);
	}

	/**
	 * Test de la fonction getValueLabel().
	 */
	public function testGetValueLabelDynamode() {
		
		// On charge le modèle
		$queryService = new Application_Service_GenericService();
		
		// On crée un objet avec un code à traduire en libellé
		$field = new Application_Object_Metadata_TableField();
		$field->unit = 'DEPARTEMENT';
		$field->type = "CODE";
		$field->subtype = "DYNAMIC";
		
		// On récupère le libellé d'un code et on le vérifie
		$label = $queryService->getValueLabel($field, '45');
		$this->assertEquals('LOIRET', $label);
	}

	/**
	 * Test de la fonction getValueLabel().
	 */
	public function testGetValueLabelTree() {
		
		// On charge le modèle
		$queryService = new Application_Service_GenericService();
		
		// On crée un objet avec un code à traduire en libellé
		$field = new Application_Object_Metadata_TableField();
		$field->unit = 'CORINE_BIOTOPE';
		$field->type = "CODE";
		$field->subtype = "TREE";
		
		// On récupère le libellé d'un code et on le vérifie
		$label = $queryService->getValueLabel($field, '41');
		$this->assertEquals('Forêts caducifoliées', $label);
	}

	/**
	 * Test de la fonction getValueLabel().
	 */
	public function testGetValueLabelTaxref() {
		
		// On charge le modèle
		$queryService = new Application_Service_GenericService();
		
		// On crée un objet avec un code à traduire en libellé
		$field = new Application_Object_Metadata_TableField();
		$field->unit = 'ID_TAXON';
		$field->type = "CODE";
		$field->subtype = "TAXREF";
		
		// On récupère le libellé d'un code et on le vérifie
		$label = $queryService->getValueLabel($field, '409299');
		$this->assertEquals('Acalles nudiusculus', $label);
	}
}
