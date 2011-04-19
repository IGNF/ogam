<?php
/**
 * © French National Forest Inventory
 * Licensed under EUPL v1.1 (see http://ec.europa.eu/idabc/eupl).
 */
//require_once 'AbstractEforestController.php';
//require_once APPLICATION_PATH.'/models/website/User.php';
//require_once APPLICATION_PATH.'/models/website/Role.php';
//require_once LIBRARY_PATH.'/Genapp/models/metadata/Metadata.php';

/**
 * UsermanagementController is the controller that manages the users
 * @package controllers
 */
class UsermanagementController extends Genapp_Controller_AbstractOGAMController {

	/**
	 * Initialise the controler
	 */
	public function init() {
		parent::init();

		// Set the current module name
		$websiteSession = new Zend_Session_Namespace('website');
		$websiteSession->module = "user";
		$websiteSession->moduleLabel = "Manage Users";
		$websiteSession->moduleURL = "usermanagement/show-user-management";

		// Initialise the models
		$this->metadataModel = new Genapp_Model_DbTable_Metadata_Metadata();
		$this->userModel = new Application_Model_DbTable_Website_User();
		$this->roleModel = new Application_Model_DbTable_Website_Role();
	}

	/**
	 * The "index" action is the default action for all controllers.
	 */
	public function indexAction() {
		$this->logger->debug('User index');

		$this->showUserManagementAction();
	}

	/**
	 * Check if the authorization is valid this controler.
	 */
	function preDispatch() {

		parent::preDispatch();

		$userSession = new Zend_Session_Namespace('user');
		$permissions = $userSession->permissions;
		$role = $userSession->role;
		if (empty($permissions) || !array_key_exists('MANAGE_USERS', $permissions)) {
			$this->_redirector->gotoUrl('/');
		}
	}

	/**
	 * Build and return the user form.
	 *
	 * @param String the mode of the form ('create' or 'edit')
	 * @param User the user
	 * @param Role the role of the user
	 * @return a Zend Form
	 */
	private function _getUserForm($mode = null, $user = null, $role = null) {

		$form = new Zend_Form();
		$form->setAction($this->baseUrl.'/usermanagement/validate-user');
		$form->setMethod('post');

		//
		// Add the login element:
		//
		$login = $form->createElement('text', 'login');
		$login->setLabel('Login');
		$login->addValidator('alnum');
		$login->addValidator('regex', false, array('/^[a-z]+/'));
		$login->addValidator('stringLength', false, array(2, 20));
		$login->setRequired(true);
		$login->addFilter('StringToLower');
		if ($user != null) {
			$login->setValue($user->login);
		}

		if ($mode == 'edit') {
			$login->setAttrib('readonly', 'true');
		} else {
			$login->addValidator(new Genapp_Validate_UserNotExist());
		}

		//
		// Add the password elements
		//
		if ($mode == 'create') {
			// Create and configure password element
			$password = $form->createElement('password', 'password');
			$password->addValidator(new Genapp_Validate_PasswordConfirmation());
			$password->setLabel('Password');
			$password->setRequired(true);

			$confirmPassword = $form->createElement('password', 'confirmPassword');
			$confirmPassword->setLabel('Confirm Password');
			$confirmPassword->setRequired(true);
		}

		//
		// Add the user name element
		//
		$username = $form->createElement('text', 'username');
		$username->setLabel('User Name');
		$username->setRequired(true);
		if ($user != null) {
			$username->setValue($user->username);
		}

		//
		// Add the country element
		//
		$countryCode = $form->createElement('select', 'countryCode');
		$countryCode->setLabel('Country Code');
		$countryCode->setRequired(true);
		if ($user != null) {
			$countryCode->setValue($user->countryCode);
		}
		$countries = $this->metadataModel->getModes('COUNTRY_CODE');

		$countryCode->addMultiOptions($countries);

		//
		// Add the email element
		//
		$email = $form->createElement('text', 'email');
		$email->setLabel('Email');
		if ($user != null && $user->email != null) {
			$email->setValue($user->email);
		}
		$email->addValidator('EmailAddress');

		//
		// Add the role element
		//
		$roleCodeForm = $form->createElement('select', 'roleCode');
		$roleCodeForm->setLabel('Role');
		$roleCodeForm->setRequired(true);
		if ($role != null) {
			$roleCodeForm->setValue($role->roleCode);
		}
		// Add the list of available roles
		$rolesList = $this->roleModel->getRoles();
		$multi = array();
		foreach ($rolesList as $roleItem) {
			$multi[$roleItem->roleCode] = $roleItem->roleLabel;
		}
		$roleCodeForm->addMultiOptions($multi);

		//
		// Create the submit button
		//
		$submitElement = $form->createElement('submit', 'submit');
		$submitElement->setLabel('Submit');

		//
		// Create a hidden mode element
		//
		$modeElement = $form->createElement('hidden', 'mode');
		$modeElement->setValue($mode);

		// Add elements to form:
		$form->addElement($login);
		if ($mode == 'create') {
			$form->addElement($password);
			$form->addElement($confirmPassword);
		}
		$form->addElement($username);
		$form->addElement($countryCode);
		$form->addElement($email);
		$form->addElement($roleCodeForm);
		$form->addElement($modeElement);
		$form->addElement($submitElement);

		return $form;
	}

	/**
	 * Build and return the change password form.
	 */
	private function _getChangePasswordForm($login = null) {

		$form = new Zend_Form();
		$form->setAction($this->baseUrl.'/usermanagement/validate-user-password');
		$form->setMethod('post');

		$this->logger->debug('_getChangePasswordForm login : '.$login);

		// Add the user login as an input type text
		$loginElem = $form->createElement('hidden', 'login');
		$loginElem->setValue($login);

		// Create and configure old password element:
		$oldpassword = $form->createElement('password', 'oldpassword');
		$oldpassword->setLabel('Old Password');
		$oldpassword->setRequired(true);

		// Create and configure password element:
		$newpassword = $form->createElement('password', 'password');
		$newpassword->setLabel('New Password');
		$newpassword->setRequired(true);

		// Create and configure confirm-password element:
		$confirmPassword = $form->createElement('password', 'confirmpassword');
		$confirmPassword->setLabel('Confirm New Password');
		$confirmPassword->setRequired(true);

		$submit = $form->createElement('submit', 'submit');
		$submit->setLabel('Submit');

		$form->addElement($loginElem);
		$form->addElement($oldpassword);
		$form->addElement($newpassword);
		$form->addElement($confirmPassword);
		$form->addElement($submit);

		return $form;
	}

	/**
	 * Build and return the role form.
	 *
	 * @param String the mode of the form ('create' or 'edit')
	 * @param Role the role
	 * @param Array[String] the permissions
	 * @return a Zend Form
	 */
	private function _getRoleForm($mode = null, $role = null, $permissions = null) {

		$form = new Zend_Form();
		$form->setAction($this->baseUrl.'/usermanagement/validate-role');
		$form->setMethod('post');

		//
		// Add the role code
		//
		$roleCode = $form->createElement('text', 'roleCode');
		$roleCode->setLabel('Role Code');
		$roleCode->setRequired(true);
		if ($role != null) {
			$roleCode->setValue($role->roleCode);
		}
		if ($mode == 'edit') {
			$roleCode->setAttrib('readonly', 'true');
		}

		//
		// Add the role label
		//
		$roleLabel = $form->createElement('text', 'roleLabel');
		$roleLabel->setLabel('Role Label');
		$roleLabel->setRequired(true);
		if ($role != null) {
			$roleLabel->setValue($role->roleLabel);
		}

		//
		// Add the role definition
		//
		$roleDefinition = $form->createElement('text', 'roleDefinition');
		$roleDefinition->setLabel('Role Definition');
		$roleDefinition->setRequired(true);
		if ($role != null) {
			$roleDefinition->setValue($role->roleDefinition);
		}

		// Permissions
		// Get all the Permissions
		$allpermissions = $this->roleModel->getAllPermissions();
		$rolepermissions = new Zend_Form_Element_MultiCheckbox('rolepermissions', array(
			'multiOptions' => $allpermissions)); // set the list of available permissions
		if (!empty($permissions)) {
			$rolepermissions->setValue(array_keys($permissions)); // set the selected permissions
		}
		$rolepermissions->setLabel('Permissions');

		//
		// Create the submit button
		//
		$submitElement = $form->createElement('submit', 'submit');
		$submitElement->setLabel('Submit');

		//
		// Create a hidden mode element
		//
		$modeElement = $form->createElement('hidden', 'mode');
		$modeElement->setValue($mode);

		// Add elements to form:
		$form->addElement($roleCode);
		$form->addElement($roleLabel);
		$form->addElement($roleDefinition);
		$form->addElement($modeElement);
		$form->addElement($rolepermissions);
		$form->addElement($submitElement);

		return $form;
	}

	/**
	 * Check the user form validity and update the user information.
	 *
	 * @return a view.
	 */
	public function validateUserAction() {
		$this->logger->debug('validateUserAction');

		// Check the validity of the POST
		if (!$this->getRequest()->isPost()) {
			$this->logger->debug('form is not a POST');
			return $this->_forward('index');
		}

		// Check the validity of the form
		$mode = $_POST['mode'];
		$form = $this->_getUserForm($mode);
		$this->logger->debug('validateUserAction mode = '.$mode);

		if (!$form->isValid($_POST)) {
			// Failed validation; redisplay form
			$this->logger->debug('form is not valid');
			$this->view->form = $form;
			if ($mode == 'edit') {
				return $this->render('show-edit-user');
			} else {
				return $this->render('show-create-user');
			}
		} else {
			$values = $form->getValues();

			$f = new Zend_Filter_StripTags();
			$userLogin = $f->filter($values['login']);
			$userName = $f->filter($values['username']);
			$countryCode = $f->filter($values['countryCode']);
			$email = $f->filter($values['email']);
			$roleCode = $f->filter($values['roleCode']);
			if ($mode == 'create') {
				$password = $f->filter($values['password']);
				$confirmPassword = $f->filter($values['confirmPassword']);
				$this->logger->debug('password : '.$password);
				$this->logger->debug('confirmPassword : '.$confirmPassword);
			}

			$this->logger->debug('UserLogin : '.$userLogin);
			$this->logger->debug('mode : '.$mode);
			$this->logger->debug('userName : '.$userName);

			// Build the user
			$user = new Application_Model_Website_User();
			$user->login = $userLogin;
			$user->username = $userName;
			$user->countryCode = $countryCode;
			$user->email = $email;

			if ($mode == 'edit') {
				//
				// EDIT User
				//
				$this->logger->debug('validateUserAction EDIT User');

				// Update the user in database
				$this->userModel->updateUser($user);

				// Update the role of the user
				$this->userModel->updateUserRole($userLogin, $roleCode);

			} else {
				//
				// CREATE User
				//

				// Encrypt the password
				$user->password = sha1($password);
				$this->logger->debug('crypted password : '.$user->password);

				// Create the user in database
				$this->userModel->createUser($user);
				$this->userModel->createUserRole($userLogin, $roleCode);
			}

			// Return to the user list page
			$this->showUsersAction();
		}
	}

	/**
	 * Check update the user password.
	 *
	 * @return a view.
	 */
	public function validateUserPasswordAction() {
		$this->logger->debug('validateUserPasswordAction');

		// Check the validity of the POST
		if (!$this->getRequest()->isPost()) {
			$this->logger->debug('form is not a POST');
			return $this->_forward('index');
		}

		// Check the validity of the form
		$form = $this->_getChangePasswordForm();

		if (!$form->isValid($_POST)) {
			// Failed validation, redisplay form
			$this->logger->debug('form is not valid');
			$this->view->form = $form;
			return $this->render('show-change-password');

		} else {
			$values = $form->getValues();

			$f = new Zend_Filter_StripTags();
			$login = $f->filter($values['login']);
			$oldpassword = $f->filter($values['oldpassword']);
			$password = $f->filter($values['password']);
			$confirmpassword = $f->filter($values['confirmpassword']);

			// Check that the new password if confirmed
			if ($password != $confirmpassword) {
				return $this->showChangePasswordAction("Password does not match confirmation", $login);
			}

			// Check that the old password is correct
			$storedPassword = $this->userModel->getPassword($login);
			$cryptedOldPassword = sha1($oldpassword);

			if ($storedPassword != $cryptedOldPassword) {
				return $this->showChangePasswordAction("Old password is not correct", $login);
			}

			// Encrypt the password
			$cryptedPassword = sha1($password);

			// Update the user password
			$this->userModel->updatePassword($login, $cryptedPassword);

			// Return to the user list page
			$this->showUsersAction();
		}
	}

	/**
	 * Check the role form validity and update the role information.
	 *
	 * @return a view.
	 */
	public function validateRoleAction() {
		$this->logger->debug('validateRole');

		// Check the validity of the POST
		if (!$this->getRequest()->isPost()) {
			$this->logger->debug('form is not a POST');
			return $this->_forward('index');
		}

		// Check the validity of the form
		$mode = $_POST['mode'];
		$form = $this->_getRoleForm($mode);

		if (!$form->isValid($_POST)) {
			// Failed validation; redisplay form
			$this->logger->debug('form is not valid');
			$this->view->form = $form;
			if ($mode == 'edit') {
				return $this->render('show-edit-role');
			} else {
				return $this->render('show-create-role');
			}
		} else {
			$values = $form->getValues();

			$f = new Zend_Filter_StripTags();
			$roleCode = $f->filter($values['roleCode']);
			$roleLabel = $f->filter($values['roleLabel']);
			$roleDefinition = $f->filter($values['roleDefinition']);
			$isEuropeLevel = $f->filter($values['isEuropeLevel']);
			$rolepermissions = $values['rolepermissions'];

			// Build the user
			$role = new Application_Model_Website_Role();
			$role->roleCode = $roleCode;
			$role->roleLabel = $roleLabel;
			$role->roleDefinition = $roleDefinition;
			$role->isEuropeLevel = $isEuropeLevel;

			if ($mode == 'edit') {
				//
				// EDIT the role
				//

				// Update the user in database
				$this->roleModel->updateRole($role);

				// Update the permissions
				$this->roleModel->updateRolePermissions($role, $rolepermissions);

			} else {
				//
				// CREATE the new role
				//

				// Create the user in database
				$this->roleModel->createRole($role);

				// Update the permissions
				$this->roleModel->updateRolePermissions($role, $rolepermissions);

			}

			// Return to the user list page
			$this->showRolesAction();
		}
	}

	/**
	 * Show the user management page.
	 *
	 * @return a view.
	 */
	public function showUserManagementAction() {

		$this->logger->debug('showUserManagementAction');

		$this->render('show-user-management');
	}

	/**
	 * Show the users.
	 *
	 * @return a view.
	 */
	public function showUsersAction() {

		$this->logger->debug('showUsersAction');

		// Get the list of users
		$users = $this->userModel->getUsers();

		// Get the list of countries
		$countries = $this->metadataModel->getModes('COUNTRY_CODE');

		$this->logger->debug('users : '.$users);

		$this->view->users = $users;
		$this->view->countries = $countries;

		return $this->render('show-users');

	}

	/**
	 * Show the roles.
	 *
	 * @return a view.
	 */
	public function showRolesAction() {

		$this->logger->debug('showRolesAction');

		// Get the list of roles
		$roles = $this->roleModel->getRoles();

		$this->view->roles = $roles;

		return $this->render('show-roles');
	}

	/**
	 * Show the user creation page.
	 *
	 * @param String $errorMessage the error message to display
	 */
	public function showCreateUserAction($errorMessage = null) {

		$this->logger->debug('showCreateUserAction');

		// Generate the form
		$form = $this->_getUserForm('create', null, null);
		$this->view->form = $form;

		// Eventually add an error message
		if (!empty($errorMessage)) {
			$this->view->form->getElement('login')->addError($errorMessage);
		}

		$this->render('show-create-user');
	}

	/**
	 * Show a user for edition.
	 */
	public function showEditUserAction() {

		$this->logger->debug('showEditUserAction');

		// Get the user login
		$userLogin = $this->_getParam("userLogin");

		// Get the user info from database
		$user = $this->userModel->getUser($userLogin);

		// Get the role of the user
		$role = $this->roleModel->getRole($user->roleCode);

		// Generate the form
		$form = $this->_getUserForm('edit', $user, $role);
		$this->view->form = $form;

		$this->render('show-edit-user');
	}

	/**
	 * Show a role for edition.
	 */
	public function showEditRoleAction() {

		$this->logger->debug('showEditRoleAction');

		// Get the user login
		$roleCode = $this->_getParam("roleCode");

		// Get the role
		$role = $this->roleModel->getRole($roleCode);

		// Get the Permissions
		$permissions = $this->roleModel->getRolePermissions($role->roleCode);

		// Generate the form
		$form = $this->_getRoleForm('edit', $role, $permissions);
		$this->view->form = $form;

		$this->render('show-edit-role');
	}

	/**
	 * Show the role creation page.
	 *
	 * @param String $errorMessage the error message to display
	 */
	public function showCreateRoleAction($errorMessage = null) {

		$this->logger->debug('showCreateRoleAction');

		// Generate the form
		$form = $this->_getRoleForm('create', null, null);
		$this->view->form = $form;

		// Eventually add an error message
		if (!empty($errorMessage)) {
			$this->view->form->getElement('roleCode')->addError($errorMessage);
		}

		$this->render('show-create-role');
	}

	/**
	 * Delete a user.
	 */
	public function deleteUserAction() {

		$this->logger->debug('deleteUserAction');

		// Get the user login
		$userLogin = $this->_getParam("userLogin");

		// Delete the user
		$this->userModel->deleteUserRole($userLogin);
		$this->userModel->deleteUser($userLogin);

		$this->showUsersAction();
	}

	/**
	 * Delete a role.
	 */
	public function deleteRoleAction() {

		$this->logger->debug('deleteRoleAction');

		// Get the user login
		$roleCode = $this->_getParam("roleCode");

		// Delete the user
		$this->roleModel->deleteRole($roleCode);

		$this->showRolesAction();
	}

	/**
	 * Show change a user password.
	 *
	 * @param String $errorMessage the error message to display
	 * @param String $login the user login
	 */
	public function showChangePasswordAction($errorMessage = null, $login = null) {

		$this->logger->debug('showChangePasswordAction');

		// Get the user login
		if (!empty($login)) {
			$userLogin = $login;
		} else {
			$userLogin = $this->_getParam("userLogin");
		}

		$this->logger->debug('$userLogin : '.$userLogin);

		// Get the user info from database
		$user = $this->userModel->getUser($userLogin);

		// Show the user name on the page
		$this->view->username = $user->username;

		// Generate the form
		$form = $this->_getChangePasswordForm($userLogin);
		$this->view->form = $form;

		// Eventually add an error message
		if (!empty($errorMessage)) {
			$this->view->form->getElement('password')->addError($errorMessage);
		}

		$this->render('show-change-password');
	}

}
