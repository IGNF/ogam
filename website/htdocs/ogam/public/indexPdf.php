<?php
include_once('setup.php');
require_once 'Zend/Search/Lucene/Proxy.php';
require_once 'Zend/Search/Lucene.php';
require_once 'Genapp/Search/Lucene.php';
require_once 'Genapp/Search/Lucene/Document.php';
require_once 'Genapp/Search/Helper/PdfParser.php';
require_once 'Zend/Pdf.php';
require_once 'Genapp/Search/Lucene/Index/Pdfs.php';

//set_time_limit(0);

//phpinfo();

// Get the config
$appIniFilePath = APPLICATION_PATH.'/configs/app.ini';
if (defined('CUSTOM_APPLICATION_PATH') && file_exists(CUSTOM_APPLICATION_PATH.'/configs/app.ini')) {
	$appIniFilePath = CUSTOM_APPLICATION_PATH.'/configs/app.ini';
}
$config = new Zend_Config_Ini($appIniFilePath, APPLICATION_ENV, array('allowModifications' => true));

// Check the index key
$indexKey = $argv[1];
$validIndexKeys = array_keys($config->indices->toArray());
if(!in_array($indexKey, $validIndexKeys)){
    throw new Exception('Invalid INDEX_KEY');
}

// The 'create' function is used to remove the old index
$index = Genapp_Search_Lucene::create($config->indices->$indexKey->directory);

function getPdfInDir($dir) {
    $filesList = array();
    $files = glob($dir.'/*');
    foreach ($files as $file) {
        if (is_dir($file)) {
        	$filesList = array_merge($filesList, getPdfInDir($file));
        } else {
        	if(substr($file, -3 , 3) == 'pdf'){
            	$filesList[] = $file;
        	}
        }
    }
    return $filesList;
}
function getPdfList($dirs){
	$filesList = array();
	foreach ($dirs as $filesDirectory) {
		$filesList = array_merge($filesList, getPdfInDir($filesDirectory));
	}
	return $filesList;
}

$filesList = getPdfList($config->indices->$indexKey->filesDirectories);
echo count($filesList) . " files found.\n\r";

if (count($filesList) > 0) { // make sure the glob array has something in it
	foreach ($filesList as $filename) {
        $index = Genapp_Search_Lucene_Index_Pdfs::index(
	    	$filename,
	    	$index,
	    	$config->indices->$indexKey->filesMetadata->toArray(),
	    	$config->indices->$indexKey->filesCharset
	    );
	    echo $filename."\n\r";
	}
}
$index->commit();
