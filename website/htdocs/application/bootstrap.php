<?php

// application/bootstrap.php
//
// APPLICATION CONSTANTS - Set the constants to use in this application.
// These constants are accessible throughout the application, even in ini
// files.
include_once 'constants.php';

// FRONT CONTROLLER - Get the front controller.
// The Zend_Front_Controller class implements the Singleton pattern, which is a
// design pattern used to ensure there is only one instance of
// Zend_Front_Controller created on each request.
$frontController = Zend_Controller_Front::getInstance();

// CONTROLLER DIRECTORY SETUP - Point the front controller to your action
// controller directory.
$frontController->setControllerDirectory(APPLICATION_PATH.'/controllers');

// APPLICATION ENVIRONMENT - Set the current environment.
// Set a variable in the front controller indicating the current environment --
// commonly one of development, staging, testing, production, but wholly
// dependent on your organization's and/or site's needs.
$frontController->setParam('env', APPLICATION_ENVIRONMENT);

// LAYOUT SETUP - Setup the layout component
// The Zend_Layout component implements a composite (or two-step-view) pattern
// With this call we are telling the component where to find the layouts scripts.
Zend_Layout::startMvc(APPLICATION_PATH.'/layouts/scripts');

// VIEW SETUP - Initialize properties of the view object
// The Zend_View component is used for rendering views. Here, we grab a "global"
// view instance from the layout object, and specify the doctype we wish to
// use. In this case, XHTML1 Strict.
$view = Zend_Layout::getMvcInstance()->getView();
$view->doctype('XHTML1_STRICT');
$view->setEncoding('UTF-8');
$view->addHelperPath(LIBRARY_PATH.'/Genapp/View/Helper', 'Genapp_View_Helper'); // Path to the genapp helpers

// CONFIGURATION - Setup the configuration object
// The Zend_Config_Ini component will parse the ini file, and resolve all of
// the values for the given section.  Here we will be using the section name
// that corresponds to the APP's Environment
$configuration = new Zend_Config_Ini('app.ini', APPLICATION_ENVIRONMENT);
$sessionConfig = new Zend_Config_Ini('session.ini', APPLICATION_ENVIRONMENT);
Zend_Session::setOptions($sessionConfig->toArray());

// Set the default timezone
date_default_timezone_set($configuration->defaultTimeZone);

// Set the locale
$browserLocales = Zend_Locale::getBrowser();
$locales = array_intersect(array_keys($browserLocales), $configuration->availableLocales->toArray());
if (empty($locales)) {
	$locale = new Zend_Locale($configuration->defaultLocale);
} else {
	$locale = new Zend_Locale(current($locales));
}
Zend_Registry::set('Zend_Locale', $locale);

// Setup the translation
$adapterTranslate = new Zend_Translate('csv', APPLICATION_PATH.'/lang/lang_en.csv', 'en'); // default translation
$adapterTranslate->addTranslation(array('content' => APPLICATION_PATH.'/lang/lang_fr.csv', 'locale' => 'fr')); // add french
$adapterTranslate->addTranslation(array('content' => APPLICATION_PATH.'/lang/lang_en.csv', 'locale' => 'en')); // add english
$adapterTranslate->setLocale($locale);
Zend_Registry::set('Zend_Translate', $adapterTranslate); // store in the registry
Zend_Validate_Abstract::setDefaultTranslator($adapterTranslate); // use the translator for validation

// Instantiate and register ViewRenderer
$viewRenderer = new Zend_Controller_Action_Helper_ViewRenderer();
$viewRenderer->setView($view);

// Pass $viewRenderer to the helper broker
Zend_Controller_Action_HelperBroker::addHelper($viewRenderer);

// Set the base path
$pathBaseURLs = $configuration->path_base_url->toArray();
define('PATH_BASE_URL', $pathBaseURLs[0]);

// LOGS
$logger = new Zend_Log();
$writer = new Zend_Log_Writer_Stream(APPLICATION_PATH.$configuration->log->path.'/'.date('Y-m-d').'.log');
$loglevel = intval($configuration->log->level);
$writer->addFilter(new Zend_Log_Filter_Priority($loglevel));
$formatter = new Zend_Log_Formatter_Simple('%timestamp% %priorityName% : %message%'.PHP_EOL);
$writer->setFormatter($formatter);
$logger = new Zend_Log($writer);
$logger->debug('**********************************************************************');
$logger->debug('Logs initialised');

// DATABASE ADAPTER - Setup the database adapter
// Zend_Db implements a factory interface that allows developers to pass in an
// adapter name and some parameters that will create an appropriate database
// adapter object.  In this instance, we will be using the values found in the
// "database" section of the configuration obj.
try {
	$dbAdapter = Zend_Db::factory($configuration->database);
	Zend_Db_Table_Abstract::setDefaultAdapter($dbAdapter);

	//
	// Configure a cache for the database adapter
	//
	$frontendOptions = array(
		// 'lifetime' => 60*60*2, // cache lifetime of 2 hours
		'automatic_serialization' => true
	);

	$cacheDir = $configuration->cachedDir;
	$backendOptions = array(
		'cache_dir' => $cacheDir // Cache directory
	);

	$cache = Zend_Cache::factory('Core', 'File', $frontendOptions, $backendOptions);

	Zend_Db_Table_Abstract::setDefaultMetadataCache($cache);

} catch (Zend_Exception $e) {
	$logger->err('Error while initializing database/cache : '.$e->getMessage());
	$logger->err('cacheDir : '.$cacheDir);
	throw $e;
}
$logger->debug('Database initialised');

// REGISTRY - setup the application registry
// An application registry allows the application to store application
// necessary objects into a safe and consistent (non global) place for future
// retrieval.  This allows the application to ensure that regardless of what
// happends in the global scope, the registry will contain the objects it
// needs.
$registry = Zend_Registry::getInstance();
$registry->configuration = $configuration;
$registry->logger = $logger;
$registry->dbAdapter = $dbAdapter;
$logger->debug('Registry initialised');

// USER - autologin for public access
if ($configuration->autoLogin) {

	$userSession = new Zend_Session_Namespace('user');
	$user = $userSession->user;

	if (empty($user)) {
		require_once APPLICATION_PATH.'/models/website/User.php';
		require_once APPLICATION_PATH.'/models/website/Role.php';

		$userModel = new Model_User();
		$roleModel = new Model_Role();
		// Get the user informations
		$user = $userModel->getUser($configuration->defaultUser);

		// Store the user in session
		$userSession = new Zend_Session_Namespace('user');
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

// CLEANUP - remove items from global scope
// This will clear all our local boostrap variables from the global scope of
// this script (and any scripts that called bootstrap). This will enforce
// object retrieval through the applications's registry.
unset($view);
unset($frontController);
unset($registry);
unset($configuration);
unset($logger);
unset($dbAdapter);
unset($adapterTranslate);
