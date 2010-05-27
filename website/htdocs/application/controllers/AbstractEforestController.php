<?php

/**
 * AbstractEforestController is the common controler for the Eforest application.
 * @package controllers
 */
abstract class AbstractEforestController extends Zend_Controller_Action {

	/**
	 * Base URL of the web site
	 */
	protected $baseUrl;

	/**
	 * Initialise the controler
	 */
	public function init() {
		// Initialise the logger
		$this->logger = Zend_Registry::get('logger');
		$this->_redirector = $this->_helper->getHelper('Redirector');

		// Get the base URL from the config
		$configuration = Zend_Registry::get("configuration");
		$path_base_urls = $configuration->path_base_url->toArray();
		$this->baseUrl = $path_base_urls[0];
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
