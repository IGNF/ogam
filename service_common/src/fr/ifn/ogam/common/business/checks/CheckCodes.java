package fr.ifn.ogam.common.business.checks;

/**
 * List the check codes.
 */
public interface CheckCodes {

	/**
	 * Empty file.
	 */
	Integer EMPTY_FILE = 1000;

	/**
	 * Wrong file number.
	 */
	Integer WRONG_FIELD_NUMBER = 1001;

	/**
	 * Integrity constraint (trying to insert a plot when the location doesn't exist).
	 */
	Integer INTEGRITY_CONSTRAINT = 1002;

	/**
	 * Unexpected SQL error.
	 */
	Integer UNEXPECTED_SQL_ERROR = 1003;

	/**
	 * Duplicate row.
	 */
	Integer DUPLICATE_ROW = 1004;

	/**
	 * Mandatory field missing.
	 */
	Integer MANDATORY_FIELD_MISSING = 1101;

	/**
	 * Invalid format.
	 */
	Integer INVALID_FORMAT = 1102;

	/**
	 * Invalid type field (we cannot cast the value to its type).
	 */
	Integer INVALID_TYPE_FIELD = 1103;

	/**
	 * Invalid date field.
	 */
	Integer INVALID_DATE_FIELD = 1104;

	/**
	 * Invalid code field (the value isn't in the list of codes).
	 */
	Integer INVALID_CODE_FIELD = 1105;

	/**
	 * Invalid range field (the value is outside the range).
	 */
	Integer INVALID_RANGE_FIELD = 1106;

	/**
	 * String too long.
	 */
	Integer STRING_TOO_LONG = 1107;

	/**
	 * Undefined column.
	 */
	Integer UNDEFINED_COLUMN = 1108;

	/**
	 * No mapping.
	 */
	Integer NO_MAPPING = 1109;

}
