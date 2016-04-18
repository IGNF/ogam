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
 * Represent a user.
 *
 * @SuppressWarnings checkUnusedVariables
 *
 * @package Application_Object
 * @subpackage Website
 */
class Application_Object_Website_User {

	/**
	 * The user login.
	 *
	 * @var String
	 */
	var $login;

	/**
	 * The user name.
	 *
	 * @var String
	 */
	var $username;

	/**
	 * The user password.
	 *
	 * @var String
	 */
	var $password;

	/**
	 * The provider.
	 *
	 * @var Application_Object_Website_Provider
	 */
	var $provider;

	/**
	 * Indicate if the user is active.
	 *
	 * @var Boolean
	 */
	var $active = false;

	/**
	 * The user email adress.
	 *
	 * @var String
	 */
	var $email;

	/**
	 * The role of the user.
	 *
	 * @var Array[Application_Object_Website_Role]
	 */
	var $rolesList = array();

	/**
	 * Indicate if the user is allowed for a permission.
	 *
	 * @param String $permissionName
	 *        	The permission
	 * @return Boolean
	 */
	function isAllowed($permissionName) {
		// The user is allowed if one of its role is.
		foreach ($this->rolesList as $role) {
			if ($role->isAllowed($permissionName)) {
				return true;
			}
		}
		return false;
	}

	/**
	 * Indicate if the user is allowed for a schema.
	 *
	 * @param String $schemaName
	 *        	The schema
	 * @return Boolean
	 */
	function isSchemaAllowed($schemaName) {
		// The user is allowed if one of its role is.
		foreach ($this->rolesList as $role) {
			if (in_array($schemaName, $role->schemasList)) {
				return true;
			}
		}
		return false;
	}
}
