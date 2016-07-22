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
 * @package Application_Model
 * @subpackage Website
 */
class Application_Model_Website_User {

	/**
	 * The logger.
	 *
	 * @var Zend_Log
	 */
	var $logger;

	/**
	 * The other models.
	 */
	protected $roleModel;

	protected $metadataModel;

	/**
	 * The database connection
	 *
	 * @var Zend_Db
	 */
	var $db;

	/**
	 * Initialisation.
	 */
	public function __construct() {

		// Initialise the logger
		$this->logger = Zend_Registry::get("logger");

		$translate = Zend_Registry::get('Zend_Translate');
		$this->lang = strtoupper($translate->getAdapter()->getLocale());

		$this->metadataModel = new Application_Model_Metadata_Metadata();
		$this->roleModel = new Application_Model_Website_Role();

		// The database connection
		$this->db = Zend_Registry::get('website_db');
	}

	/**
	 * Destuction.
	 */
	function __destruct() {
		$this->db->closeConnection();
	}

	/**
	 * Return the list of users.
	 *
	 * @return Array[Application_Object_Website_User]
	 */
	public function getUsersList() {
		$req = " SELECT user_login as login, ";
		$req .= " user_name as username, ";
		$req .= " provider_id, ";
		$req .= " p.label as provider_label, ";
		$req .= " p.definition as provider_def, ";
		$req .= " email, ";
		$req .= " active ";
		$req .= " FROM users ";
		$req .= " LEFT JOIN providers p ON p.id = users.provider_id ";
		$req .= " WHERE active = 1 ";
		$req .= " ORDER BY user_login";
		$this->logger->info('getUsersList : ' . $req);

		$query = $this->db->prepare($req);
		$query->execute();

		$results = $query->fetchAll();
		$users = array();

		foreach ($results as $result) {
			$user = new Application_Object_Website_User();
			$user->login = $result['login'];
			$user->username = $result['username'];
			$user->active = ($result['active'] === 1);
			$user->email = $result['email'];

			// Get the provider linked to the user
			$user->provider = new Application_Object_Website_Provider();
			$user->provider->id = $result['provider_id'];
			$user->provider->label = $result['provider_label'];
			$user->provider->definition = $result['provider_def'];

			// Get the roles linked to the user
			$user->rolesList = $this->roleModel->getUserRolesList($user->login);

			$users[] = $user;
		}

		return $users;
	}

	/**
	 * Get a user information.
	 *
	 * @param String $userLogin
	 *        	The userLogin
	 * @return Application_Object_Website_User
	 */
	public function getUser($userLogin) {
		$req = " SELECT users.user_login as login, ";
		$req .= " user_password as password, ";
		$req .= " user_name as username, ";
		$req .= " provider_id, ";
		$req .= " p.label as provider_label, ";
		$req .= " p.definition as provider_def, ";
		$req .= " active, ";
		$req .= " email ";
		$req .= " FROM users ";
		$req .= " LEFT JOIN providers p ON p.id = users.provider_id ";
		$req .= " WHERE user_login = ? ";
		$this->logger->info('getUser : ' . $req);

		$query = $this->db->prepare($req);
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

			// Get the provider linked to the user
			$user->provider = new Application_Object_Website_Provider();
			$user->provider->id = $result['provider_id'];
			$user->provider->label = $result['provider_label'];
			$user->provider->definition = $result['provider_def'];

			// Get the roles linked to the user
			$user->rolesList = $this->roleModel->getUserRolesList($user->login);

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
		$req = " SELECT user_password ";
		$req .= " FROM users ";
		$req .= " WHERE user_login = ? ";

		$this->logger->info('getPassword : ' . $req);

		$query = $this->db->prepare($req);
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
		$req = " UPDATE users SET user_password = ? WHERE user_login = ?";

		$this->logger->info('updatePassword : ' . $req);

		$query = $this->db->prepare($req);
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
		$req = " UPDATE users ";
		$req .= " SET user_name = ?, provider_id = ?, email = ?";
		$req .= " WHERE user_login = ?";

		$this->logger->info('updateUser : ' . $req);

		$query = $this->db->prepare($req);
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
		$req = " INSERT INTO users (user_login, user_password, user_name, provider_id, email, active )";
		$req .= " VALUES (?, ?, ?, ?, ?, ?)";

		$this->logger->info('createUser : ' . $req);

		$query = $this->db->prepare($req);
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
	 * Create the role of the user.
	 *
	 * @param String $userLogin
	 *        	the user login
	 * @param String $roleCode
	 *        	the role code
	 */
	public function createUserRole($userLogin, $roleCode) {
		$req = " INSERT INTO role_to_user (role_code, user_login) VALUES (?, ?)";

		$this->logger->info('createUserRole : ' . $req);

		$query = $this->db->prepare($req);
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
		$req = " DELETE FROM role_to_user WHERE user_login = ?";

		$this->logger->info('deleteUserRole : ' . $req);

		$query = $this->db->prepare($req);
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

		$req = " DELETE FROM users WHERE user_login = ?";

		$this->logger->info('deleteUser : ' . $req);

		$query = $this->db->prepare($req);
		$query->execute(array(
			$userLogin
		));
	}

	/**
	 * Get all users for a given provider.
	 *
	 * @param Integer $id
	 *        	The identifier of the provider
	 * @return Array[Application_Object_Website_User]
	 */
	public function getUsersByProvider($id) {
		$req = " SELECT * ";
		$req .= " FROM users ";
		$req .= " WHERE provider_id = ? ";
		$req .= " ORDER BY user_login";
		$this->logger->info('getUsersByProvider : ' . $req);

		$query = $this->db->prepare($req);
		$query->execute(array(
			$id
		));

		$rows = $query->fetchAll();
		$users = array();
		foreach ($rows as $row) {

			$user = new Application_Object_Website_User();

			$user->login = $row['user_login'];
			$user->username = $row['user_name'];
			$user->active = ($row['active'] === 1);
			$user->email = $row['email'];

			$users[$user->login] = $user;
		}

		return $users;
	}
}