<?php
require_once TEST_PATH . 'ControllerTestCase.php';

/**
 * Classe de test du modèle User.
 *
 * @package controllers
 */
class UserTest extends ControllerTestCase {

	protected $userModel;

	/**
	 * Set up the test case.
	 *
	 * @see sources/library/Zend/Test/PHPUnit/Zend_Test_PHPUnit_ControllerTestCase::setUp()
	 */
	public function setUp() {
		parent::setUp();

		// On instancie le modèle
		$this->userModel = new Application_Model_Website_User();
	}

	/**
	 * Clean up after the test case.
	 */
	public function tearDown() {

		// Ferme les connections
		$db = $this->userModel->getAdapter();
		$db->closeConnection();

		$this->userModel = null;
	}

	/**
	 * Test "getUser".
	 * Cas nominal.
	 */
	public function testGetUser() {

		// On vérifie que le user "admin" existe
		$user = $this->userModel->getUser('admin');

		// On vérifie que l'on a ramené le bon user
		$this->assertNotNull($user);
		$this->assertEquals($user->login, 'admin');
		$this->assertEquals($user->active, true);
		$this->assertEquals($user->provider->id, '1');
		$this->assertEquals($user->username, 'admin user');
	}

	/**
	 * Test "getUser".
	 * Cas null.
	 */
	public function testGetUserNull() {

		// On vérifie que le user "TOTO" n'existe pas
		$user = $this->userModel->getUser('TOTO');
		$this->assertNull($user);
	}

	/**
	 * Test "getUsersList".
	 */
	public function testGetUsersList() {
		$users = $this->userModel->getUsersList();

		$this->assertNotNull($users);
		$this->assertTrue(is_array($users));
		$this->assertTrue(count($users) > 0);
	}

	/**
	 * Test CRUD user.
	 */
	public function testCreateUser() {

		// On charge le modèle
		$providerModel = new Application_Model_Website_Provider();

		$login = "PHPUnit";

		// On récupère le provider de test
		$provider = $providerModel->getProvider("1");

		// On crée un utilisateur de test
		$user = new Application_Object_Website_User();
		$user->login = $login;
		$user->username = "PHPUnitUser";
		$user->active = false;
		$user->email = "PHPUnit@ign.fr";
		$user->roleCode = "ADMIN";
		$user->provider = $provider;

		// On fait du ménage au cas où
		$this->userModel->deleteUser($login);

		// On enregistre l'utilisateur
		$this->userModel->createUser($user);

		// On relie ce que l'on vient d'enregistrer
		$user2 = $this->userModel->getUser($login);

		// On vérifie que c'est pareil
		$this->assertNotNull($user2);
		$this->assertEquals($login, $user2->login);
		$this->assertEquals($user->username, $user2->username);
		$this->assertEquals($user->active, $user2->active);
		$this->assertEquals($user->email, $user2->email);

		// On met à jour l'utilisateur
		$user2->username = "PHPUnitUser2";
		$this->userModel->updateUser($user2);

		// On relie ce que l'on vient d'enregistrer
		$user3 = $this->userModel->getUser($login);

		// On vérifie que c'est pareil
		$this->assertNotNull($user3);
		$this->assertEquals($user2->username, $user3->username);

		// Enregistrement d'un mot de passe
		$this->userModel->updatePassword($login, "password");

		// Récupération du mot de passe
		$password = $this->userModel->getPassword($login);

		$this->assertEquals("password", $password);

		// Lien user -> role (on suppose que le role ADMIN existe)
		$this->userModel->createUserRole($login, "ADMIN");
		$this->userModel->updateUserRole($login, "ADMIN");

		// Vérif
		$user4 = $this->userModel->getUser($login);
		$this->assertEquals("ADMIN", $user4->role->code);

		//
		// On fait du ménage
		//
		$this->userModel->deleteUser($user->login);
	}

	/**
	 * Test de getPassword.
	 * Cas null
	 */
	public function testGetPasswordNull() {

		// Récupération du mot de passe
		$password = $this->userModel->getPassword('TOTO');

		$this->assertNull($password);
	}
}
