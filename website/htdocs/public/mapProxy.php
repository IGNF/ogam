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
require_once APPLICATION_PATH . '/../lib/Zend/Session.php';
require_once APPLICATION_PATH . '/../lib/Zend/Registry.php';

Zend_Session::setOptions($ApplicationConf->resources->session->toArray());

$userSession = new Zend_Session_Namespace('user');
$configurationSession = new Zend_Session_Namespace('configuration');
$mapServiceURL = $configurationSession->configuration['map_service_url'];

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

parse_str(ltrim($_SERVER["QUERY_STRING"],'?'), $query); //recupere la requete envoyée partie (GET params)...
$query = array_change_key_case($query, CASE_UPPER); // force les clés en majuscule
$queryParamsAllow = array(//paramNom => requis
    'BBOX' ,
    'LAYERS' ,
    'EXCEPTIONS' ,
    'SRS' ,
    'CRS' ,
    'FORMAT' ,
    'WIDTH' ,
    'HEIGHT' ,
    'SESSION_ID' ,
    'TRANSPARENT' ,
    'VERSION' ,
    'STYLES' ,
	'REQUEST' ,
	'QUERY_LAYERS' ,
	'X' ,
	'Y' ,
	'INFO_FORMAT' ,
	'HASSLD' ,
	'SERVICE' ,
	'REQUEST' ,
	'FORMAT' ,
	'LAYER' ,
	'MAP.SCALEBAR',
    'OUTPUTFORMAT',
    'TYPENAME',
    'SRSNAME'
);

// Vérifie que les paramètres sont dans la liste des ceux autorisés
$queriesArg = array();
foreach($queryParamsAllow as $param) {
    if (isset($query[$param])){
        $queriesArg[$param] = $query[$param];
    }
}
// force la valeur de REQUEST
if (strcasecmp($queriesArg['REQUEST'] , "getlegendgraphic") == 0) {
	$queriesArg['REQUEST']  = 'GetLegendGraphic';
} else if (strcasecmp($queriesArg['REQUEST'] , "getmap") == 0) {
	$queriesArg['REQUEST']  = 'GetMap';	
} else {
    $queriesArg['REQUEST']  = 'GetFeature';
}

// force la valeur de SERVICE
$geoJSONOFRequired = false;
if (strcasecmp($queriesArg['SERVICE'] , "WFS") !== 0) {
    header('Content-Type: image/png');
    $queriesArg['SERVICE']  = 'WMS';
} elseif (strcasecmp($queriesArg['OUTPUTFORMAT'] , "geojsonogr") == 0 || strcasecmp($queriesArg['OUTPUTFORMAT'] , "geojsontpl") == 0) {
    $geoJSONOFRequired = true;
    header('Content-Type: application/json,subtype=geojson,charset=utf-8');
}

$uri = rtrim($mapServiceURL,'?').'?'.http_build_query($queriesArg);
//echo $uri;exit;
//error_log($uri);

$content = file_get_contents($uri);
if ($content !== FALSE) {
    if ($content === "" && $geoJSONOFRequired) { // BugFix: gdal-bin 1.10 OGR driver return nothing when there are no feature
        echo '{
            "type": "FeatureCollection",
            "features": []
        }';
    } else {
        echo $content;
    }
}