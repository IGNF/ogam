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
		parent::tearDown();

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

		// Build a new provider with no id
		$provider = new Application_Object_Website_Provider();
		$provider->label = "PHPUnitProvider";
		$provider->definition = "Test provider";

		// Insert in database and get a new provider id
		$provider = $this->providerModel->addProvider($provider);

		// On vérifie les valeurs
		$this->assertEquals("PHPUnitProvider", $provider->label);
		$this->assertEquals("Test provider", $provider->definition);
		$this->assertNotNull($provider->id);

		// On modifie le provider
		$provider->label = "PHPUnitProvider2";
		$provider->definition = "Test provider2";
		$this->providerModel->updateProvider($provider);

		// On récupère le provider modifié
		$provider2 = $this->providerModel->getProvider($provider->id);

		// On vérifie que la modif a eu lieu
		$this->assertEquals("PHPUnitProvider2", $provider2->label);
		$this->assertEquals("Test provider2", $provider2->definition);

		// The provider should be deletable has it is new
		$isProviderDeletable = $this->providerModel->isProviderDeletable($provider->id);
		$this->assertTrue($isProviderDeletable);

		// On supprime le provider de test
		$this->providerModel->deleteProvider($provider->id);
	}
}
