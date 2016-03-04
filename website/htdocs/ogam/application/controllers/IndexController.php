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
 * IndexController is the default controller for this application
 *
 * @package controllers
 */
class IndexController extends Zend_Controller_Action {

	/**
	 * Initialise the controler
	 */
	public function init() {
		parent::init();
		
		// Set the current module name
		$websiteSession = new Zend_Session_Namespace('website');
		$websiteSession->module = "";
		
		// Initialise the logger
		$bootstrap = $this->getInvokeArg('bootstrap');
		$this->logger = $bootstrap->getResource('log');
	}

	/**
	 * The "index" action is the default action for all controllers.
	 * This
	 * will be the landing page of your application.
	 */
	public function indexAction() {
		$this->logger->debug('index');
				
		$this->render('index');
	}
}
