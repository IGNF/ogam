<?php
/**
 * © French National Forest Inventory
 * Licensed under EUPL v1.1 (see http://ec.europa.eu/idabc/eupl).
 */
//require_once APPLICATION_PATH.'/models/website/User.php';
//require_once APPLICATION_PATH.'/models/website/Role.php';
//require_once 'Genapp/models/metadata/Metadata.php';

/**
 * UserController is the controller that manages the current user session
 * @package controllers
 */
class UserController extends Zend_Controller_Action {

	/**
	 * Base URL of the web site
	 */
	protected $baseUrl;

	/**
	 * Initialise the controler
	 */
	public function init() {
		parent::init();

		// Initialise the logger
		$bootstrap = $this->getInvokeArg('bootstrap');
		$this->logger = $bootstrap->getResource('log');

		// Initialise the models
		$this->metadataModel = new Genapp_Model_DbTable_Metadata_Metadata();
		$this->userModel = new Application_Model_DbTable_Website_User();
		$this->roleModel = new Application_Model_DbTable_Website_Role();

		// Get the base URL from the config
		$configuration = Zend_Registry::get("configuration");
		$this->baseUrl = Zend_Controller_Front::getInstance()->getBaseUrl();
	}

	/**
	 * The "index" action is the default action for all controllers.
	 */
	public function indexAction() {
		$this->logger->debug('Start of UserController->indexAction()');

		$this->showLoginFormAction();
	}

	/**
	 * Build and return the login form.
	 */
	private function _getLoginForm($salt) {

		$form = new Zend_Form();
		$form->setAction($this->baseUrl.'/user/validate-login');
		$form->setMethod('post');

		// Create and configure login element:
		$login = $form->createElement('text', 'login');
		$login->setLabel('Login');
		$login->addValidator('alnum');
		$login->addValidator('regex', false, array('/^[a-z]+/'));
		$login->addValidator('stringLength', false, array(2, 20));
		$login->addValidator(new Genapp_Validate_UserExist());
		$login->setRequired(true);
		$login->addFilter('StringToLower');

		// Create and configure password element:
		$password = $form->createElement('password', 'password');
		$password->setLabel('Password');
		$password->setRequired(true);

		// Create and configute a hidden "login_salt" element for the Challenge - Response mecanisme
		$loginSalt = $form->createElement('hidden', 'login_salt');
		$loginSalt->setValue($salt);

		$submit = $form->createElement('submit', 'submit');
		$submit->setLabel('Log in');

		// Add elements to form:
		$form->addElement($login);
		$form->addElement($password);
		$form->addElement($loginSalt);
		$form->addElement($submit);

		// Add the javascript launch
		$form->addAttribs(array('onSubmit' => 'cram()'));

		return $form;
	}

	/**
	 * Return the login form.
	 *
	 * @param String $errorMessage a potential error message
	 */
	public function showLoginFormAction($errorMessage = null) {

		$this->logger->debug('Start of UserController->showLoginFormAction($errorMessage)'.$errorMessage);

		// Generate a salt and store id in session
		$salt = md5(uniqid(rand(), true));
		$authenticationSession = new Zend_Session_Namespace('auth');
		$authenticationSession->salt = $salt;
		if (isset($_SERVER['HTTP_REFERER'])) {
			$authenticationSession->referer = $_SERVER['HTTP_REFERER'];
		}
		//$this->logger->debug('generated salt  : ' . $salt);

		// Get the login form
		$this->view->form = $this->_getLoginForm($salt);

		// Eventually add an error message
		if (!empty($errorMessage)) {
			$this->view->form->getElement('login')->addError($errorMessage);
		}

		$this->render('show-login-form');
	}

	/**
	 * Check the login form validity and log the user.
	 *
	 * @return a View.
	 */
	public function validateLoginAction() {
		$this->logger->debug('validateLogin');

		try {

			// Check the validity of the POST
			if (!$this->getRequest()->isPost()) {
				$this->logger->debug('form is not a POST');
				return $this->_forward('index');
			}

			// Retrieve salt from session and erase it since it's used once
			$authenticationSession = new Zend_Session_Namespace('auth');
			$salt = $authenticationSession->salt;
			unset($authenticationSession->salt);

			// Check the validity of the form
			$form = $this->_getLoginForm($salt);
			if (!$form->isValid($_POST)) {
				// Failed validation; redisplay form
				$this->logger->debug('form is not valid');
				$this->view->form = $form;
				return $this->render('show-login-form');
			}

			// Check the validity of the login
			$this->logger->debug('Check the validity of the login');
			$values = $form->getValues();
			$f = new Zend_Filter_StripTags();
			$login = $f->filter($values['login']);
			$cramFromClient = $f->filter($values['password']);

			$this->logger->debug('encoded login : '.sha1($values['login']));

			// Retrieve the password from database
			$storedpassword = $this->userModel->getPassword($login);

			// Calculate the sha1 of salt + password
			$cramFromServer = sha1($salt.$storedpassword);

			// Compare the client-side and server-side responses and log the user if OK
			if ($cramFromServer == $cramFromClient) {

				// Get the user informations
				$user = $this->userModel->getUser($login);

				// Store the user in session
				$userSession = new Zend_Session_Namespace('user');
				$userSession->user = $user;

				// Get the user role
				$role = $this->roleModel->getRole($user->roleCode);

				// Store the role in session
				$userSession->role = $role;

				// Get the User Permissions
				$permissions = $this->roleModel->getRolePermissions($role->roleCode);
				$userSession->permissions = $permissions;

				// Redirect to the main page
				$configuration = Zend_Registry::get("configuration");
				if ($configuration->autoLogin == 1) {
					$this->_redirect('/index');
				} else {
					$this->_redirect('/');
				}
			} else {

				// Return to the login page
				$this->showLoginFormAction("Incorrect password");
			}
		} catch (Exception $e) {
			$this->logger->err('Exception '.$e);
			$this->showLoginFormAction("Unexpected error : ".$e->getMessage());
		}
	}

	/**
	 * Disconnect the user.
	 */
	public function logoutAction() {

		// Stop and destroy the session
		Zend_Session::stop();
		Zend_Session::destroy();

		$this->_redirect('/');
	}
}
