<?php
require_once TEST_PATH . 'ControllerTestCase.php';

/**
 * Classe de test du modèle Layers.
 *
 * @package controllers
 */
class LayersTest extends ControllerTestCase {

	/**
	 * Test "getLayer".
	 *
	 * This test is based on default data.
	 */
	public function testGetLayer() {

		// On charge le modèle
		$layersModel = new Application_Model_Mapping_Layers();

		// On récupère le layer des résultats
		$resultLayer = $layersModel->getLayer('result_locations');

		// On vérifie le résultat attendu
		$this->assertNotNull($resultLayer);

		$this->assertEquals('result_locations', $resultLayer->layerName);
		$this->assertEquals('Résultats', $resultLayer->layerLabel);
		$this->assertEquals('result_locations', $resultLayer->serviceLayerName);
		$this->assertEquals(true, $resultLayer->isTransparent);
		$this->assertEquals(100, $resultLayer->defaultOpacity);
		$this->assertEquals(false, $resultLayer->isBaseLayer);
		$this->assertEquals(true, $resultLayer->isUntiled);
		$this->assertEquals(true, $resultLayer->isVector);
		$this->assertEquals(null, $resultLayer->maxscale);
		$this->assertEquals(null, $resultLayer->minscale);
		$this->assertEquals(false, $resultLayer->hasLegend);
		$this->assertEquals(null, $resultLayer->transitionEffect);
		$this->assertEquals('PNG', $resultLayer->imageFormat);
		$this->assertEquals(null, $resultLayer->providerId);
		$this->assertEquals('REQUEST', $resultLayer->activateType);
		$this->assertEquals('Local_MapProxy_WMS_GetMap', $resultLayer->viewServiceName);
		$this->assertEquals('Local_MapProxy_WMS_GetLegendGraphic', $resultLayer->legendServiceName);
		$this->assertEquals('Local_MapProxy_WMS_GetMap', $resultLayer->detailServiceName);
		$this->assertEquals(null, $resultLayer->featureServiceName);
	}

	/**
	 * Test "getLayersList".
	 *
	 * This test is based on default data.
	 */
	public function testGetLayersList() {

		// On charge le modèle
		$layersModel = new Application_Model_Mapping_Layers();

		// On récupère le layer des résultats
		$layers = $layersModel->getLayersList();

		// On vérifie le résultat attendu
		$this->assertNotNull($layers);
		$this->assertTrue(is_array($layers));

		// Le résultat doit contenir le layer "résultats"
		$resultLayer = $layers['result_locations'];
		$this->assertNotNull($resultLayer);
		$this->assertEquals('Résultats', $resultLayer->layerLabel);
	}

	/**
	 * Test "getLegendItems".
	 *
	 * This test is based on default data.
	 */
	public function testGetLegendItems() {

		// On charge le modèle
		$layersModel = new Application_Model_Mapping_Layers();

		// On récupère le layer des résultats
		$legendItems = $layersModel->getLegendItems(-1);

		// On vérifie le résultat attendu
		$this->assertNotNull($legendItems);
		$this->assertTrue(is_array($legendItems));

		// Le résultat doit contenir le layer "résultats"
		$resultItem = $legendItems[1];
		$this->assertNotNull($resultItem);
		$this->assertEquals('result_locations', $resultItem->layerName);
		$this->assertEquals(true, $resultItem->isLayer);
		$this->assertEquals(false, $resultItem->isChecked);
		$this->assertEquals(false, $resultItem->isHidden);
		$this->assertEquals(true, $resultItem->isDisabled);
		$this->assertEquals(false, $resultItem->isExpended);
		$this->assertEquals('', $resultItem->checkedGroup);
	}

	/**
	 * Test "getVectorLayersList".
	 *
	 * This test is based on default data.
	 */
	public function testGetVectorLayersList() {

		// On charge le modèle
		$layersModel = new Application_Model_Mapping_Layers();

		// On récupère le layer des résultats
		$vectorLayers = $layersModel->getVectorLayersList();

		// On vérifie le résultat attendu
		$this->assertNotNull($vectorLayers);
		$this->assertTrue(is_array($vectorLayers));

		// Le résultat doit contenir le layer "résultats"
		$resultLayer = $vectorLayers['all_locations'];

		$this->assertNotNull($resultLayer);
		$this->assertEquals('Localisations', $resultLayer->layerLabel);
	}
}
