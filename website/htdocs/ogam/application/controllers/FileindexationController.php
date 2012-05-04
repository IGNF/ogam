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

		// TODO: check for the path APPLICATION_PATH.'/../public/pdf/'
		/*$pdf = Zend_Pdf::load(APPLICATION_PATH.'/../../custom/public/pdf/02-01.pdf');
		$pdfParse = new Genapp_Search_Helper_PdfParser();
		$contents = $pdfParse->pdf2txt($pdf->render());
		$this->view->contents = $contents;*/
		
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

	public function indexpdfsAction() {

        $indexKey = $this->_getParam("INDEX_KEY");

	    $config = Zend_Registry::get("configuration");
	    // The 'create' function is used to remove the old index
	    $index = Genapp_Search_Lucene::create($config->indices->$indexKey->directory);

	    $globOut = array();
	    foreach ($config->indices->$indexKey->filesDirectories as $filesDirectory) {
	        $globOut = array_merge($globOut, glob($filesDirectory . '*.pdf'));
        }
	    if (count($globOut) > 0) { // make sure the glob array has something in it
	        foreach ($globOut as $filename) {
	            $index = Genapp_Search_Lucene_Index_Pdfs::index($filename, $index);
	        }
	    }
	    $index->commit();
	    $this->_redirector->gotoUrl('/fileindexation');
	}

	// TODO: rebuild this function to work with the extjs interface
	public function searchAction()
	{
	    $filters = array('q' => array('StringTrim', 'StripTags'));
	    $validators = array('q' => array('presence' => 'required'));
	    $input = new Zend_Filter_Input($filters, $validators, $_GET);
	  
	    if (is_string($this->_request->getParam('q'))) {
	        $queryString = $input->getEscaped('q');
	        $this->view->queryString = $queryString;
	  
	        if ($input->isValid()) {
	            $config = Zend_Registry::get('configuration');
	            $index = Genapp_Search_Lucene::open($config->luceneIndex);
	  
	            $query = new Zend_Search_Lucene_Search_Query_Boolean();
	  
	            $pathTerm = new Zend_Search_Lucene_Index_Term($queryString);
	            $pathQuery = new Zend_Search_Lucene_Search_Query_Term($pathTerm);
	            $query->addSubquery($pathQuery, true);

                $pathTerm = new Zend_Search_Lucene_Index_Term('20091023', 'CreationDate');
                $pathQuery = new Zend_Search_Lucene_Search_Query_Term($pathTerm);
                $query->addSubquery($pathQuery, true);
	  
	            try {
	                $hits = $index->find($query);
	            } catch (Zend_Search_Lucene_Exception $ex) {
	                $hits = array();
	            }
	  
	            $this->view->hits = $hits;
	        } else {
	            $this->view->messages = $input->getMessages();
	        }
	    }
	}

    public function optimizeAction()
    {
        $indexKey = $this->_getParam("INDEX_KEY");

        // Open existing index
        $config = Zend_Registry::get('configuration');
        $index = Genapp_Search_Lucene::open($config->indices->$indexKey->directory);

        // Optimize index.
        $index->optimize();
        $this->_redirector->gotoUrl('/fileindexation');
    }
}
