<?php

include_once('setup.php');

function onfailure($url){
    header('Location: '.$url);
}

require_once APPLICATION_PATH . '/objects/Website/Role.php';
require_once APPLICATION_PATH . '/objects/Website/User.php';

/*
require_once APPLICATION_PATH . '/../library/Zend/Exception.php';
require_once APPLICATION_PATH . '/../library/Zend/Session/Exception.php';
require_once APPLICATION_PATH . '/../library/Zend/Session/Abstract.php';
require_once APPLICATION_PATH . '/../library/Zend/Session/Namespace.php';
require_once APPLICATION_PATH . '/../library/Zend/Session/SaveHandler/Interface.php';*/
require_once APPLICATION_PATH . '/../lib/Zend/Session.php';
require_once APPLICATION_PATH . '/../lib/Zend/Registry.php';

Zend_Session::setOptions($ApplicationConf->resources->session->toArray());

$userSession = new Zend_Session_Namespace('user');
$configurationSession = new Zend_Session_Namespace('configuration');

/*
 * echo '<br/>connected : '; echo $userSession->connected;
 * exit();
*/

if(!$userSession->connected){
    error_log('User not connected on '.$_SERVER["HTTP_HOST"]);
    error_log('Request: '.$_SERVER["QUERY_STRING"]);
    onfailure('/');
}

if (empty($userSession->user) || !$userSession->user->isAllowed('DATA_QUERY')) {
    onfailure('/');
}

session_write_close();//libere le cookie/session