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
 * Represent a Field of a File.
 *
 * @package objects
 *          @SuppressWarnings checkUnusedVariables
 */
class Application_Object_Metadata_FileField extends Application_Object_Metadata_Field {

	/**
	 * Indicate if the field is mandatory
	 * 1 for true
	 * 0 for false
	 */
	var $isMandatory;

	/**
	 * The mask of the field
	 */
	var $mask;

	/**
	 * Serialize the object as a JSON string
	 *
	 * @return a JSON string
	 */
	public function toJSON() {
		$json = '"name":' . json_encode($this->getName());
		$json .= ',"format":' . json_encode($this->format);
		$json .= ',"label":' . json_encode($this->label);
		$json .= ',"isMandatory":' . json_encode($this->isMandatory);
		$json .= ',"definition":' . json_encode($this->definition);
		$json .= ',"mask":' . json_encode($this->mask);
		
		return $json;
	}
}
