package fr.ifn.eforest.common.business;

/**
 * List the authorised field types.
 */
public interface UnitTypes {

	/**
	 * A string.
	 */
	String STRING = "STRING";

	/**
	 * A code (mapped to java type String).
	 */
	String CODE = "CODE";

	/**
	 * A decimal value comprised in a specified range (mapped to java type BigDecimal).
	 */
	String RANGE = "RANGE";

	/**
	 * A numeric value (mapped to java type BigDecimal).
	 */
	String NUMERIC = "NUMERIC";

	/**
	 * An integer (mapped to java type Integer).
	 */
	String INTEGER = "INTEGER";

	/**
	 * A geographic coordinate (mapped to java type BigDecimal).
	 */
	String COORDINATE = "COORDINATE";

	/**
	 * A date (mapped to java type Date).
	 */
	String DATE = "DATE";

	/**
	 * A boolean (mapped to java type Boolean).
	 */
	String BOOLEAN = "BOOLEAN";

}
