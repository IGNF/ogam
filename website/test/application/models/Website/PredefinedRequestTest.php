<?php
require_once TEST_PATH . 'ControllerTestCase.php';

/**
 * Classe de test du modèle des requêtes prédéfinies.
 *
 * @package controllers
 */
class PredefinedRequestTest extends ControllerTestCase {

	/**
	 * Test de la fonction getPredefinedRequest().
	 * Cas nominal (suppose que le rôle ADMIN existe déjà en base).
	 */
	public function testGetPredefinedRequest() {
		
		// On charge le modèle
		$requestModel = new Application_Model_Website_PredefinedRequest();
		
		// On vérifie que la requête prédéfinie "SPECIES" existe
		$speciesRequest = $requestModel->getPredefinedRequest('SPECIES');
		
		// On vérifie que l'on a ramené la bonne requête
		$this->assertNotNull($speciesRequest);
		$this->assertEquals('SPECIES', $speciesRequest->requestName);
		$this->assertEquals('RAW_DATA', $speciesRequest->schemaCode);
		
		// La requête doit contenir des critères et des résultats
		$this->assertNotNull($speciesRequest->criteriaList);
		$this->assertTrue(count($speciesRequest->criteriaList) > 0);
		
		$this->assertNotNull($speciesRequest->resultsList);
		$this->assertTrue(count($speciesRequest->resultsList) > 0);
	}

	/**
	 * Test de la fonction getPredefinedRequest().
	 * Cas null.
	 */
	public function testGetPredefinedRequestNull() {
		
		// On charge le modèle
		$requestModel = new Application_Model_Website_PredefinedRequest();
		
		// On vérifie qu'il n'y a pas de requête TOTO
		$speciesRequest = $requestModel->getPredefinedRequest('TOTO');
		$this->assertNull($speciesRequest);
	}

	/**
	 * Test de la fonction getPredefinedRequestList().
	 */
	public function testGetPredefinedRequestList() {
		
		// On charge le modèle
		$requestModel = new Application_Model_Website_PredefinedRequest();
		
		// On vérifie que la liste n'est pas vide
		$requestsList = $requestModel->getPredefinedRequestList();
		$this->assertNotNull($requestsList);
		$this->assertTrue(count($requestsList) > 0);
	}

	/**
	 * Test de la fonction savePredefinedRequest().
	 */
	public function testSavePredefinedRequest() {
		$nomRequete = 'TEST_REQUEST';
		
		// On charge le modèle
		$requestModel = new Application_Model_Website_PredefinedRequest();
		
		// On fait un ménage préventif
		$requestModel->deletePredefinedRequest($nomRequete);
		
		// Création d'une nouvelle requête prédéfinie
		$requete = new Application_Object_Website_PredefinedRequest();
		$requete->requestName = $nomRequete;
		$requete->schemaCode = 'RAW_DATA';
		$requete->datasetID = 'SPECIES';
		$requete->definition = 'Requête de test unitaire';
		$requete->label = 'Requête de test unitaire';
		
		$criteria = new Application_Object_Website_PredefinedField();
		$criteria->format = "SPECIES_FORM";
		$criteria->data = "SPECIES";
		$criteria->value = 12;
		$criteria->fixed = true;
		
		$requete->addCriteria($criteria);
		
		$result = new Application_Object_Website_PredefinedField();
		$result->format = "SPECIES_FORM";
		$result->data = "SPECIES";
		
		$requete->addResult($result);
		
		// On sauvegarde la requête
		$requestModel->savePredefinedRequest($requete);
		
		// TODO : Association d'une requête à un groupe
		
		// On la recharge pour vérifier
		$requete2 = $requestModel->getPredefinedRequest($nomRequete);
		
		$this->logger->info('requete2 : ' . print_r($requete2, true));
		
		$this->assertNotNull($requete2);
		$this->assertEquals($requete->requestName, $requete2->requestName);
		$this->assertEquals($requete->schemaCode, $requete2->schemaCode);
		$this->assertEquals($requete->datasetID, $requete2->datasetID);
		$this->assertEquals($requete->definition, $requete2->definition);
		$this->assertEquals($requete->label, $requete2->label);
		
		$this->assertTrue(count($requete2->resultsList) > 0);
		$this->assertTrue(count($requete2->criteriaList) > 0);
		
		// On fait le ménage
		$requestModel->deletePredefinedRequest($nomRequete);
	}
}
