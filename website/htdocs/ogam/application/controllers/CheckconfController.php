<?php
/**
 * © French National Forest Inventory
 * Licensed under EUPL v1.1 (see http://ec.europa.eu/idabc/eupl).
 */
require_once 'AbstractOGAMController.php';

/**
 * CheckConfController is the controller that checks the environment configuration
 * @package controllers
 */
class CheckconfController extends AbstractOGAMController {

	/**
	 * The models.
	 */
	private $postgreSQLModel;
	private $metadataSystemModel;

	/**
	 * Initialise the controler
	 */
	public function init() {
		parent::init();

		// Set the current module name
		$websiteSession = new Zend_Session_Namespace('website');
		$websiteSession->module = "checkconf";
		$websiteSession->moduleLabel = "Check Configuration";
		$websiteSession->moduleURL = "checkconf";

		$this->postgreSQLModel = new Application_Model_System_Postgresql();
		$this->metadataSystemModel = new Application_Model_System_Metadata();
	}

	/**
	 * Check if the authorization is valid this controler.
	 */
	function preDispatch() {

		parent::preDispatch();

		$userSession = new Zend_Session_Namespace('user');
		$permissions = $userSession->permissions;
		if (empty($permissions) || !array_key_exists('CHECK_CONF', $permissions)) {
			throw new Zend_Auth_Exception('Permission denied for right : CHECK_CONF');
		}
	}

	/**
	 * The "index" action is the default action for all controllers.
	 */
	public function indexAction() {

		// Check the PHP config
		$this->checkPhpParameters();

		// Check the database
		$this->checkDatabase();
	}

	/**
	 * Checks the php parameters
	 */
	function checkPhpParameters() {

		$this->logger->debug('Checking PHP parameters');

		/**
		 * Note:
		 * "post_max_size" and "upload_max_filesize" are under the PHP_INI_PERDIR mode (php.ini, .htaccess or httpd.conf).
		 * The parameter must be set into the php.ini file because it's not possible in the other files when php is running under the CGI mode.
		 * So we can only check if it's done.
		 */
		$configuration = Zend_Registry::get("configuration");
		$errorMsg = $this->view->translate('Error: %value% minimum');
		$phpParameters = array();

		// Checks the post_max_size php parameters
		$postMaxSizeMin = $configuration->post_max_size;
		$postMaxSizeMinInt = substr($postMaxSizeMin, 0, -1);
		$postMaxSizeMinChar = substr($postMaxSizeMin, -1, 1);
		$postMaxSize = ini_get("post_max_size");
		$postMaxSizeInt = substr($postMaxSize, 0, -1);
		$postMaxSizeChar = substr($postMaxSize, -1, 1);
		$postMaxSizeMsg = array(
            'name' => 'post_max_size',
            'value' => $postMaxSize);

		if ($postMaxSizeMinInt!= null && $postMaxSizeInt < $postMaxSizeMinInt) {
			$postMaxSizeMsg['error'] = str_replace('%value%', $postMaxSizeMin, $errorMsg);
		}
		array_push($phpParameters, $postMaxSizeMsg);

		// Checks the upload_max_filesize php parameters
		$uploadMaxFilesizeMin = $configuration->upload_max_filesize;
		$uploadMaxFilesizeMinInt = substr($uploadMaxFilesizeMin, 0, -1);
		$uploadMaxFilesizeMinChar = substr($uploadMaxFilesizeMin, -1, 1);
		$uploadMaxFilesize = ini_get("upload_max_filesize");
		$uploadMaxFilesizeInt = substr($uploadMaxFilesize, 0, -1);
		$uploadMaxFilesizeChar = substr($uploadMaxFilesize, -1, 1);
		$uploadMaxFilesizeMsg = array(
            'name' => 'upload_max_filesize',
            'value' => $uploadMaxFilesize);
		if ($uploadMaxFilesizeMin != null && $uploadMaxFilesizeInt < $uploadMaxFilesizeMinInt) {
			$uploadMaxFilesizeMsg['error'] = str_replace('%value%', $uploadMaxFilesizeMin, $errorMsg);
		}
		array_push($phpParameters, $uploadMaxFilesizeMsg);

		// Add the parameters to the view
		$this->view->phpParameters = $phpParameters;
	}


	/**
	 * Checks the database access.
	 */
	function checkDatabase() {

		$this->logger->debug('Checking database');

		//
		// Check if the expected tables are found
		//

		$expectedTables = $this->metadataSystemModel->getTables();

		$existingTables = $this->postgreSQLModel->getTables();

		$missingTablesMsg = array();
		$primaryKeysMsg = array();
		foreach ($expectedTables as $key => $table) {
			if (!array_key_exists($key,$existingTables)) {
				$missingTablesMsg[] = 'Expected table '.$table->tableName.' of schema '.$table->schemaName.' is not found';
			} else {
				$foundTable = $existingTables[$key];

				//
				//  Check the primary keys
				//
				$diff = array_diff($foundTable->primaryKeys, $table->primaryKeys);
				if (!empty($diff)) {
					$primaryKeysMsg[] = 'PK '.$foundTable->primaryKeys.' not compatible with metadata PK '.$table->primaryKeys;
				}

			}
		}
		$this->view->missingTablesMsg = $missingTablesMsg;
		$this->view->primaryKeysMsg = $primaryKeysMsg;


		//
		// Check if the expected fields are found
		//

		$expectedFields = $this->metadataSystemModel->getFields();

		$existingFields = $this->postgreSQLModel->getFields();

		$missingFieldsMsg = array();
		$fieldTypeMsg = array();
		foreach ($expectedFields as $key => $field) {
			if (!array_key_exists($key,$existingFields)) {
				$missingFieldsMsg[] = 'Expected data '.$field->columnName.' for table '.$field->tableName.' of schema '.$field->schemaName.' is not found';
			} else {

				//
				// Check field type
				//
				$foundField = $existingFields[$key];

				switch ($field->type) {
					case "ARRAY":
						if ($foundField->type != 'ARRAY') {
							$fieldTypeMsg[] = "The field ".$field->columnName.' for table '.$field->tableName.' of schema '.$field->schemaName.' is of type '.$foundField->type.' which is incompatible with the metadata definition '.$field->type;
						}
						break;
					case "STRING":
						if ($foundField->type != 'CHARACTER VARYING' && $foundField->type != 'CHARACTER' && $foundField->type != 'TEXT') {
							$fieldTypeMsg[] = "The field ".$field->columnName.' for table '.$field->tableName.' of schema '.$field->schemaName.' is of type '.$foundField->type.' which is incompatible with the metadata definition '.$field->type;
						}
						break;
					case "NUMERIC":
						if ($foundField->type != 'DOUBLE PRECISION') {
							$fieldTypeMsg[] = "The field ".$field->columnName.' for table '.$field->tableName.' of schema '.$field->schemaName.' is of type '.$foundField->type.' which is incompatible with the metadata definition '.$field->type;
						}
						break;
					case "DATE":
						if ($foundField->type != 'DATE' && $foundField->type != 'TIMESTAMP') {
							$fieldTypeMsg[] = "The field ".$field->columnName.' for table '.$field->tableName.' of schema '.$field->schemaName.' is of type '.$foundField->type.' which is incompatible with the metadata definition '.$field->type;
						}
						break;
					case "CODE":
						if ($foundField->type != 'CHARACTER VARYING' && $foundField->type != 'CHARACTER' && $foundField->type != 'TEXT') {
							$fieldTypeMsg[] = "The field ".$field->columnName.' for table '.$field->tableName.' of schema '.$field->schemaName.' is of type '.$foundField->type.' which is incompatible with the metadata definition '.$field->type;
						}
						break;
					case "GEOM":
						if ($foundField->type != 'USER-DEFINED') {
							$fieldTypeMsg[] = "The field ".$field->columnName.' for table '.$field->tableName.' of schema '.$field->schemaName.' is of type '.$foundField->type.' which is incompatible with the metadata definition '.$field->type;
						}
						break;
					case "INTEGER":
						if ($foundField->type != 'INTEGER') {
							$fieldTypeMsg[] = "The field ".$field->columnName.' for table '.$field->tableName.' of schema '.$field->schemaName.' is of type '.$foundField->type.' which is incompatible with the metadata definition '.$field->type;
						}
						break;
					case "BOOLEAN":
						if ($foundField->type != 'CHARACTER') {
							$fieldTypeMsg[] = "The field ".$field->columnName.' for table '.$field->tableName.' of schema '.$field->schemaName.' is of type '.$foundField->type.' which is incompatible with the metadata definition '.$field->type;
						}
						break;
					default:
						$fieldTypeMsg[] = "Unknow field type for data ".$field->columnName.' for table '.$field->tableName.' of schema '.$field->schemaName;
				}
					

			}
		}
		$this->view->fieldTypeMsg = $fieldTypeMsg;
		$this->view->missingFieldsMsg = $missingFieldsMsg;

	}
}