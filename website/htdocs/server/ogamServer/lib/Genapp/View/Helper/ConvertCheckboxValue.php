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
 * Helper for the convertion of field value.
 *
 * @package Helper
 */
class Genapp_View_Helper_ConvertCheckboxValue extends Zend_View_Helper_Abstract {

	/**
	 * Convert a checkbox field value depending of the field's type
	 *
	 * @param Array $fieldParameters The field parameters
	 * @return String the converted value
	 */
	function convertCheckboxValue($fieldParameters) {

	    // Initialise the logger
		$this->logger = Zend_Registry::get("logger");

		// Get the translator
		$this->translator = Zend_Registry::get('Zend_Translate');

        $booleanValue = null;
        $v = $fieldParameters['value'];
        switch ($fieldParameters['type']) {
            case 'BOOLEAN':
                switch (true) {
                    case ($v === false): $booleanValue = false; break;
                    case ($v === true): $booleanValue = true; break;
                    default: 
                        $this->logger->warn('The value must be set to true or false for a checkbox field with a "BOOLEAN" type');
                        $booleanValue = null;
                }
                break;
            case 'STRING':
                switch (true) {
                    case ($v === "0"): $booleanValue = false; break;
                    case ($v === "1"): $booleanValue = true; break;
                    default: 
                        $this->logger->warn('The value must be set to "0" or "1" for a checkbox field with a "STRING" type');
                        $booleanValue = null;
                }
                break;
            case 'CODE':
                $uncheckedValue = '0';
                $checkedValue = '1';
                if (fieldParameters['uncheckedValue'] && fieldParameters['checkedValue']) {
                    $uncheckedValue = fieldParameters['uncheckedValue'];
                    $checkedValue = fieldParameters['checkedValue'];
                } else {
                    $this->logger->warn('The uncheckedValue and checkedValue parameters are missing for a checkbox field with a "CODE" type');
                    $this->logger->warn('The checkbox field defaults values are set to "0" and "1"');
                }
                switch (true) {
                    case ($v === $uncheckedValue): $booleanValue = false; break;
                    case ($v === $checkedValue): $booleanValue = true; break;
                    default:
                        $this->logger->warn('The value must be set to "'. $uncheckedValue .'" or "'. $checkedValue .'" for a checkbox field with a "CODE" type');
                        $booleanValue = null;
                }
                break;
            default:
                $booleanValue = null;
                $this->logger->warn('The checkbox field value type is not specified for the "' . fieldParameters['type'] . '" type');
        }
        switch (true) {
            case ($booleanValue === false): return $this->translator->translate('No'); break;
            case ($booleanValue === true): return $this->translator->translate('Yes'); break;
            default: return '&#160;';
        }
	}
}