<?php
require_once TEST_PATH . 'ControllerTestCase.php';

/**
 * Classe de test du modèle Provider.
 *
 * Les tests utilisent le jeu de données par défaut.
 *
 * @package controllers
 */
class ProviderTest extends ControllerTestCase {

	protected $providerModel;

	/**
	 * Set up the test case.
	 *
	 * @see sources/library/Zend/Test/PHPUnit/Zend_Test_PHPUnit_ControllerTestCase::setUp()
	 */
	public function setUp() {
		parent::setUp();

		// On instancie le modèle
		$this->providerModel = new Application_Model_Website_Provider();
	}

	/**
	 * Clean up after the test case.
	 */
	public function tearDown() {

		// Ferme les connections
		$db = $this->providerModel->getAdapter();
		$db->closeConnection();

		$this->providerModel = null;
	}

	/**
	 * Test "getProvider".
	 * Cas nominal.
	 */
	public function testGetProvider() {

		// On vérifie que le provider "1" existe
		$provider = $this->providerModel->getProvider('1');

		// On vérifie que l'on a ramené le bon user
		$this->assertNotNull($provider);
		$this->assertEquals($provider->id, '1');
		$this->assertEquals($provider->label, 'Defaut');
		$this->assertEquals($provider->definition, 'Organisme par défaut');
	}

	/**
	 * Test "getProvider".
	 * Cas null.
	 */
	public function testGetProviderNull() {

		// On vérifie que le user "TOTO" n'existe pas
		try {
			$provider = $this->providerModel->getProvider('TOTO');

			$this->assertTrue(false);
		} catch (Exception $e) {
			// On attend une exception
			$this->assertTrue(true);
		}
	}

	/**
	 * Test "getProvidersList".
	 */
	public function testGetProvidersList() {
		$providers = $this->providerModel->getProvidersList();

		$this->assertNotNull($providers);
		$this->assertTrue(is_array($providers));
		$this->assertTrue(count($providers) > 0);
	}

	/**
	 * Test CRUD provider.
	 */
	public function testCRUDProvider() {

		// On crée un nouveau provider
		$providerId = $this->providerModel->addProvider("PHPUnitProvider", "Test provider");

		// On récupère le provider créé
		$provider = $this->providerModel->getProvider($providerId);

		// On vérifie les valeurs
		$this->assertEquals("PHPUnitProvider", $provider->label);
		$this->assertEquals("Test provider", $provider->definition);

		// On modifie le provider
		$this->providerModel->updateProvider($providerId, "PHPUnitProvider2", "Test provider2");

		// On récupère le provider modifié
		$provider = $this->providerModel->getProvider($providerId);

		// On vérifie que la modif a eu lieu
		$this->assertEquals("PHPUnitProvider2", $provider->label);
		$this->assertEquals("Test provider2", $provider->definition);

		// On supprime le provider de test
		$this->providerModel->deleteProvider($providerId);
	}
}
