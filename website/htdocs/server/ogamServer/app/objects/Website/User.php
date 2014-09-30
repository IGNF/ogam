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
 * @package objects
 * @SuppressWarnings checkUnusedVariables
 */
class Application_Object_Website_User {

	/**
	 * The user login
	 */
	var $login;

	/**
	 * The user name
	 */
	var $username;

	/**
	 * The user password
	 */
	var $password;

	/**
	 * The provider identifier (ex: "1" for France).
	 */
	var $providerId;

	/**
	 * Indicate if the user is active.
	 * @var Boolean
	 */
	var $active;

	/**
	 * The user email adress.
	 */
	var $email;

	/**
	 * The code of the role.
	 */
	var $roleCode;

	/**
	 * The name of the role (used in the "user list" view").
	 */
	var $roleLabel;

}
