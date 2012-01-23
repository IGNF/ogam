<?php
/**
 * © French National Forest Inventory
 * Licensed under EUPL v1.1 (see http://ec.europa.eu/idabc/eupl).
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
	 * The "index" action is the default action for all controllers. This
	 * will be the landing page of your application.
	 */
	public function indexAction() {

		$this->logger->debug('custom index');

		$this->render('custom-index');

	}


}
