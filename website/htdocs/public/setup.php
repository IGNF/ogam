<?php

// Define path to application directory
defined('APPLICATION_PATH') || define('APPLICATION_PATH', realpath(dirname(__FILE__).'/../application'));

// Define application environment
defined('APPLICATION_ENV') || define('APPLICATION_ENV', (getenv('APPLICATION_ENV') ? getenv('APPLICATION_ENV') : 'production'));

// Define current date (For log file name)
define('DATE_STAMP', date('Y-m-d'));

// Define path to inherent application directory
if (file_exists(APPLICATION_PATH.'/../../inherent')) {
    define('INHERENT_APPLICATION_PATH', APPLICATION_PATH.'/../../inherent/application');
}

// Define current base url
define('BASE_URL', substr($_ENV['REDIRECT_URL'], 0, strrpos($_ENV['REDIRECT_URL'],'index.php')));

// Ensure library/ is on include_path
set_include_path(implode(PATH_SEPARATOR, array(
    realpath(APPLICATION_PATH.'/../library'),
    get_include_path()
)));
if (defined('INHERENT_APPLICATION_PATH') && file_exists(INHERENT_APPLICATION_PATH.'/../library')) {
    set_include_path(implode(PATH_SEPARATOR, array(
        realpath(INHERENT_APPLICATION_PATH.'/../library'),
        get_include_path()
    )));
}

require_once 'Zend/Config/Ini.php';

// Create application, bootstrap, and run
$applicationIniFilePath = APPLICATION_PATH.'/configs/application.ini';
if (defined('INHERENT_APPLICATION_PATH') && file_exists(INHERENT_APPLICATION_PATH.'/configs/substitute/application.ini')) {
    $applicationIniFilePath = INHERENT_APPLICATION_PATH.'/configs/substitute/application.ini';
}
$ApplicationConf = new Zend_Config_Ini($applicationIniFilePath, APPLICATION_ENV, array('allowModifications' => true));
if (defined('INHERENT_APPLICATION_PATH') && file_exists(INHERENT_APPLICATION_PATH.'/configs/patch/application.ini')) {
    $applicationIniPatchPath = INHERENT_APPLICATION_PATH.'/configs/patch/application.ini';
    $patchConfiguration = new Zend_Config_Ini($applicationIniPatchPath, APPLICATION_ENV);
    $ApplicationConf->merge($patchConfiguration);
}