package fr.ifn.ogam.common.business.processing;

/**
 * List the different processing steps.
 */
public interface ProcessingStep {

	/**
	 * Post-integration processing.
	 */
	String INTEGRATION = "INTEGRATION";

	/**
	 * Post-harmonization processing.
	 */
	String HARMONIZATION = "HARMONIZATION";

}
