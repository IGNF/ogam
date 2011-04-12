<?php
/**
 * © French National Forest Inventory 
 * Licensed under EUPL v1.1 (see http://ec.europa.eu/idabc/eupl).
 */ 

/**
 * AbstractEforestController is the common controler for the Eforest application.
 * @package controllers
 */
abstract class Genapp_Controller_AbstractEforestController extends Zend_Controller_Action {

	/**
	 * Base URL of the web site
	 */
	protected $baseUrl;

	/**
	 * Initialise the controler
	 */
	public function init() {
		// Initialise the logger
		$bootstrap = $this->getInvokeArg('bootstrap');
		$this->logger = $bootstrap->getResource('log');
		$this->_redirector = $this->_helper->getHelper('Redirector');

		// Get the base URL from the config
		$configuration = Zend_Registry::get("configuration");
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
			$this->_redirect('user');
		}
	}

}
