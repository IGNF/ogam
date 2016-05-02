<?php
require_once TEST_PATH . 'ControllerTestCase.php';

/**
 * Classe de test du modèle Application_Model_Database_Metadata.
 *
 * @package controllers
 */
class ModelDatabaseMetadataTest extends ControllerTestCase {

	protected $databaseModel;

	/**
	 * Set up the test case.
	 *
	 * @see sources/library/Zend/Test/PHPUnit/Zend_Test_PHPUnit_ControllerTestCase::setUp()
	 */
	public function setUp() {
		parent::setUp();

		echo "SetUp();";

		// On instancie le service
		$this->databaseModel = new Application_Model_Database_Metadata();

		echo "databaseModel : " . print_r(databaseModel, true);
	}

	/**
	 * Clean up after the test case.
	 */
	public function tearDown() {

		// Ferme les connections
		$db = $this->databaseModel->getAdapter();
		$db->closeConnection();

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

		// On vérifie que l'on a ramené les bonnes valeurs
		$this->assertNotNull($fks);

		// La fk LOCATION__LOCATION doit être documentée dans la liste
		$this->assertTrue(array_key_exists('PLOT_DATA__LOCATION', $fks));
	}
}
