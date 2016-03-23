<?php
require_once TEST_PATH . 'ControllerTestCase.php';

/**
 * Classe de test du modèle Generic.
 *
 * @package controllers
 */
class GenericTest extends ControllerTestCase {

	protected $genericModel;

	/**
	 * Set up the test case.
	 *
	 * @see sources/library/Zend/Test/PHPUnit/Zend_Test_PHPUnit_ControllerTestCase::setUp()
	 */
	public function setUp() {
		parent::setUp();

		// On instancie le service
		$this->genericModel = new Application_Model_Generic_Generic();
	}

	/**
	 * Clean up after the test case.
	 */
	public function tearDown() {

		// Ferme les connections
		$db = $this->genericModel->getAdapter();
		$db->closeConnection();

		$this->genericModel = null;
	}

	/**
	 * Test "executeRequest".
	 * Cas nominal.
	 */
	public function testExecuteRequest() {

		// On récupère le centre pour le fournisseur "1"
		$result = $this->genericModel->executeRequest('SELECT 1 as count');

		$this->assertNotNull($result);

		// echo "Result : " . print_r($result, true);

		$this->assertTrue($result[0]['count'] === 1);
	}

	/**
	 * Test des fonctions génériques d'accès à une donnée.
	 * Création, lecture, mise à jour et effacement d'une donnée dans une table.
	 */
	public function testCRUDDatum() {

		// On charge le service de manipulation des objets génériques
		$genericService = new Application_Service_GenericService();

		// On récupère un objet générique correspondant une ligne vide de la table PLOT_DATA
		$data = $genericService->buildDataObject('RAW_DATA', 'PLOT_DATA');

		// echo "Result : " . print_r($data, true);

		$this->assertNotNull($data);

		// On renseigne les champs identifiant une ligne de la table avec des valeurs.
		$pkFields = $data->infoFields;
		$pkFields['PLOT_DATA__PROVIDER_ID']->value = '1';
		$pkFields['PLOT_DATA__PLOT_CODE']->value = '01575-14060-4-0TD';
		$pkFields['PLOT_DATA__CYCLE']->value = '5';

		// On récupère maintenant le reste des valeurs correspondant à cette ligne
		$filledData = $this->genericModel->getDatum($data);

		// echo "Result : " . print_r($filledData, true);

		// On vérifie que l'objet a bien été complété avec des valeurs
		$this->assertNotNull($filledData);
		$this->assertEquals($filledData->getEditableField('PLOT_DATA__INV_DATE')->value, '2015/01/18');
		$this->assertEquals($filledData->getEditableField('PLOT_DATA__IS_FOREST_PLOT')->value, '1');

		// On modifie la clé identifiant l'objet
		$newData = clone $filledData;
		$newData->getInfoField('PLOT_DATA__CYCLE')->value = '1';

		// Et on l'enregistre en base, créant ainsi un nouvel objet 'plot_data' sur la même localisation.
		$this->genericModel->insertData($newData);

		// Lecture pour vérifier que ça a fonctionné
		$newData2 = $this->genericModel->getDatum($newData);
		$this->assertNotNull($newData2);

		// On met à jour l'objet en base
		$newData2->getEditableField('PLOT_DATA__INV_DATE')->value = '2015/05/29';
		$newData2->getEditableField('PLOT_DATA__IS_FOREST_PLOT')->value = '0';
		$this->genericModel->updateData($newData2);

		// Lecture pour vérifier que ça a fonctionné
		$newData3 = $this->genericModel->getDatum($newData2);
		$this->assertNotNull($newData3);
		$this->assertEquals($newData3->getEditableField('PLOT_DATA__INV_DATE')->value, '2015/05/29');
		$this->assertEquals($newData3->getEditableField('PLOT_DATA__IS_FOREST_PLOT')->value, '0');

		// Ménage : On supprime en base l'objet que l'on viens de créer
		$this->genericModel->deleteData($newData3);
	}

	/**
	 * Test de la fonction de récupération des parents d'un objet.
	 */
	public function testAncestors() {

		// On charge le service de manipulation des objets génériques
		$genericService = new Application_Service_GenericService();

		// On récupère un objet générique correspondant une ligne vide de la table PLOT_DATA
		$data = $genericService->buildDataObject('RAW_DATA', 'PLOT_DATA');

		$this->assertNotNull($data);

		// On renseigne les champs identifiant une ligne de la table avec des valeurs.
		$pkFields = $data->infoFields;
		$pkFields['PLOT_DATA__PROVIDER_ID']->value = '1';
		$pkFields['PLOT_DATA__PLOT_CODE']->value = '01575-14060-4-0T';
		$pkFields['PLOT_DATA__CYCLE']->value = '5';

		// On récupère maintenant le reste des valeurs correspondant à cette ligne
		$filledData = $this->genericModel->getDatum($data);

		// On récupère les ancêtres de l'objet en question
		// Normalement, pour notre point on doit récupérer une localisation
		$ancestors = $this->genericModel->getAncestors($filledData);

		$this->assertNotNull($ancestors);
		$ancestor = $ancestors[0];

		$this->assertEquals($ancestor->tableFormat->tableName, 'LOCATION');
		$this->assertEquals($ancestor->getInfoField('LOCATION_DATA__PLOT_CODE')->value, '01575-14060-4-0T');

		// echo "Result : " . print_r($ancestor, true);
	}

	/**
	 * Test de la fonction de récupération des enfants d'un objet.
	 */
	public function testGetChildren() {

		// On charge le service de manipulation des objets génériques
		$genericService = new Application_Service_GenericService();

		// On récupère un objet générique correspondant une ligne vide de la table PLOT_DATA
		$data = $genericService->buildDataObject('RAW_DATA', 'PLOT_DATA');

		$this->assertNotNull($data);

		// On renseigne les champs identifiant une ligne de la table avec des valeurs.
		$pkFields = $data->infoFields;
		$pkFields['PLOT_DATA__PROVIDER_ID']->value = '1';
		$pkFields['PLOT_DATA__PLOT_CODE']->value = '01575-14060-4-0TD';
		$pkFields['PLOT_DATA__CYCLE']->value = '5';

		// On récupère maintenant le reste des valeurs correspondant à cette ligne
		$filledData = $this->genericModel->getDatum($data);

		// On récupère les ancêtres de l'objet en question
		// Normalement, pour notre point on doit récupérer une localisation
		$children = $this->genericModel->getChildren($filledData, 'SPECIES');

		// echo "Result : " . print_r($children, true);

		$this->assertNotNull($children);

		$species = $children['SPECIES_DATA'];

		// Le point en question possède une observation d'espèce
		$this->assertNotNull($species);

		$specie = $species[0];

		$this->assertNotNull($specie);
	}
}

