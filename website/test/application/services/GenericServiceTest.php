<?php
require_once TEST_PATH . 'ControllerTestCase.php';

/**
 *
 * @package services
 */
class GenericServiceTest extends ControllerTestCase {

	protected $queryService;

	/**
	 * Set up the test case.
	 *
	 * @see sources/library/Zend/Test/PHPUnit/Zend_Test_PHPUnit_ControllerTestCase::setUp()
	 */
	public function setUp() {
		parent::setUp();

		// On instancie le service
		$this->queryService = new Application_Service_GenericService();
	}

	/**
	 * Test de la fonction getValueLabel(), cas vides.
	 */
	public function testGetValueLabelEmpty() {

		// On crée un objet avec un code à traduire en libellé
		$field = new Application_Object_Metadata_TableField();
		$field->unit = 'SPECIES_CODE';
		$field->type = "CODE";
		$field->subtype = "MODE";

		// On récupère le libellé d'un code et on le vérifie
		$label = $this->queryService->getValueLabel($field, '');
		$this->assertEquals('', $label);

		// On récupère le libellé d'un code et on le vérifie
		$label = $this->queryService->getValueLabel($field, null);
		$this->assertEquals('', $label);
	}

	/**
	 * Test de la fonction getValueLabel().
	 */
	public function testGetValueLabelMode() {

		// On crée un objet avec un code à traduire en libellé
		$field = new Application_Object_Metadata_TableField();
		$field->unit = 'SPECIES_CODE';
		$field->type = "CODE";
		$field->subtype = "MODE";

		// On récupère le libellé d'un code et on le vérifie
		$label = $this->queryService->getValueLabel($field, '031.001.041');
		$this->assertEquals('Salix caprea', $label);
	}

	/**
	 * Test de la fonction getValueLabel().
	 */
	public function testGetValueLabelDynamode() {

		// On crée un objet avec un code à traduire en libellé
		$field = new Application_Object_Metadata_TableField();
		$field->unit = 'DEPARTEMENT';
		$field->type = "CODE";
		$field->subtype = "DYNAMIC";

		// On récupère le libellé d'un code et on le vérifie
		$label = $this->queryService->getValueLabel($field, '45');
		$this->assertEquals('LOIRET', $label);
	}

	/**
	 * Test de la fonction getValueLabel().
	 */
	public function testGetValueLabelTree() {

		// On crée un objet avec un code à traduire en libellé
		$field = new Application_Object_Metadata_TableField();
		$field->unit = 'CORINE_BIOTOPE';
		$field->type = "CODE";
		$field->subtype = "TREE";

		// On récupère le libellé d'un code et on le vérifie
		$label = $this->queryService->getValueLabel($field, '41');
		$this->assertEquals('Forêts caducifoliées', $label);
	}

	/**
	 * Test de la fonction getValueLabel().
	 */
	public function testGetValueLabelTaxref() {

		// On crée un objet avec un code à traduire en libellé
		$field = new Application_Object_Metadata_TableField();
		$field->unit = 'ID_TAXON';
		$field->type = "CODE";
		$field->subtype = "TAXREF";

		// On récupère le libellé d'un code et on le vérifie
		$label = $this->queryService->getValueLabel($field, '409299');
		$this->assertEquals('Acalles nudiusculus', $label);
	}

	/**
	 * Test de la fonction getValueLabel().
	 */
	public function testGetValueLabelArrayDynamode() {

		// On crée un objet avec un code à traduire en libellé
		$field = new Application_Object_Metadata_TableField();
		$field->unit = 'COMMUNES';
		$field->type = "ARRAY";
		$field->subtype = "DYNAMIC";

		// On récupère le libellé d'un code et on le vérifie
		$label = $this->queryService->getValueLabel($field, '45050');
		$this->assertEquals('BOYNES (45050)', $label);
	}

	/**
	 * Test de la fonction getValueLabel().
	 */
	public function testGetValueLabelArrayTree() {

		// On crée un objet avec un code à traduire en libellé
		$field = new Application_Object_Metadata_TableField();
		$field->unit = 'CORINE_BIOTOPE';
		$field->type = "ARRAY";
		$field->subtype = "TREE";

		// On récupère le libellé d'un code et on le vérifie
		$label = $this->queryService->getValueLabel($field, '38.11');
		$this->assertEquals('Pâturages continus', $label);
	}

	/**
	 * Test de la fonction removeAccents().
	 */
	public function testRemoveAccents() {

		$label = $this->queryService->removeAccents('Tèst d\'élimînàtiôn des âçcènts');

		$this->assertEquals('Test d\'elimination des accents', $label);

	}
}
