<?php
require_once TEST_PATH.'ControllerTestCase.php';

/**
 * Classe de test du modèle Role.
 *
 * @package controllers
 */
class RoleTest extends ControllerTestCase {

	/**
	 * Test du modèle "User".
	 */
	public function testGetUser() {

		// On charge le modèle LDAP
		$roleModel = new Application_Model_Website_Role();
		
		// On vérifie que le user "ADMIN" existe
		$role = $roleModel->getRole('ADMIN');
		
		// On vérifie que l'on a ramené le bon role
		$this->assertEquals($role->roleCode, 'ADMIN');
		$this->assertEquals($role->roleDefinition, 'Manages the web site');
		$this->assertEquals($role->roleLabel, 'Administrator');
	}

}
