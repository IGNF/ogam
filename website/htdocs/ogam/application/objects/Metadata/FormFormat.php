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
 * Represent a Form Format (a logical bloc of the HTML Query page).
 *
 * @package objects
 *          @SuppressWarnings checkUnusedVariables
 */
class Application_Object_Metadata_FormFormat extends Application_Object_Metadata_Format {

	/**
	 * The label of the form
	 */
	var $label;

	/**
	 * The definition of the form
	 */
	var $definition;

	/**
	 * The list of result columns.
	 */
	var $resultsList = array();

	/**
	 * The list of criteria columns.
	 */
	var $criteriaList = array();

	/**
	 * Serialize the object as a JSON string
	 *
	 * @return a JSON string
	 */
	public function toJSON() {
		return '"id":' . json_encode($this->format) . ',"label":' . json_encode($this->label);
	}
}
