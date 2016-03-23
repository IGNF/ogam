<?php
require_once TEST_PATH . 'ControllerTestCase.php';
require_once APPLICATION_PATH . 'views/helpers/GenerateAddLink.php';

/**
 * Classe de test du helper de génération de liens.
 *
 * @package controllers
 */
class GenerateAddLinkTest extends ControllerTestCase {

	/**
	 * Test "generateAddLink".
	 * Cas nominal.
	 */
	public function testGenerateAddLink() {

		// On charge le helper
		$helper = new Application_Views_Helpers_GenerateAddLink();

		// On lui affecte un objet View
		$view = new Zend_View();
		$helper->setView($view);

		// On crée une clé primaire d'un objet format quelconque
		$keyFields = array();

		$tableField1 = new Application_Object_Metadata_TableField();
		$tableField1->data = 'myfield1';
		$tableField1->format = 'myFormat';
		$tableField1->value = 'value1';
		$keyFields[] = $tableField1;

		$tableField2 = new Application_Object_Metadata_TableField();
		$tableField2->data = 'myfield2';
		$tableField2->format = 'myFormat';
		$tableField2->value = 'value2';
		$keyFields[] = $tableField2;

		// génère un lien
		$link = $helper->generateAddLink('mySchema', 'myFormat', $keyFields);

		$this->assertNotNull($link);

		$this->assertEquals('/ogam/dataedition/show-add-data/SCHEMA/mySchema/FORMAT/myFormat/myfield1/value1/myfield2/value2', $link);
		// echo "Result : " . print_r($link, true);
	}
}

