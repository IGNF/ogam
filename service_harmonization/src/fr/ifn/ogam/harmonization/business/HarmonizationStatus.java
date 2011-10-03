package fr.ifn.ogam.harmonization.business;

/**
 * List the harmonization status.
 */
public interface HarmonizationStatus {

	/**
	 * Initial status.
	 */
	String INIT = "INIT";

	/**
	 * Running status.
	 */
	String RUNNING = "RUNNING";

	/**
	 * OK status.
	 */
	String OK = "OK";

	/**
	 * Error status.
	 */
	String ERROR = "ERROR";

}
