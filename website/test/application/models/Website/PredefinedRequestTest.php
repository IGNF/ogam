<?php
require_once TEST_PATH . 'ControllerTestCase.php';

/**
 * Classe de test du modèle des requêtes prédéfinies.
 *
 * @package controllers
 */
class PredefinedRequestTest extends ControllerTestCase {

	protected $requestModel;

	/**
	 * Set up the test case.
	 *
	 * @see sources/library/Zend/Test/PHPUnit/Zend_Test_PHPUnit_ControllerTestCase::setUp()
	 */
	public function setUp() {
		parent::setUp();

		// On instancie le modèle
		$this->requestModel = new Application_Model_Website_PredefinedRequest();
	}

	/**
	 * Clean up after the test case.
	 */
	public function tearDown() {

		// Ferme les connections
		$db = $this->requestModel->getAdapter();
		$db->closeConnection();

		$this->requestModel = null;
	}

	/**
	 * Test de la fonction getPredefinedRequest().
	 * Cas nominal (suppose que le rôle ADMIN existe déjà en base).
	 */
	public function testGetPredefinedRequest() {

		// On vérifie que la requête prédéfinie "SPECIES" existe
		$speciesRequest = $this->requestModel->getPredefinedRequest('SPECIES');

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

		// On vérifie qu'il n'y a pas de requête TOTO
		$speciesRequest = $this->requestModel->getPredefinedRequest('TOTO');
		$this->assertNull($speciesRequest);
	}

	/**
	 * Test de la fonction getPredefinedRequestList().
	 */
	public function testGetPredefinedRequestList() {

		// On vérifie que la liste n'est pas vide
		$requestsList = $this->requestModel->getPredefinedRequestList();
		$this->assertNotNull($requestsList);
		$this->assertTrue(count($requestsList) > 0);
	}

	/**
	 * Test de la fonction savePredefinedRequest().
	 */
	public function testSavePredefinedRequest() {
		$nomRequete = 'TEST_REQUEST';

		// On fait un ménage préventif
		$this->requestModel->deletePredefinedRequest($nomRequete);

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
		$this->requestModel->savePredefinedRequest($requete);

		// TODO : Association d'une requête à un groupe

		// On la recharge pour vérifier
		$requete2 = $this->requestModel->getPredefinedRequest($nomRequete);

		$this->assertNotNull($requete2);
		$this->assertEquals($requete->requestName, $requete2->requestName);
		$this->assertEquals($requete->schemaCode, $requete2->schemaCode);
		$this->assertEquals($requete->datasetID, $requete2->datasetID);
		$this->assertEquals($requete->definition, $requete2->definition);
		$this->assertEquals($requete->label, $requete2->label);

		$this->assertTrue(count($requete2->resultsList) > 0);
		$this->assertTrue(count($requete2->criteriaList) > 0);

		// On fait le ménage
		$this->requestModel->deletePredefinedRequest($nomRequete);
	}
}
