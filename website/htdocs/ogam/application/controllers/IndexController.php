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
	}

	/**
	 * The "index" action is the default action for all controllers. This
	 * will be the landing page of your application.
	 *
	 * Assuming the default route and default router, this action is dispatched
	 * via the following urls:
	 *   /
	 *   /index/
	 *   /index/index
	 *
	 * @return void
	 */
	public function indexAction() {
		/*
		 There is nothing inside this action, but it will still attempt to
		 render a view.  This is because by default, the front controller
		 uses the ViewRenderer action helper to handle auto rendering
		 In the MVC grand scheme of things, the ViewRenderer allows us to
		 draw the line between the C and V in the MVC.  Also note this action
		 helper is optional, but on default.
		 */
	}

	
}
