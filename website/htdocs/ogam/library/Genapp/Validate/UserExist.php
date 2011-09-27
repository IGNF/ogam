<?php
/**
 * Validator for the login field
 * Returns true if the login exist
 *
 * @category   Genapp
 * @package    Genapp_Validate
 *
 */
class Genapp_Validate_UserExist extends Zend_Validate_Abstract {
	/**
	 * Validation failure message key for when the login doesn't exist
	 */
	const USER_NOT_EXIST = 'userNotExist';

	/**
	 * Validation failure message template definitions
	 *
	 * @var array
	 */
	protected $_messageTemplates = array(
		self::USER_NOT_EXIST => 'This login doesn\'t exist'
	);

	/**
	 * Defined by Zend_Validate_Interface
	 *
	 * Returns true if the login exist
	 *
	 * @param  String $value the value to test
	 * @param  Array $context some contextual information
	 * @return boolean
	 */
	public function isValid($value, $context = null) {
		$value = (string) $value;
		$this->_setValue($value);

		// Check that the user exist
		$userModel = new Application_Model_Website_User();
		$duplicate = $userModel->getUser($value);
		if (!empty($duplicate)) {
			return true;
		}

		$this->_error(self::USER_NOT_EXIST);
		return false;
	}
}
