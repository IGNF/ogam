<?php
require_once TEST_PATH . 'ControllerTestCase.php';

/**
 * Classe de test du modèle Application_Model_Database_Metadata.
 *
 * @package controllers
 */
class ModelDatabaseMetadataTest extends ControllerTestCase {

	/**
	 * Test de la fonction getTables().
	 */
	public function testGetTables() {

		// On charge le modèle
		$databaseModel = new Application_Model_Database_Metadata();

		// On récupère la liste des tables documentées dans le métamodèles
		$tables = $databaseModel->getTables();

		// On vérifie que l'on a ramené les bonnes valeurs
		$this->assertNotNull($tables);

		// La table RAW_DATA_LOCATION doit être documentée dans la liste
		$this->assertTrue(array_key_exists('RAW_DATA_LOCATION', $tables));
	}

	/**
	 * Test de la fonction getFields().
	 */
	public function testGetFields() {

		// On charge le modèle
		$databaseModel = new Application_Model_Database_Metadata();

		// On récupère la liste des tables documentées dans le métamodèles
		$fields = $databaseModel->getFields();

		// On vérifie que l'on a ramené les bonnes valeurs
		$this->assertNotNull($fields);

		// La table RAW_DATA_LOCATION doit être documentée dans la liste
		$this->assertTrue(array_key_exists('RAW_DATA_LOCATION_SUBMISSION_ID', $fields));
	}

	/**
	 * Test de la fonction getForeignKeys().
	 */
	public function testGetForeignKeys() {

		// On charge le modèle
		$databaseModel = new Application_Model_Database_Metadata();

		// On récupère la liste des tables documentées dans le métamodèles
		$fks = $databaseModel->getForeignKeys();

		// On vérifie que l'on a ramené les bonnes valeurs
		$this->assertNotNull($fks);

		// La fk LOCATION__LOCATION doit être documentée dans la liste
		$this->assertTrue(array_key_exists('PLOT_DATA__LOCATION', $fks));
	}
}
