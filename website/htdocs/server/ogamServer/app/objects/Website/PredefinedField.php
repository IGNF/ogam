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
 * Represent a Predefined Field.
 * This is a kind of criteria form field.
 *
 * @SuppressWarnings checkUnusedVariables
 *
 * @package Application_Object
 * @subpackage Website
 */
class Application_Object_Website_PredefinedField extends Application_Object_Metadata_FormField {

	/**
	 * Indicate if the value is fixed ("1") or if the user can select it ("0").
	 */
	var $fixed;

	/**
	 * Serialize the criteria as a JSON string
	 *
	 * @return JSON the criteria field descriptor
	 */
	public function toCriteriaJSON() {
		$return = '"name":' . json_encode($this->getName());
		$return .= ',"label":' . json_encode($this->label);
		$return .= ',"inputType":' . json_encode($this->inputType);
		$return .= ',"unit":' . json_encode($this->unit);
		$return .= ',"type":' . json_encode($this->type);
		$return .= ',"subtype":' . json_encode($this->subtype);
		$return .= ',"definition":' . json_encode($this->definition);
		$return .= ',"is_default":' . $this->isDefaultCriteria;
		$return .= ',"default_value":' . json_encode($this->defaultValue);
		$return .= ',"decimals":' . json_encode($this->decimals);
		$return .= ',"fixed":' . json_encode($this->fixed); // for predefined criterias
		return $return;
	}
}
