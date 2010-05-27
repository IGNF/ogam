package fr.ifn.eforest.interpolation.business;

/**
 * List the interpolation status.
 */
public interface InterpolationStatus {

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
