<?php
require_once TEST_PATH . 'ControllerTestCase.php';

/**
 * Classe de test du modèle Role.
 *
 * @package controllers
 */
class RoleTest extends ControllerTestCase {

	/**
	 * Test de la fonction GetRole().
	 * Cas nominal (suppose que le rôle ADMIN existe déjà en base).
	 */
	public function testGetRole() {
		
		// On charge le modèle
		$roleModel = new Application_Model_Website_Role();
		
		// On vérifie que le rôle "ADMIN" existe
		$role = $roleModel->getRole('ADMIN');
		
		// On vérifie que l'on a ramené le bon rôle
		$this->assertEquals($role->roleCode, 'ADMIN');
		$this->assertEquals($role->roleDefinition, 'Manages the web site');
		$this->assertEquals($role->roleLabel, 'Administrator');
	}

	/**
	 * Test de la fonction GetRole().
	 * Cas null.
	 */
	public function testGetRoleNull() {
		
		// On charge le modèle
		$roleModel = new Application_Model_Website_Role();
		
		// On vérifie que le rôle "TOTO" n'existe pas
		$role = $roleModel->getRole('TOTO');
		$this->assertNull($role);
	}
}
