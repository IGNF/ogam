<?php
require_once TEST_PATH.'ControllerTestCase.php';

/**
 * Classe de test du modèle User.
 *
 * @package controllers
 */
class UserTest extends ControllerTestCase {

	/**
	 * Test du modèle "User".
	 */
	public function testGetUser() {

		// On charge le modèle LDAP
		$userModel = new Application_Model_Website_User();
		
		// On vérifie que le user "admin" existe
		$user = $userModel->getUser('admin');

		
		// On vérifie que l'on a ramené le bon user
		$this->assertEquals($user->login, 'admin');
		$this->assertEquals($user->active, 1);
		$this->assertEquals($user->providerId, '1');
		$this->assertEquals($user->username, 'admin user');
	}


	/**
	 * Test du modèle "User".
	 */
	public function testGetUsers() {
	
		// On charge le modèle
		$userModel = new Application_Model_Website_User();
	
		$users = $userModel->getUsers();
	
		$this->assertNotNull($users);
		$this->assertTrue(is_array($users));
		$this->assertTrue(count($users) > 0);
	}

}
