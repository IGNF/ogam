<?php
require_once TEST_PATH . 'ControllerTestCase.php';

/**
 * Test class for the DataObject object.
 *
 * @package objects
 */
class DataObjectTest extends ControllerTestCase {

	/**
	 * Test de la création d'un objet DataObject.
	 */
	public function testCreate() {

		// On crée un objet query vide
		$dataObject = new Application_Object_Generic_DataObject();

		// On renseigne le format
		$tableFormat = new Application_Object_Metadata_TableFormat();
		$tableFormat->format = 'LOCATION_DATA';
		$tableFormat->schemaCode = 'RAW_DATA';
		$tableFormat->tableName = 'LOCATION';
		$dataObject->tableFormat = $tableFormat;

		// On ajoute2 champs de clé primaire
		$providerField = new Application_Object_Metadata_TableField();
		$providerField->format = 'LOCATION_DATA';
		$providerField->data = 'PROVIDER_ID';
		$dataObject->addInfoField($providerField);

		$plotField = new Application_Object_Metadata_TableField();
		$plotField->format = 'LOCATION_DATA';
		$plotField->data = 'PLOT_CODE';
		$dataObject->addInfoField($plotField);

		// On ajoute 2 colonnes de résultat
		$dataField1 = new Application_Object_Metadata_TableField();
		$dataField1->format = 'LOCATION_DATA';
		$dataField1->data = 'DEPARTEMENT';
		$dataObject->addEditableField($dataField1);

		$dataField2 = new Application_Object_Metadata_TableField();
		$dataField2->format = 'LOCATION_DATA';
		$dataField2->data = 'COMMUNES';
		$dataObject->addEditableField($dataField2);

		// On vérifie que l'objet contient bien ce qu'on lui a donné
		$this->assertEquals(2, count($dataObject->getInfoFields()));
		$this->assertEquals(2, count($dataObject->getEditableFields()));
		$this->assertEquals(4, count($dataObject->getFields()));

		$this->assertEquals(1, count($dataObject->getInfoField('LOCATION_DATA__PLOT_CODE')));
		$this->assertEquals(1, count($dataObject->getEditableField('LOCATION_DATA__DEPARTEMENT')));

		// Pas de géométrie car nous n'avons pas ajouté de champ dont le type est GEOM
		$this->assertFalse($dataObject->hasGeometry());

		// On ajoute un champ géométrie
		$dataField3 = new Application_Object_Metadata_TableField();
		$dataField3->format = 'LOCATION_DATA';
		$dataField3->data = 'THE_GEOM';
		$dataField3->type = 'GEOM';
		$dataObject->addEditableField($dataField3);

		// Maintenant il y a une géométrie
		$this->assertTrue($dataObject->hasGeometry());

		// On renseigne des valeurs pour les éléments de la clé
		$providerField->value = 'TestProvider';
		$plotField->value = '1234';

		// On vérifie l'identificant unique de la donnée
		$this->assertEquals('SCHEMA/RAW_DATA/FORMAT/LOCATION_DATA/PROVIDER_ID/TestProvider/PLOT_CODE/1234', $dataObject->getId());
	}
}
