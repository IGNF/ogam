<?php
require_once TEST_PATH . 'ControllerTestCase.php';

/**
 * Test class for the BoundingBox object.
 *
 * @package objects
 */
class BoundingBoxObjectTest extends ControllerTestCase {

	/**
	 * Test de la création d'un objet BoundingBox.
	 */
	public function testCreateBBox() {

		// On crée un objet bbox en utilisant la méthode Factory.
		$xmin = 0;
		$xmax = 10;
		$ymin = 20;
		$ymax = 40; // la box n'est pas carrée au départ

		$bbox = Application_Object_Mapping_BoundingBox::createBoundingBox($xmin, $xmax, $ymin, $ymax, 10);

		// L'object est créé
		$this->assertnotNull($bbox);

		$this->assertEquals(-5, $bbox->xmin);
		$this->assertEquals(20, $bbox->ymin);
		$this->assertEquals(15, $bbox->xmax);
		$this->assertEquals(40, $bbox->ymax);
	}

	/**
	 * Test de la création d'un objet BoundingBox.
	 */
	public function testCreateBBox2() {

		// On crée un objet bbox en utilisant la méthode Factory.
		$xmin = 0;
		$xmax = 20; // la box n'est pas carrée au départ (mais sur les X)
		$ymin = 20;
		$ymax = 30;

		$bbox = Application_Object_Mapping_BoundingBox::createBoundingBox($xmin, $xmax, $ymin, $ymax, 10);

		// L'object est créé
		$this->assertnotNull($bbox);

		$this->assertEquals(0, $bbox->xmin);
		$this->assertEquals(15, $bbox->ymin);
		$this->assertEquals(20, $bbox->xmax);
		$this->assertEquals(35, $bbox->ymax);
	}

	/**
	 * Test de la création d'un objet BoundingBox.
	 * Avec un seuil minimum à respecter.
	 */
	public function testCreateBBoxMinSize() {

		// On crée un objet bbox en utilisant la méthode Factory.
		$xmin = 0;
		$xmax = 10;
		$ymin = 0;
		$ymax = 10; // la box n'est pas carrée au départ

		// On demande une taille min de 1000
		$bbox = Application_Object_Mapping_BoundingBox::createBoundingBox($xmin, $xmax, $ymin, $ymax, 1000);

		// L'object est créé
		$this->assertnotNull($bbox);

		$this->assertEquals(-495, $bbox->xmin);
		$this->assertEquals(-495, $bbox->ymin);
		$this->assertEquals(505, $bbox->xmax);
		$this->assertEquals(505, $bbox->ymax);
	}
}