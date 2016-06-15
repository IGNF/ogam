<?php
require_once TEST_PATH . 'ControllerTestCase.php';

/**
 * Classe de test du modèle Application_Model_Database_Postgresql.
 *
 * @package controllers
 */
class ModelDatabasePostgresqlTest extends ControllerTestCase {

	protected $databaseModel;

	/**
	 * Set up the test case.
	 *
	 * @see sources/library/Zend/Test/PHPUnit/Zend_Test_PHPUnit_ControllerTestCase::setUp()
	 */
	public function setUp() {
		parent::setUp();

		// On instancie le service
		$this->databaseModel = new Application_Model_Database_Postgresql();
	}

	/**
	 * Clean up after the test case.
	 */
	public function tearDown() {
		parent::tearDown();

		$this->databaseModel = null;
	}

	/**
	 * Test de la fonction getTables().
	 */
	public function testGetTables() {

		// On récupère la liste des tables documentées dans le métamodèles
		$tables = $this->databaseModel->getTables();

		// On vérifie que l'on a ramené les bonnes valeurs
		$this->assertNotNull($tables);

		// La table RAW_DATA_LOCATION doit être documentée dans la liste
		$this->assertTrue(array_key_exists('RAW_DATA_LOCATION', $tables));
	}

	/**
	 * Test de la fonction getFields().
	 */
	public function testGetFields() {

		// On récupère la liste des tables documentées dans le métamodèles
		$fields = $this->databaseModel->getFields();

		// echo print_r($fields, true);

		// On vérifie que l'on a ramené les bonnes valeurs
		$this->assertNotNull($fields);

		// La table RAW_DATA_LOCATION doit être documentée dans la liste
		$this->assertTrue(array_key_exists('RAW_DATA_LOCATION_SUBMISSION_ID', $fields));
	}

	/**
	 * Test de la fonction getForeignKeys().
	 */
	public function testGetForeignKeys() {

		// On récupère la liste des tables documentées dans le métamodèles
		$fks = $this->databaseModel->getForeignKeys();

		// echo print_r($fks, true);

		// On vérifie que l'on a ramené les bonnes valeurs
		$this->assertNotNull($fks);

		// La fk LOCATION__LOCATION doit être documentée dans la liste
		$this->assertTrue(array_key_exists('PLOT_DATA__LOCATION', $fks));
	}

	/**
	 * Test de la fonction getSchemas().
	 */
	public function testGetSchemas() {

		// On récupère la liste des tables documentées dans le métamodèles
		$schemas = $this->databaseModel->getSchemas();

		// On vérifie que l'on a ramené les bonnes valeurs
		$this->assertNotNull($schemas);

		// La fk LOCATION__LOCATION doit être documentée dans la liste
		$this->assertTrue(in_array('RAW_DATA', $schemas));
	}
}
