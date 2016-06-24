<?php
include_once('includes/setup.php');

/** Zend_Application */
require_once 'Zend/Application.php';

$application = new Zend_Application(APPLICATION_ENV, $ApplicationConf);
$application->bootstrap()->run();
