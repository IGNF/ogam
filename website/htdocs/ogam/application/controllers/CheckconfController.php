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
	 * Initialise the controler
	 */
	public function init() {
		parent::init();

		// Set the current module name
		$websiteSession = new Zend_Session_Namespace('website');
		$websiteSession->module = "checkconf";
		$websiteSession->moduleLabel = "Check Configuration";
		$websiteSession->moduleURL = "checkconf";
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
		$this->logger->debug('CheckConf index');

		$this->checkPhpParameters();
	}

	/**
	 * Checks the php parameters
	 */
	function checkPhpParameters() {
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
		if ($postMaxSizeInt < $postMaxSizeMinInt || $postMaxSizeChar !== $postMaxSizeMinChar) {
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
		if ($uploadMaxFilesizeInt < $uploadMaxFilesizeMinInt || $uploadMaxFilesizeChar !== $uploadMaxFilesizeMinChar) {
			$uploadMaxFilesizeMsg['error'] = str_replace('%value%', $uploadMaxFilesizeMin, $errorMsg);
		}
		array_push($phpParameters, $uploadMaxFilesizeMsg);

		// Add the parameters to the view
		$this->view->phpParameters = $phpParameters;
	}
}
