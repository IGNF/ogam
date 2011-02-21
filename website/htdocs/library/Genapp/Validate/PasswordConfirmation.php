<?php
/**
 * Validator for the password field
 * Returns true if the confirmation password match the password
 *
 * @category   Genapp
 * @package    Genapp_Validate
 *
 */
class Genapp_Validate_PasswordConfirmation extends Zend_Validate_Abstract {
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
	 * @param  string $value
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
