<?php
/**
 *
 * The bootstrap class
 * @author IFN
 *
 */
class Bootstrap extends Zend_Application_Bootstrap_Bootstrap {

	// Do not call this function _initLog() !
	/**
	 *
	 * Register the logger into Zend_Registry
	 * @throws Zend_Exception
	 */
	protected function _initRegisterLogger() {
		$this->bootstrap('Log');
		if (!$this->hasPluginResource('Log')) {
			throw new Zend_Exception('Log not enabled in config.ini');
		}
		$logger = $this->getResource('Log');
		if (empty($logger)) {
			throw new Zend_Exception('Logger object is empty.');
		}
		Zend_Registry::set('logger', $logger);
	}

	/**
	 *
	 * Initialise the layout
	 * @return Zend_View The layout view
	 */
	protected function _initView() {
		$this->bootstrap('frontController');
		$this->bootstrap('RegisterTranslate');
		$this->bootstrap('ConfFiles');
		$configuration = Zend_Registry::get('configuration');
		$baseUrl = Zend_Controller_Front::getInstance()->getBaseUrl();

		// Initialisons la vue
		$view = new Zend_View();
		$view->doctype('XHTML1_STRICT');
		$view->headTitle()->setSeparator(' - ')->append($view->translate('Layout Head Title'));
		$view->headMeta()->appendHttpEquiv('Content-Type', 'text/html; charset=utf-8') //->appendHttpEquiv('Content-Language', 'fr-FR')
		->appendName('robots', 'index, follow')->appendName('keywords', $view->translate('Layout Head Meta Keywords'))->appendName('description', $view->translate('Layout Head Meta Description'));
		$view->headLink()->appendStylesheet($baseUrl.'css/global.css');
		$view->headScript()->appendFile($baseUrl.'js/extjs/adapter/ext/ext-base.js', 'text/javascript')->appendFile($baseUrl.'js/genapp/source/genapp.js', 'text/javascript');
		$view->contactEmailPrefix = $configuration->contactEmailPrefix;
		$view->contactEmailSufix = $configuration->contactEmailSufix;

		// Path to the genapp helpers
		$view->addHelperPath(APPLICATION_PATH."/../library/Genapp/View/Helper", 'Genapp_View_Helper');

		// Ajoutons là au ViewRenderer
		$viewRenderer = Zend_Controller_Action_HelperBroker::getStaticHelper('ViewRenderer');
		$viewRenderer->setView($view);

		// Retourner la vue pour qu'elle puisse être stockée par le bootstrap
		return $view;
	}

	// Do not call this function _initTranslate() !
	/**
	 *
	 * Register the locale and the translation
	 * @throws Zend_Exception
	 */
	protected function _initRegisterTranslate() {
		$this->bootstrap('Locale');
		$this->bootstrap('Translate');
		if (!$this->hasPluginResource('Translate')) {
			throw new Zend_Exception('Translate not enabled in application.ini');
		}
		$translate = $this->getResource('Translate');
		if (empty($translate)) {
			throw new Zend_Exception('Translate object is empty.');
		}
		if (!$this->hasPluginResource('Locale')) {
			throw new Zend_Exception('Locale not enabled in application.ini');
		}
		$locale = $this->getResource('Locale');
		if (empty($locale)) {
			throw new Zend_Exception('Locale object is empty.');
		}

		// Setup the translation
		$translations = $this->addTranslation(array(
			APPLICATION_PATH.'/lang',
			INHERENT_APPLICATION_PATH.'/lang/new',
			INHERENT_APPLICATION_PATH.'/lang/substitute',
			INHERENT_APPLICATION_PATH.'/lang/patch'
		), $translate);

		// Set the locale
		$browserLocales = Zend_Locale::getBrowser();
		$locales = array_intersect(array_keys($browserLocales), array_keys($translations));
		if (!empty($locales)) {
			$locale = new Zend_Locale(current($locales));
		}
		Zend_Registry::set('Zend_Locale', $locale);

		$translate->setLocale($locale);
		Zend_Registry::set('Zend_Translate', $translate); // store in the registry for the view helper
		Zend_Validate_Abstract::setDefaultTranslator($translate); // use the translator for validation
		}

	/**
	 *
	 * Add the translation files to the provided Zend_Translate object
	 * @param array $dirs An array of lang dirs
	 * @param Zend_Translate $translate the current translator
	 */
	private function addTranslation($dirs, $translate) {
		$translations = array();
		foreach ($dirs as $dir) {
			if ($handle = opendir($dir)) {
				while (false !== ($file = readdir($handle))) {
					if ($file != "." && $file != ".." && $file != ".svn") {
						$explodedFile = explode('.', $file);
						$translate->addTranslation($dir.'/'.$file, $explodedFile[0]);
						$translations[] = $explodedFile[0];
					}
				}
				closedir($handle);
			}
		}
		return array_unique($translations);
	}

	/**
	 *
	 * Define few constants
	 */
	protected function _initConstants() {
		define('DPI', '72'); // Default number of dots per inch in mapserv
		define('FACTOR', '39370.1'); // Inch to meter conversion factor
		}

	/**
	 *
	 * Register the *.ini files
	 */
	protected function _initConfFiles() {
		$appIniFilePath = APPLICATION_PATH.'/configs/app.ini';
		if (defined('INHERENT_APPLICATION_PATH') && file_exists(INHERENT_APPLICATION_PATH.'/configs/substitute/app.ini')) {
			$appIniFilePath = INHERENT_APPLICATION_PATH.'/configs/substitute/app.ini';
		}
		$configuration = new Zend_Config_Ini($appIniFilePath, APPLICATION_ENV, array('allowModifications' => true));
		if (defined('INHERENT_APPLICATION_PATH') && file_exists(INHERENT_APPLICATION_PATH.'/configs/patch/app.ini')) {
			$appIniPatchPath = INHERENT_APPLICATION_PATH.'/configs/patch/app.ini';
			$patchConfiguration = new Zend_Config_Ini($appIniPatchPath, APPLICATION_ENV);
			$configuration->merge($patchConfiguration);
		}
		Zend_Registry::set('configuration', $configuration);
	}

	/**
	 *
	 * Set the metadata cache
	 * @throws Zend_Exception
	 */
	protected function _initSetCache() {
		$this->bootstrap('Cachemanager');
		if (!$this->hasPluginResource('Cachemanager')) {
			throw new Zend_Exception('Cachemanager not enabled in config.ini');
		}
		$cachemanager = $this->getResource('Cachemanager');
		if (empty($cachemanager)) {
			throw new Zend_Exception('Cachemanager object is empty.');
		}
		$dbCache = $cachemanager->getCache('database');

		Zend_Db_Table_Abstract::setDefaultMetadataCache($dbCache);
	}

	/**
	 *
	 * Manage the AutoLogin
	 */
	protected function _initAutoLogin() {
		$this->bootstrap('Db');
		$this->bootstrap('ConfFiles');
		$this->bootstrap('Session');
		$configuration = Zend_Registry::get('configuration');
		// USER - autologin for public access
		if ($configuration->autoLogin) {
			$userSession = new Zend_Session_Namespace('user');
			$user = $userSession->user;

			if (empty($user)) {
				$userModel = new Application_Model_DbTable_Website_User();
				$roleModel = new Application_Model_DbTable_Website_Role();
				// Get the user informations
				$user = $userModel->getUser($configuration->defaultUser);

				if (!is_null($user)) {
					// Store the user in session
					$userSession->connected = true;
					$userSession->user = $user;

					// Get the user role
					$role = $roleModel->getRole($user->roleCode);

					// Store the role in session
					$userSession->role = $role;

					// Get the User Permissions
					$permissions = $roleModel->getRolePermissions($role->roleCode);
					$userSession->permissions = $permissions;
				}
			}
		}
	}
}
