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

	/**
	 * Test de la fonction buildDataObject().
	 */
	public function testBuildDataObject() {

		// On récupère un descripteur d'objet pour le format "Location"
		// On ne précise pas de dataset, il n'y a donc pas de filtrage sur les champs disponibles
		$data = $this->queryService->buildDataObject('RAW_DATA', 'LOCATION_DATA');

		// $this->logger->info('data : ' . print_r($data, true));

		// Le descripteur n'est pas null
		$this->assertNotNull($data);

		// Il correspond à un format LOCATION
		$this->assertNotNull($data->tableFormat);
		$this->assertEquals('LOCATION_DATA', $data->tableFormat->format);
		$this->assertEquals('LOCATION', $data->tableFormat->tableName);

		// Il contient 2 champs de clé primaire
		$this->assertNotNull($data->getInfoFields());
		$this->assertTrue(is_array($data->getInfoFields()));
		$this->assertEquals(2, count($data->getInfoFields()));

		$providerField = $data->getInfoField('LOCATION_DATA__PROVIDER_ID');
		$plotField = $data->getInfoField('LOCATION_DATA__PLOT_CODE');
		$this->assertEquals('PROVIDER_ID', $providerField->data);
		$this->assertEquals('PLOT_CODE', $plotField->data);

		// Et des champs de données
		$this->assertNotNull($data->getEditableFields());
		$this->assertTrue(is_array($data->getEditableFields()));
		$this->assertEquals(8, count($data->getEditableFields()));

		$latitudeField = $data->getEditableField('LOCATION_DATA__LATITUDE');
		$this->assertEquals('LATITUDE', $latitudeField->data);

		// Les formats utilisés
		$this->assertNotNull($data->getFormats());
		$this->assertTrue(is_array($data->getFormats()));
		$this->assertTrue(in_array('LOCATION_DATA', $data->getFormats()));

		// Le format LOCALISATION possède une géométrie
		$this->assertTrue($data->hasGeometry());

		// On renseigne des valeurs pour les éléments de la clé
		$providerField->value = 'TestProvider';
		$plotField->value = '1234';

		// On vérifie l'identificant unique de la donnée
		$this->assertEquals('SCHEMA/RAW_DATA/FORMAT/LOCATION_DATA/PROVIDER_ID/TestProvider/PLOT_CODE/1234', $data->getId());
	}

	/**
	 * Test de la fonction buildDataObject() dans le cas où on précise un dataset.
	 */
	public function testBuildDataObjectWithDataset() {

		// On récupère un descripteur d'objet pour le format "Location"
		// On ne précise pas de dataset
		$data = $this->queryService->buildDataObject('RAW_DATA', 'LOCATION_DATA', 'SPECIES');

		// $this->logger->info('data : ' . print_r($data, true));

		// Le descripteur n'est pas null
		$this->assertNotNull($data);

		// Il correspond à un format LOCATION
		$this->assertNotNull($data->tableFormat);
		$this->assertEquals('LOCATION_DATA', $data->tableFormat->format);
		$this->assertEquals('LOCATION', $data->tableFormat->tableName);

		// Et des champs de données
		$this->assertNotNull($data->getEditableFields());
		$this->assertTrue(is_array($data->getEditableFields()));
		$this->assertEquals(8, count($data->getEditableFields()));
	}

	/**
	 * Test de la fonction getAllFormats().
	 */
	public function testGetAllFormats() {

		// On récupère un descripteur d'objet pour le format "SPECIES"
		$data = $this->queryService->buildDataObject('RAW_DATA', 'SPECIES_DATA', 'SPECIES');

		// On récupère la liste des formats de tables dans la hiérarchie de cet objet.
		$hierarchie = $this->queryService->getAllFormats('RAW_DATA', $data);

		// $this->logger->info('hierarchie : ' . print_r($hierarchie, true));

		$this->assertNotNull($hierarchie);
		$this->assertTrue(is_array($hierarchie));
		$this->assertEquals(3, count($hierarchie));

		// Les 3 tables dans l'ordre doivent être LOCATION, PLOT, SPECIES
		$keys = array_keys($hierarchie);
		$this->assertEquals('LOCATION_DATA', $keys[0]);
		$this->assertEquals('PLOT_DATA', $keys[1]);
		$this->assertEquals('SPECIES_DATA', $keys[2]);
	}
}
