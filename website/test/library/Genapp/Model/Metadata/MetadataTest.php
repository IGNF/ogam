<?php
require_once TEST_PATH.'ControllerTestCase.php';

/**
 * Classe de test du modèle Metadata.
 *
 * @package controllers
 */
class MetadataTest extends ControllerTestCase {

	/**
	 * Test la fonction getMode.
	 */
	public function testGetMode() {

		// On charge le modèle LDAP
		$metadataModel = new Genapp_Model_Metadata_Metadata();
		
		// On vérifie que le user "admin" existe
		$modeLabel = $metadataModel->getMode('PROVIDER_ID', '1');
		
		// On vérifie que l'on a ramené la bonne modalité
		$this->assertEquals($modeLabel, 'France');
	}

	

}
