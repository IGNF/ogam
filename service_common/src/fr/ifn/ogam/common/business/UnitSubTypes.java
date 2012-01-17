package fr.ifn.ogam.common.business;

/**
 * List the field sub-types.
 */
public interface UnitSubTypes {

	/**
	 * A decimal value comprised in a specified range (mapped to java type BigDecimal). For NUMERIC type.
	 */
	String RANGE = "RANGE";

	/**
	 * A coordinate expressed in decimal degrees (mapped to java type BigDecimal). For NUMERIC type.
	 */
	String COORDINATE = "COORDINATE";

	/**
	 * A mode (list of values) For CODE type.
	 */
	String MODE = "MODE";

	/**
	 * A tree (hierarchical list of values) For CODE type.
	 */
	String TREE = "TREE";

	/**
	 * A mode selected in a table using a dynamic SQL request. For CODE type.
	 */
	String DYNAMIC = "DYNAMIC";
	
	/**
	 * A mode selected in a taxonomic referential. For CODE type.
	 */
	String TAXREF = "TAXREF";

}
