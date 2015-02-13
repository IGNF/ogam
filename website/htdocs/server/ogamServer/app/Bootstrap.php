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
	 * Addition of plugins to the Front Controller.
	 */
	protected function _initPlugins() {
		require_once('Genapp/Controller/Plugin/Bootstrap.php');

		$this->bootstrap('View');
		$view = $this->getResource('View');

		$front = Zend_Controller_Front::getInstance();
		// Pour la gestion de la langue de l'application
		$front->registerPlugin(new Genapp_Controller_Plugin_Bootstrap($view));
	}

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

		// Log l'URL appelée
		if (isset($_SERVER['REQUEST_URI'])) {
			$this->logger->debug($_SERVER['REQUEST_URI']);
		}

		if (empty($this->logger)) {
			throw new Zend_Exception('Logger object is empty.');
		}
		Zend_Registry::set('logger', $this->logger);
	}


	/**
	 * Autoloading
	 */
	protected function _initApplicationAutoloading() {
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
		$this->bootstrap('Router');

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
					$customRoute = new Zend_Controller_Router_Route("/".$controllerName.'/:action', array('module' => 'custom', 'controller' => $controllerName));
					$router->addRoute('customRoute_'.$controllerName, $customRoute);
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
		$this->bootstrap('AppConfRegistry');
	    $this->bootstrap('AppConfSession');
		$configuration = Zend_Registry::get('configuration');
		$baseUrl = Zend_Controller_Front::getInstance()->getBaseUrl();

		// Initialisons la vue
		$view = new Zend_View();
		$view->doctype('XHTML1_STRICT');
		$view->headTitle()->setSeparator(' - ')->append($view->translate('Layout Head Title'));
		$view->headMeta()->appendHttpEquiv('Content-Type', 'text/html; charset=utf-8'); //->appendHttpEquiv('Content-Language', 'fr-FR')
		$view->headMeta()->appendName('robots', 'index, follow');
		$view->headMeta()->appendName('keywords', $view->translate('Layout Head Meta Keywords'));
		$view->headMeta()->appendName('description', $view->translate('Layout Head Meta Description'));
		$view->headLink()->appendStylesheet($baseUrl.'css/global.css');
		$view->contactEmailPrefix = $configuration->contactEmailPrefix;
		$view->contactEmailSufix = $configuration->contactEmailSufix;

		// Si le répertoire custom existe alors on le prend en priorité
		if (defined('CUSTOM_APPLICATION_PATH') && file_exists(CUSTOM_APPLICATION_PATH.'/views/')) {
			$view->addBasePath(CUSTOM_APPLICATION_PATH.'/views/');
		}
		$view->addBasePath(APPLICATION_PATH.'/views/');

		// Path to the genapp helpers
		$view->addHelperPath(APPLICATION_PATH."/../lib/Genapp/View/Helper", 'Genapp_View_Helper');

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
		$this->bootstrap('AppConfRegistry');
	    $this->bootstrap('AppConfSession');

		if (!$this->hasPluginResource('Translate')) {
			throw new Zend_Exception('Translate not enabled in application.ini');
		}
		$translate = $this->getResource('Translate');
		if (empty($translate)) {
			throw new Zend_Exception('Translate object is empty.');
		}
		$configuration = Zend_Registry::get('configuration');
		if ($configuration->useCache == false) {
			$translate->clearCache();// Remove the default cache done during the translate bootstrap
			$translate->removeCache();
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
		$translations = $this->_addTranslation(array(APPLICATION_PATH.'/lang'), $translate);

		// Setup the translation with files specific to the app
		if (defined('CUSTOM_APPLICATION_PATH') && file_exists(CUSTOM_APPLICATION_PATH.'/lang/')) {
			$translations = $this->_addTranslation(array(CUSTOM_APPLICATION_PATH.'/lang'), $translate);
		}

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
					if ($file !== "." && $file !== ".." && $file !== ".svn") {
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
	 * Register the config.
	 *
	 * Take by default the files in ogam/application/config and if present overrides with custom/application/config.
	 */
	protected function _initAppConfRegistry() {
	   // get db param
	    $this->bootstrap('Db');
	    $this->bootstrap('Session');
	    $this->bootstrap('RegisterLogger');
	    
	    // Get the parameters
	    $parameterModel = new Application_Model_Website_ApplicationParameter();
		$parameters = $parameterModel->getParameters();
		
		// Adding of the intern map service url into the parameters
		$service_config_array = $parameterModel->getMapServiceUrl();
		$parameters->map_service_url = json_decode($service_config_array['config'])->{'urls'}[0];
		
		Zend_Registry::set('configuration', $parameters);
		
	}

	/**
	 * Initialise the application configuration and set it in session.
	 */
	protected function _initAppConfSession() {
	    $this->bootstrap('Session');
	    $this->bootstrap('AppConfRegistry');
	    $this->bootstrap('RegisterLogger');
	    
	    // We need for the deserialization of the session objects classes
	    require_once APPLICATION_PATH . '/objects/Website/User.php';
	    require_once APPLICATION_PATH . '/objects/Website/Role.php';
	    require_once APPLICATION_PATH . '/objects/RawData/Submission.php';
	     
	    $configuration = Zend_Registry::get('configuration');
	    $configurationSession = new Zend_Session_Namespace('user');
	    $configurationSession = new Zend_Session_Namespace('configuration');
	    
	    $configurationSession->configuration = array(
	        "map_service_url" => $configuration->map_service_url // Needed into mapProxy.php file to improve performances (avoiding a db connection).
	    );
	}

	/**
	 *
	 * Check the caches
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
		if (empty($dbCache)) {
			throw new Zend_Exception('DB cache object is empty.');
		}
		$languageCache = $cachemanager->getCache('language');
		if (empty($languageCache)) {
			throw new Zend_Exception('Language cache object is empty.');
		}
	}

	/**
	 *
	 * Manage the AutoLogin
	 */
	protected function _initAutoLogin() {

		$this->bootstrap('Db');
		$this->bootstrap('AppConfRegistry');
	    $this->bootstrap('AppConfSession');
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

				$this->logger->debug('Autologin default user : '.$user->login);

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

					// Get the accessible schemas
					$schemas = $roleModel->getRoleSchemas($role->roleCode);
					$userSession->schemas = $schemas;
				}
			}
		}
	}
}
