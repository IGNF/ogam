<?php
require_once TEST_PATH . 'ControllerTestCase.php';

/**
 * Classe de test du modèle User.
 *
 * @package controllers
 */
class UserTest extends ControllerTestCase {

	/**
	 * Test "getUser".
	 * Cas nominal.
	 */
	public function testGetUser() {
		
		// On charge le modèle LDAP
		$userModel = new Application_Model_Website_User();
		
		// On vérifie que le user "admin" existe
		$user = $userModel->getUser('admin');
		
		// On vérifie que l'on a ramené le bon user
		$this->assertNotNull($user);
		$this->assertEquals($user->login, 'admin');
		$this->assertEquals($user->active, true);
		$this->assertEquals($user->providerId, '1');
		$this->assertEquals($user->username, 'admin user');
	}

	/**
	 * Test "getUser".
	 * Cas null.
	 */
	public function testGetUserNull() {
		
		// On charge le modèle LDAP
		$userModel = new Application_Model_Website_User();
		
		// On vérifie que le user "TOTO" n'existe pas
		$user = $userModel->getUser('TOTO');
		$this->assertNull($user);
	}

	/**
	 * Test "getUsers".
	 */
	public function testGetUsers() {
		
		// On charge le modèle
		$userModel = new Application_Model_Website_User();
		
		$users = $userModel->getUsers();
		
		$this->assertNotNull($users);
		$this->assertTrue(is_array($users));
		$this->assertTrue(count($users) > 0);
	}

	/**
	 * Test CRUD user.
	 */
	public function testCreateUser() {
		
		// On charge le modèle
		$userModel = new Application_Model_Website_User();
		
		$login = "PHPUnit";
		
		// On crée un utilisateur de test
		$user = new Application_Object_Website_User();
		$user->login = $login;
		$user->username = "PHPUnitUser";
		$user->providerId = "1";
		$user->active = false;
		$user->email = "PHPUnit@ign.fr";
		$user->roleCode = "ADMIN";
		
		// On fait du ménage au cas où
		$userModel->deleteUser($login);
		
		// On enregistre l'utilisateur
		$userModel->createUser($user);
		
		// On relie ce que l'on vient d'enregistrer
		$user2 = $userModel->getUser($login);
		
		// On vérifie que c'est pareil
		$this->assertNotNull($user2);
		$this->assertEquals($login, $user2->login);
		$this->assertEquals($user->username, $user2->username);
		$this->assertEquals($user->providerId, $user2->providerId);
		$this->assertEquals($user->active, $user2->active);
		$this->assertEquals($user->email, $user2->email);
		
		// On met à jour l'utilisateur
		$user2->username = "PHPUnitUser2";
		$userModel->updateUser($user2);
		
		// On relie ce que l'on vient d'enregistrer
		$user3 = $userModel->getUser($login);
		
		// On vérifie que c'est pareil
		$this->assertNotNull($user3);
		$this->assertEquals($user2->username, $user3->username);
		
		// Enregistrement d'un mot de passe
		$userModel->updatePassword($login, "password");
		
		// Récupération du mot de passe
		$password = $userModel->getPassword($login);
		
		$this->assertEquals("password", $password);
		
		// Lien user -> role (on suppose que le role ADMIN existe)
		$userModel->createUserRole($login, "ADMIN");
		$userModel->updateUserRole($login, "ADMIN");
		
		// Vérif
		$user4 = $userModel->getUser($login);
		$this->assertEquals("ADMIN", $user4->role->code);
		
		//
		// On fait du ménage
		//
		$userModel->deleteUser($user->login);
	}

	/**
	 * Test de getPassword.
	 * Cas null
	 */
	public function testGetPasswordNull() {
		
		// On charge le modèle
		$userModel = new Application_Model_Website_User();
		
		// Récupération du mot de passe
		$password = $userModel->getPassword('TOTO');
		
		$this->assertNull($password);
	}
}
