<?php
require_once TEST_PATH . 'ControllerTestCase.php';

/**
 * Classe de test du modèle ApplicationParameter.
 *
 * @package controllers
 */
class ApplicationParameterTest extends ControllerTestCase {

	/**
	 * Test de la fonction getParameters().
	 */
	public function testGetParameters() {

		// On charge le modèle
		$parametersModel = new Application_Model_Website_ApplicationParameter();

		// On récupère les paramètres
		$params = $parametersModel->getParameters();

		// On vérifie que l'on a ramené les bonnes valeurs
		$this->assertNotNull($params);
		$this->assertTrue(is_array($params));

		$testParam = $params['Test'];

		$this->assertEquals('OK', $testParam->value);
	}
}
