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
		$this->assertEquals($role->code, 'ADMIN');
		$this->assertEquals($role->definition, 'Manages the web site');
		$this->assertEquals($role->label, 'Administrator');
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

	/**
	 * Test CRUD role.
	 */
	public function testCreateRole() {
		
		// On charge le modèle
		$roleModel = new Application_Model_Website_Role();
		
		$code = "TEST_ROLE";
		
		// On crée un utilisateur de test
		$role = new Application_Object_Website_Role();
		$role->code = $code;
		$role->definition = "Rôle de test";
		$role->label = "Rôle de test";
		
		// On fait du ménage au cas où
		$roleModel->deleteRole($code);
		
		// On enregistre le nouveau role
		$roleModel->createRole($role);
		
		// On relie ce que l'on vient d'enregistrer
		$role2 = $roleModel->getRole($code);
		
		// On vérifie que c'est pareil
		$this->assertNotNull($role2);
		$this->assertEquals($code, $role2->code);
		$this->assertEquals($role->definition, $role2->definition);
		$this->assertEquals($role->label, $role2->label);
		
		// On met à jour l'utilisateur
		$role2->label = "Label MAJ";
		$roleModel->updateRole($role2);
		
		// On relie ce que l'on vient d'enregistrer
		$role3 = $roleModel->getRole($code);
		
		// On vérifie que c'est pareil
		$this->assertNotNull($role3);
		$this->assertEquals("Label MAJ", $role3->label);
		
		//
		// On fait du ménage
		//
		$roleModel->deleteRole($code);
	}
}
