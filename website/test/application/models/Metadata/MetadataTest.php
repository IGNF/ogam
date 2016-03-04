<?php
require_once TEST_PATH . 'ControllerTestCase.php';

/**
 * Classe de test du modèle Metadata.
 *
 * Warning : These tests are closely related to the example data available for OGAM.
 *
 * @package controllers
 */
class MetadataTest extends ControllerTestCase {

	protected $metadataModel;

	/**
	 * Set up the test case.
	 *
	 * @see sources/library/Zend/Test/PHPUnit/Zend_Test_PHPUnit_ControllerTestCase::setUp()
	 */
	public function setUp() {
		parent::setUp();

		// On instancie le service
		$this->metadataModel = new Application_Model_Metadata_Metadata();
	}

	/**
	 * Clean up after the test case.
	 */
	public function tearDown() {

		// Ferme les connections
		$db = $this->metadataModel->getAdapter();
		$db->closeConnection();

		$this->metadataModel = null;
	}

	/**
	 * Test la fonction getSchemas.
	 */
	public function testGetSchemas() {

		// On vérifie que le user "admin" existe
		$schemas = $this->metadataModel->getSchemas();

		// On vérifie que l'on a ramené la bonne modalité
		$this->assertEquals(count($schemas), 2);

		$rawSchema = $schemas['RAW_DATA'];
		$this->assertEquals($rawSchema->code, 'RAW_DATA');
		$this->assertEquals($rawSchema->name, 'RAW_DATA');
		$this->assertEquals($rawSchema->label, 'Raw Data');
		$this->assertEquals($rawSchema->description, 'Contains raw data');
	}

	/**
	 * Test la fonction getModeLabels.
	 */
	public function testGetModeLabels() {

		// On récupère la liste des esp^èces
		$modes = $this->metadataModel->getModeLabels('SPECIES_CODE');

		// On vérifie que l'on a ramené la bonne modalité
		$this->assertEquals(count($modes), 303);

		// On filtre sur un code
		$modes = $this->metadataModel->getModeLabels('SPECIES_CODE', '999');

		// On vérifie que l'on a ramené la bonne modalité
		$this->assertEquals(count($modes), 1);
		$this->assertEquals($modes['999'], 'Other broadleaves');

		// On filtre sur une liste de codes
		$modes = $this->metadataModel->getModeLabels('SPECIES_CODE', array(
			'999',
			'998'
		));

		// On vérifie que l'on a ramené la bonne modalité
		$this->assertEquals(count($modes), 2);
		$this->assertEquals($modes['999'], 'Other broadleaves');
		$this->assertEquals($modes['998'], 'Other conifers');

		// On filtre sur un libellé
		$modes = $this->metadataModel->getModeLabels('SPECIES_CODE', null, 'Acacia');

		// On vérifie que l'on a ramené la bonne modalité
		$this->assertEquals(count($modes), 11);
	}

	/**
	 * Test la fonction getMode.
	 */
	public function testGetMode() {

		// On vérifie que le user "admin" existe
		$modeLabel = $this->metadataModel->getMode('PROVIDER_ID', '1');

		// On vérifie que l'on a ramené la bonne modalité
		$this->assertEquals($modeLabel, 'France');
	}

	/**
	 * Test la fonction getTreeLabels.
	 */
	public function testGetTreeLabels() {
		$taxons = $this->metadataModel->getTreeLabels('CORINE_BIOTOPE');

		// On vérifie que l'on a ramené le bon compte de modalités
		$this->assertEquals(count($taxons), 1509);
	}

	/**
	 * Test la fonction getDynamodeLabels.
	 */
	public function testGetDynamodeLabels() {
		$departements = $this->metadataModel->getDynamodeLabels('DEPARTEMENT');

		// On vérifie que l'on a ramené le bon compte de modalités
		$this->assertEquals(count($departements), 97);

		// Test avec un bout de libellé
		$departements = $this->metadataModel->getDynamodeLabels('DEPARTEMENT', '45');

		// On vérifie que l'on a ramené le bon compte de modalités
		$this->assertEquals(count($departements), 1);

		// Test avec un code
		$departements = $this->metadataModel->getDynamodeLabels('DEPARTEMENT', null, 'LOIR');

		// On vérifie que l'on a ramené le bon compte de modalités
		$this->assertEquals(count($departements), 4);
	}

	/**
	 * Test la fonction getTreeModes.
	 */
	public function testGetTreeChildren() {

		// Requête par défaut, on ramène le noeud racine avec 1 niveau de descendants
		$taxonsTree = $this->metadataModel->getTreeChildren('CORINE_BIOTOPE');
		$this->assertEquals(count($taxonsTree->children), 7); // Il doit y avoir 7 enfants
		$taxon = $taxonsTree->children[0];
		$this->assertEquals($taxon->code, 1); // le noeud sous la racine est 1 : Habitats littoraux et halophiles
		$this->assertEquals($taxon->label, 'Habitats littoraux et halophiles');

		// Idem
		$taxonsTree = $this->metadataModel->getTreeChildren('CORINE_BIOTOPE', '*');
		$this->assertEquals(count($taxonsTree->children), 7); // Il doit y avoir 7 enfants

		// Idem
		$taxonsTree = $this->metadataModel->getTreeChildren('CORINE_BIOTOPE', '*', 1);
		$this->assertEquals(count($taxonsTree->children), 7);

		// 1 niveau à partir de Fauna
		$taxonsTree = $this->metadataModel->getTreeChildren('CORINE_BIOTOPE', '4', 1);
		$this->assertEquals(count($taxonsTree->children), 5); // Il y a 10 enfants à Fauna

		// 2 niveaux à partir de la racine
		$taxonsTree = $this->metadataModel->getTreeChildren('CORINE_BIOTOPE', '*', 2);
		$this->assertEquals(count($taxonsTree->children), 7);
	}

	/**
	 * Test la fonction getTreeChildrenCodes.
	 */
	public function testGetTreeChildrenCodes() {

		// Réquête par défaut, on ramène le noeud racine sur 1 niveau
		$taxons = $this->metadataModel->getTreeChildrenCodes('CORINE_BIOTOPE', '1');
		$this->assertEquals(count($taxons), 1);

		// Idem
		$taxons = $this->metadataModel->getTreeChildrenCodes('CORINE_BIOTOPE', '1', 1);
		$this->assertEquals(count($taxons), 1);

		// Sur 2 niveaux
		$taxons = $this->metadataModel->getTreeChildrenCodes('CORINE_BIOTOPE', '1', 2);
		$this->assertEquals(count($taxons), 10); // on doit trouver 10 codes

		// Un noeud fils
		$taxons = $this->metadataModel->getTreeChildrenCodes('CORINE_BIOTOPE', '41.1312', 1);
		$this->assertEquals(count($taxons), 1);

		// Un noeud avec des enfants
		$taxons = $this->metadataModel->getTreeChildrenCodes('CORINE_BIOTOPE', '41.11', 2);
		$this->assertEquals(count($taxons), 3);
	}

	/**
	 * Test la fonction getTreeModes.
	 */
	public function testGetTreeModes() {

		// Réquête par défaut, on ramène le noeud racine sur 1 niveau
		$modes = $this->metadataModel->getTreeModes('CORINE_BIOTOPE', 'Forêts');
		$count = $this->metadataModel->getTreeModesCount('CORINE_BIOTOPE', 'Forêts');

		$this->assertEquals(count($modes), 156);
		$this->assertEquals($count, 156);

		$this->assertEquals($modes["41"], "Forêts caducifoliées");
	}

	/**
	 * Test la fonction getRequestedFiles.
	 */
	public function testGetRequestedFiles() {
		$datasets = $this->metadataModel->getRequestedFiles('SPECIES');

		// On vérifie que l'on a ramené le bon compte de modalités
		$this->assertEquals(count($datasets), 3);

		// Les fichiers attendus sont ordonnés
		$this->assertEquals($datasets[0]->format, 'LOCATION_FILE');
		$this->assertEquals($datasets[1]->format, 'PLOT_FILE');
		$this->assertEquals($datasets[2]->format, 'SPECIES_FILE');
	}

	/**
	 * Test la fonction getFileFields.
	 */
	public function testGetFileFields() {
		$fields = $this->metadataModel->getFileFields('LOCATION_FILE');

		// On vérifie que l'on a ramené le bon compte de modalités
		$this->assertEquals(count($fields), 4);

		// Les données attendues sont ordonnées
		$this->assertEquals($fields[0]->data, 'PLOT_CODE');
		$this->assertEquals($fields[1]->data, 'LATITUDE');
		$this->assertEquals($fields[2]->data, 'LONGITUDE');
		$this->assertEquals($fields[3]->data, 'COMMENT');
	}

	/**
	 * Test la fonction getTableFields.
	 */
	public function testGetTableFields() {
		$fields = $this->metadataModel->getTableFields('RAW_DATA', 'LOCATION_DATA');

		// On vérifie que l'on a ramené le bon compte de modalités
		$this->assertEquals(count($fields), 10);

		// Les données attendues sont ordonnées
		$this->assertEquals($fields['SUBMISSION_ID']->data, 'SUBMISSION_ID');
		$this->assertEquals($fields['PROVIDER_ID']->data, 'PROVIDER_ID');
		$this->assertEquals($fields['PLOT_CODE']->data, 'PLOT_CODE');
		$this->assertEquals($fields['LATITUDE']->data, 'LATITUDE');
		$this->assertEquals($fields['LONGITUDE']->data, 'LONGITUDE');
		$this->assertEquals($fields['COMMUNES']->data, 'COMMUNES');
		$this->assertEquals($fields['DEPARTEMENT']->data, 'DEPARTEMENT');
		$this->assertEquals($fields['COMMENT']->data, 'COMMENT');
		$this->assertEquals($fields['THE_GEOM']->data, 'THE_GEOM');
		$this->assertEquals($fields['LINE_NUMBER']->data, 'LINE_NUMBER');

		//
		// Same thing but filter with a dataset specified
		//
		$fields = $this->metadataModel->getTableFields('RAW_DATA', 'LOCATION_DATA', 'SPECIES');

		// On vérifie que l'on a ramené le bon compte de modalités
		$this->assertEquals(count($fields), 10);

		// Les données attendues sont ordonnées
		$this->assertEquals($fields['SUBMISSION_ID']->data, 'SUBMISSION_ID');
		$this->assertEquals($fields['PROVIDER_ID']->data, 'PROVIDER_ID');
		$this->assertEquals($fields['PLOT_CODE']->data, 'PLOT_CODE');
		$this->assertEquals($fields['LATITUDE']->data, 'LATITUDE');
		$this->assertEquals($fields['LONGITUDE']->data, 'LONGITUDE');
		$this->assertEquals($fields['COMMUNES']->data, 'COMMUNES');
		$this->assertEquals($fields['DEPARTEMENT']->data, 'DEPARTEMENT');
		$this->assertEquals($fields['COMMENT']->data, 'COMMENT');
		$this->assertEquals($fields['THE_GEOM']->data, 'THE_GEOM');
		$this->assertEquals($fields['LINE_NUMBER']->data, 'LINE_NUMBER');
	}

	/**
	 * Test la fonction getTableFormat.
	 */
	public function testGetTableFormat() {
		$tableFormat = $this->metadataModel->getTableFormat('RAW_DATA', 'LOCATION_DATA');

		//
		$this->assertEquals($tableFormat->tableName, 'LOCATION');
		$this->assertEquals($tableFormat->label, 'Location');
		$this->assertEquals(count($tableFormat->primaryKeys), 2); // 2 colonnes dans la PK
	}

	/**
	 * Test la fonction getForms.
	 */
	public function testGetForms() {
		$forms = $this->metadataModel->getForms('SPECIES', 'RAW_DATA');

		$this->assertEquals(count($forms), 3);

		// Les données attendues sont ordonnées
		$this->assertEquals($forms[0]->format, 'LOCATION_FORM');
		$this->assertEquals($forms[1]->format, 'PLOT_FORM');
		$this->assertEquals($forms[2]->format, 'SPECIES_FORM');
	}

	/**
	 * Test la fonction getFormFields.
	 */
	public function testGetFormFields() {

		//
		// Get the result fields available for the form 'plot'
		//
		$formFields = $this->metadataModel->getFormFields('SPECIES', 'PLOT_FORM', 'RAW_DATA', 'result');

		$this->assertEquals(count($formFields), 7);

		// Les données attendues sont ordonnées
		$this->assertEquals($formFields[0]->data, 'PROVIDER_ID');
		$this->assertEquals($formFields[1]->data, 'PLOT_CODE');
		$this->assertEquals($formFields[2]->data, 'CYCLE');
		$this->assertEquals($formFields[3]->data, 'INV_DATE');
		$this->assertEquals($formFields[4]->data, 'IS_FOREST_PLOT');
		$this->assertEquals($formFields[5]->data, 'CORINE_BIOTOPE');
		$this->assertEquals($formFields[6]->data, 'COMMENT');

		//
		// Same thing for the criterias
		//
		$formFields = $this->metadataModel->getFormFields('SPECIES', 'PLOT_FORM', 'RAW_DATA', 'criteria');

		$this->assertEquals(count($formFields), 6);

		// Les données attendues sont ordonnées
		$this->assertEquals($formFields[0]->data, 'PROVIDER_ID');
		$this->assertEquals($formFields[1]->data, 'PLOT_CODE');
		$this->assertEquals($formFields[2]->data, 'CYCLE');
		$this->assertEquals($formFields[3]->data, 'INV_DATE');
		$this->assertEquals($formFields[4]->data, 'IS_FOREST_PLOT');
		$this->assertEquals($formFields[5]->data, 'CORINE_BIOTOPE');
	}

	/**
	 * Test la fonction getFormField.
	 */
	public function testGetFormField() {
		$formField = $this->metadataModel->getFormField('PLOT_FORM', 'IS_FOREST_PLOT');

		// Les données attendues sont ordonnées
		$this->assertEquals($formField->label, 'Is a forest plot');
		$this->assertEquals($formField->type, 'BOOLEAN');
	}

	/**
	 * Test la fonction getRange.
	 */
	public function testGetRange() {
		$range = $this->metadataModel->getRange('PERCENTAGE');

		// Les données attendues sont ordonnées
		$this->assertEquals($range->min, 0);
		$this->assertEquals($range->max, 100);
	}

	/**
	 * Test la fonction getFormToTableMapping.
	 */
	public function testGetFormToTableMapping() {

		// first we get a form field
		$formField = $this->metadataModel->getFormField('PLOT_FORM', 'IS_FOREST_PLOT');

		// then we get the corresponding table field
		$tableField = $this->metadataModel->getFormToTableMapping('RAW_DATA', $formField);

		// $this->logger->debug('testGetFormToTableMapping : '.print_r($tableField,true));

		// Les données attendues sont ordonnées
		$this->assertEquals($tableField->columnName, 'IS_FOREST_PLOT');
	}

	/**
	 * Test la fonction getTableToFormMapping.
	 */
	public function testGetTableToFormMapping() {

		// first we get a form field
		$formField = $this->metadataModel->getFormField('PLOT_FORM', 'IS_FOREST_PLOT');

		// then we get the corresponding table field
		$tableField = $this->metadataModel->getFormToTableMapping('RAW_DATA', $formField);

		// then we get back the form field
		$formField2 = $this->metadataModel->getTableToFormMapping($tableField);

		// Les données attendues sont ordonnées
		$this->assertEquals($formField, $formField2);
	}

	/**
	 * Test la fonction getTablesTree.
	 */
	public function testGetTablesTree() {
		$tablesTree = $this->metadataModel->getTablesTree('SPECIES_DATA', 'RAW_DATA');

		$this->assertEquals(count($tablesTree), 3);

		// Les données attendues sont ordonnées
		$this->assertEquals($tablesTree[0]->tableFormat, 'SPECIES_DATA');
		$this->assertEquals($tablesTree[1]->tableFormat, 'PLOT_DATA');
		$this->assertEquals($tablesTree[2]->tableFormat, 'LOCATION_DATA');
	}

	/**
	 * Test la fonction getChildrenTableLabels.
	 */
	public function testGetChildrenTableLabels() {

		// First we get a table format
		$tableFormat = $this->metadataModel->getTableFormat('RAW_DATA', 'PLOT_DATA');

		// Then we get the available children
		$childTables = $this->metadataModel->getChildrenTableLabels($tableFormat);

		$this->assertEquals(count($childTables), 2);

		// Les données attendues sont ordonnées
		$this->assertEquals('Species Data', $childTables['SPECIES_DATA']);
		$this->assertEquals('Tree data', $childTables['TREE_DATA']);
	}

	/**
	 * Test la fonction getGeometryField.
	 */
	public function testGetGeometryField() {

		// The list of tables where to search
		$tables = array(
			'LOCATION_DATA',
			'PLOT_DATA',
			'TREE_DATA'
		);

		// We search for the geometry column
		$geometryField = $this->metadataModel->getGeometryField('RAW_DATA', $tables);

		$this->assertNotNull($geometryField);

		// We should find one in the location table
		$this->assertEquals('THE_GEOM', $geometryField->columnName);
		$this->assertEquals('TREE_DATA', $geometryField->format);
		$this->assertEquals('GEOM', $geometryField->type);
	}

	/**
	 * Test la fonction getDatasetsForDisplay.
	 */
	public function testGetDatasetsForDisplay() {

		// We search for the geometry column
		$datasets = $this->metadataModel->getDatasetsForDisplay();

		$this->assertNotNull($datasets);
		$this->assertEquals(2, count($datasets));

		$dataSetSpecies = $datasets['SPECIES'];

		$this->assertNotNull($dataSetSpecies);
		$this->assertEquals('SPECIES', $dataSetSpecies->id);
	}

	/**
	 * Test la fonction getDatasetsForUpload.
	 */
	public function testGetDatasetsForUpload() {

		// We search for the geometry column
		$datasets = $this->metadataModel->getDatasetsForUpload();

		$this->assertNotNull($datasets);
		$this->assertEquals(2, count($datasets));

		$dataSetSpecies = $datasets['SPECIES'];

		$this->assertNotNull($dataSetSpecies);
		$this->assertEquals('SPECIES', $dataSetSpecies->id);
	}

	/**
	 * Test de la fonction getTaxrefChildren.
	 *
	 * Cas null.
	 */
	public function testGetTaxrefChildrenNull() {

		// then we get the corresponding table field
		$tree = $this->metadataModel->getTaxrefChildren('TOTO', 'NODE', 1);

		$this->assertNull($tree);
	}

	/**
	 * Test de la fonction getTaxrefChildren.
	 *
	 * Cas nominal.
	 */
	public function testGetTaxrefChildren() {

		// On cherche les enfants au rang 2 de 'Plantae'
		$tree = $this->metadataModel->getTaxrefChildren('ID_TAXON', '187079', 2);

		// Ne doit pas être null
		$this->assertNotNull($tree);

		// Il doit y avoir des enfants
		$this->assertFalse(empty($tree->children));

		// On cherche un des enfants en particulier
		$item0 = $tree->getNode('187557');
		$this->assertEquals('Bacillariophyta', $item0->name);
	}

	/**
	 * Test de la fonction getTaxrefChildrenCodes.
	 */
	public function testGetTaxrefChildrenCodes() {

		// On cherche les enfants au rang 2 de 'Plantae'
		$codes = $this->metadataModel->getTaxrefChildrenCodes('ID_TAXON', '187079', 2);

		// Ne doit pas être null
		$this->assertNotNull($codes);

		// Il doit y avoir des enfants
		$this->assertTrue(is_array($codes));
		$this->assertTrue(in_array('187557', $codes));
	}

	/**
	 * Test de la fonction getTaxrefLabels.
	 */
	public function testGetTaxrefLabels() {

		// On cherche les enfants au rang 2 de 'Plantae'
		$labels = $this->metadataModel->getTaxrefLabels('ID_TAXON', '187079');

		// Ne doit pas être null
		$this->assertNotNull($labels);

		// Il doit y avoir des enfants
		$this->assertTrue(is_array($labels));
		$this->assertTrue(in_array('Plantae', $labels));
	}

	/**
	 * Test de la fonction getTaxrefModes.
	 */
	public function testGetTaxrefModes() {

		// On cherche les enfants au rang 2 de 'Plantae'
		$modes = $this->metadataModel->getTaxrefModes('ID_TAXON', 'Planta', 0, 50);

		// Ne doit pas être null
		$this->assertNotNull($modes);

		$this->assertTrue(is_array($modes));
		$this->assertEquals(50, count($modes));
	}

	/**
	 * Test de la fonction getTaxrefModesCount.
	 */
	public function testGetTaxrefModesCount() {

		// On cherche les enfants au rang 2 de 'Plantae'
		$count = $this->metadataModel->getTaxrefModesCount('ID_TAXON', 'Planta');

		$this->assertEquals(528, $count);
	}
}
