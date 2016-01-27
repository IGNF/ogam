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
require_once 'AbstractOGAMController.php';

/**
 * UsermanagementController is the controller that manages the users
 *
 * @package controllers
 */
class UsermanagementController extends AbstractOGAMController {

	/**
	 * Initialise the controler
	 */
	public function init() {
		parent::init();
		
		// Set the current module name
		$websiteSession = new Zend_Session_Namespace('website');
		$websiteSession->module = "user";
		$websiteSession->moduleLabel = "Manage Users";
		$websiteSession->moduleURL = "usermanagement";
		
		// Initialise the models
		$this->metadataModel = new Application_Model_Metadata_Metadata();
		$this->userModel = new Application_Model_Website_User();
		$this->roleModel = new Application_Model_Website_Role();
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
	 *
	 * @throws an Exception if the user doesn't have the rights
	 */
	function preDispatch() {
		parent::preDispatch();
		
		$userSession = new Zend_Session_Namespace('user');
		$user = $userSession->user;
		if (empty($user) || !in_array('MANAGE_USERS', $user->role->permissionsList)) {
			throw new Zend_Auth_Exception('Permission denied for right : MANAGE_USERS');
		}
	}

	/**
	 * Build and return the user form.
	 *
	 * @param
	 *        	String the mode of the form ('create' or 'edit')
	 * @param
	 *        	User the user
	 * @param
	 *        	Role the role of the user
	 * @return a Zend Form
	 */
	private function _getUserForm($mode = null, $user = null, $role = null) {
		$form = new Application_Form_OGAMForm(array(
			'attribs' => array(
				'name' => 'user-form',
				'action' => $this->baseUrl . '/usermanagement/validate-user'
			)
		));
		
		//
		// Add the login element:
		//
		$login = $form->createElement('text', 'login');
		$login->setLabel('Login');
		$login->addValidator('alnum');
		$login->addValidator('regex', false, array(
			'/^[a-z]+/'
		));
		$login->addValidator('stringLength', false, array(
			2,
			20
		));
		$login->setRequired(true);
		$login->addFilter('StringToLower');
		if ($user != null) {
			$login->setValue($user->login);
		}
		
		if ($mode == 'edit') {
			$login->setAttrib('readonly', 'true');
		} else {
			$login->addValidator(new Application_Validator_UserNotExist());
		}
		
		//
		// Add the password elements
		//
		if ($mode == 'create') {
			// Create and configure password element
			$password = $form->createElement('password', 'password');
			$password->addValidator(new Application_Validator_PasswordConfirmation());
			$password->setLabel('Password');
			$password->setRequired(true);
			
			$confirmPassword = $form->createElement('password', 'confirmPassword');
			$confirmPassword->setLabel('Confirm Password');
			$confirmPassword->setRequired(true);
		}
		
		//
		// Add the user name element
		//
		$usernameElem = $form->createElement('text', 'username');
		$usernameElem->setLabel('User Name');
		$usernameElem->setRequired(true);
		if ($user != null) {
			$usernameElem->setValue($user->username);
		}
		
		//
		// Add the provider element
		//
		$providerIdElem = $form->createElement('select', 'providerId');
		$providerIdElem->setLabel('Provider');
		$providerIdElem->setRequired(true);
		if ($user != null) {
			$providerIdElem->setValue($user->providerId);
		}
		// $providers = $this->metadataModel->getModeLabels('PROVIDER_ID');
		$providerModel = new Application_Model_Website_Provider();
		$providers = $providerModel->getProvidersList();

		$providerIdElem->addMultiOptions($providers);
		
		//
		// Add the email element
		//
		$emailElem = $form->createElement('text', 'email');
		$emailElem->setLabel('Email');
		if ($user != null && $user->email != null) {
			$emailElem->setValue($user->email);
		}
		$emailElem->addValidator('EmailAddress');
		
		//
		// Add the role element
		//
		$roleCodeElem = $form->createElement('select', 'roleCode');
		$roleCodeElem->setLabel('Role');
		$roleCodeElem->setRequired(true);
		if ($role != null) {
			$roleCodeElem->setValue($role->code);
		}
		// Add the list of available roles
		$rolesList = $this->roleModel->getRolesList();
		$multi = array();
		foreach ($rolesList as $roleItem) {
			$multi[$roleItem->code] = $roleItem->label;
		}
		$roleCodeElem->addMultiOptions($multi);
		
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
		$form->addElement($usernameElem);
		$form->addElement($providerIdElem);
		$form->addElement($emailElem);
		$form->addElement($roleCodeElem);
		$form->addElement($modeElement);
		$form->addElement($submitElement);
		
		return $form;
	}

	/**
	 * Build and return the change password form.
	 */
	private function _getChangePasswordForm($login = null) {
		$form = new Application_Form_OGAMForm(array(
			'attribs' => array(
				'name' => 'change-user-password-form',
				'action' => $this->baseUrl . '/usermanagement/validate-user-password'
			)
		));
		
		$this->logger->debug('_getChangePasswordForm login : ' . $login);
		
		// Add the user login as an input type text
		$loginElem = $form->createElement('hidden', 'login');
		$loginElem->setValue($login);
		
		// Create and configure password element:
		$newpassword = $form->createElement('password', 'password');
		$newpassword->setLabel('New Password');
		$newpassword->setRequired(true);
		
		// Create and configure confirm-password element:
		$confirmPassword = $form->createElement('password', 'confirmpassword');
		$confirmPassword->setLabel('Confirm Password');
		$confirmPassword->setRequired(true);
		
		$submit = $form->createElement('submit', 'submit');
		$submit->setLabel('Submit');
		
		$form->addElement($loginElem);
		$form->addElement($newpassword);
		$form->addElement($confirmPassword);
		$form->addElement($submit);
		
		return $form;
	}

	/**
	 * Build and return the role form.
	 *
	 * @param String $mode
	 *        	the mode of the form ('create' or 'edit')
	 * @param Role $role
	 *        	the role
	 * @return a Zend Form
	 */
	private function _getRoleForm($mode = null, $role = null) {
		$form = new Application_Form_OGAMForm(array(
			'attribs' => array(
				'name' => 'role-form',
				'action' => $this->baseUrl . '/usermanagement/validate-role'
			)
		));
		
		//
		// Add the role code
		//
		$roleCode = $form->createElement('text', 'roleCode');
		$roleCode->setLabel('Role Code');
		$roleCode->setRequired(true);
		if ($role != null) {
			$roleCode->setValue($role->code);
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
			$roleLabel->setValue($role->label);
		}
		
		//
		// Add the role definition
		//
		$roleDefinition = $form->createElement('text', 'roleDefinition');
		$roleDefinition->setLabel('Role Definition');
		$roleDefinition->setRequired(true);
		if ($role != null) {
			$roleDefinition->setValue($role->definition);
		}
		
		// Permissions
		// Get all the Permissions
		$allpermissions = $this->roleModel->getAllPermissions();
		$rolepermissions = $form->createElement('multiCheckbox', 'rolepermissions');
		$rolepermissions->setLabel($this->translator->translate('Permissions'));
		$rolepermissions->setDisableTranslator(true); // Pas de trad par Zend, c'est géré dans les métadonnées
		$rolepermissions->addMultiOptions($allpermissions);
		if ($role != null) {
			$rolepermissions->setValue($role->permissionsList); // set the selected permissions
		}
		
		// Schemas
		// get all available schemas
		$allschemas = $this->metadataModel->getSchemas();
		$schemasList = array();
		foreach ($allschemas as $schema) {
			$schemasList[$schema->code] = $schema->label;
		}
		$roleschemas = $form->createElement('multiCheckbox', 'roleschemas');
		$roleschemas->setLabel($this->translator->translate('Schemas Permissions'));
		$roleschemas->setDisableTranslator(true); // Pas de trad par Zend, c'est géré dans les métadonnées
		$roleschemas->addMultiOptions($schemasList);
		if ($role != null) {
			// Get the Schemas
			$roleschemas->setValue($role->schemasList); // set the selected schemas
		}
		
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
		$form->addElement($roleschemas);
		$form->addElement($submitElement);
		
		return $form;
	}


	/**
	 * Build and return the provider form.
	 *
	 * @return a Zend Form
	 */
	private function _getProviderForm() {
		$form = new Application_Form_OGAMForm(array(
				'attribs' => array(
						'name' => 'provider-form',
				)
		));

		//
		// Add the provider_id element
		//
		$id = $form->createElement('hidden', 'id');
		$id->addFilter('Int');

		// Add the label element:
		$label = $form->createElement('text', 'label');
		$label->setLabel('Label');
		$label->addValidator('alnum', false, array('allowWhiteSpace' => true));
		$label->addValidator('stringLength', false, array(
				1,
				20
		));
		$label->setRequired(true);

		// Unicité du label
		//$label->addValidator(new Application_Validator_ProviderNotExist());

		// Add the definition element:
		$definition = $form->createElement('text', 'definition');
		$definition->setLabel('definition');
		$label->addValidator('alnum', false, array('allowWhiteSpace' => true));
		$definition->addValidator('stringLength', false, array(
				0,
				200
		));
		$definition->setRequired(false);

		// Create the submit button
		$submitElement = $form->createElement('submit', 'submit');
		$submitElement->setLabel('Submit');

		// Add elements to form:
		$form->addElements(array($id, $label, $definition, $submitElement));

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
		$this->logger->debug('validateUserAction mode = ' . $mode);
		
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
			$providerId = $f->filter($values['providerId']);
			$email = $f->filter($values['email']);
			$roleCode = $f->filter($values['roleCode']);
			if ($mode == 'create') {
				$password = $f->filter($values['password']);
				$confirmPassword = $f->filter($values['confirmPassword']);
				$this->logger->debug('password : ' . $password);
				$this->logger->debug('confirmPassword : ' . $confirmPassword);
			}
			
			$this->logger->debug('UserLogin : ' . $userLogin);
			$this->logger->debug('mode : ' . $mode);
			$this->logger->debug('userName : ' . $userName);
			
			// Build the user
			$user = new Application_Object_Website_User();
			$providers = new Application_Model_Website_Provider();
			$user->login = $userLogin;
			$user->username = $userName;
			$user->provider = $providers->getProvider($providerId);
			$user->email = $email;
			$user->active = true;
			
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
				$this->logger->debug('crypted password : ' . $user->password);
				
				// Create the user in database
				$this->userModel->createUser($user);
				$this->userModel->createUserRole($userLogin, $roleCode);
			}
			
			// Return to the user list page
			$this->showUsersAction();
		}
	}

	/**
	 * Set a new user password.
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
			$password = $f->filter($values['password']);
			$confirmpassword = $f->filter($values['confirmpassword']);
			
			// Check that the new password if confirmed
			if ($password != $confirmpassword) {
				return $this->showChangePasswordAction("Password does not match confirmation", $login);
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
			$rolepermissions = $values['rolepermissions'];
			$schemas = $values['roleschemas'];
			
			// Build the user
			$role = new Application_Object_Website_Role();
			$role->code = $roleCode;
			$role->label = $roleLabel;
			$role->definition = $roleDefinition;
			
			$role->permissionsList = $rolepermissions;
			$role->schemasList = $schemas;
			
			if ($mode == 'edit') {
				//
				// EDIT the role
				//
				
				// Update the user in database
				$this->roleModel->updateRole($role);
			} else {
				//
				// CREATE the new role
				//
				
				// Create the user in database
				$this->roleModel->createRole($role);
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
		$users = $this->userModel->getUsersList();
		
		// Get the list of providers
		// $providers = $this->metadataModel->getModeLabels('PROVIDER_ID');
		
		$this->view->users = $users;
		// $this->view->providers = $providers;
		
		return $this->render('show-users');
	}

	/**
	 * Show the providers
	 *
	 * @return a view
	 */
	public function showProvidersAction() {
		$this->logger->debug('showProvidersAction');

		$providers = new Application_Model_Website_Provider();
		$this->view->providers = $providers->fetchAll(null, 'id');
		$this->view->isDeletable = array();
		foreach ($this->view->providers as $provider) {
			$this->view->isDeletable[$provider->id] = $providers->isProviderDeletable($provider->id);
		}
		return $this->render('show-providers');
	}

	/**
	 * Show everything related to a provider :
	 * Users, Submissions, Raw data (not related to submissions)
	 *
	 * @return a view
	 */
	public function showProviderContentAction() {
		$this->logger->debug('showProviderContentAction');

		$id = (int) $this->_getParam('id', 0);
		if ($id > 0) {
			$providers = new Application_Model_Website_Provider();
			$this->view->provider = $providers->getProvider($id);
			$this->view->users = $providers->getProviderUsers($id);
			$this->view->submissions = $providers->getProviderActiveSubmissions($id);
			$this->view->rawDataCount = $providers->getProviderNbOfRawDatasByTable($id);

			return $this->render('show-provider-content');
		}
	}


	/**
	 * Show the roles.
	 *
	 * @return a view.
	 */
	public function showRolesAction() {
		$this->logger->debug('showRolesAction');
		
		// Get the list of roles
		$roles = $this->roleModel->getRolesList();
		
		$this->view->roles = $roles;
		
		return $this->render('show-roles');
	}

	/**
	 * Show the user creation page.
	 *
	 * @param String $errorMessage
	 *        	the error message to display
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
		$role = $this->roleModel->getRole($user->code);
		
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
		
		// Generate the form
		$form = $this->_getRoleForm('edit', $role);
		$this->view->form = $form;
		
		$this->render('show-edit-role');
	}

	/**
	 * Show the role creation page.
	 *
	 * @param String $errorMessage
	 *        	the error message to display
	 */
	public function showCreateRoleAction($errorMessage = null) {
		$this->logger->debug('showCreateRoleAction');
		
		// Generate the form
		$form = $this->_getRoleForm('create', null);
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
	 * @param String $errorMessage
	 *        	the error message to display
	 * @param String $login
	 *        	the user login
	 */
	public function showChangePasswordAction($errorMessage = null, $login = null) {
		$this->logger->debug('showChangePasswordAction');
		
		// Get the user login
		if (!empty($login)) {
			$userLogin = $login;
		} else {
			$userLogin = $this->_getParam("userLogin");
		}
		
		$this->logger->debug('$userLogin : ' . $userLogin);
		
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


	/**
	 * Add a provider.
	 *
	 */
	public function addProviderAction() {
		// Generate the form
		$form = $this->_getProviderForm('create', null);
		$this->view->form = $form;

		if ($this->getRequest()->isPost()) {
			$formData = $this->getRequest()->getPost();
			if ($form->isValid($formData)) {
				$label = $form->getValue('label');
				$definition = $form->getValue('definition');

				$providers = new Application_Model_Website_Provider();
				$providerId = $providers->addProvider($label, $definition);

				// Also add a line in the 'bounding_box' table - the bb is the world
				$bbox = new Application_Object_Mapping_BoundingBox();
				$bbox->provider_id = $providerId;

				$bboxModel = new Application_Model_Mapping_BoundingBox();
				$bboxModel->addBoundingBox($bbox);

				$this->_helper->redirector('show-providers');
			}
			else {
				$form->populate($formData);
			}
		}
		$this->render('add-provider');
	}

	/**
	 * Edit a provider
	 */
	function editProviderAction() {
		// Generate the form
		$form = $this->_getProviderForm('edit', null);
		$this->view->form = $form;

		if ($this->getRequest()->isPost()) {
			$formData = $this->getRequest()->getPost();
			if ($form->isValid($formData)) {
				$provider_id = (int)$form->getValue('id');
				$label = $form->getValue('label');
				$definition = $form->getValue('definition');

				$providers = new Application_Model_Website_Provider();
				$providers->updateProvider($provider_id, $label, $definition);

				$this->_helper->redirector('show-providers');
			}
			else {
				$form->populate($formData);
			}
		} else {
			$id = $this->_getParam('id', 0);
			if ($id > 0) {
				$providers = new Application_Model_Website_Provider();
				$provider = $providers->getProvider($id);
				$form->populate($provider->toArray());
			}
		}
		$this->render('edit-provider');
	}


	/**
	 * Delete a provider.
	 */
	public function deleteProviderAction() {
		$providerId = $this->_getParam("id");

		// First delete Bounding Box
		$bboxModel = new Application_Model_Mapping_BoundingBox();
		$bboxModel->deleteBoundingBox($providerId);

		// Then the provider
		$providers = new Application_Model_Website_Provider();
		$providers->deleteProvider($providerId);

		$this->_helper->redirector('show-providers');
	}



}