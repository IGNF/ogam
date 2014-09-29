<?php

// Define path to application directory
defined('APPLICATION_PATH') || define('APPLICATION_PATH', realpath(dirname(__FILE__).'/../server/ogamServer/app'));

// Define application environment
defined('APPLICATION_ENV') || define('APPLICATION_ENV', (getenv('APPLICATION_ENV') ? getenv('APPLICATION_ENV') : 'production'));

// Define current date (For log file name)
define('DATE_STAMP', date('Y-m-d'));

// Define path to oison application directory
if (file_exists(realpath(dirname(__FILE__).'/../custom'))) {
	define('CUSTOM_APPLICATION_PATH', realpath(dirname(__FILE__).'/../custom/server/ogamServer/app'));
}

// Ensure libraries is on include_path
set_include_path(implode(PATH_SEPARATOR, array(
	realpath(APPLICATION_PATH.'/../lib'),
	get_include_path()
)));
if (defined('CUSTOM_APPLICATION_PATH') && file_exists(CUSTOM_APPLICATION_PATH.'/../lib')) {
	set_include_path(implode(PATH_SEPARATOR, array(
		realpath(CUSTOM_APPLICATION_PATH.'/../lib'),
		get_include_path()
	)));
}

require_once 'Zend/Config/Ini.php';

// Create application, bootstrap, and run
$applicationIniFilePath = APPLICATION_PATH.'/configs/application.ini';
if (defined('CUSTOM_APPLICATION_PATH') && file_exists(CUSTOM_APPLICATION_PATH.'/configs/application.ini')) {
	$applicationIniFilePath = CUSTOM_APPLICATION_PATH.'/configs/application.ini';
}
$ApplicationConf = new Zend_Config_Ini($applicationIniFilePath, APPLICATION_ENV, array('allowModifications' => true));

