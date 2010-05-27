<?php

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

	/**
	 * Flag indicating if the user can access coutries other than his own (1 for true, 0 for false).
	 */
	var $isEuropeLevel;

}
