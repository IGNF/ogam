<?php
namespace OGAMBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Component\HttpFoundation\Request;

class CheckconfController extends Controller {

	/**
	 * Default action.
	 *
	 * @Route("checkconf/")
	 */
	public function indexAction(Request $request) {
		// Display the default
		return $this->showCheckConfiguration($request);
	}

	/**
	 * Logout.
	 *
	 * @Route("checkconf/showCheckConf")
	 */
	public function showCheckConfAction() {

		// Check the PHP config
		$phpParameters = $this->checkPhpParameters();

		// Check the database
		// $this->checkDatabase();

		return $this->render('OGAMBundle:Checkconf:show_checkconf.html.twig', array(
				'phpParameters' => $phpParameters
			)
		);
	}

	/**
	 * Checks the php parameters.
	 */
	function checkPhpParameters() {
		$logger = $this->get('logger');
		$logger->debug('Checking PHP parameters');

		// Get the configuration manager service
		$configManager = $this->get('ogam.configurationmanager');

		// Get the translator service
		$translator = $this->get('translator');

		/**
		 * Note:
		 * "post_max_size" and "upload_max_filesize" are under the PHP_INI_PERDIR mode (php.ini, htaccess or httpd.conf).
		 * The parameter must be set into the php.ini file because it's not possible in the other files when php is running under the CGI mode.
		 * So we can only check if it's done.
		 */
		$errorMsg = $translator->trans('Error: %value% minimum');
		$phpParameters = array();

		// Checks the post_max_size php parameters
		$postMaxSizeMin = $configManager->getConfig('post_max_size', '100M');
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
		$uploadMaxFilesizeMin = $configManager->getConfig('upload_max_filesize', '100M');
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

		return $phpParameters;
	}

	/**
	 * Checks the database access.
	 */
	function checkDatabase() {
		$logger = $this->get('logger');
		$logger->debug('Checking database');

		// Check the schemas
		$this->checkSchemas();

		// Check if the expected tables are found
		$this->checkTables();

		// Check if the expected fields are found
		$this->checkFields();

		// Checks the foreign keys
		$this->checkForeignKeys();
	}

	/**
	 * Checks the schemas.
	 */
	protected function checkSchemas() {

		// Get the translator service
		$translator = $this->get('translator');

		// Get the list of expected schema objects
		$expectedSchemas = $this->metadataModel->getSchemas();

		$existingSchemas = $this->postgreSQLModel->getSchemas();

		$missingSchemasMsg = array();
		foreach ($expectedSchemas as $expectedSchema) {

			if (!in_array(strtoupper($expectedSchema->name), $existingSchemas)) {
				$missingSchemasMsg[] = sprintf($translator->trans("The schema '%s' described in the metadata doesn't exist in the system."), $expectedSchema->label);
			}
		}
		$this->view->missingSchemasMsg = $missingSchemasMsg;
	}

	/**
	 * Checks the foreign keys.
	 */
	protected function checkForeignKeys() {

		// Get the translator service
		$translator = $this->get('translator');

		$expectedFKs = $this->metadataSystemModel->getForeignKeys();

		$existingFKs = $this->postgreSQLModel->getForeignKeys();

		$missingFKsMsg = array();
		foreach ($expectedFKs as $foreignKey) {

			$id = $foreignKey->table . '__' . $foreignKey->sourceTable;

			if (!array_key_exists($id, $existingFKs)) {
				$missingFKsMsg[] = sprintf($translator->trans("The foreign key between the table '%s' and the table '%s' described in the metadata doesn't exist in the system."), $foreignKey->table, $foreignKey->sourceTable);
			} else {
				$foundFK = $existingFKs[$id];

				//
				// Check the primary keys
				//
				$diff = array_diff($foundFK->foreignKeys, $foreignKey->foreignKeys);
				if (!empty($diff)) {
					$missingFKsMsg[] = sprintf($translator->trans("The foreign key '%s' between the table '%s' and the table '%s' does not match the metadata definition: '%s'."), $foundFK->foreignKeys, $foreignKey->table, $foreignKey->sourceTable, $foreignKey->foreignKeys);
				}
			}
		}
		$this->view->missingFKsMsg = $missingFKsMsg;
	}

	/**
	 * Check if the expected fields are found.
	 */
	protected function checkFields() {

		// Get the translator service
		$translator = $this->get('translator');

		$expectedFields = $this->metadataSystemModel->getFields();

		$existingFields = $this->postgreSQLModel->getFields();

		$missingFieldsMsg = array();
		$fieldTypeMsg = array();
		foreach ($expectedFields as $key => $field) {
			if (!array_key_exists($key, $existingFields)) {
				$missingFieldsMsg[] = sprintf($translator->trans("The Expected data '%s' of the table '%s' of the schema '%s' is not found."), $field->columnName, $field->tableName, $field->schemaName);
			} else {

				//
				// Check field type
				//
				$foundField = $existingFields[$key];
				$msg = sprintf($translator->trans("The field '%s' of the table '%s' of the schema '%s' is of type '%s' which is incompatible with the metadata definition: '%s'."), $field->columnName, $field->tableName, $field->schemaName, $foundField->type, $field->type);

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
						$fieldTypeMsg[] = sprintf($translator->trans("Unknow field type for the data '%s' of the table '%s' of the schema '%s'."), $field->columnName, $field->tableName, $field->schemaName);
				}
			}
		}
		$this->view->fieldTypeMsg = $fieldTypeMsg;
		$this->view->missingFieldsMsg = $missingFieldsMsg;
	}

	/**
	 * Check if the expected tables are found.
	 */
	protected function checkTables() {

		// Get the translator service
		$translator = $this->get('translator');

		$expectedTables = $this->metadataSystemModel->getTables();

		$existingTables = $this->postgreSQLModel->getTables();

		$missingTablesMsg = array();
		$primaryKeysMsg = array();
		foreach ($expectedTables as $key => $table) {
			if (!array_key_exists($key, $existingTables)) {
				$missingTablesMsg[] = sprintf($translator->trans("The expected table '%s' of the schema '%s' is not found."), $table->tableName, $table->schemaName);
			} else {
				$foundTable = $existingTables[$key];

				//
				// Check the primary keys
				//
				$diff = array_diff($foundTable->primaryKeys, $table->primaryKeys);
				if (!empty($diff)) {
					$primaryKeysMsg[] = sprintf($translator->trans("The PK (%s) of the table '%s' is not compatible with the metadata PK (%s)."), implode(",", $foundTable->primaryKeys), $table->tableName, implode(",", $table->primaryKeys));
				}
			}
		}
		$this->view->missingTablesMsg = $missingTablesMsg;
		$this->view->primaryKeysMsg = $primaryKeysMsg;
	}
}
