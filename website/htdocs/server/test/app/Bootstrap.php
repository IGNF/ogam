<?php
// ------------------------------------------ //
// Redefine parameters from index.php //
// ------------------------------------------ //

// Set error level
error_reporting(E_ALL | E_STRICT);

// Redefine the paths to link to the correct directories
define('APPLICATION_PATH', './ogamServer/app/');
define('LIBRARY_PATH', './ogamServer/lib/');
define('TEST_PATH', './test/');
define('APPLICATION_ENVIRONMENT', 'production');
define('APPLICATION_LOG_PATH', './logs');

// ------------------------------------------ //
// Include the original application bootstrap //
// ------------------------------------------ //
include APPLICATION_PATH . '../../../public/setup.php';

require_once 'Zend/Application.php';

$application = new Zend_Application(APPLICATION_ENV, $ApplicationConf);

// Start a session
Zend_Session::start();

