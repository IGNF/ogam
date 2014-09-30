<?php
/**
 * Licensed under EUPL v1.1 (see http://ec.europa.eu/idabc/eupl).
 * 
 * © European Union, 2008-2012
 *
 * Reuse is authorised, provided the source is acknowledged. The reuse policy of the European Commission is implemented by a Decision of 12 December 2011.
 *
 * The general principle of reuse can be subject to conditions which may be specified in individual copyright notices. 
 * Therefore users are advised to refer to the copyright notices of the individual websites maintained under Europa and of the individual documents. 
 * Reuse is not applicable to documents subject to intellectual property rights of third parties.
 */
require_once 'IndexedfilequeryController.php';

class IndexationController extends IndexedfilequeryController {

	/**
	 * Check if the authorization is valid this controler.
	 *
	 * @throws an Exception if the user doesn't have the rights
	 */
	function preDispatch() {

		parent::preDispatch();

		$userSession = new Zend_Session_Namespace('user');
		$permissions = $userSession->permissions;
		if (empty($permissions) || !array_key_exists('INDEX_FILE', $permissions)) {
			throw new Zend_Auth_Exception('Permission denied for right : INDEX_FILE');
		}
	}

	/**
	 * Initialise the controler
	 */
	public function init() {
		parent::init();

		// Set the current module name
		$websiteSession = new Zend_Session_Namespace('website');
		$websiteSession->module = "indexation";
		$websiteSession->moduleLabel = "Indexation";
		$websiteSession->moduleURL = "indexation";
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
		$indexationNS = new Zend_Session_Namespace('indexation');
		$indexNS = &$indexationNS->$indexKey;
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
				$errorMessage = $this->view->translate('An error occured during the indexation process.');
				echo "{'success': false, 'errorMessage': \"".$errorMessage."\"}";
			}
		}

		$this->_helper->layout()->disableLayout();
		$this->_helper->viewRenderer->setNoRender();

		$this->logger->debug('End of the get index pdf status action (File index process running for '.$passedTime.'s)');
	}

	public static function isRunningIndex($indexKey){
		$indexationNS = new Zend_Session_Namespace('indexation');
		// Check if no process are running
		if ($indexationNS->$indexKey) {
			$indexNS = &$indexationNS->$indexKey;
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

	public function optimizeAction()
	{
		$indexKey = $this->_getIndexKey();

		// Open existing index
		$config = Zend_Registry::get('configuration');
		$index = Genapp_Search_Lucene::open($config->indices->$indexKey->directory);

		// Optimize index.
		$index->optimize();
		$this->_redirector->gotoUrl('/indexation');
	}
}
