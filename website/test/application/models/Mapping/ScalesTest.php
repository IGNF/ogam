<?php
require_once TEST_PATH . 'ControllerTestCase.php';

/**
 * Classe de test du modèle Scales.
 *
 * @package controllers
 */
class ScalesTest extends ControllerTestCase {

	/**
	 * Test "getScales".
	 */
	public function testGetScales() {
		
		// On charge le modèle
		$scalesModel = new Application_Model_Mapping_Scales();
		
		// ON récupère la config
		$scales = $scalesModel->getScales();
		
		// On vérifie le résultat attendu
		$this->assertNotNull($scales);
		$this->assertTrue(is_array($scales));
		$this->assertEquals(25000000, $scales[0]);
		$this->assertEquals(100000, $scales[7]);
	}
}
