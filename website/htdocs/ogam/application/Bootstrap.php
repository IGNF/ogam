<?php
/**
 *
 * The bootstrap class
 * @author IFN
 * @SuppressWarnings protectedFunctionNaming
 */
class Bootstrap extends Zend_Application_Bootstrap_Bootstrap {

	// The logger
	var $logger = null;


	/**
	 * Register the logger into Zend_Registry
	 * WARNING : Do not call this function _initLog() !
	 * @throws Zend_Exception
	 */
	protected function _initRegisterLogger() {
		$this->bootstrap('Log');
		if (!$this->hasPluginResource('Log')) {
			throw new Zend_Exception('Log not enabled in config.ini');
		}
		$this->logger = $this->getResource('Log');
		if (empty($this->logger)) {
			throw new Zend_Exception('Logger object is empty.');
		}
		Zend_Registry::set('logger', $this->logger);
	}


	/**
	 * Autoloading
	 */
	protected function _initApplicationAutoloading() {
		$this->logger->debug('_initApplicationAutoloading');
		$resourceLoader = $this->getResourceLoader();
		$resourceLoader->addResourceTypes(array(
		            'objects' => array(
		                'namespace' => 'Object',
		                'path'      => 'objects')));
	}


	/**
	 * Init the routing system
	 * @throws Zend_Exception
	 */
	protected function _initCustomRouter() {

		// Vérifie que le contrôleur frontal est bien présent, et le récupère
		$this->bootstrap('FrontController');
		$front = $this->getResource('FrontController');

		$router = $front->getRouter();

		// Si un controleur existe dans custom alors on le prend en priorité à la place de default
		if (defined('CUSTOM_APPLICATION_PATH') && file_exists(CUSTOM_APPLICATION_PATH.'/controllers/')) {

			// Scan des controleurs présents
			$files = scandir(CUSTOM_APPLICATION_PATH.'/controllers/');
			foreach ($files as $file) {
				if (stripos($file, 'Controller.php') !== false) {
					$controllerName = substr($file, 0, stripos($file, 'Controller.php'));
					$controllerName = strtolower($controllerName);
					$this->logger->debug("Adding custom controller : ".$controllerName);
					$customRoute = new Zend_Controller_Router_Route($controllerName.'/:action', array('module' => 'custom', 'controller' => $controllerName));
					$router->addRoute('customQuery'.$controllerName, $customRoute);
				}
			}
		}
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
		$view->headMeta()->appendHttpEquiv('Content-Type', 'text/html; charset=utf-8'); //->appendHttpEquiv('Content-Language', 'fr-FR')
		$view->headMeta()->appendName('robots', 'index, follow')->appendName('keywords', $view->translate('Layout Head Meta Keywords'))->appendName('description', $view->translate('Layout Head Meta Description'));
		$view->headLink()->appendStylesheet($baseUrl.'css/global.css');
		$view->contactEmailPrefix = $configuration->contactEmailPrefix;
		$view->contactEmailSufix = $configuration->contactEmailSufix;

		// Si le répertoire custom existe alors on le prend en priorité
		if (defined('CUSTOM_APPLICATION_PATH') && file_exists(CUSTOM_APPLICATION_PATH.'/views/')) {
			$view->addBasePath(CUSTOM_APPLICATION_PATH.'/views/');
		}
		$view->addBasePath(APPLICATION_PATH.'/views/');

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
		// Return the current locale build by Zend from the local browser, server... and the config file!
		$locale = $this->getResource('Locale');
		if (empty($locale)) {
			throw new Zend_Exception('Locale object is empty.');
		}

		// Setup the translation
		// !!! Note: the translate local correspond to the file name only.
		$translations = $this->_addTranslation(array(
		APPLICATION_PATH.'/lang'
		), $translate);

		// Setup the translation with files specific to the app
		if (defined('CUSTOM_APPLICATION_PATH') && file_exists(CUSTOM_APPLICATION_PATH.'/lang/')) {
			$translations = $this->_addTranslation(array(CUSTOM_APPLICATION_PATH.'/lang'), $translate);
		}

		// Set the locale
		switch ($locale->getLanguage()) {
			case 'fr' : $locale = 'fr';break;
			case 'fr_FR' : $locale = 'fr';break;
			case 'en' : $locale = 'en';break;
			case 'en_GB' : $locale = 'en';break;
			case 'en_US' : $locale = 'en';break;
			default : $locale = current(array_keys($locale->getDefault()));
		}
		$locale = new Zend_Locale($locale);
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
	private function _addTranslation($dirs, $translate) {
		$translations = array();
		foreach ($dirs as $dir) {
			if ($handle = @opendir($dir)) {
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
	 * Register the *.ini files.
	 *
	 * Take by default the files in ogam/application/config and if present overrides with custom/application/config.
	 */
	protected function _initConfFiles() {
		$appIniFilePath = APPLICATION_PATH.'/configs/app.ini';
		if (defined('CUSTOM_APPLICATION_PATH') && file_exists(CUSTOM_APPLICATION_PATH.'/configs/app.ini')) {
			$appIniFilePath = CUSTOM_APPLICATION_PATH.'/configs/app.ini';
		}
		$configuration = new Zend_Config_Ini($appIniFilePath, APPLICATION_ENV, array('allowModifications' => true));
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
				$userModel = new Application_Model_Website_User();
				$roleModel = new Application_Model_Website_Role();
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
