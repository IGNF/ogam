<?php
/**
* Zend Framework Controller Plugin to allow post output pdf indexation processing
*/
final class Genapp_Controller_Plugin_PostProcessPdfIndexation extends Zend_Controller_Plugin_Abstract {

	/**
	 * String _indexKey
	 * @var _indexKey
	 */
	protected $_indexKey;

	/**
	 * Contructor
	 *
	 * @param Zend_View $view
	 * @return void
	 */
	public function __construct($indexKey)
	{
	    $this->_indexKey = $indexKey;
	    
	    // Create application, bootstrap, and run
		$applicationIniFilePath = APPLICATION_PATH.'/configs/application.ini';
		if (defined('CUSTOM_APPLICATION_PATH') && file_exists(CUSTOM_APPLICATION_PATH.'/configs/application.ini')) {
			$applicationIniFilePath = CUSTOM_APPLICATION_PATH.'/configs/application.ini';
		}
		$applicationConf = new Zend_Config_Ini($applicationIniFilePath, APPLICATION_ENV, array('allowModifications' => true));
		$this->_sessionConfArray = $applicationConf->resources->session->toArray();
	}

	public function dispatchLoopShutdown()
	{
		// The session registering must be done here.
		// It can't be done in the PostProcess because:
		// - We can't maintain a session during all the PostPorcess (Queue the other requests)
		// - We can't stop and start a new session during a PostPorcess (Headers already sent)
		if(FileindexationController::isRunningIndex($this->_indexKey)){
			$this->_outputStringAndCloseConnection("{'success':false, errorMessage:'A process is already running.'}");
		} else {
			$this->_registerFirstCommit($this->_indexKey);
			$this->_outputStringAndCloseConnection("{'success':true}");
			$this->_indexpdf($this->_indexKey);
		}
	}

	private function _outputStringAndCloseConnection($stringToOutput)
	{
		// if some content, begin with ob_end_clean() or ob_clean();
	    // close current session
	    //Zend_Session::writeClose();
	    if (session_id()) session_write_close();
	    set_time_limit(0); 
	    ignore_user_abort(true);
	    // buffer all upcoming output - make sure we care about compression: 
	    if(!ob_start("ob_gzhandler")) ob_start();
	    echo $stringToOutput;    
	    // get the size of the output 
	    $size = ob_get_length();
	    // send headers to tell the browser to close the connection
	    header("Content-Length: $size"); 
	    header('Connection: close');
	    // flush all output 
	    ob_end_flush(); 
	    ob_flush();
	    flush();
	    ob_end_clean();
	}

	private function _indexpdf($indexKey)
	{
		Zend_Registry::get('logger')->debug('Start of the index pdfs PostProcess');

        $config = Zend_Registry::get("configuration");
	    // The 'create' function is used to remove the old index
	    $index = Genapp_Search_Lucene::create($config->indices->$indexKey->directory);

        $filesList = AbstractOGAMController::getFilesList($config->indices->$indexKey->filesDirectories, 'pdf');

	    if (count($filesList) > 0) { // make sure the glob array has something in it
	        foreach ($filesList as $filename) {
	            $index = Genapp_Search_Lucene_Index_Pdfs::index(
	            	$filename,
	            	$index,
	            	$config->indices->$indexKey->filesMetadata->toArray(),
	            	$config->indices->$indexKey->filesCharset
	            );
	            $index->commit();
	        }
	    }

        Zend_Registry::get('logger')->debug('End of the index pdfs PostProcess');
	}

	private function _registerFirstCommit($indexKey)
	{
		$fileIndexationNS = new Zend_Session_Namespace('fileIndexation');
		$fileIndexationNS->$indexKey = array(
			'lastNumDocs' => 0,
			'lastNumDocsChange' => time()
		);
	}
}

