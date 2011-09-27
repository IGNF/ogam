<?php
require_once TEST_PATH.'ControllerTestCase.php';
require_once APPLICATION_PATH.'/objects/Website/User.php';
require_once APPLICATION_PATH.'/models/Website/User.php';

/**
 * Classe de test du modèle d'accès à LDAP.
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

		
		// On vérifie que l'on est bien connecté
		$this->assertTrue($userModel);
	}

	

}
