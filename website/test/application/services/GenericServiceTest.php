<?php
require_once TEST_PATH . 'ControllerTestCase.php';

/**
 *
 * @package services
 */
class GenericServiceTest extends ControllerTestCase {

	protected $genericService;

	/**
	 * Set up the test case.
	 *
	 * @see sources/library/Zend/Test/PHPUnit/Zend_Test_PHPUnit_ControllerTestCase::setUp()
	 */
	public function setUp() {
		parent::setUp();

		// On instancie le service
		$this->genericService = new Application_Service_GenericService();
	}

	/**
	 * Test de la fonction fillValueLabel(), cas vides.
	 */
	public function testFillValueLabelEmpty() {

		// On crée un objet avec un code à traduire en libellé
		$field = new Application_Object_Metadata_TableField();
		$field->unit = 'SPECIES_CODE';
		$field->type = "CODE";
		$field->subtype = "MODE";
		$field->value = '';

		// On vérifie que le libellé est vide
		$field->valueLabel = $this->genericService->getValueLabel($field, $field->value);
		$this->assertEquals('', $field->getValueLabel());

		// On vérifie que le libellé est vide
		$field->value = null;
		$field->valueLabel = $this->genericService->getValueLabel($field, $field->value);
		$this->assertEquals('', $field->getValueLabel());
	}

	/**
	 * Test de la fonction fillValueLabel().
	 */
	public function testFillValueLabelMode() {

		// On crée un objet avec un code à traduire en libellé
		$field = new Application_Object_Metadata_TableField();
		$field->unit = 'SPECIES_CODE';
		$field->type = "CODE";
		$field->subtype = "MODE";
		$field->value = '031.001.041';

		// On récupère le libellé d'un code et on le vérifie
		$field->valueLabel = $this->genericService->getValueLabel($field, $field->value);
		$this->assertEquals('Salix caprea', $field->getValueLabel());
	}

	/**
	 * Test de la fonction fillValueLabel().
	 */
	public function testFillValueLabelDynamode() {

		// On crée un objet avec un code à traduire en libellé
		$field = new Application_Object_Metadata_TableField();
		$field->unit = 'DEPARTEMENT';
		$field->type = "CODE";
		$field->subtype = "DYNAMIC";
		$field->value = '45';

		// On récupère le libellé d'un code et on le vérifie
		$field->valueLabel = $this->genericService->getValueLabel($field, $field->value);
		$this->assertEquals('LOIRET', $field->getValueLabel());
	}

	/**
	 * Test de la fonction fillValueLabel().
	 */
	public function testFillValueLabelArrayDynamode() {

		// On crée un objet avec un code à traduire en libellé
		$field = new Application_Object_Metadata_TableField();
		$field->unit = 'COMMUNES';
		$field->type = "ARRAY";
		$field->subtype = "DYNAMIC";
		$field->value = '45050';

		// On récupère le libellé d'un code et on le vérifie
		$field->valueLabel = $this->genericService->getValueLabel($field, $field->value);
		$this->assertEquals('BOYNES (45050)', $field->getValueLabel());

		// Cas d'un ARRAY
		$field->value = array(
			'45050',
			'45051'
		);

		// On récupère le libellé d'un code et on le vérifie
		$field->valueLabel = $this->genericService->getValueLabel($field, $field->value);
		$communes = $field->getValueLabel();
		$this->assertEquals('BOYNES (45050)', $communes[0]);
		$this->assertEquals('BRAY-EN-VAL (45051)', $communes[1]);
	}

	/**
	 * Test de la fonction fillValueLabel().
	 */
	public function testFillValueLabelTree() {

		// On crée un objet avec un code à traduire en libellé
		$field = new Application_Object_Metadata_TableField();
		$field->unit = 'CORINE_BIOTOPE';
		$field->type = "CODE";
		$field->subtype = "TREE";
		$field->value = '41';

		// On récupère le libellé d'un code et on le vérifie
		$field->valueLabel = $this->genericService->getValueLabel($field, $field->value);
		$this->assertEquals('Forêts caducifoliées', $field->getValueLabel());
	}

	/**
	 * Test de la fonction fillValueLabel().
	 */
	public function testFillValueLabelArrayTree() {

		// On crée un objet avec un code à traduire en libellé
		$field = new Application_Object_Metadata_TableField();
		$field->unit = 'CORINE_BIOTOPE';
		$field->type = "ARRAY";
		$field->subtype = "TREE";
		$field->value = '38.11';

		// On récupère le libellé d'un code et on le vérifie
		$field->valueLabel = $this->genericService->getValueLabel($field, $field->value);
		$this->assertEquals('Pâturages continus', $field->getValueLabel());

		// Cas d'un ARRAY
		$field->value = array(
			'38.11',
			'38.12'
		);

		// On récupère le libellé d'un code et on le vérifie
		$field->valueLabel = $this->genericService->getValueLabel($field, $field->value);
		$biotopes = $field->getValueLabel();
		$this->assertEquals('Pâturages continus', $biotopes[0]);
		$this->assertEquals('Pâturages interrompus par des fossés', $biotopes[1]);
	}

	/**
	 * Test de la fonction fillValueLabel().
	 */
	public function testFillValueLabelTaxref() {

		// On crée un objet avec un code à traduire en libellé
		$field = new Application_Object_Metadata_TableField();
		$field->unit = 'ID_TAXON';
		$field->type = "CODE";
		$field->subtype = "TAXREF";
		$field->value = '409299';

		// On récupère le libellé d'un code et on le vérifie
		$field->valueLabel = $this->genericService->getValueLabel($field, $field->value);
		$this->assertEquals('Acalles nudiusculus', $field->getValueLabel());
	}

	/**
	 * Test de la fonction fillValueLabel().
	 */
	public function testFillValueLabelArrayTaxref() {

		// On crée un objet avec un code à traduire en libellé
		$field = new Application_Object_Metadata_TableField();
		$field->unit = 'ID_TAXON';
		$field->type = "ARRAY";
		$field->subtype = "TAXREF";
		$field->value = '409299';

		// On récupère le libellé d'un code et on le vérifie
		$field->valueLabel = $this->genericService->getValueLabel($field, $field->value);
		$this->assertEquals('Acalles nudiusculus', $field->getValueLabel());

		// Cas d'un ARRAY
		$field->value = array(
			'409299',
			'196303'
		);

		// On récupère le libellé d'un code et on le vérifie
		$field->valueLabel = $this->genericService->getValueLabel($field, $field->value);
		$taxons = $field->getValueLabel();
		$this->assertEquals('Acalles nudiusculus', $taxons[0]);
		$this->assertEquals('Pirata', $taxons[1]);
	}

	/**
	 * Test de la fonction removeAccents().
	 */
	public function testRemoveAccents() {
		$label = $this->genericService->removeAccents('Tèst d\'élimînàtiôn des âçcènts');

		$this->assertEquals('Test d\'elimination des accents', $label);
	}

	/**
	 * Test de la fonction buildDataObject().
	 */
	public function testBuildDataObject() {

		// On récupère un descripteur d'objet pour le format "Location"
		// On ne précise pas de dataset, il n'y a donc pas de filtrage sur les champs disponibles
		$data = $this->genericService->buildDataObject('RAW_DATA', 'LOCATION_DATA');

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
	}

	/**
	 * Test de la fonction buildDataObject() dans le cas où on précise un dataset.
	 */
	public function testBuildDataObjectWithDataset() {

		// On récupère un descripteur d'objet pour le format "Location"
		// On ne précise pas de dataset
		$data = $this->genericService->buildDataObject('RAW_DATA', 'LOCATION_DATA', 'SPECIES');

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
		$data = $this->genericService->buildDataObject('RAW_DATA', 'SPECIES_DATA', 'SPECIES');

		// On récupère la liste des formats de tables dans la hiérarchie de cet objet.
		$hierarchie = $this->genericService->getAllFormats('RAW_DATA', $data);

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

	/**
	 * Test de la fonction generateSQLPrimaryKey().
	 */
	public function testGenerateSQLPrimaryKey() {

		// On récupère un descripteur d'objet pour le format "SPECIES"
		$data = $this->genericService->buildDataObject('RAW_DATA', 'SPECIES_DATA', 'SPECIES');

		// On récupère la liste des formats de tables dans la hiérarchie de cet objet.
		$pk = $this->genericService->generateSQLPrimaryKey('RAW_DATA', $data);

		$this->assertNotNull($pk);
		$this->assertEquals('SPECIES_DATA.PROVIDER_ID,SPECIES_DATA.PLOT_CODE,SPECIES_DATA.CYCLE,SPECIES_DATA.SPECIES_CODE', $pk);
	}
}
