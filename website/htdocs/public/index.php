<?php
include_once('setup.php');

/** Zend_Application */
require_once 'Zend/Application.php';

$application = new Zend_Application(APPLICATION_ENV, $ApplicationConf);
$application->bootstrap()->run();
