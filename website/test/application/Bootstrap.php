<?php

// ------------------------------------------ //
//    Redefine parameters from index.php      //
// ------------------------------------------ //

// Set error level
error_reporting(E_ALL | E_STRICT);

// Redefine the paths to link to the correct directories
define('APPLICATION_PATH', './htdocs/ogam/application/');
define('LIBRARY_PATH', './htdocs/ogam/library/');
define('TEST_PATH','./test/');
define('APPLICATION_ENVIRONMENT', 'production');
define('APPLICATION_LOG_PATH', './htdocs/logs');



// ------------------------------------------ //
// Include the original application bootstrap //
// ------------------------------------------ //
include APPLICATION_PATH.'/../public/setup.php';
include APPLICATION_PATH.'/Bootstrap.php';

$frontController = Zend_Controller_Front::getInstance();
$frontController->setParam('noErrorHandler', TRUE); // Desactivate the error handler 



