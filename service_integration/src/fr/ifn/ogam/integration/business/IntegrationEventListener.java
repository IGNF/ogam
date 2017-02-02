package fr.ifn.ogam.integration.business;

import java.util.Map;

import fr.ifn.ogam.common.database.GenericData;

/**
 * Interface to be implemented by integration event listeners.
 */
public interface IntegrationEventListener {

	/**
	 * Event called before the integration of a submission of data.
	 *
	 * @param submissionId
	 *            the submission identifier
	 * @throws Exception
	 *             in case of database error
	 */
	public void beforeIntegration(Integer submissionId) throws Exception;

	/**
	 * Event called after the integration of a submission of data.
	 *
	 * @param submissionId
	 *            the submission identifier
	 * @throws Exception
	 *             in case of database error
	 */
	public void afterIntegration(Integer submissionId) throws Exception;

	/**
	 * Event called after each insertion of a line of data.
	 * 
	 * @param submissionId
	 *            the submission identifier
	 * @param format
	 *            The format
	 * @param tableName
	 *            The table name
	 * @param values
	 *            Entry values
	 * @throws Exception
	 *             in case of database error
	 */
	public void afterLineInsertion(Integer submissionId, String format, String tableName, Map<String, GenericData> values) throws Exception;

}
