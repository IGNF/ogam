package fr.ifn.eforest.integration.business.submissions;

/**
 * List the submission status.
 */
public interface SubmissionStatus {

	/**
	 * OK status.
	 */
	String OK = "OK";

	/**
	 * Running status.
	 */
	String RUNNING = "RUNNING";

	/**
	 * Warning status.
	 */
	String WARNING = "WARNING";

	/**
	 * Error status.
	 */
	String ERROR = "ERROR";

	/**
	 * Crash status. For unexpected errors like a problem with the database connexion ...
	 */
	String CRASH = "CRASH";
}
