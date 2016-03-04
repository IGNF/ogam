<?php
require_once TEST_PATH . 'ControllerTestCase.php';

/**
 * Classe de test du modèle Role.
 *
 * @package controllers
 */
class RoleTest extends ControllerTestCase {

	/**
	 * Test de la fonction getAllPermissions().
	 */
	public function testGetAllPermissions() {
		
		// On charge le modèle
		$roleModel = new Application_Model_Website_Role();
		
		// On récupère les permissions
		$permissionsList = $roleModel->getAllPermissions();
		
		// La liste ne doit pas être vide
		$this->assertNotNull($permissionsList);
		$this->assertTrue(count($permissionsList) > 0);
		
		// La permission DATA_QUERY doit existe
		$this->assertTrue(array_key_exists('DATA_QUERY', $permissionsList));
	}

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
		
		// Le rôle ADMIN doit avoir le droit de voir les données
		$permissionsList = $role->permissionsList;
		$this->assertTrue(in_array('DATA_QUERY', $permissionsList));
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
		
		// On crée un role de test
		$role = new Application_Object_Website_Role();
		$role->code = $code;
		$role->definition = "Rôle de test";
		$role->label = "Rôle de test";
		
		// On lui donne des permission
		$role->permissionsList = array(
			'DATA_QUERY',
			'DATA_EDITION'
		);
		
		// On lui affecte un schéma
		$role->schemasList = array(
			'RAW_DATA'
		);
		
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

	/**
	 * Test de la fonction getRolesList().
	 */
	public function testGetRolesList() {
		
		// On charge le modèle
		$roleModel = new Application_Model_Website_Role();
		
		// On récupère les rôles
		$rolesList = $roleModel->getRolesList();
		
		// Il doit y avoir au moins un role dans la liste (ADMIN)
		$this->assertNotNull($rolesList);
		$this->assertTrue(count($rolesList) > 0);
		
		$role = $rolesList['ADMIN'];
		
		$this->assertNotNull($role);
		$this->assertEquals($role->label, 'Administrator');
	}
}
