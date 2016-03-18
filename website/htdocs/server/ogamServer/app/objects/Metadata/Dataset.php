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
 * Represent a dataset.
 *
 * @package objects
 * @SuppressWarnings checkUnusedVariables
 */
class Application_Object_Metadata_Dataset {

	/**
	 * The identifier of the dataset.
	 */
	var $id;

	/**
	 * The label.
	 */
	var $label;

	/**
	 * The definition.
	 */
	var $definition;

	/**
	 * Indicate if the dataset is displayed by default.
	 */
	var $isDefault;

	/**
	 * Serialize the object as a JSON string
	 *
	 * @return a JSON string
	 */
	public function toJSON() {
		$json = '"id":' . json_encode($this->id);
		$json .= ',"label":' . json_encode($this->label);
		$json .= ',"definition":' . json_encode($this->definition);
		$json .= ',"is_default":' . json_encode($this->isDefault);

		return $json;
	}
}