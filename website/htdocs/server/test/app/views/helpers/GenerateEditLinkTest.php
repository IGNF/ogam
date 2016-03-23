<?php
require_once TEST_PATH . 'ControllerTestCase.php';
require_once APPLICATION_PATH . 'views/helpers/GenerateEditLink.php';

/**
 * Classe de test du helper de génération de liens.
 *
 * @package controllers
 */
class GenerateEditLinkTest extends ControllerTestCase {

	/**
	 * Test "generateEditLink".
	 * Cas nominal.
	 */
	public function testGenerateEditLink() {

		// On charge le helper à tester
		$helper = new Application_Views_Helpers_GenerateEditLink();

		// On lui affecte un objet View
		$view = new Zend_View();
		$helper->setView($view);

		// On récupère un objet générique correspondant une ligne vide de la table PLOT_DATA
		$genericService = new Application_Service_GenericService();
		$data = $genericService->buildDataObject('RAW_DATA', 'PLOT_DATA');

		// On lui affecte des valeurs de clé primaire
		$data->getInfoField('PLOT_DATA__PROVIDER_ID')->value = '1';
		$data->getInfoField('PLOT_DATA__PLOT_CODE')->value = '01575-14060-4-0T';
		$data->getInfoField('PLOT_DATA__CYCLE')->value = '5';

		// On génère un tableau correspondant à au lien
		$link = $helper->generateEditLink($data);

		$this->assertNotNull($link);

		$this->assertNotNull($link['url']);

		// echo "Result : " . print_r($link, true);

		$this->assertEquals('/ogam/dataedition/show-edit-data/SCHEMA/RAW_DATA/FORMAT/PLOT_DATA/PROVIDER_ID/1/PLOT_CODE/01575-14060-4-0T/CYCLE/5', $link['url']);
	}
}

