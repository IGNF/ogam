<?php
require_once TEST_PATH . 'ControllerTestCase.php';

/**
 * Classe de test du modèle Services.
 *
 * @package controllers
 */
class ServicesTest extends ControllerTestCase {

	/**
	 * Test "getService".
	 */
	public function testGetService() {

		// On charge le modèle
		$servicesModel = new Application_Model_Mapping_Services();

		$serviceLocal = $servicesModel->getService('Local_MapProxy_WMS_GetMap');

		// On vérifie le résultat attendu
		$this->assertNotNull($serviceLocal);
		$this->assertEquals('Local_MapProxy_WMS_GetMap', $serviceLocal->serviceName);
	}
}
