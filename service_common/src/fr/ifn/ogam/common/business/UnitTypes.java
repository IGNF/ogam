package fr.ifn.ogam.common.business;

/**
 * List the field types.
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
	 * A numeric value (mapped to java type BigDecimal).
	 */
	String NUMERIC = "NUMERIC";

	/**
	 * An integer (mapped to java type Integer).
	 */
	String INTEGER = "INTEGER";

	/**
	 * A date (mapped to java type Date).
	 */
	String DATE = "DATE";

	/**
	 * A boolean (mapped to java type Boolean).
	 */
	String BOOLEAN = "BOOLEAN";

	/**
	 * An array of codes.
	 */
	String ARRAY = "ARRAY";

	/**
	 * A geometry (as a WKT string, mapped to the GEOMETRY type of PostGIS).
	 */
	String GEOM = "GEOM";
	
	/**
	 * An image (the image name in the CSV file).
	 */
	String IMAGE = "IMAGE";

}
