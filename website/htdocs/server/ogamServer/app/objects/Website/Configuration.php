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
 * Represent the configuration of the website.
 *
 * This class is a container for ApplicationParameter objects.
 * The parameters are set during bootstrap.
 *
 * @SuppressWarnings checkUnusedVariables
 *
 * @package Application_Object
 * @subpackage Website
 */
class Application_Object_Website_Configuration {

	/**
	 * The array of parameters.
	 *
	 * @var Array[Application_Object_Website_ApplicationParameter]
	 */
	var $parameters = array();

	/**
	 * Add a new parameter.
	 *
	 * @param Array[Application_Object_Website_ApplicationParameter] $params
	 */
	function setParameters($params) {
		$this->parameters = $params;
	}

	/**
	 * Get a config parameter.
	 *
	 * @param String $name
	 * @param String $defaultValue
	 * @param Boolean $silent (if true, doesn't generate a warning for default value)
	 * @return String the parameter value
	 * @throws An exception if the parameter cannot be found and no default value is set
	 */
	function getConfig($name, $defaultValue = null, $silent = false) {
		if (isset($this->parameters[$name])) {
			$parameter = $this->parameters[$name];
		}

		// Get the parameter value from the config
		if (!empty($parameter)) {
			return $parameter->value;
		} else if ($defaultValue !== null) {

			// If not available but a default is specified, return the default
			if (!$silent) {
				$logger = Zend_Registry::get("logger");
				$logger->warn('Configuration parameter ' . $name . ' not found, using default value : ' . $defaultValue);
			}

			return $defaultValue;
		} else {

			// Missing config
			$logger = Zend_Registry::get("logger");
			$logger->err('Configuration parameter ' . $name . ' cannot be found');

			throw new Exception('Configuration parameter ' . $name . ' cannot be found');
		}
	}
}