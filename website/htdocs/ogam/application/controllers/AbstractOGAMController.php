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

/**
 * AbstractOGAMController is the common controler for the OGAM application.
 * @package controllers
 */
abstract class AbstractOGAMController extends Zend_Controller_Action {

	/**
	 * Base URL of the web site
	 */
	protected $baseUrl;

	/**
	 * Translator.
	 *
	 * @var Zend_Translate
	 */
	protected $translator;

	/**
	 * Initialise the controler
	 */
	public function init() {
		// Initialise the logger
		$bootstrap = $this->getInvokeArg('bootstrap');
		$this->logger = $bootstrap->getResource('log');
		$this->_redirector = $this->_helper->getHelper('Redirector');
		
		// Get the translator
		$this->translator = Zend_Registry::get('Zend_Translate');

		// Get the base URL
		$this->baseUrl = Zend_Controller_Front::getInstance()->getBaseUrl();
	}

	/**
	 * Check if the user session is valid.
	 */
	function preDispatch() {
		$userSession = new Zend_Session_Namespace('user');
		$user = $userSession->user;

		//$this->logger->debug("preDispatch controller : " . $this->getRequest()->getControllerName());
		//$this->logger->debug("preDispatch action : " . $this->getRequest()->getActionName());

		if (!empty($user)) {
			$this->logger->debug("preDispatch user logged : ".$user->username);
		} else {
		    $this->logger->debug('preDispatch user not logged (redirect to the user controller), session_id='.session_id());
			$this->_redirect('user');
		}
	}

	/**
	 * Return a list of the files contained in the provided directory and its subdirectories
	 *
	 * @param string $dir The directory
	 * @param string $fileType The file extension
	 */
	public static function getFilesInDir($dir, $fileType = null) {
	    $filesList = array();
	    $files = glob($dir.'/*');
	    foreach ($files as $file) {
	        if (is_dir($file)) {
	        	$filesList = array_merge($filesList, AbstractOGAMController::getFilesInDir($file, $fileType));
	        } else {
	        	if($fileType == null){
	        		$filesList[] = $file;
	        	} elseif(substr($file, -3 , 3) == $fileType){
	            	$filesList[] = $file;
	        	}
	        }
	    }
	    return $filesList;
	}

	/**
	 * Return a list of the files contained in the provided directories
	 *
	 * @param array $dirs The directories
	 * @param string $fileType The file extension
	 */
	public static function getFilesList($dirs, $fileType = null){
		$filesList = array();
		foreach ($dirs as $filesDirectory) {
			$filesList = array_merge($filesList, AbstractOGAMController::getFilesInDir($filesDirectory, $fileType));
		}
		return $filesList;
	}
}
