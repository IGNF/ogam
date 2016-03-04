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
 * Validator for the login field
 *
 * @package Application_Validator
 */
class Application_Validator_UserExist extends Zend_Validate_Abstract {

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
	 * @param String $value
	 *        	the value to test
	 * @param Array $context
	 *        	some contextual information
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
