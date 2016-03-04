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
 *
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
		
		if (!empty($user)) {
			$this->logger->debug("preDispatch user logged : " . $user->username);
		} else {
			$this->logger->debug('preDispatch user not logged (redirect to the user controller), session_id=' . session_id());
			$this->_redirect('user');
		}
	}
}
