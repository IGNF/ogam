<?php
require_once TEST_PATH.'ControllerTestCase.php';

/**
 * Classe de test du modèle ApplicationParameter.
 *
 * @package controllers
 */
class ApplicationParameterTest extends ControllerTestCase {

	/**
	 * Test du modèle "User".
	 */
	public function testGetUser() {

		// On charge le modèle
		$parametersModel = new Application_Model_Website_ApplicationParameter();
		
		// On récupère les paramètres
		$params = $parametersModel->getParameters();
		
		// On vérifie que l'on a ramené les bonnes valeurs
		$this->assertNotNull($params);
		$this->assertEquals('OK', $params->Test);
	}

}
