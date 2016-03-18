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
 * This is the User model.
 *
 * @package models
 */
class Application_Model_Website_User extends Zend_Db_Table_Abstract {

	// == Properties defined in Zend_Db_Table_Abstract

	// Db table name
	protected $_name = 'website.users';
	// Primary key column
	protected $_primary = 'user_login';
	// Pk is not auto-generated
	protected $_sequence = false;

	var $logger;

	/**
	 * Initialisation
	 */
	public function init() {

		// Initialise the logger
		$this->logger = Zend_Registry::get("logger");

		$translate = Zend_Registry::get('Zend_Translate');
		$this->lang = strtoupper($translate->getAdapter()->getLocale());

		$this->metadataModel = new Application_Model_Metadata_Metadata();
		$this->roleModel = new Application_Model_Website_Role();
	}

	/**
	 * Return the list of users.
	 *
	 * @return Array fo Users
	 */
	public function getUsersList() {
		$db = $this->getAdapter();

		$req = " SELECT user_login as login, ";
		$req .= " user_name as username, ";
		$req .= " provider_id, ";
		$req .= " p.label as provider_label, ";
		$req .= " p.definition as provider_def, ";
		$req .= " email, ";
		$req .= " active, ";
		$req .= " COALESCE(t.label, role_label) as role_label, ";
		$req .= " role_code, ";
		$req .= " role_definition ";
		$req .= " FROM users ";
		$req .= " LEFT JOIN role_to_user USING (user_login) ";
		$req .= " LEFT JOIN role USING (role_code) ";
		$req .= " LEFT JOIN providers p ON p.id = users.provider_id ";
		$req .= " LEFT JOIN translation t ON (lang = '" . $this->lang . "' AND table_format = 'ROLE' AND row_pk = role_code) ";
		$req .= " WHERE active = 1 ";
		$req .= " ORDER BY role_label, user_login";
		$this->logger->info('getUsersList : ' . $req);

		$query = $db->prepare($req);
		$query->execute();

		$results = $query->fetchAll();
		$users = array();

		foreach ($results as $result) {
			$user = new Application_Object_Website_User();
			$user->login = $result['login'];
			$user->username = $result['username'];
			$user->active = ($result['active'] === 1);
			$user->email = $result['email'];
			$user->role = new Application_Object_Website_Role();
			$user->role->code = $result['role_code'];
			$user->role->label = $result['role_label'];
			$user->role->definition = $result['role_definition'];

			// Get the provider linked to the user
			$user->provider = new Application_Object_Website_Provider();
			$user->provider->id = $result['provider_id'];
			$user->provider->label = $result['provider_label'];
			$user->provider->definition = $result['provider_def'];

			$users[] = $user;
		}

		return $users;
	}

	/**
	 * Get a user information.
	 *
	 * @param String $userLogin
	 *        	The userLogin
	 * @return a User
	 */
	public function getUser($userLogin) {
		$db = $this->getAdapter();

		$req = " SELECT users.user_login as login, ";
		$req .= " user_password as password, ";
		$req .= " user_name as username, ";
		$req .= " provider_id, ";
		$req .= " p.label as provider_label, ";
		$req .= " p.definition as provider_def, ";
		$req .= " active, ";
		$req .= " email, ";
		$req .= " role_code ";
		$req .= " FROM users ";
		$req .= " LEFT JOIN role_to_user using(user_login) ";
		$req .= " LEFT JOIN providers p ON p.id = users.provider_id ";
		$req .= " WHERE user_login = ? ";
		$this->logger->info('getUser : ' . $req);

		$query = $db->prepare($req);
		$query->execute(array(
			$userLogin
		));

		$result = $query->fetch();

		if (!empty($result)) {
			$user = new Application_Object_Website_User();
			$user->login = $result['login'];
			$user->username = $result['username'];
			$user->active = ($result['active'] === 1);
			$user->email = $result['email'];
			$user->role = $this->roleModel->getRole($result['role_code']);

			// Get the provider linked to the user
			$user->provider = new Application_Object_Website_Provider();
			$user->provider->id = $result['provider_id'];
			$user->provider->label = $result['provider_label'];
			$user->provider->definition = $result['provider_def'];

			return $user;
		} else {
			$this->logger->err('User not found');
			return null;
		}
	}

	/**
	 * Return the password (SHA1 encoded) of the user.
	 *
	 * @param String $login
	 *        	The user login
	 * @return the user password
	 */
	public function getPassword($login) {
		$db = $this->getAdapter();

		$req = " SELECT user_password ";
		$req .= " FROM users ";
		$req .= " WHERE user_login = ? ";

		$this->logger->info('getPassword : ' . $req);

		$query = $db->prepare($req);
		$query->execute(array(
			$login
		));

		$result = $query->fetch();

		if (!empty($result)) {
			return $result['user_password'];
		} else {
			return null;
		}
	}

	/**
	 * Update the password (SHA1 encoded) of the user.
	 *
	 * @param String $login
	 *        	The user login
	 * @param String $password
	 *        	The user password
	 */
	public function updatePassword($login, $password) {
		$db = $this->getAdapter();

		$req = " UPDATE users SET user_password = ? WHERE user_login = ?";

		$this->logger->info('updatePassword : ' . $req);

		$query = $db->prepare($req);
		$query->execute(array(
			$password,
			$login
		));
	}

	/**
	 * Update user information.
	 *
	 * @param User $user
	 */
	public function updateUser($user) {
		$db = $this->getAdapter();

		$req = " UPDATE users ";
		$req .= " SET user_name = ?, provider_id = ?, email = ?";
		$req .= " WHERE user_login = ?";

		$this->logger->info('updateUser : ' . $req);

		$query = $db->prepare($req);
		$query->execute(array(
			$user->username,
			$user->provider->id,
			$user->email,
			$user->login
		));
	}

	/**
	 * Create a new user.
	 *
	 * @param User $user
	 */
	public function createUser($user) {
		$db = $this->getAdapter();

		$req = " INSERT INTO users (user_login, user_password, user_name, provider_id, email, active )";
		$req .= " VALUES (?, ?, ?, ?, ?, ?)";

		$this->logger->info('createUser : ' . $req);

		$query = $db->prepare($req);
		$query->execute(array(
			$user->login,
			$user->password,
			$user->username,
			$user->provider->id,
			$user->email,
			$user->active ? 1 : 0
		));
	}

	/**
	 * Update the role of the user.
	 *
	 * @param String $userLogin
	 *        	the user login
	 * @param String $roleCode
	 *        	the role code
	 */
	public function updateUserRole($userLogin, $roleCode) {
		$db = $this->getAdapter();

		$req = " UPDATE role_to_user ";
		$req .= " SET role_code = ? ";
		$req .= " WHERE user_login = ?";

		$this->logger->info('updateUserRole : ' . $req);

		$query = $db->prepare($req);
		$query->execute(array(
			$roleCode,
			$userLogin
		));
	}

	/**
	 * Create the role of the user.
	 *
	 * @param String $userLogin
	 *        	the user login
	 * @param String $roleCode
	 *        	the role code
	 */
	public function createUserRole($userLogin, $roleCode) {
		$db = $this->getAdapter();

		$req = " INSERT INTO role_to_user (role_code, user_login) VALUES (?, ?)";

		$this->logger->info('createUserRole : ' . $req);

		$query = $db->prepare($req);
		$query->execute(array(
			$roleCode,
			$userLogin
		));
	}

	/**
	 * Delete the role of the user.
	 *
	 * @param String $userLogin
	 *        	the user login
	 */
	public function deleteUserRole($userLogin) {
		$db = $this->getAdapter();

		$req = " DELETE FROM role_to_user WHERE user_login = ?";

		$this->logger->info('deleteUserRole : ' . $req);

		$query = $db->prepare($req);
		$query->execute(array(
			$userLogin
		));
	}

	/**
	 * Delete the user.
	 *
	 * @param String $userLogin
	 *        	the user login
	 */
	public function deleteUser($userLogin) {

		// Suppression du lien user -> role
		$this->deleteUserRole($userLogin);

		// Suppression de l'utilisateur
		$db = $this->getAdapter();

		$req = " DELETE FROM users WHERE user_login = ?";

		$this->logger->info('deleteUser : ' . $req);

		$query = $db->prepare($req);
		$query->execute(array(
			$userLogin
		));
	}

	/**
	 * Get all users for a given provider
	 *
	 * @param
	 *        	$id
	 * @return Zend_Db_Table_Rowset_Abstract
	 */
	public function findByProviderId($id) {
		$where = $this->getAdapter()->quoteInto("provider_id = '?'", intval($id));
		$users = $this->fetchAll($where, 'user_login');
		return $users;
	}
}