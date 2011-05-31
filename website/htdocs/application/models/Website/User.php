<?php
/**
 * © French National Forest Inventory 
 * Licensed under EUPL v1.1 (see http://ec.europa.eu/idabc/eupl).
 */ 

/**
 * Represent a user.
 *
 * @package classes
 * @SuppressWarnings checkUnusedVariables
 */
class Application_Model_Website_User {

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
	 * The country code (ex: "1" for France).
	 */
	var $countryCode;

	/**
	 * The country label (ex: France).
	 */
	var $countryLabel;

	/**
	 * Indicate if the user is active (1 for true, 0 for false)
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
