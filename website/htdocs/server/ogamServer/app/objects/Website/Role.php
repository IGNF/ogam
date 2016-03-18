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
 * Represent a user's role.
 *
 * @package objects
 *          @SuppressWarnings checkUnusedVariables
 */
class Application_Object_Website_Role {

	/**
	 * The user role.
	 *
	 * @var String
	 */
	var $code;

	/**
	 * The role label.
	 *
	 * @var String
	 */
	var $label;

	/**
	 * The role definition.
	 *
	 * @var String
	 */
	var $definition;

	/**
	 * The role permissions.
	 *
	 * A list of codes corresponding to authorised actions.
	 *
	 * @var Array[String]
	 */
	var $permissionsList = array();

	/**
	 * The database schemas the role can access.
	 *
	 * A list of schemas names.
	 *
	 * @var Array[String]
	 */
	var $schemasList = array();

	/**
	 * Indicate if the role is allowed for a permission.
	 *
	 * @param String $permissionName
	 *        	The permission
	 * @return Boolean
	 */
	function isAllowed($permissionName) {
		return (!empty($this->permissionsList) && in_array($permissionName, $this->permissionsList));
	}
}