<?php
require_once 'AbstractEforestController.php';

/**
 * PrivateDocumentationController is the controller that manages the documentation only accessible to the framework members.
 * @package controllers
 */
class PrivateDocumentationController extends AbstractEforestController {

	protected $_redirector = null;

	/**
	 * Initialise the controler
	 */
	public function init() {
		parent::init();

		// Set the current module name
		$websiteSession = new Zend_Session_Namespace('website');
		$websiteSession->module = "privatedocumentation";
		$websiteSession->moduleLabel = "Private Documentation";
		$websiteSession->moduleURL = "privatedocumentation";

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
		if (empty($permissions) || !array_key_exists('PRIVATE_DOCUMENTATION', $permissions)) {
			$this->_redirector->gotoUrl('/');
		}
	}

	/**
	 * The "index" action is the default action for all controllers.
	 */
	public function indexAction() {
		$this->logger->debug('Private Documentation index');

		$this->render('index');
	}

	/**
	 * The documents action.
	 */
	public function documentsAction() {
		$this->logger->debug('documents');

		$this->render('documents');
	}

	/**
	 * The fileformat action.
	 */
	public function fileformatAction() {
		$this->logger->debug('fileformat');

		$this->render('fileformat');
	}

	/**
	 * The manuals action.
	 */
	public function manualsAction() {
		$this->logger->debug('manuals');

		$this->render('manuals');
	}

	/**
	 * The faq action.
	 */
	public function faqAction() {
		$this->logger->debug('faq');

		$this->render('faq');
	}

	/**
	 * The meetings action.
	 */
	public function meetingsAction() {
		$this->logger->debug('meetings');

		$this->render('meetings');
	}

}
