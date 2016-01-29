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
	 * This test is based on default data
	 */
	public function testGetLayer() {
		
		// On charge le modèle
		$layersModel = new Application_Model_Mapping_Layers();
		
		// On récupère le layer des résultats
		$resultLayer = $layersModel->getLayer('result_locations');
		
		// On vérifie le résultat attendu
		$this->assertNotNull($resultLayer);
		
		$this->assertEquals('result_locations', $resultLayer->layerName);
		$this->assertEquals('Results', $resultLayer->layerLabel);
		$this->assertEquals('result_locations', $resultLayer->serviceLayerName);
		$this->assertEquals(true, $resultLayer->isTransparent);
		$this->assertEquals(null, $resultLayer->defaultOpacity);
		$this->assertEquals(false, $resultLayer->isBaseLayer);
		$this->assertEquals(true, $resultLayer->isUntiled);
		$this->assertEquals(null, $resultLayer->maxscale);
		$this->assertEquals(null, $resultLayer->minscale);
		$this->assertEquals(false, $resultLayer->hasLegend);
		$this->assertEquals(null, $resultLayer->transitionEffect);
		$this->assertEquals('PNG', $resultLayer->imageFormat);
		$this->assertEquals(null, $resultLayer->providerId);
		$this->assertEquals('REQUEST', $resultLayer->activateType);
		$this->assertEquals('local_mapserver', $resultLayer->viewServiceName);
		$this->assertEquals('local_legend', $resultLayer->legendServiceName);
		$this->assertEquals('local_mapserver', $resultLayer->printServiceName);
		$this->assertEquals('local_mapserver', $resultLayer->detailServiceName);
		$this->assertEquals('local_mapserver', $resultLayer->featureServiceName);
	}
}
