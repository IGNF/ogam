<?php
/**
 * Licensed under EUPL v1.1 (see http://ec.europa.eu/idabc/eupl).
 *
 * © European Union, 2008-2012
 *
 * Reuse is authorised, provided the source is acknowledged. The reuse policy of the European Commission is implemented by a Decision of 12 December 2011.
 *
 * The general principle of reuse can be subject to conditions which may be specified in individual copyright notices.
 * Therefore users are advised to refer to the copyright notices of the individual websites maintained under Europa and of the individual documents.
 * Reuse is not applicable to documents subject to intellectual property rights of third parties.
 */
require_once 'AbstractOGAMController.php';

/**
 * CheckConfController is the controller that checks the environment configuration.
 *
 * @package Application_Controller
 */
class CheckconfController extends AbstractOGAMController {

	/**
	 * The models.
	 */
	private $postgreSQLModel;

	private $metadataSystemModel;

	private $metadataModel;

	/**
	 * Initialise the controler.
	 */
	public function init() {
		parent::init();

		// Set the current module name
		$websiteSession = new Zend_Session_Namespace('website');
		$websiteSession->module = "checkconf";
		$websiteSession->moduleLabel = "Check Configuration";
		$websiteSession->moduleURL = "checkconf";

		$this->postgreSQLModel = new Application_Model_Database_Postgresql();
		$this->metadataSystemModel = new Application_Model_Database_Metadata();
		$this->metadataModel = new Application_Model_Metadata_Metadata();
	}

	/**
	 * Check if the authorization is valid this controler.
	 *
	 * @throws an Exception if the user doesn't have the rights
	 */
	function preDispatch() {
		parent::preDispatch();

		$userSession = new Zend_Session_Namespace('user');
		$user = $userSession->user;
		if (empty($user) || !$user->isAllowed('CHECK_CONF')) {
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
	 * Checks the php parameters.
	 */
	function checkPhpParameters() {
		$this->logger->debug('Checking PHP parameters');

		/**
		 * Note:
		 * "post_max_size" and "upload_max_filesize" are under the PHP_INI_PERDIR mode (php.ini, htaccess or httpd.conf).
		 * The parameter must be set into the php.ini file because it's not possible in the other files when php is running under the CGI mode.
		 * So we can only check if it's done.
		 */
		$configuration = Zend_Registry::get("configuration");
		$errorMsg = $this->view->translate('Error: %value% minimum');
		$phpParameters = array();

		// Checks the post_max_size php parameters
		$postMaxSizeMin = $configuration->getConfig('post_max_size', '100M');
		$postMaxSizeMinInt = substr($postMaxSizeMin, 0, -1);
		$postMaxSize = ini_get("post_max_size");
		$postMaxSizeInt = substr($postMaxSize, 0, -1);
		$postMaxSizeMsg = array(
			'name' => 'post_max_size',
			'value' => $postMaxSize
		);

		if ($postMaxSizeMinInt !== null && $postMaxSizeInt < $postMaxSizeMinInt) {
			$postMaxSizeMsg['error'] = str_replace('%value%', $postMaxSizeMin, $errorMsg);
		}
		array_push($phpParameters, $postMaxSizeMsg);

		// Checks the upload_max_filesize php parameters
		$uploadMaxFilesizeMin = $configuration->getConfig('upload_max_filesize', '100M');
		$uploadMaxFilesizeMinInt = substr($uploadMaxFilesizeMin, 0, -1);
		$uploadMaxFilesize = ini_get("upload_max_filesize");
		$uploadMaxFilesizeInt = substr($uploadMaxFilesize, 0, -1);
		$uploadMaxFilesizeMsg = array(
			'name' => 'upload_max_filesize',
			'value' => $uploadMaxFilesize
		);
		if ($uploadMaxFilesizeMin !== null && $uploadMaxFilesizeInt < $uploadMaxFilesizeMinInt) {
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

		// Check the schemas
		$this->_checkSchemas();

		// Check if the expected tables are found
		$this->_checkTables();

		// Check if the expected fields are found
		$this->_checkFields();

		// Checks the foreign keys
		$this->_checkForeignKeys();
	}

	/**
	 * Checks the schemas.
	 */
	private function _checkSchemas() {

		// Get the list of expected schema objects
		$expectedSchemas = $this->metadataModel->getSchemas();

		$existingSchemas = $this->postgreSQLModel->getSchemas();

		$missingSchemasMsg = array();
		foreach ($expectedSchemas as $expectedSchema) {

			if (!in_array(strtoupper($expectedSchema->name), $existingSchemas)) {
				$missingSchemasMsg[] = sprintf($this->view->translate("The schema '%s' described in the metadata doesn't exist in the system."), $expectedSchema->label);
			}
		}
		$this->view->missingSchemasMsg = $missingSchemasMsg;
	}

	/**
	 * Checks the foreign keys.
	 */
	private function _checkForeignKeys() {
		$expectedFKs = $this->metadataSystemModel->getForeignKeys();

		$existingFKs = $this->postgreSQLModel->getForeignKeys();

		$missingFKsMsg = array();
		foreach ($expectedFKs as $foreignKey) {

			$id = $foreignKey->table . '__' . $foreignKey->sourceTable;

			if (!array_key_exists($id, $existingFKs)) {
				$missingFKsMsg[] = sprintf($this->view->translate("The foreign key between the table '%s' and the table '%s' described in the metadata doesn't exist in the system."), $foreignKey->table, $foreignKey->sourceTable);
			} else {
				$foundFK = $existingFKs[$id];

				//
				// Check the primary keys
				//
				$diff = array_diff($foundFK->foreignKeys, $foreignKey->foreignKeys);
				if (!empty($diff)) {
					$missingFKsMsg[] = sprintf($this->view->translate("The foreign key '%s' between the table '%s' and the table '%s' does not match the metadata definition: '%s'."), $foundFK->foreignKeys, $foreignKey->table, $foreignKey->sourceTable, $foreignKey->foreignKeys);
				}
			}
		}
		$this->view->missingFKsMsg = $missingFKsMsg;
	}

	/**
	 * Check if the expected fields are found.
	 */
	private function _checkFields() {
		$expectedFields = $this->metadataSystemModel->getFields();

		$existingFields = $this->postgreSQLModel->getFields();

		$missingFieldsMsg = array();
		$fieldTypeMsg = array();
		foreach ($expectedFields as $key => $field) {
			if (!array_key_exists($key, $existingFields)) {
				$missingFieldsMsg[] = sprintf($this->view->translate("The Expected data '%s' of the table '%s' of the schema '%s' is not found."), $field->columnName, $field->tableName, $field->schemaName);
			} else {

				//
				// Check field type
				//
				$foundField = $existingFields[$key];
				$msg = sprintf($this->view->translate("The field '%s' of the table '%s' of the schema '%s' is of type '%s' which is incompatible with the metadata definition: '%s'."), $field->columnName, $field->tableName, $field->schemaName, $foundField->type, $field->type);

				switch ($field->type) {
					case "ARRAY":
						if ($foundField->type !== 'ARRAY') {
							$fieldTypeMsg[] = $msg;
						}
						break;
					case "STRING":
						if ($foundField->type !== 'CHARACTER VARYING' && $foundField->type !== 'CHARACTER' && $foundField->type !== 'TEXT') {
							$fieldTypeMsg[] = $msg;
						}
						break;
					case "NUMERIC":
						if ($foundField->type !== 'DOUBLE PRECISION') {
							$fieldTypeMsg[] = $msg;
						}
						break;
					case "DATE":
						if ($foundField->type !== 'DATE' && $foundField->type !== 'TIMESTAMP' && $foundField->type !== 'TIMESTAMP WITHOUT TIME ZONE') {
							$fieldTypeMsg[] = $msg;
						}
						break;
					case "TIME":
							if ($foundField->type !== 'TIME' && $foundField->type !== 'TIME WITHOUT TIME ZONE') {
								$fieldTypeMsg[] = $msg;
							}
							break;
					case "CODE":
						if ($foundField->type !== 'CHARACTER VARYING' && $foundField->type !== 'CHARACTER' && $foundField->type !== 'TEXT') {
							$fieldTypeMsg[] = $msg;
						}
						break;
					case "GEOM":
						if ($foundField->type !== 'USER-DEFINED') {
							$fieldTypeMsg[] = $msg;
						}
						break;
					case "INTEGER":
						if ($foundField->type !== 'INTEGER' && $foundField->type !== 'SMALLINT') {
							$fieldTypeMsg[] = $msg;
						}
						break;
					case "BOOLEAN":
						if ($foundField->type !== 'CHARACTER') {
							$fieldTypeMsg[] = $msg;
						}
						break;
					case "IMAGE":
						if ($foundField->type !== 'CHARACTER VARYING' && $foundField->type !== 'CHARACTER' && $foundField->type !== 'TEXT') {
							$fieldTypeMsg[] = $msg;
						}
						break;
					default:
						$fieldTypeMsg[] = sprintf($this->view->translate("Unknow field type for the data '%s' of the table '%s' of the schema '%s'."), $field->columnName, $field->tableName, $field->schemaName);
				}
			}
		}
		$this->view->fieldTypeMsg = $fieldTypeMsg;
		$this->view->missingFieldsMsg = $missingFieldsMsg;
	}

	/**
	 * Check if the expected tables are found.
	 */
	private function _checkTables() {
		$expectedTables = $this->metadataSystemModel->getTables();

		$existingTables = $this->postgreSQLModel->getTables();

		$missingTablesMsg = array();
		$primaryKeysMsg = array();
		foreach ($expectedTables as $key => $table) {
			if (!array_key_exists($key, $existingTables)) {
				$missingTablesMsg[] = sprintf($this->view->translate("The expected table '%s' of the schema '%s' is not found."), $table->tableName, $table->schemaName);
			} else {
				$foundTable = $existingTables[$key];

				//
				// Check the primary keys
				//
				$diff = array_diff($foundTable->primaryKeys, $table->primaryKeys);
				if (!empty($diff)) {
					$primaryKeysMsg[] = sprintf($this->view->translate("The PK (%s) of the table '%s' is not compatible with the metadata PK (%s)."), implode(",", $foundTable->primaryKeys), $table->tableName, implode(",", $table->primaryKeys));
				}
			}
		}
		$this->view->missingTablesMsg = $missingTablesMsg;
		$this->view->primaryKeysMsg = $primaryKeysMsg;
	}
}