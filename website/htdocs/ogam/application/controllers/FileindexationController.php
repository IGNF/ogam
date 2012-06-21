<?php
/**
 * © French National Forest Inventory
 * Licensed under EUPL v1.1 (see http://ec.europa.eu/idabc/eupl).
 */
require_once 'AbstractOGAMController.php';

/**
 * UsermanagementController is the controller that manages the users
 * @package controllers
 */
class FileindexationController extends AbstractOGAMController {

	/**
	 * Initialise the controler
	 */
	public function init() {
		parent::init();

		// Set the current module name
		$websiteSession = new Zend_Session_Namespace('website');
		$websiteSession->module = "user";
		$websiteSession->moduleLabel = "File Indexation";
		$websiteSession->moduleURL = "fileindexation";
	}

	/**
	 * The "index" action is the default action for all controllers.
	 */
	public function indexAction() {
		$this->logger->debug('File indexation index');

		// Open Index
		$config = Zend_Registry::get('configuration');
		$indices = array();
		foreach($config->indices as $indexKey => $indexCfg){
			$index = Genapp_Search_Lucene::open($indexCfg->directory);
			$indices[$indexKey] = array(
					'indexSize' => $index->count(),
					'documentsCount' => $index->numDocs(),
					'indexDirectory' => $indexCfg->directory,
					'filesDirectories' => $indexCfg->filesDirectories,
					'isRunning' => $this->isRunningIndex($indexKey)
			);
		}
		$this->view->indices = $indices;
	}

	/**
	 * Check if the authorization is valid this controler.
	 *
	 * @throws an Exception if the user doesn't have the rights
	 */
	function preDispatch() {

		parent::preDispatch();

		$userSession = new Zend_Session_Namespace('user');
		$permissions = $userSession->permissions;
		$role = $userSession->role;
		if (empty($permissions) || !array_key_exists('INDEX_FILE', $permissions)) {
			throw new Zend_Auth_Exception('Permission denied for right : INDEX_FILE');
		}
	}

	public function parsepdfAction(){

		$indexKey = $this->_getIndexKey();
		$file = urldecode($this->_getParam("file"));

		$pdf = Zend_Pdf::load($file);
		$pdfParse = new Genapp_Search_Helper_PdfParser();
		$config = Zend_Registry::get('configuration');
		$content = iconv($config->indices->$indexKey->filesCharset,'UTF-8',$pdfParse->pdf2txt($pdf->render()));
		$this->view->file = $file;
		$this->view->content = $content;
		$this->view->indexKey = $indexKey;
	}
	
	public function launchindexAction() {
		$this->logger->debug('Start of the launch index action');

		$update = $this->_getParam("UPDATE");

		// Check the update parameter
		if($update != true && $update != false){
			throw new Exception('Invalid UPDATE parameter');
		}

		$front = Zend_Controller_Front::getInstance();
		$front->registerPlugin(new Genapp_Controller_Plugin_PostProcessPdfIndexation($this->_getIndexKey(), $update));

		$this->_helper->layout()->disableLayout();
		$this->_helper->viewRenderer->setNoRender();

		$this->logger->debug('End of the launch index action');
	}

	public function getindexstatusAction() {
		$this->logger->debug('Start of the get index pdf status action');
		
		$indexKey = $this->_getIndexKey();

		$config = Zend_Registry::get("configuration");
		$index = Genapp_Search_Lucene::open($config->indices->$indexKey->directory);
		$filesList = AbstractOGAMController::getFilesList($config->indices->$indexKey->filesDirectories, 'pdf');

		// The session registering must be done here.
		// It can't be done in the PostProcess because:
		// - We can't maintain a session during all the PostPorcess (Queue the other requests)
		// - We can't stop and start a new session during a PostPorcess (Headers already sent)
		$fileIndexationNS = new Zend_Session_Namespace('fileIndexation');
		$indexNS = &$fileIndexationNS->$indexKey;
		if ($indexNS['lastNumDocs'] != $index->numDocs()) {
			$indexNS = array(
				'lastNumDocs' => $index->numDocs(),
				'lastNumDocsChange' => time(),
				'indexationDone' => ($index->numDocs() == count($filesList))
			);
		}
		$lastNumDocsChange = $indexNS['lastNumDocsChange'];
		$maxFileIndexTime = $config->indices->$indexKey->maxFileIndexTime;
		$passedTime = time() - $lastNumDocsChange;

		if((time() - $lastNumDocsChange) < $maxFileIndexTime ){// An indexation process is running
			echo "{'success': true, 'progress': ".$index->numDocs().", 'count':".count($filesList)."}";
		} else {// No indexation process is running
			if($index->numDocs() == count($filesList)){
				echo "{'success': true, 'progress': ".$index->numDocs().", 'count':".count($filesList)."}";
			} else {// Error during the indexation process
				echo "{'success': false, 'errorMessage': 'An error occured during the indexation process.'}";
			}
		}

		$this->_helper->layout()->disableLayout();
		$this->_helper->viewRenderer->setNoRender();

		$this->logger->debug('End of the get index pdf status action (File index process running from '.$passedTime.'s)');
	}

	public static function isRunningIndex($indexKey){
		$fileIndexationNS = new Zend_Session_Namespace('fileIndexation');
		// Check if no process are running
		if ($fileIndexationNS->$indexKey) {
			$indexNS = &$fileIndexationNS->$indexKey;
			$indexationDone = $indexNS['indexationDone'];
			$lastNumDocsChange = $indexNS['lastNumDocsChange'];
			$config = Zend_Registry::get("configuration");
			$maxFileIndexTime = $config->indices->$indexKey->maxFileIndexTime;
			if( $indexationDone == true || (time() - $lastNumDocsChange) > $maxFileIndexTime){
				// We can launch a new indexation
				return false;
			} else {
				// We can't launch a new indexation because a process may be running
				return true;
			}
		} else {
			return false;
		}
	}

	public function _indexpdfs() {

		set_time_limit(0);
		$this->logger->debug('Start of the index pdfs action');
		
        $indexKey = $this->_getIndexKey();

        $config = Zend_Registry::get("configuration");
	    // The 'create' function is used to remove the old index
	    $index = Genapp_Search_Lucene::create($config->indices->$indexKey->directory);

        $filesList = $this->_getFilesList($config->indices->$indexKey->filesDirectories, 'pdf');

	    if (count($filesList) > 0) { // make sure the glob array has something in it
	        foreach ($filesList as $filename) {
	            $index = Genapp_Search_Lucene_Index_Pdfs::index(
	            	$filename,
	            	$index,
	            	$config->indices->$indexKey->filesMetadata->toArray(),
	            	$config->indices->$indexKey->filesCharset
	            );
	        }
	    }
	    $index->commit();

        $this->logger->debug('End of the index pdfs action');

		$this->_helper->layout()->disableLayout();
		$this->_helper->viewRenderer->setNoRender();
	}

	private function _getIndexKey() {
		$indexKey = $this->_getParam("INDEX_KEY");

		// Check the index key
		$config = Zend_Registry::get('configuration');
		$validIndexKeys = array_keys($config->indices->toArray());
		if(!in_array($indexKey, $validIndexKeys)){
			throw new Exception('Invalid INDEX_KEY');
		}
		return $indexKey;
	}

	private function _getSearchFilterInput($indexKey) {
		$metaValues = $this->_getPdfsMetadataValues($indexKey);
		$filters = array();
		$validators = array();
		foreach($metaValues as $meta => $metaValue){
			//$filters[$meta] = array('StringTrim', 'StripTags');
			$validators[$meta] = array(new Zend_Validate_InArray($metaValue), 'allowEmpty' => true);
		}
		// TEXT
		$filters['TEXT'] = array('StringTrim', 'StripTags');
		$validators['TEXT'] = array('allowEmpty' => true); // The validator declaration is mandatory
		$input = new Zend_Filter_Input($filters, $validators, $_POST);
		return $input;
	}

	public function searchAction()
	{
		$indexKey = $this->_getIndexKey();
		$input = $this->_getSearchFilterInput($indexKey);
		if ($input->isValid()) {
			$config = Zend_Registry::get('configuration');
			$index = Genapp_Search_Lucene::open($config->indices->$indexKey->directory);

			$query = new Zend_Search_Lucene_Search_Query_Boolean();

			$filesMetadata = $config->indices->$indexKey->filesMetadata->toArray();
			$filesCharset = $config->indices->$indexKey->filesCharset;
			foreach($filesMetadata as $meta){
				$value = $input->getUnescaped($meta);

				if(is_string($value) && $value != ''){
					$pathTerm = new Zend_Search_Lucene_Index_Term($value, $meta);
					$pathQuery = new Zend_Search_Lucene_Search_Query_Term($pathTerm);
					$query->addSubquery($pathQuery, true);
				}
			}

			$text = $input->getUnescaped('TEXT');
			if(is_string($text) && $text != ''){
				// The text must be lowered in the case of the use of Utf8Num_CaseInsensitive analyzer
				// Don't use strtolower ('alphabetic' is determined by the current locale)
				// because the accentued characters will not be converted.
				// Use mb_strtolower instead.
				$pathQuery = new Zend_Search_Lucene_Search_Query_Phrase(explode(' ', mb_strtolower($text, 'UTF-8')));
				$query->addSubquery($pathQuery, true);
			}

			try {
				$hits = $index->find($query);
			} catch (Zend_Search_Lucene_Exception $ex) {
				$hits = array();
			}

			$results = array();
			foreach ($hits as $hit) {
				$result = array();
				$result['id'] = $hit->id;
				$result['score'] = $hit->score;
				$result['url'] = $hit->url;

				foreach($filesMetadata as $meta){
					$result[$meta] = $hit->getDocument()->$meta;
				}
				$results[] = $result;
			}

			$response = array(
					'success' => true,
					'hits' => $results
			);
			echo json_encode($response);
		} else {
			// Setup the response
			$msgs = $input->getMessages();
			$errors = array();
			foreach($msgs as $meta => $errormsgs){
				$errors[$meta] = implode ( '. ' , $errormsgs );
			}
			$response = array(
					'success' => false,
					'errors' => $errors
			);
			echo json_encode($response);
		}

		// No View, we send directly the JSON
		$this->_helper->layout()->disableLayout();
		$this->_helper->viewRenderer->setNoRender();
		$this->getResponse()->setHeader('Content-type', 'application/json; charset=UTF-8');
	}

	public function getmetadatafieldsAction()
	{
		// Release the session to unblock the other requests
		Zend_Session::writeClose();

		// Get the params
		$indexKey = $this->_getIndexKey();

		$config = Zend_Registry::get('configuration');
		$filesMetadata = $config->indices->$indexKey->filesMetadata->toArray();

		$metaValues = $this->_getPdfsMetadataValues($indexKey);
		$fields = array();
		// Loop on the conf metadata array to keep the good metadata order
		foreach($filesMetadata as $meta){
			$values = $metaValues[$meta];
			if(!empty($values)){
				$fields[] = array(
						'name' => $meta,
						'label' => $this->view->translate($meta),
						'data' => $values
				);
			}
		}
		 
		echo json_encode($fields);

		// No View, we send directly the JSON
		$this->_helper->layout()->disableLayout();
		$this->_helper->viewRenderer->setNoRender();
		$this->getResponse()->setHeader('Content-type', 'application/json; charset=UTF-8');
	}

	public function _getPdfsMetadataValues($indexKey)
	{
		ini_set('max_execution_time', '300');

		$config = Zend_Registry::get('configuration');

		// Get the cache
		$cacheKey = 'getmetadatafields' . $indexKey;
		$manager = $this->getFrontController()
		->getParam('bootstrap')
		->getPluginResource('cachemanager')
		->getCacheManager();
		$fileindexCache = $manager->getCache('fileindex');
		$useCache = $config->useCache;

		if ($useCache) {
			$cachedResult = $fileindexCache->load($cacheKey);
		}
		if (empty($cachedResult)) {
			$filesList = AbstractOGAMController::getFilesList($config->indices->$indexKey->filesDirectories, 'pdf');
			if (count($filesList) > 0) { // make sure the glob array has something in it
				$indexValues = array();
				foreach ($filesList as $filename) {
					try {
						$pdf = Zend_Pdf::load($filename);
					} catch(Exception $e){
						$this->logger->err('Unable to load the file: '.$filename);
			            $this->logger->err($e->getMessage());
			        }

					$filesMetadata = $config->indices->$indexKey->filesMetadata->toArray();

					// Go through each meta data item and add to index array.
					foreach ($pdf->properties as $meta => $metaValue) {
						if(in_array($meta, $filesMetadata)){
							$value = $pdf->properties[$meta];
							$filesCharset = $config->indices->$indexKey->filesCharset;
							$value = iconv($filesCharset, "UTF-8//TRANSLIT", $value);
							if(empty($indexValues[$meta]) || !in_array($value, $indexValues[$meta])){
								$indexValues[$meta][] = $value;
							}
						}
					}

					// Short File name
					$splitedFilename = preg_split("/[\\/\\\\]+/",$filename);
					$shortFileName = $splitedFilename[count($splitedFilename)- 1];
						
					// Small file name and Extension
					$smallFilename	= preg_split("/[\\.]+/",$shortFileName);
					$extension = array_pop($smallFilename);
					$smallFilename = implode(".", $smallFilename);
						
					// Set the 'FileName', 'ShortFileName', 'Extension'
					if(in_array('ShortFileName', $filesMetadata)
							&& (empty($indexValues['ShortFileName']) || !in_array($filename, $indexValues['ShortFileName']))){
						$indexValues['ShortFileName'][] = $shortFileName;
					}
					if(in_array('SmallFileName', $filesMetadata)
							&& (empty($indexValues['SmallFileName']) || !in_array($filename, $indexValues['SmallFileName']))){
						$indexValues['SmallFileName'][] = $smallFilename;
					}
					if(in_array('Extension', $filesMetadata)
							&& (empty($indexValues['Extension']) || !in_array($filename, $indexValues['Extension']))){
						$indexValues['Extension'][] = $extension;
					}
				}
			}
			foreach($indexValues as $meta => $metaValues){
				sort($indexValues[$meta]);
			}

			if ($useCache) {
				$fileindexCache->save($indexValues, $cacheKey);
			}
			return $indexValues;
		} else {
			return $cachedResult;
		}
	}

	public function optimizeAction()
	{
		$indexKey = $this->_getIndexKey();

		// Open existing index
		$config = Zend_Registry::get('configuration');
		$index = Genapp_Search_Lucene::open($config->indices->$indexKey->directory);

		// Optimize index.
		$index->optimize();
		$this->_redirector->gotoUrl('/fileindexation');
	}
}
