<?php
require_once TEST_PATH . 'ControllerTestCase.php';

/**
 * Classe de test du modèle Role.
 *
 * @package controllers
 */
class RoleTest extends ControllerTestCase {

	protected $roleModel;

	/**
	 * Set up the test case.
	 *
	 * @see sources/library/Zend/Test/PHPUnit/Zend_Test_PHPUnit_ControllerTestCase::setUp()
	 */
	public function setUp() {
		parent::setUp();

		// On instancie le modèle
		$this->roleModel = new Application_Model_Website_Role();
	}

	/**
	 * Clean up after the test case.
	 */
	public function tearDown() {

		// Ferme les connections
		$db = $this->roleModel->getAdapter();
		$db->closeConnection();

		$this->roleModel = null;
	}

	/**
	 * Test de la fonction getAllPermissions().
	 */
	public function testGetAllPermissions() {

		// On récupère les permissions
		$permissionsList = $this->roleModel->getAllPermissions();

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

		// On vérifie que le rôle "ADMIN" existe
		$role = $this->roleModel->getRole('ADMIN');

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

		// On vérifie que le rôle "TOTO" n'existe pas
		$role = $this->roleModel->getRole('TOTO');
		$this->assertNull($role);
	}

	/**
	 * Test CRUD role.
	 */
	public function testCreateRole() {
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
		$this->roleModel->deleteRole($code);

		// On enregistre le nouveau role
		$this->roleModel->createRole($role);

		// On relie ce que l'on vient d'enregistrer
		$role2 = $this->roleModel->getRole($code);

		// On vérifie que c'est pareil
		$this->assertNotNull($role2);
		$this->assertEquals($code, $role2->code);
		$this->assertEquals($role->definition, $role2->definition);
		$this->assertEquals($role->label, $role2->label);

		// On met à jour l'utilisateur
		$role2->label = "Label MAJ";
		$this->roleModel->updateRole($role2);

		// On relie ce que l'on vient d'enregistrer
		$role3 = $this->roleModel->getRole($code);

		// On vérifie que c'est pareil
		$this->assertNotNull($role3);
		$this->assertEquals("Label MAJ", $role3->label);

		//
		// On fait du ménage
		//
		$this->roleModel->deleteRole($code);
	}

	/**
	 * Test de la fonction getRolesList().
	 */
	public function testGetRolesList() {

		// On récupère les rôles
		$rolesList = $this->roleModel->getRolesList();

		// Il doit y avoir au moins un role dans la liste (ADMIN)
		$this->assertNotNull($rolesList);
		$this->assertTrue(count($rolesList) > 0);

		$role = $rolesList['ADMIN'];

		$this->assertNotNull($role);
		$this->assertEquals($role->label, 'Administrator');
	}
}
