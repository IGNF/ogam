package fr.ifn.ogam.integration.business;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import fr.ifn.ogam.common.database.GenericData;

/**
 * Class used to call all event listeners.
 */
public class IntegrationEventNotifier {

	private static List<IntegrationEventListener> listeners = new ArrayList<IntegrationEventListener>();

	/**
	 * Event called before the integration of a submission of data.
	 *
	 * @param submissionId
	 *            the submission identifier
	 * @throws Exception
	 *             in case of database error
	 */
	public void beforeIntegration(Integer submissionId) throws Exception {
		for (IntegrationEventListener listener : listeners) {
			listener.beforeIntegration(submissionId);
		}
	}

	/**
	 * Event called after the integration of a submission of data.
	 *
	 * @param submissionId
	 *            the submission identifier
	 * @throws Exception
	 *             in case of database error
	 */
	public void afterIntegration(Integer submissionId) throws Exception {
		for (IntegrationEventListener listener : listeners) {
			listener.afterIntegration(submissionId);
		}
	}

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
	public void afterLineInsertion(Integer submissionId, String format, String tableName, Map<String, GenericData> values) throws Exception {
		for (IntegrationEventListener listener : listeners) {
			listener.afterLineInsertion(submissionId, format, tableName, values);
		}
	}

	/**
	 * Add a new event listener.
	 * 
	 * @param listener
	 *            A listener to notify
	 */
	public static void addListener(IntegrationEventListener listener) {
		listeners.add(listener);
	}

}
