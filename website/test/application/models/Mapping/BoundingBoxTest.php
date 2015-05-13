<?php
require_once TEST_PATH . 'ControllerTestCase.php';

/**
 * Classe de test du modèle BoundingBox.
 *
 * @package controllers
 */
class BoundingBoxTest extends ControllerTestCase {

	/**
	 * Test "getCenter".
	 * Cas nominal.
	 */
	public function testGetCenter() {
		
		// On charge le modèle
		$bbModel = new Application_Model_Mapping_BoundingBox();
		
		// On récupère le centre pour le fournisseur "1"
		$center = $bbModel->getCenter('1');
		
		// On vérifie le résultat attendu
		$this->assertNotNull($center);
		$this->assertEquals($center->x_center, 3710000);
		$this->assertEquals($center->y_center, 2610000);
		$this->assertEquals($center->defaultzoom, 1);
	}

	/**
	 * Test "getCenter".
	 * Cas d'erreur.
	 */
	public function testGetCenterNull() {
		
		// On charge le modèle
		$bbModel = new Application_Model_Mapping_BoundingBox();
		
		// On récupère le centre pour le fournisseur "TOTO"
		$center = $bbModel->getCenter('TOTO');
		
		// On vérifie le résultat attendu
		$this->assertNull($center);
	}
}
