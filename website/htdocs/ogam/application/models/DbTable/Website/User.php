<?php
/**
 * © French National Forest Inventory
 * Licensed under EUPL v1.1 (see http://ec.europa.eu/idabc/eupl).
 */

/**
 * This is the User model.
 * @package models
 */
class Application_Model_DbTable_Website_User extends Zend_Db_Table_Abstract {

	var $logger;

	/**
	 * Initialisation
	 */
	public function init() {

		// Initialise the logger
		$this->logger = Zend_Registry::get("logger");
	}

	/**
	 * Return the list of users.
	 *
	 * @return Array fo Users
	 */
	public function getUsers() {
		$db = $this->getAdapter();

		$req = " SELECT user_login as login, ";
		$req .= " user_name as username, ";
		$req .= " country_code, ";
		$req .= " email, ";
		$req .= " active, ";
		$req .= " role_label ";
		$req .= " FROM users ";
		$req .= " LEFT JOIN role_to_user USING (user_login) ";
		$req .= " LEFT JOIN role USING (role_code) ";
		$req .= " WHERE active = '1' ";
		$req .= " ORDER BY role_label, user_login";
		$this->logger->info('getUser : '.$req);

		$query = $db->prepare($req);
		$query->execute();

		$results = $query->fetchAll();
		$users = array();

		foreach ($results as $result) {
			$user = new Application_Model_Website_User();
			$user->login = $result['login'];
			$user->username = $result['username'];
			$user->countryCode = $result['country_code'];
			$user->active = $result['active'];
			$user->email = $result['email'];
			$user->roleLabel = $result['role_label'];
			$users[] = $user;
		}

		return $users;
	}

	/**
	 * Get a user information.
	 *
	 * @param string userLogin The userLogin
	 * @return a User
	 */
	public function getUser($userLogin) {
		$db = $this->getAdapter();

		$req = " SELECT users.user_login as login, ";
		$req .= " user_password as password, ";
		$req .= " user_name as username, ";
		$req .= " country_code, ";
		$req .= " active, ";
		$req .= " email, ";
		$req .= " role_code ";
		$req .= " FROM users ";
		$req .= " LEFT JOIN role_to_user using(user_login) ";
		$req .= " WHERE user_login = ? ";
		$this->logger->info('getUser : '.$req);

		$query = $db->prepare($req);
		$query->execute(array($userLogin));

		$result = $query->fetch();

		if (!empty($result)) {
			$user = new Application_Model_Website_User();
			$user->login = $result['login'];
			$user->username = $result['username'];
			$user->countryCode = $result['country_code'];
			$user->active = $result['active'];
			$user->email = $result['email'];
			$user->roleCode = $result['role_code'];
			return $user;
		} else {
			$this->logger->err('User not found');
			return null;
		}

	}

	/**
	 * Return the password (SHA1 encoded) of the user.
	 *
	 * @param string login The user login
	 * @return the user password
	 */
	public function getPassword($login) {
		$db = $this->getAdapter();

		$req = " SELECT user_password ";
		$req .= " FROM users ";
		$req .= " WHERE user_login = ? ";
		$req .= " AND active = '1'";

		$this->logger->info('getPassword : '.$req);

		$query = $db->prepare($req);
		$query->execute(array($login));

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
	 * @param string login The user login
	 * @param string password The user password
	 */
	public function updatePassword($login, $password) {
		$db = $this->getAdapter();

		$req = " UPDATE users SET user_password = ? WHERE user_login = ?";

		$this->logger->info('updatePassword : '.$req);

		$query = $db->prepare($req);
		$query->execute(array($password, $login));
	}

	/**
	 * Update user information.
	 *
	 * @param User user
	 */
	public function updateUser($user) {
		$db = $this->getAdapter();

		$req = " UPDATE users ";
		$req .= " SET user_name = ?, country_code = ?, email = ?";
		$req .= " WHERE user_login = ?";

		$this->logger->info('updateUser : '.$req);

		$query = $db->prepare($req);
		$query->execute(array(
			$user->username,
			$user->countryCode,
			$user->email,
			$user->login));
	}

	/**
	 * Create a new user.
	 *
	 * @param User user
	 */
	public function createUser($user) {
		$db = $this->getAdapter();

		$req = " INSERT INTO users (user_login, user_password, user_name, country_code, email, active )";
		$req .= " VALUES (?, ?, ?, ?, ?, '1')";

		$this->logger->info('createUser : '.$req);

		$query = $db->prepare($req);
		$query->execute(array(
			$user->login,
			$user->password,
			$user->username,
			$user->countryCode,
			$user->email));
	}

	/**
	 * Update the role of the user.
	 *
	 * @param String the user login
	 * @param String the role code
	 */
	public function updateUserRole($userLogin, $roleCode) {
		$db = $this->getAdapter();

		$req = " UPDATE role_to_user ";
		$req .= " SET role_code = ? ";
		$req .= " WHERE user_login = ?";

		$this->logger->info('updateUserRole : '.$req);

		$query = $db->prepare($req);
		$query->execute(array($roleCode, $userLogin));
	}

	/**
	 * Create the role of the user.
	 *
	 * @param String the user login
	 * @param String the role code
	 */
	public function createUserRole($userLogin, $roleCode) {
		$db = $this->getAdapter();

		$req = " INSERT INTO role_to_user (role_code, user_login) VALUES (?, ?)";

		$this->logger->info('createUserRole : '.$req);

		$query = $db->prepare($req);
		$query->execute(array($roleCode, $userLogin));
	}

	/**
	 * Delete the role of the user.
	 *
	 * @param String the user login
	 */
	public function deleteUserRole($userLogin) {
		$db = $this->getAdapter();

		$req = " DELETE FROM role_to_user WHERE user_login = ?";

		$this->logger->info('deleteUserRole : '.$req);

		$query = $db->prepare($req);
		$query->execute(array($userLogin));
	}

	/**
	 * Delete the user.
	 *
	 * @param String the user login
	 */
	public function deleteUser($userLogin) {
		$db = $this->getAdapter();

		$req = " DELETE FROM users WHERE user_login = ?";

		$this->logger->info('deleteUser : '.$req);

		$query = $db->prepare($req);
		$query->execute(array($userLogin));
	}

}
