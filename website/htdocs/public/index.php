<?php
// public/index.php
//
// Step 1: APPLICATION_PATH is a constant pointing to our
// application/subdirectory. We use this to add our "library" directory
// to the include_path, so that PHP can find our Zend Framework classes.
define('APPLICATION_PATH', realpath(dirname(__FILE__) . '/../application'));
define('LIBRARY_PATH', realpath(dirname(__FILE__) . '/../library'));
set_include_path(
    LIBRARY_PATH 
    . PATH_SEPARATOR . LIBRARY_PATH . '/Genapp/classes/metadata'
    . PATH_SEPARATOR . LIBRARY_PATH . '/Genapp/classes/generic'
    . PATH_SEPARATOR . APPLICATION_PATH . '/../../application/config'
    . PATH_SEPARATOR . APPLICATION_PATH . '/../../application/classes'
    . PATH_SEPARATOR . APPLICATION_PATH . '/../../application/classes/harmonized_data'
    . PATH_SEPARATOR . APPLICATION_PATH . '/../../application/classes/mapping'
    . PATH_SEPARATOR . APPLICATION_PATH . '/../../application/classes/raw_data'
    . PATH_SEPARATOR . APPLICATION_PATH . '/../../application/classes/website'
    . PATH_SEPARATOR . APPLICATION_PATH . '/config'
    . PATH_SEPARATOR . APPLICATION_PATH . '/classes'
    . PATH_SEPARATOR . APPLICATION_PATH . '/classes/harmonized_data'
    . PATH_SEPARATOR . APPLICATION_PATH . '/classes/mapping'
    . PATH_SEPARATOR . APPLICATION_PATH . '/classes/raw_data'
    . PATH_SEPARATOR . APPLICATION_PATH . '/classes/website'
    . PATH_SEPARATOR . get_include_path()
);

// Step 2: AUTOLOADER - Set up autoloading.
// This is a nifty trick that allows ZF to load classes automatically so
// that you don't have to litter your code with 'include' or 'require'
// statements.
require_once "Zend/Loader/Autoloader.php";
$autoloader = Zend_Loader_Autoloader::getInstance();
$autoloader->setFallbackAutoloader(true); 

// Step 3: REQUIRE APPLICATION BOOTSTRAP: Perform application-specific setup
// This allows you to setup the MVC environment to utilize. Later you 
// can re-use this file for testing your applications.
// The try-catch block below demonstrates how to handle bootstrap 
// exceptions. In this application, if defined a different 
// APPLICATION_ENVIRONMENT other than 'production', we will output the 
// exception and stack trace to the screen to aid in fixing the issue
try {
    require '../application/bootstrap.php';
} catch (Exception $exception) {
    echo '<html><body><center>'
       . 'An exception occured while bootstrapping the application.';
    if (defined('APPLICATION_ENVIRONMENT')
        && APPLICATION_ENVIRONMENT != 'production'
    ) {
        echo '<br /><br />' . $exception->getMessage() . '<br />'
           . '<div align="left">Stack Trace:' 
           . '<pre>' . $exception->getTraceAsString() . '</pre></div>';
    }
    echo '</center></body></html>';
    exit(1);
}

// Step 4: DISPATCH:  Dispatch the request using the front controller.
// The front controller is a singleton, and should be setup by now. We 
// will grab an instance and call dispatch() on it, which dispatches the
// current request.
try{
    $front = Zend_Controller_Front::getInstance();
    $front->throwExceptions(true);
    $front->dispatch();
}catch(Exception $e){
    // Exceptions handling
    $log  = 'Error: ' . $e->getMessage()
          . "\nin file: " . $e->getFile()
          . "\non line: " . $e->getLine()
          . "\ntrace: " . print_r($e->getTrace(), true);
    $logger = Zend_Registry :: get("logger");
    if (isset($logger)) {
        $logger->err($log);   //change the level to EMG
    } elseif (true) {
        error_log($log);    //log to php error log
    }

    header(" ",true,500);
}