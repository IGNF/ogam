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
 * @package Application_Controller
 */
class UsermanagementController extends AbstractOGAMController {

	/**
	 * The models.
	 */
	protected $roleModel;

	protected $userModel;

	protected $metadataModel;

	protected $providerModel;

	protected $bboxModel;

	protected $submissionModel;

	protected $genericModel;

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
		$this->providerModel = new Application_Model_Website_Provider();
		$this->bboxModel = new Application_Model_Mapping_BoundingBox();
		$this->submissionModel = new Application_Model_RawData_Submission();
		$this->genericModel = new Application_Model_Generic_Generic();
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
		if (empty($user) || !$user->isAllowed('MANAGE_USERS')) {
			throw new Zend_Auth_Exception('Permission denied for right : MANAGE_USERS');
		}
	}

	/**
	 * Build and return the user form.
	 *
	 * @param
	 *        	String the mode of the form ('create' or 'edit')
	 * @param
	 *        	Application_Object_Website_User the user
	 * @return a Zend Form
	 */
	protected function getUserForm($mode = null, $user = null) {
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
		if ($user != null && $user->provider != null) {
			$providerIdElem->setValue($user->provider->id);
		}
		$providers = $this->providerModel->getProvidersList();
		$providersChoices = array();
		foreach ($providers as $provider) {
			$providersChoices[$provider->id] = $provider->label;
		}
		$providerIdElem->addMultiOptions($providersChoices);

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
		// Add the roles element
		//
		$roleCodeElem = $form->createElement('multiCheckbox', 'rolesCodes');
		$roleCodeElem->setLabel('Roles');
		$roleCodeElem->setRequired(true);
		$allroles = $this->roleModel->getRolesList();
		$options = array();
		foreach ($allroles as $role) {
			$options[$role->code] = $role->label;
		}
		$roleCodeElem->addMultiOptions($options);

		if ($user != null) {
			$userRoles = array();
			foreach ($user->rolesList as $role) {
				$userRoles[] = $role->code;
			}
			$roleCodeElem->setValue($userRoles);
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
	 *
	 * @param String $login
	 *        	the login
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
	 * @param Application_Object_Website_Role $role
	 *        	the role
	 * @return a Zend Form
	 */
	protected function getRoleForm($mode = null, $role = null) {
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
	 * @param String $mode
	 *        	the mode of the form ('create' or 'edit')
	 * @param Application_Object_Website_Provider $provider
	 *        	a provider
	 * @return a Zend Form
	 */
	protected function getProviderForm($mode = null, $provider = null) {
		$form = new Application_Form_OGAMForm(array(
			'attribs' => array(
				'name' => 'provider-form',
				'action' => $this->baseUrl . '/usermanagement/validate-provider'
			)
		));

		//
		// Add the provider_id element
		//
		$id = $form->createElement('hidden', 'id');
		$id->addFilter('Int');
		if ($provider != null) {
			$id->setValue($provider->id);
		}

		// Add the label element:
		$label = $form->createElement('text', 'label');
		$label->setLabel('Label');
		$label->addValidator('alnum', false, array(
			'allowWhiteSpace' => true
		));
		$label->addValidator('stringLength', false, array(
			1,
			20
		));
		$label->setRequired(true);
		if ($provider != null) {
			$label->setValue($provider->label);
		}

		// Unicité du label
		// $label->addValidator(new Application_Validator_ProviderNotExist());

		// Add the definition element:
		$definition = $form->createElement('text', 'definition');
		$definition->setLabel('Definition');
		$label->addValidator('alnum', false, array(
			'allowWhiteSpace' => true
		));
		$definition->addValidator('stringLength', false, array(
			0,
			200
		));
		$definition->setRequired(false);
		if ($provider != null) {
			$definition->setValue($provider->definition);
		}

		// Create the submit button
		$submitElement = $form->createElement('submit', 'submit');
		$submitElement->setLabel('Submit');

		//
		// Create a hidden mode element
		//
		$modeElement = $form->createElement('hidden', 'mode');
		$modeElement->setValue($mode);

		// Add elements to form:
		$form->addElements(array(
			$modeElement,
			$id,
			$label,
			$definition,
			$submitElement
		));

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
		$form = $this->getUserForm($mode);
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
			$rolesCode = $values['rolesCodes'];
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
			$user->login = $userLogin;
			$user->username = $userName;
			$user->provider = $this->providerModel->getProvider($providerId);
			$user->email = $email;
			$user->active = true;

			if ($mode == 'edit') {
				//
				// EDIT User
				//
				$this->logger->debug('validateUserAction EDIT User');

				// Update the user in database
				$this->userModel->updateUser($user);

				// Update the roles of the user
				$this->userModel->deleteUserRole($userLogin);
				foreach ($rolesCode as $roleCode) {
					$this->userModel->createUserRole($userLogin, $roleCode);
				}
			} else {
				//
				// CREATE User
				//

				// Encrypt the password
				$user->password = sha1($password);
				$this->logger->debug('crypted password : ' . $user->password);

				// Create the user in database
				$this->userModel->createUser($user);

				// Update the roles of the user
				$this->userModel->deleteUserRole($userLogin);
				foreach ($rolesCode as $roleCode) {
					$this->userModel->createUserRole($userLogin, $roleCode);
				}
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
		$form = $this->getRoleForm($mode);

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

		$providersList = $this->providerModel->getProvidersList();

		$this->view->providers = $providersList;
		$this->view->isDeletable = array();
		foreach ($providersList as $provider) {
			$this->view->isDeletable[$provider->id] = $this->providerModel->isProviderDeletable($provider->id);
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
			$this->view->provider = $this->providerModel->getProvider($id);
			$this->view->users = $this->userModel->getUsersByProvider($id);
			$this->view->submissions = $this->submissionModel->getActiveSubmissions($id);
			$this->view->rawDataCount = $this->genericModel->getProviderNbOfRawDatasByTable($id);

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

		$this->view->isDeletable = array();
		foreach ($this->view->roles as $roles) {
			$this->view->isDeletable[$roles->code] = $this->roleModel->isRoleDeletable($roles->code);
		}

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
		$form = $this->getUserForm('create', null, null);
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

		// Generate the form
		$form = $this->getUserForm('edit', $user);
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
		$form = $this->getRoleForm('edit', $role);
		$this->view->form = $form;

		$this->render('show-edit-role');
	}

	/**
	 * Show a role for edition.
	 */
	public function showEditProviderAction() {
		$this->logger->debug('showEditProviderAction');

		// Get the user login
		$id = $this->_getParam("id");

		// Get the provider
		$provider = $this->providerModel->getProvider($id);

		// Generate the form
		$form = $this->getProviderForm('edit', $provider);
		$this->view->form = $form;

		$this->render('show-edit-provider');
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
		$form = $this->getRoleForm('create', null);
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

		// Get the role to delete
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
	 */
	public function showCreateProviderAction() {
		// Generate the form
		$form = $this->getProviderForm('create');
		$this->view->form = $form;

		$this->render('show-create-provider');
	}

	/**
	 * Check the provider form validity and update the provider information.
	 */
	function validateProviderAction() {
		$this->logger->debug('validateProvider');

		// Check the validity of the POST
		if (!$this->getRequest()->isPost()) {
			$this->logger->debug('form is not a POST');
			return $this->_forward('index');
		}

		// Check the validity of the form
		$mode = $_POST['mode'];
		$form = $this->getProviderForm($mode);

		if (!$form->isValid($_POST)) {
			// Failed validation; redisplay form
			$this->logger->debug('form is not valid');
			$this->view->form = $form;
			if ($mode == 'edit') {
				return $this->render('show-edit-provider');
			} else {
				return $this->render('show-create-provider');
			}
		} else {
			$values = $form->getValues();

			$f = new Zend_Filter_StripTags();

			$providerId = $f->filter($values['id']);
			$providerLabel = $f->filter($values['label']);
			$providerDefinition = $f->filter($values['definition']);

			// Build the provider
			$provider = new Application_Object_Website_Provider();
			$provider->id = $providerId;
			$provider->label = $providerLabel;
			$provider->definition = $providerDefinition;

			if ($mode == 'edit') {
				//
				// EDIT the role
				//

				// Update the provider in database
				$this->providerModel->updateProvider($provider);
			} else {
				//
				// CREATE the new role
				//

				// Create the provider in database
				$provider = $this->providerModel->addProvider($provider);

				// Also add a line in the 'bounding_box' table - the bb is the world
				$bbox = Application_Object_Mapping_BoundingBox::createDefaultBoundingBox();
				$this->bboxModel->addBoundingBox($provider->id, $bbox);

			}

			// Return to the user list page
			$this->showProvidersAction();
		}
	}

	/**
	 * Delete a provider.
	 */
	public function deleteProviderAction() {
		$providerId = $this->_getParam("id");

		// First delete Bounding Box
		$this->bboxModel->deleteBoundingBox($providerId);

		// Then the provider
		$this->providerModel->deleteProvider($providerId);

		$this->_helper->redirector('show-providers');
	}
}