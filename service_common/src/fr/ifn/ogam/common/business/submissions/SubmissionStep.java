/**
 * Licensed under EUPL v1.1 (see http://ec.europa.eu/idabc/eupl).
 * 
 * © European Union, 2008-2012
 *
 * Reuse is authorised, provided the source is acknowledged. The reuse policy of the European Commission is implemented by a Decision of 12 December 2011.
 *
 * The general principle of reuse can be subject to conditions which may be specified in individual copyright notices. 
 * Therefore users are advised to refer to the copyright notices of the individual websites maintained under Europa and of the individual documents. 
 * Reuse is not applicable to documents subject to intellectual property rights of third parties.
 */
package fr.ifn.ogam.common.business.submissions;

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
