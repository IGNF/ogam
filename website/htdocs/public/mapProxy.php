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
if (defined('INHERENT_APPLICATION_PATH') && file_exists(INHERENT_APPLICATION_PATH.'/configs/substitute/app.ini')) {
    $appIniFilePath = INHERENT_APPLICATION_PATH.'/configs/substitute/app.ini';
}
$AppConf = new Zend_Config_Ini($appIniFilePath, APPLICATION_ENV, array('allowModifications' => true));
if (defined('INHERENT_APPLICATION_PATH') && file_exists(INHERENT_APPLICATION_PATH.'/configs/patch/app.ini')) {
    $appIniPatchPath = INHERENT_APPLICATION_PATH.'/configs/patch/app.ini';
    $patchConfiguration = new Zend_Config_Ini($appIniPatchPath, APPLICATION_ENV);
    $AppConf->merge($patchConfiguration);
}

Zend_Session::setOptions($ApplicationConf->resources->session->toArray());

$userSession = new Zend_Session_Namespace('user');
if(!$userSession->connected){
    error_log('User not connected on '.$_SERVER["HTTP_HOST"]);
    error_log('Request: '.$_SERVER["QUERY_STRING"]);
    onfailure(BASE_URL);
}
/*
$permissions = $userSession->permissions;
$role = $userSession->role;
if (empty($permissions) || !array_key_exists('DATA_QUERY',$permissions)) {
    onfailure(BASE_URL);
}*/

//Zend_Session::stop(); // Doesn't work well
session_write_close();//libere le cookie/session

parse_str($_SERVER["QUERY_STRING"],$query);//recupere la requete envoyée partie (GET params)...

$queryParamsAllow = array(//paramNom => requis
    'BBOX' => true,
    'LAYERS' =>true,
    'EXCEPTIONS' =>true,
    'SRS' =>true,
    'FORMAT' => true,
    'WIDTH' => false,
    'HEIGHT' => false,
    'sessionid' => true,
    'TRANSPARENT' => true,
    'VERSION' => true,
    'STYLES' => true
);

$queriesArg = array();

foreach($queryParamsAllow as $param => $isReq){
    if($isReq && !isset($query[$param])){
        error_log('Request param not found.');
        error_log('Request: '.$_SERVER["QUERY_STRING"]);
        onfailure(BASE_URL);
    }
    if(isset($query[$param])){
        $queriesArg[$param] = $query[$param];
    }
}
//force la valeur de certains parametres
$queriesArg['request']  = 'GetMap';
$queriesArg['service']  = 'WMS';

$uri = $AppConf->mapserver_url . http_build_query($queriesArg);
//error_log($uri);
header('Content-Type: image/png');
$content = file_get_contents($uri);
if ($content !== FALSE) {
    echo $content;
}