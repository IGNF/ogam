<?php
/**
 * This script index a set of pdf files defined per the index config
 * Use example: php indexPdf.php pdfIndex true
 * 
 * @param indexKey the index key defined in the config file
 * @param update if true the index is refreshed (check of the presence of the files only) else a new index is created
 */
include_once('setup.php');
require_once 'Zend/Search/Lucene/Proxy.php';
require_once 'Zend/Search/Lucene.php';
require_once 'Genapp/Search/Lucene.php';
require_once 'Genapp/Search/Lucene/Document.php';
require_once 'Genapp/Search/Helper/PdfParser.php';
require_once 'Zend/Pdf.php';
require_once 'Genapp/Search/Lucene/Index/Pdfs.php';
require_once 'Zend/Controller/Plugin/Abstract.php';
require_once 'Zend/Registry.php';
require_once 'Zend/Controller/Action.php';
require_once APPLICATION_PATH.'/controllers/AbstractOGAMController.php';
require_once 'Genapp/Controller/Plugin/PostProcessPdfIndexation.php';

// Setup the logger
require_once 'Zend/Log.php';
$logger = Zend_Log::factory(array(
    'timestampFormat' => 'Y-m-d',
    $ApplicationConf->resources->log->stream->toArray()
));
Zend_Registry::set('logger', $logger);
$logger->debug('Start of the index pdfs script');

// Get the config
$appIniFilePath = APPLICATION_PATH.'/configs/app.ini';
if (defined('CUSTOM_APPLICATION_PATH') && file_exists(CUSTOM_APPLICATION_PATH.'/configs/app.ini')) {
	$appIniFilePath = CUSTOM_APPLICATION_PATH.'/configs/app.ini';
}
$config = new Zend_Config_Ini($appIniFilePath, APPLICATION_ENV, array('allowModifications' => true));
Zend_Registry::set('configuration', $config);

// Get and check the index key parameter
$indexKey = $argv[1];
$logger->debug('$indexKey : ' .$indexKey);
$validIndexKeys = array_keys($config->indices->toArray());
if(!in_array($indexKey, $validIndexKeys)){
    throw new Exception('Invalid INDEX_KEY parameter');
}

// Get and check the update parameter
if(array_key_exists(2, $argv)){
	$update = $argv[2];
}else{
	$update = false;
}
if($update != true && $update != false){
	throw new Exception('Invalid UPDATE parameter');
}

Genapp_Controller_Plugin_PostProcessPdfIndexation::indexFiles($indexKey, $update, true);

$logger->debug('End of the index pdfs script');
