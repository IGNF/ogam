<?php
require_once TEST_PATH . 'ControllerTestCase.php';

/**
 * Test the Generic Service.
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

		// On récupère la PK correspondant à ce format.
		$pk = $this->genericService->generateSQLPrimaryKey('RAW_DATA', $data);

		$this->assertNotNull($pk);
		$this->assertEquals('SPECIES_DATA.PROVIDER_ID,SPECIES_DATA.PLOT_CODE,SPECIES_DATA.CYCLE,SPECIES_DATA.SPECIES_CODE', $pk);
	}

	/**
	 * Test de la fonction generateSQLSelectRequest().
	 */
	public function testGenerateSQLSelectRequest() {

		// On récupère un descripteur d'objet pour le format "SPECIES"
		$data = $this->genericService->buildDataObject('RAW_DATA', 'SPECIES_DATA', 'SPECIES');

		// On récupère la liste des formats de tables dans la hiérarchie de cet objet.
		$select = $this->genericService->generateSQLSelectRequest('RAW_DATA', $data);

		$this->assertNotNull($select);
		$this->assertTrue(strpos($select, 'SELECT ') !== false);
		$this->assertTrue(strpos($select, 'SPECIES_DATA.SUBMISSION_ID as SPECIES_DATA__SUBMISSION_ID') !== false);
		$this->assertTrue(strpos($select, 'SPECIES_DATA.ID_TAXON as SPECIES_DATA__ID_TAXON') !== false);
		$this->assertTrue(strpos($select, 'SPECIES_DATA.BASAL_AREA as SPECIES_DATA__BASAL_AREA') !== false);
		$this->assertTrue(strpos($select, 'SPECIES_DATA.COMMENT as SPECIES_DATA__COMMENT') !== false);
		$this->assertTrue(strpos($select, 'SPECIES_DATA.LINE_NUMBER as SPECIES_DATA__LINE_NUMBER') !== false);
		$this->assertTrue(strpos($select, 'st_astext(st_centroid(st_transform(LOCATION_DATA.THE_GEOM,3035))) as location_centroid') !== false);

		// $this->assertEquals("SELECT DISTINCT SPECIES_DATA.SUBMISSION_ID as SPECIES_DATA__SUBMISSION_ID, SPECIES_DATA.ID_TAXON as SPECIES_DATA__ID_TAXON, SPECIES_DATA.BASAL_AREA as SPECIES_DATA__BASAL_AREA, SPECIES_DATA.COMMENT as SPECIES_DATA__COMMENT, SPECIES_DATA.LINE_NUMBER as SPECIES_DATA__LINE_NUMBER, 'SCHEMA/RAW_DATA/FORMAT/SPECIES_DATA' || '/' || 'PROVIDER_ID/' ||SPECIES_DATA.PROVIDER_ID || '/' || 'PLOT_CODE/' ||SPECIES_DATA.PLOT_CODE || '/' || 'CYCLE/' ||SPECIES_DATA.CYCLE || '/' || 'SPECIES_CODE/' ||SPECIES_DATA.SPECIES_CODE as id, st_astext(st_centroid(st_transform(LOCATION_DATA.THE_GEOM,3035))) as location_centroid", $select);
	}

	/**
	 * Test de la fonction generateSQLFROMRequest().
	 */
	public function testGenerateSQLFromRequest() {

		// On récupère un descripteur d'objet pour le format "SPECIES"
		$data = $this->genericService->buildDataObject('RAW_DATA', 'SPECIES_DATA', 'SPECIES');

		// On récupère la liste des formats de tables dans la hiérarchie de cet objet.
		$from = $this->genericService->generateSQLFromRequest('RAW_DATA', $data);

		$this->assertNotNull($from);
		$this->assertTrue(strpos($from, 'FROM LOCATION LOCATION_DATA ') !== false);
		$this->assertTrue(strpos($from, 'JOIN PLOT_DATA PLOT_DATA on (PLOT_DATA.PROVIDER_ID = LOCATION_DATA.PROVIDER_ID AND PLOT_DATA.PLOT_CODE = LOCATION_DATA.PLOT_CODE)') !== false);
		$this->assertTrue(strpos($from, 'JOIN SPECIES_DATA SPECIES_DATA on (SPECIES_DATA.PROVIDER_ID = PLOT_DATA.PROVIDER_ID AND SPECIES_DATA.PLOT_CODE = PLOT_DATA.PLOT_CODE AND SPECIES_DATA.CYCLE = PLOT_DATA.CYCLE)') !== false);
		// $this->assertEquals(' FROM LOCATION LOCATION_DATA JOIN PLOT_DATA PLOT_DATA on (PLOT_DATA.PROVIDER_ID = LOCATION_DATA.PROVIDER_ID AND PLOT_DATA.PLOT_CODE = LOCATION_DATA.PLOT_CODE) JOIN SPECIES_DATA SPECIES_DATA on (SPECIES_DATA.PROVIDER_ID = PLOT_DATA.PROVIDER_ID AND SPECIES_DATA.PLOT_CODE = PLOT_DATA.PLOT_CODE AND SPECIES_DATA.CYCLE = PLOT_DATA.CYCLE)', $from);
	}

	/**
	 * Test de la fonction generateSQLWhereRequest().
	 */
	public function testGenerateSQLWhereEmptyRequest() {

		// On récupère un descripteur d'objet pour le format "SPECIES"
		$data = $this->genericService->buildDataObject('RAW_DATA', 'SPECIES_DATA', 'SPECIES');

		// On récupère le where correspondant
		$where = $this->genericService->generateSQLWhereRequest('RAW_DATA', $data);

		// On vérifie le résultat
		$this->assertNotNull($where);
		$this->assertEquals('WHERE (1 = 1)', trim($where));
	}

	/**
	 * Test de la fonction generateSQLWhereRequest().
	 */
	public function testGenerateSQLWhereCodeRequest() {

		// On récupère un descripteur d'objet pour le format "SPECIES"
		$data = $this->genericService->buildDataObject('RAW_DATA', 'SPECIES_DATA', 'SPECIES');

		//
		// Ajout d'un critère sur un code simple
		//
		$field = new Application_Object_Metadata_TableField();
		$field->data = "DEPARTEMENT";
		$field->columnName = "DEPARTEMENT";
		$field->format = "LOCATION_DATA";
		$field->unit = "DEPARTEMENT";
		$field->type = "CODE";
		$field->subtype = "DYNAMIC";
		$field->value = '45';
		$data->addInfoField($field);

		// On récupère le where correspondant
		$where = $this->genericService->generateSQLWhereRequest('RAW_DATA', $data);

		// On vérifie le résultat
		$this->assertNotNull($where);
		$this->assertEquals("WHERE (1 = 1) AND LOCATION_DATA.DEPARTEMENT = '45'", trim($where));

		//
		// Ajout d'un critère sur une liste de codes
		//
		$field->value = array(
			'45',
			'46'
		);

		// On récupère le where correspondant
		$where = $this->genericService->generateSQLWhereRequest('RAW_DATA', $data);

		// On vérifie le résultat
		$this->assertNotNull($where);
		$this->assertEquals("WHERE (1 = 1) AND LOCATION_DATA.DEPARTEMENT IN ('45', '46')", trim($where));
	}

	/**
	 * Test de la fonction generateSQLWhereRequest().
	 */
	public function testGenerateSQLWhereCodeTreeRequest() {

		// On récupère un descripteur d'objet pour le format "SPECIES"
		$data = $this->genericService->buildDataObject('RAW_DATA', 'SPECIES_DATA', 'SPECIES');

		//
		// Ajout d'un critère sur un code de type arborescent
		//
		$field = new Application_Object_Metadata_TableField();
		$field->data = "CORINE_BIOTOPE";
		$field->columnName = "CORINE_BIOTOPE";
		$field->format = "PLOT_DATA";
		$field->unit = "CORINE_BIOTOPE";
		$field->type = "CODE";
		$field->subtype = "TREE";
		$field->value = '13.1'; // 13.1 est le parent de 13.11 et 13.12
		$data->addInfoField($field);

		// On récupère le where correspondant
		$where = $this->genericService->generateSQLWhereRequest('RAW_DATA', $data);

		// On vérifie le résultat
		$this->assertNotNull($where);
		$this->assertEquals("WHERE (1 = 1) AND PLOT_DATA.CORINE_BIOTOPE IN ('13.1', '13.11', '13.12')", trim($where));
	}

	/**
	 * Test de la fonction generateSQLWhereRequest().
	 */
	public function testGenerateSQLWhereCodeTaxrefRequest() {

		// On récupère un descripteur d'objet pour le format "SPECIES"
		$data = $this->genericService->buildDataObject('RAW_DATA', 'SPECIES_DATA', 'SPECIES');

		//
		// Ajout d'un critère sur un code de type arborescent
		//
		$field = new Application_Object_Metadata_TableField();
		$field->data = "ID_TAXON";
		$field->columnName = "ID_TAXON";
		$field->format = "SPECIES_DATA";
		$field->unit = "ID_TAXON";
		$field->type = "CODE";
		$field->subtype = "TAXREF";
		$field->value = '201070'; // 201070 est le taxon parent de 220213, 220214 et 220215
		$data->addInfoField($field);

		// On récupère le where correspondant
		$where = $this->genericService->generateSQLWhereRequest('RAW_DATA', $data);

		// On vérifie le résultat
		$this->assertNotNull($where);
		$this->assertEquals("WHERE (1 = 1) AND SPECIES_DATA.ID_TAXON IN ('201070', '220213', '220214', '220215')", trim($where));
	}

	/**
	 * Test de la fonction generateSQLWhereRequest().
	 */
	public function testGenerateSQLWhereDateRequest() {

		// On récupère un descripteur d'objet pour le format "SPECIES"
		$data = $this->genericService->buildDataObject('RAW_DATA', 'SPECIES_DATA', 'SPECIES');

		//
		// Ajout d'un critère date simple
		// YYYY/MM/DD
		//
		$field = new Application_Object_Metadata_TableField();
		$field->data = "INV_DATE";
		$field->columnName = "INV_DATE";
		$field->format = "PLOT_DATA";
		$field->unit = "DATE";
		$field->type = "DATE";
		$field->subtype = null;
		$field->value = '2016/02/18';
		$data->addInfoField($field);

		// On récupère le where correspondant
		$where = $this->genericService->generateSQLWhereRequest('RAW_DATA', $data);

		// On vérifie le résultat
		$this->assertNotNull($where);
		$this->assertEquals("WHERE (1 = 1) AND (PLOT_DATA.INV_DATE = to_date('2016/02/18', 'YYYY/MM/DD'))", trim($where));

		//
		// Ajout plusieurs dates simples
		// YYYY/MM/DD
		//
		$field->value = array(
			'2016/02/18',
			'2016/02/19'
		);

		// On récupère le where correspondant
		$where = $this->genericService->generateSQLWhereRequest('RAW_DATA', $data);

		// On vérifie le résultat
		$this->assertNotNull($where);
		$this->assertEquals("WHERE (1 = 1) AND ((PLOT_DATA.INV_DATE = to_date('2016/02/18', 'YYYY/MM/DD')) OR (PLOT_DATA.INV_DATE = to_date('2016/02/19', 'YYYY/MM/DD')))", trim($where));

		//
		// Critère "Min"
		// >= YYYY/MM/DD
		//
		$field->value = '>= 2016/02/18';

		// On récupère le where correspondant
		$where = $this->genericService->generateSQLWhereRequest('RAW_DATA', $data);

		// On vérifie le résultat
		$this->assertNotNull($where);
		$this->assertEquals("WHERE (1 = 1) AND (PLOT_DATA.INV_DATE >= to_date('2016/02/18', 'YYYY/MM/DD'))", trim($where));

		//
		// Critère "Max"
		// >= YYYY/MM/DD
		//
		$field->value = '<= 2016/02/18';

		// On récupère le where correspondant
		$where = $this->genericService->generateSQLWhereRequest('RAW_DATA', $data);

		// On vérifie le résultat
		$this->assertNotNull($where);
		$this->assertEquals("WHERE (1 = 1) AND (PLOT_DATA.INV_DATE <= to_date('2016/02/18', 'YYYY/MM/DD'))", trim($where));

		//
		// Critère "Range"
		// YYYY/MM/DD - YYYY/MM/DD
		//
		$field->value = '2016/02/18 - 2016/02/19';

		// On récupère le where correspondant
		$where = $this->genericService->generateSQLWhereRequest('RAW_DATA', $data);

		// On vérifie le résultat
		$this->assertNotNull($where);
		$this->assertEquals("WHERE (1 = 1) AND (PLOT_DATA.INV_DATE >= to_date('2016/02/18', 'YYYY/MM/DD') AND PLOT_DATA.INV_DATE <= to_date('2016/02/19', 'YYYY/MM/DD'))", trim($where));
	}

	/**
	 * Test de la fonction generateSQLWhereRequest().
	 */
	public function testGenerateSQLWhereBooleanRequest() {

		// On récupère un descripteur d'objet pour le format "SPECIES"
		$data = $this->genericService->buildDataObject('RAW_DATA', 'SPECIES_DATA', 'SPECIES');

		//
		// Ajout d'un critère simple
		//
		$field = new Application_Object_Metadata_TableField();
		$field->data = "IS_FOREST_PLOT";
		$field->columnName = "IS_FOREST_PLOT";
		$field->format = "PLOT_DATA";
		$field->unit = "IS_FOREST_PLOT";
		$field->type = "BOOLEAN";
		$field->subtype = null;
		$field->value = '1';
		$data->addInfoField($field);

		// On récupère le where correspondant
		$where = $this->genericService->generateSQLWhereRequest('RAW_DATA', $data);

		// On vérifie le résultat
		$this->assertNotNull($where);
		$this->assertEquals("WHERE (1 = 1) AND PLOT_DATA.IS_FOREST_PLOT = '1'", trim($where));

		//
		// Sous forme de boolean
		//
		$field->value = true;

		// On récupère le where correspondant
		$where = $this->genericService->generateSQLWhereRequest('RAW_DATA', $data);

		// On vérifie le résultat
		$this->assertNotNull($where);
		$this->assertEquals("WHERE (1 = 1) AND PLOT_DATA.IS_FOREST_PLOT = '1'", trim($where));

		//
		// Sous forme de tableau
		//
		$field->value = array(
			'1'
		);

		// On récupère le where correspondant
		$where = $this->genericService->generateSQLWhereRequest('RAW_DATA', $data);

		// On vérifie le résultat
		$this->assertNotNull($where);
		$this->assertEquals("WHERE (1 = 1) AND PLOT_DATA.IS_FOREST_PLOT = '1'", trim($where));
	}

	/**
	 * Test de la fonction generateSQLWhereRequest().
	 */
	public function testGenerateSQLWhereNumericRequest() {

		// On récupère un descripteur d'objet pour le format "SPECIES"
		$data = $this->genericService->buildDataObject('RAW_DATA', 'SPECIES_DATA', 'SPECIES');

		//
		// Ajout d'un critère sur une valeur simple
		//
		$field = new Application_Object_Metadata_TableField();
		$field->data = "BASAL_AREA";
		$field->columnName = "BASAL_AREA";
		$field->format = "SPECIES_DATA";
		$field->unit = "M2/HA";
		$field->type = "NUMERIC";
		$field->subtype = "RANGE";
		$field->value = '50';
		$data->addInfoField($field);

		// On récupère le where correspondant
		$where = $this->genericService->generateSQLWhereRequest('RAW_DATA', $data);

		// On vérifie le résultat
		$this->assertNotNull($where);
		$this->assertEquals("WHERE (1 = 1) AND (SPECIES_DATA.BASAL_AREA = 50)", trim($where));

		//
		// Ajout d'un critère sur le min
		//
		$field->value = array(
			'>= 50'
		);

		// On récupère le where correspondant
		$where = $this->genericService->generateSQLWhereRequest('RAW_DATA', $data);

		// On vérifie le résultat
		$this->assertNotNull($where);
		$this->assertEquals("WHERE (1 = 1) AND (SPECIES_DATA.BASAL_AREA >= 50)", trim($where));

		//
		// Critère sur min / max
		//
		$field->value = array(
			'50 - 100'
		);

		// On récupère le where correspondant
		$where = $this->genericService->generateSQLWhereRequest('RAW_DATA', $data);

		// On vérifie le résultat
		$this->assertNotNull($where);
		$this->assertEquals("WHERE (1 = 1) AND ((SPECIES_DATA.BASAL_AREA >= 50 AND SPECIES_DATA.BASAL_AREA <= 100))", trim($where));

		//
		// Critère sur max
		//
		$field->value = array(
			'<= 100'
		);

		// On récupère le where correspondant
		$where = $this->genericService->generateSQLWhereRequest('RAW_DATA', $data);

		// On vérifie le résultat
		$this->assertNotNull($where);
		$this->assertEquals("WHERE (1 = 1) AND (SPECIES_DATA.BASAL_AREA <= 100)", trim($where));

		//
		// Critère sur min ou max
		//
		$field->value = array(
			'>= 50',
			'<= 100'
		);

		// On récupère le where correspondant
		$where = $this->genericService->generateSQLWhereRequest('RAW_DATA', $data);

		// On vérifie le résultat
		$this->assertNotNull($where);
		$this->assertEquals("WHERE (1 = 1) AND (SPECIES_DATA.BASAL_AREA >= 50 OR SPECIES_DATA.BASAL_AREA <= 100)", trim($where));
	}

	/**
	 * Test de la fonction generateSQLWhereGeomRequest().
	 */
	public function testGenerateSQLWhereGeomRequest() {

		// On récupère un descripteur d'objet pour le format "SPECIES"
		$data = $this->genericService->buildDataObject('RAW_DATA', 'SPECIES_DATA', 'SPECIES');

		//
		// Ajout d'un critère sur une valeur simple
		//
		$field = new Application_Object_Metadata_TableField();
		$field->data = "THE_GEOM";
		$field->columnName = "THE_GEOM";
		$field->format = "LOCATION_DATA";
		$field->unit = "GEOM";
		$field->type = "GEOM";
		$field->subtype = "NULL";
		$field->value = 'POLYGON((3697781 2714044,3693936 2709776,3700497 2710164,3697781 2714044))';
		$data->addInfoField($field);

		// On récupère le where correspondant
		$where = $this->genericService->generateSQLWhereRequest('RAW_DATA', $data);

		// On vérifie le résultat
		$this->assertNotNull($where);
		$this->assertEquals("WHERE (1 = 1) AND (ST_Intersects(LOCATION_DATA.THE_GEOM, ST_Transform(ST_GeomFromText('POLYGON((3697781 2714044,3693936 2709776,3700497 2710164,3697781 2714044))', 3035), 4326)))", trim($where));
	}
}
