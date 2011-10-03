package fr.ifn.ogam.integration.business.checks;

/**
 * List the different check steps.
 */
public interface CheckStep {

	/**
	 * Check that the data format is correct and cna be inserted in database.
	 */
	String COMPLIANCE = "COMPLIANCE";

	/**
	 * Check that the data is conform to what is expected.
	 */
	String CONFORMITY = "CONFORMITY";

}
