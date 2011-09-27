package fr.ifn.eforest.common.business.submissions;

/**
 * List the data submission steps.
 */
public interface SubmissionStep {

	/**
	 * Initial step.
	 */
	String INITIALISED = "INIT";

	/**
	 * Data is inserted.
	 */
	String DATA_INSERTED = "INSERTED";

	/**
	 * Data has been checked.
	 */
	String DATA_CHECKED = "CHECKED";

	/**
	 * Data has been validated.
	 */
	String DATA_VALIDATED = "VALIDATED";

	/**
	 * The submission has been cancelled.
	 */
	String SUBMISSION_CANCELLED = "CANCELLED";

}
