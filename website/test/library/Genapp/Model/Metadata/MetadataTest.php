<?php
require_once TEST_PATH.'ControllerTestCase.php';

/**
 * Classe de test du modèle Metadata.
 *
 * Warning : These tests are closely related to the example data available for OGAM.
 *
 * @package controllers
 */
class MetadataTest extends ControllerTestCase {

	/**
	 * Test la fonction getModes.
	 */
	public function testGetModes() {

		// On charge le modèle
		$metadataModel = new Genapp_Model_Metadata_Metadata();

		// On vérifie que le user "admin" existe
		$modes = $metadataModel->getModes('PROVIDER_ID');

		// On vérifie que l'on a ramené la bonne modalité
		$this->assertEquals(count($modes), 1);
		$this->assertEquals($modes['1'], 'France');
	}

	/**
	 * Test la fonction getMode.
	 */
	public function testGetMode() {

		// On charge le modèle
		$metadataModel = new Genapp_Model_Metadata_Metadata();

		// On vérifie que le user "admin" existe
		$modeLabel = $metadataModel->getMode('PROVIDER_ID', '1');

		// On vérifie que l'on a ramené la bonne modalité
		$this->assertEquals($modeLabel, 'France');
	}

	/**
	 * Test la fonction getTreeLabels.
	 */
	public function testGetTreeLabels() {

		// On charge le modèle
		$metadataModel = new Genapp_Model_Metadata_Metadata();

		$taxons = $metadataModel->getTreeLabels('ID_TAXON');

		// On vérifie que l'on a ramené le bon compte de modalités
		$this->assertEquals(count($taxons), 41);
	}

	/**
	 * Test la fonction getDynamodes.
	 */
	public function testGetDynamodes() {

		// On charge le modèle
		$metadataModel = new Genapp_Model_Metadata_Metadata();

		$departements = $metadataModel->getDynamodes('DEPARTEMENT');

		// On vérifie que l'on a ramené le bon compte de modalités
		$this->assertEquals(count($departements), 97);
	}

	/**
	 * Test la fonction getTreeModes.
	 */
	public function testGetTreeModes() {

		// On charge le modèle
		$metadataModel = new Genapp_Model_Metadata_Metadata();

		// Requête par défaut, on ramène le noeud racine avec 1 niveau de descendants
		$taxonsTree = $metadataModel->getTreeModes('ID_TAXON');
		$this->assertEquals(count($taxonsTree->children),1); // Il doit y avoir 1 enfant (Fauna)
		$taxon = $taxonsTree->children[0];
		$this->assertEquals($taxon->code, -1); // le noeud sous la racine est -1
		$this->assertEquals($taxon->label, 'Fauna');
		$this->assertEquals(count($taxon->children), 0); //pas d'enfants à ce noeud

		// Idem
		$taxonsTree = $metadataModel->getTreeModes('ID_TAXON', '*');
		$this->assertEquals(count($taxonsTree->children),1); // Il doit y avoir 1 enfant (Fauna)

		// Idem
		$taxonsTree = $metadataModel->getTreeModes('ID_TAXON', '*', 1);
		$this->assertEquals(count($taxonsTree->children), 1);

		// 1 niveau à partir de Fauna
		$taxonsTree = $metadataModel->getTreeModes('ID_TAXON', '-1', 1);
		$this->assertEquals(count($taxonsTree->children), 10); // Il y a 10 enfants à Fauna

		// 2 niveaux à partir de la racine
		$taxonsTree = $metadataModel->getTreeModes('ID_TAXON', '*', 2);
		$this->assertEquals(count($taxonsTree->children), 1); // On retrouve fauna
		$taxon = $taxonsTree->children[0];
		$this->assertEquals(count($taxon->children), 10); // Il y a 10 enfants à Fauna


	}

	/**
	 * Test la fonction getTreeChildrenCodes.
	 */
	public function testGetTreeChildrenCodes() {

		// On charge le modèle
		$metadataModel = new Genapp_Model_Metadata_Metadata();

		// Réquête par défaut, on ramène le noeud racine sur 1 niveau
		$taxons = $metadataModel->getTreeChildrenCodes('ID_TAXON', '-1');
		$this->assertEquals(count($taxons), 1);
		$rootTaxon = $taxons[0];
		$this->assertEquals($rootTaxon, -1);


		// Idem
		$taxons = $metadataModel->getTreeChildrenCodes('ID_TAXON', '-1', 1);
		$this->assertEquals(count($taxons), 1);
		$rootTaxon = $taxons[0];
		$this->assertEquals($rootTaxon, -1);

		// Sur 2 niveaux
		$taxons = $metadataModel->getTreeChildrenCodes('ID_TAXON', '-1', 2);
		$this->assertEquals(count($taxons), 11); // on doit trouver 11 codes

		// Un noeud fils
		$taxons = $metadataModel->getTreeChildrenCodes('ID_TAXON', '1000', 1);
		$this->assertEquals(count($taxons), 1);

		// Un noeud avec des enfants
		$taxons = $metadataModel->getTreeChildrenCodes('ID_TAXON', '22', 2);
		$this->assertEquals(count($taxons), 6);
	}

	/**
	 * Test la fonction getDatasetsForDisplay.
	 */
	public function testGetDatasetsForDisplay() {

		// On charge le modèle
		$metadataModel = new Genapp_Model_Metadata_Metadata();

		//  On vérifie que l'on a ramené le bon compte de modalités
		$datasets = $metadataModel->getDatasetsForDisplay();
		$this->assertEquals(count($datasets), 2);
	}



	/**
	 * Test la fonction getDatasetsForUpload.
	 */
	public function testGetDatasetsForUpload() {

		// On charge le modèle
		$metadataModel = new Genapp_Model_Metadata_Metadata();

		$datasets = $metadataModel->getDatasetsForUpload();

		//  On vérifie que l'on a ramené le bon compte de modalités
		$this->assertEquals(count($datasets), 2);
	}

}
