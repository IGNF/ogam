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
		$this->assertEquals($center->x, 96670);
		$this->assertEquals($center->y, 6022395);
		$this->assertEquals($center->zoomLevel, 1);
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

	/**
	 * Test Create / Read / Update / Delete.
	 */
	public function testCRUD() {

		// On charge le modèle
		$bbModel = new Application_Model_Mapping_BoundingBox();

		$providerId = "TestProvider";

		// On fait le ménage préventivement (cas d'un test non terminé)
		$bbModel->deleteBoundingBox($providerId);

		// On crée une bbox
		$bbox = Application_Object_Mapping_BoundingBox::createBoundingBox(0, 10, 0, 10);

		// On l'insère en base
		$bbModel->addBoundingBox($providerId, $bbox);

		// On recharge la bbox
		$bbox2 = $bbModel->getBoundingBox($providerId);

		// On vérifie qu'on a bien les mêmes infos
		$this->assertNotNull($bbox2);
		$this->assertEquals($bbox->xmin, $bbox2->xmin);
		$this->assertEquals($bbox->xmax, $bbox2->xmax);
		$this->assertEquals($bbox->ymin, $bbox2->ymin);
		$this->assertEquals($bbox->ymax, $bbox2->ymax);

		// On fait le ménage
		$bbModel->deleteBoundingBox($providerId);
	}
}
