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
	 * String _update
	 * @var _update
	 */
	protected $_update;

	/**
	 * Contructor
	 *
	 * @param Zend_View $view
	 * @return void
	 */
	public function __construct($indexKey, $update)
	{
	    $this->_indexKey = $indexKey;
	    $this->_update = $update;
	}

	public function dispatchLoopShutdown()
	{
		// The session registering must be done here.
		// It can't be done in the PostProcess because:
		// - We can't maintain a session during all the PostPorcess (Queue the other requests)
		// - We can't stop and start a new session during a PostPorcess (Headers already sent)
		if(FileindexationController::isRunningIndex($this->_indexKey)){
			$errorMessage = Zend_Registry::get('Zend_Translate')->translate('A process is already running.');
			$this->outputStringAndCloseConnection("{'success':false, errorMessage: \"".$errorMessage."\"}");
		} else {
			$this->registerFirstCommit($this->_indexKey);
			$this->outputStringAndCloseConnection("{'success':true}");
			$this->indexFiles($this->_indexKey, $this->_update);
		}
	}

	public static function outputStringAndCloseConnection($stringToOutput)
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

	public static function indexFiles($indexKey, $update = true, $verbose = false)
	{
		$logger = Zend_Registry::get('logger');
		$logger->debug('Start of the index pdfs PostProcess');

        $config = Zend_Registry::get("configuration");
		if($update == true){
	        // The 'create' function is used to remove the old index
	        $index = Genapp_Search_Lucene::open($config->indices->$indexKey->directory);
	        $index->optimize();
	    } else {
	        // The 'create' function is used to remove the old index
	        $index = Genapp_Search_Lucene::create($config->indices->$indexKey->directory);
	    }

	    $index->setMaxBufferedDocs(50);// (10) To increase for batch indexing (half of the allowed memory (see memory_get_usage(true) and memory_get_peak_usage(true)))
	    $index->setMaxMergeDocs(PHP_INT_MAX/2);// (PHP_INT_MAX) To decrease for batch indexing
	    $index->setMergeFactor(50);// (10) To increase for batch indexing

        $filesList = AbstractOGAMController::getFilesList($config->indices->$indexKey->filesDirectories, 'pdf');

        $count = count($filesList);
		if($verbose){ echo $count . " files found.\n\r"; }
		$startTime = time();
		$lastNumDocs = 0;
		$lastNumDocsChange = $startTime;
	    if (count($filesList) > 0) { // make sure the glob array has something in it
            // Deletion of the removed files
	    	if($update == true){
		    	for($i = 0; $i < $index->count(); $i++){
		    		if(!$index->isDeleted($i)){
		    			$doc = $index->getDocument($i);
		    			if(!file_exists($doc->getFieldValue('Filename'))){
		    				$index->deleted($i);
		    				$msg = 'Deletion of the file: '.$filename;
		    				$logger->debug($msg);
		    				if($verbose){ echo $msg."\n\r"; }
		    			}
		    			$doc = NULL;
		    			unset($doc);// for memory release
		    		}
		    	}
		    	$index->commit();
	    	}
	    	// Addition of the new files
	    	foreach ($filesList as $filename) {
	        	$logger->debug('Process running from: '.(time() - $startTime).'s');
	        	if($update == true){
	        		// Note: use termDocs() instead of find() for get a doc by its id
	        		$term = new Zend_Search_Lucene_Index_Term($filename, 'Filename');
					$docIds = $index->termDocs($term);
					if(count($docIds) == 0){
						self::indexPdf($index, $filename, $config->indices->$indexKey, $verbose);
					} else {
						$logger->debug('Skip of the file: '.$filename);
					}
					$term = NULL;
					unset($term);// for memory release
					$docIds = NULL;
					unset($docIds);// for memory release
	        	} else {
					self::indexPdf($index, $filename, $config->indices->$indexKey, $verbose);
	        	}
	        	$lastNumDocs++;
			    $fileIndexationTime = time() - $lastNumDocsChange;
			    $processTime = time() - $startTime;
			    $msg = "$filename $lastNumDocs/$count $fileIndexationTime/$processTime".'s';
			    $logger->debug($msg);
			    if($verbose){ echo $msg."\n\r"; }
				$lastNumDocsChange = time();
				$fileIndexationTime = $processTime = $msg = NULL;
				unset($fileIndexationTime);// for memory release
				unset($processTime);// for memory release
				unset($msg);// for memory release
	        }
	    }

        $logger->debug('End of the index pdfs PostProcess');
	}

	public static function indexPdf($index, $filename, $conf, $verbose = false)
	{
		Zend_Registry::get('logger')->debug('Indexation of the file: '.$filename);
        try {
        	$index = Genapp_Search_Lucene_Index_Pdfs::index(
            	$filename,
            	$index,
            	$conf->filesMetadata->toArray(),
            	$conf->filesCharset
            );
            $index->commit();
            if($verbose){
            	echo 'memory_get_usage : '.memory_get_usage(true)."\n\r";
            	echo 'memory_get_peak_usage : '.memory_get_peak_usage(true)."\n\r";
            }
        } catch(Exception $e){
        	Zend_Registry::get('logger')->err($e->getMessage());
        }
	}

	public static function registerFirstCommit($indexKey)
	{
		$fileIndexationNS = new Zend_Session_Namespace('fileIndexation');
		$fileIndexationNS->$indexKey = array(
			'lastNumDocs' => 0,
			'lastNumDocsChange' => time()
		);
	}
}

