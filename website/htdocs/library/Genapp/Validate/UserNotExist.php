<?php
/**
 * Validator for the login field
 * Returns true if the login doesn't exist
 *
 * @category   Genapp
 * @package    Genapp_Validate
 *
 */
class Genapp_Validate_UserNotExist extends Zend_Validate_Abstract {
	/**
	 * Validation failure message key for when the login already exist
	 */
	const USER_EXIST = 'userExist';

	/**
	 * Validation failure message template definitions
	 *
	 * @var array
	 */
	protected $_messageTemplates = array(
		self::USER_EXIST => 'This login already exist'
	);

	/**
	 * Defined by Zend_Validate_Interface
	 *
	 * Returns true if the login doesn't exist
	 *
	 * @param  String $value the value to test
	 * @param  Array $context some contextual information
	 * @return boolean
	 */
	public function isValid($value, $context = null) {
		$value = (string) $value;
		$this->_setValue($value);

		// Check that the user doesn't already exist
		$userModel = new Model_User();
		$duplicate = $userModel->getUser($value);
		if (empty($duplicate)) {
			return true;
		}

		$this->_error(self::USER_EXIST);
		return false;
	}
}
