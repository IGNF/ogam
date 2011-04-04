<?php
/**
 * © French National Forest Inventory 
 * Licensed under EUPL v1.1 (see http://ec.europa.eu/idabc/eupl).
 */ 

/**
 * Represent a user's role.
 *
 * @package classes
 */
class Role {

	/**
	 * The user role.
	 */
	var $roleCode;

	/**
	 * The role label.
	 */
	var $roleLabel;

	/**
	 * The role definition.
	 */
	var $roleDefinition;

	/**
	 * Flag indicating if the user can access full coordinates of the plot locations or not (1 for true, 0 for false).
	 */
	var $degradatedCoordinate;

}
