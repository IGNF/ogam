<?php
/**
 * © French National Forest Inventory 
 * Licensed under EUPL v1.1 (see http://ec.europa.eu/idabc/eupl).
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
	 * The logger
	 */
	protected $logger;

	/**
	 * Initialise the controler
	 */
	public function init() {
		// Initialise the logger
		$bootstrap = $this->getInvokeArg('bootstrap');
		$this->logger = $bootstrap->getResource('log');
		$this->_redirector = $this->_helper->getHelper('Redirector');

		// Get the base URL 
		$this->baseUrl = Zend_Controller_Front::getInstance()->getBaseUrl();
	}

	/**
	 * Check if the user session is valid.
	 */
	function preDispatch() {
		$userSession = new Zend_Session_Namespace('user');
		$user = $userSession->user;

		if (!empty($user)) {
			$this->logger->debug("preDispatch user logged : ".$user->username);
		} else {
		    $this->logger->debug("preDispatch user not logged (redirect to the user controller)");
			$this->_redirect('user');
		}
	}

}
