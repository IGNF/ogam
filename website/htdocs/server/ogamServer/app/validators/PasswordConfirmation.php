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
 * Validator for the password field
 *
 * @package Application_Validator
 */
class Application_Validator_PasswordConfirmation extends Zend_Validate_Abstract {

	/**
	 * Validation failure message key for when the confirmation password doesn't match the password
	 */
	const NOT_MATCH = 'notMatch';

	/**
	 * Validation failure message template definitions
	 *
	 * @var array
	 */
	protected $_messageTemplates = array(
		self::NOT_MATCH => 'Password confirmation does not match'
	);

	/**
	 * Defined by Zend_Validate_Interface
	 *
	 * Returns true if the confirmation password match the password
	 *
	 * @param String $value
	 *        	the value to test
	 * @param Array $context
	 *        	some contextual information
	 * @return boolean
	 */
	public function isValid($value, $context = null) {
		$value = (string) $value;
		$this->_setValue($value);

		if (is_array($context)) {
			if (isset($context['confirmPassword']) && ($value == $context['confirmPassword'])) {
				return true;
			}
		} elseif (is_string($context) && ($value == $context)) {
			return true;
		}

		$this->_error(self::NOT_MATCH);
		return false;
	}
}
