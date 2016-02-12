<?php
require_once TEST_PATH . 'ControllerTestCase.php';

/**
 * Test class for the FormQuery object.
 *
 * @package objects
 */
class FormQueryTest extends ControllerTestCase {

	/**
	 * Test de la création d'un objet FormQuery.
	 */
	public function testCreate() {

		// On crée un objet query vide
		$formQuery = new Application_Object_Generic_FormQuery();

		// On ajoute 1 critère
		$formQuery->addCriteria('LOCATION_DATA', 'DEPARTEMENT', '45');

		// On ajoute 2 colonnes de résultat
		$formQuery->addResult('LOCATION_DATA', 'DEPARTEMENT');
		$formQuery->addResult('LOCATION_DATA', 'COMMUNES');

		// On vérifie que l'objet contient bien ce qu'on lui a donné
		$this->assertEquals(1, count($formQuery->getCriterias()));
		$this->assertEquals(2, count($formQuery->getResults()));
		$this->assertEquals(3, count($formQuery->getFields()));
	}
}
