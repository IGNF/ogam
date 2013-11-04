<?php
include_once('setup.php');

function onfailure($url){
    header('Location: '.$url);
}

//require_once APPLICATION_PATH . '/classes/website/Role.php';
//require_once APPLICATION_PATH . '/classes/website/User.php';

/*
require_once APPLICATION_PATH . '/../library/Zend/Exception.php';
require_once APPLICATION_PATH . '/../library/Zend/Session/Exception.php';
require_once APPLICATION_PATH . '/../library/Zend/Session/Abstract.php';
require_once APPLICATION_PATH . '/../library/Zend/Session/Namespace.php';
require_once APPLICATION_PATH . '/../library/Zend/Session/SaveHandler/Interface.php';*/
require_once APPLICATION_PATH . '/../library/Zend/Session.php';


// Gets the app configuration ini file.
$appIniFilePath = APPLICATION_PATH.'/configs/app.ini';
if (defined('CUSTOM_APPLICATION_PATH') && file_exists(CUSTOM_APPLICATION_PATH.'/configs/app.ini')) {
    $appIniFilePath = CUSTOM_APPLICATION_PATH.'/configs/app.ini';
}
$AppConf = new Zend_Config_Ini($appIniFilePath, APPLICATION_ENV, array('allowModifications' => true));

Zend_Session::setOptions($ApplicationConf->resources->session->toArray());

$userSession = new Zend_Session_Namespace('user');

/*
echo 'connected :<br/>'; echo $userSession->connected;
echo '<br/>role :<br/>'; print_r($userSession->role);
echo '<br/>permissions :<br/>'; print_r($userSession->permissions);
exit();
*/


if(!$userSession->connected){
    error_log('User not connected on '.$_SERVER["HTTP_HOST"]);
    error_log('Request: '.$_SERVER["QUERY_STRING"]);
    onfailure('/');
}
$permissions = $userSession->permissions;
$role = $userSession->role;
if (empty($permissions) || !array_key_exists('DATA_QUERY',$permissions)) {
    onfailure('/');
}

//Zend_Session::stop(); // Doesn't work well
session_write_close();//libere le cookie/session

parse_str($_SERVER["QUERY_STRING"], $query); //recupere la requete envoyée partie (GET params)...
array_change_key_case($query, CASE_UPPER); // force les clés en majuscule

$queryParamsAllow = array(//paramNom => requis
    'BBOX',
    'LAYERS',
    'EXCEPTIONS',
    'SRS',
    'FORMAT',
    'WIDTH',
    'HEIGHT',
    'SESSION_ID',
    'TRANSPARENT',
    'VERSION',
    'STYLES',
	'HASSLD',
	'SERVICE',
	'REQUEST',
	'FORMAT',
	'LAYER'
);

// Vérifie que les paramètres sont dans la liste des ceux autorisés
$queriesArg = array();
foreach($queryParamsAllow as $param) {
	$param = strtoupper();
    if (isset($query[$param])){
        $queriesArg[$param] = $query[$param];
    }
}
// force la valeur de certains parametres
if ($queriesArg['REQUEST'] == 'GETLEGENDGRAPHIC') {
	$queriesArg['REQUEST']  = 'GetLegendGraphic';
} else {
	$queriesArg['REQUEST']  = 'GetMap';	
}

$queriesArg['SERVICE']  = 'WMS';

$uri = $AppConf->mapserver_url.'&'.http_build_query($queriesArg);

//error_log($uri);
//echo '<br/>URI :<br/>'.$uri;
//exit();

header('Content-Type: image/png');
$content = file_get_contents($uri);
if ($content !== FALSE) {
    echo $content;
}