<?php
require_once 'AbstractEforestController.php';

/**
 * DocumentationController is the controller that manages the documentation.
 * @package controllers
 */
class DocumentationController extends AbstractEforestController {

	protected $_redirector = null;

	/**
	 * Initialise the controler
	 */
	public function init() {
		parent::init();

		// Set the current module name
		$websiteSession = new Zend_Session_Namespace('website');
		$websiteSession->module = "documentation";
		$websiteSession->moduleLabel = "Documentation";
		$websiteSession->moduleURL = "documentation";

		// Load the redirector helper
		$this->_redirector = $this->_helper->getHelper('Redirector');

		// Initialise the models

	}

	/**
	 * Check if the authorization is valid this controler.
	 */
	function preDispatch() {

		parent::preDispatch();

		$userSession = new Zend_Session_Namespace('user');
		$permissions = $userSession->permissions;
		if (empty($permissions) || !array_key_exists('DOCUMENTATION', $permissions)) {
			$this->_redirector->gotoUrl('/');
		}
	}

	/**
	 * The "index" action is the default action for all controllers.
	 */
	public function indexAction() {
		$this->logger->debug('Documentation index');

		$this->render('index');
	}

}
