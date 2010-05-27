package fr.ifn.eforest.calculation.business;

import java.util.Date;

import org.apache.log4j.Logger;

import fr.ifn.eforest.common.business.AbstractThread;
import fr.ifn.eforest.common.business.ThreadLock;

/**
 * Thread running the calculation process.
 */
public class CalculationServiceThread extends AbstractThread {

	// Attributes
	private String datasetId;
	private String sessionId;
	private String variableName;
	private String variableFormat;
	private String gridName;
	private String sql;

	/**
	 * The logger used to log the errors or several information.
	 * 
	 * @see org.apache.log4j.Logger
	 */
	protected final transient Logger logger = Logger.getLogger(this.getClass());

	/**
	 * Constructor.
	 * 
	 * @param datasetId
	 *            the identifier of the dataset
	 * @param sessionId
	 *            the identifier of the user session (to retrieve the selected plots)
	 * @param variableName
	 *            the quantitative value to aggregate
	 * @param variableFormat
	 *            the logical name of the table where to find the variable
	 * @param gridName
	 *            the logical name of the grid where to aggregate
	 * @param sql
	 *            the SQL query corresponding to the user selection
	 * @throws Exception
	 */
	public CalculationServiceThread(String datasetId, String sessionId, String variableName, String variableFormat, String gridName, String sql) throws Exception {
		this.datasetId = datasetId;
		this.sessionId = sessionId;
		this.variableName = variableName;
		this.variableFormat = variableFormat;
		this.gridName = gridName;
		this.sql = sql;
	}

	/**
	 * Launch in thread mode the aggregation process.
	 */
	public void run() {

		try {

			Date startDate = new Date();
			logger.debug("Start of the calculation process " + startDate + ".");

			// SQL Conformity checks
			CalculationService calculationService = new CalculationService(this);
			calculationService.aggregateData(datasetId, sessionId, variableName, variableFormat, gridName, sql);

			// Log the end the the request
			Date endDate = new Date();
			logger.debug("Calculation process terminated successfully in " + (endDate.getTime() - startDate.getTime()) / 1000.00 + " sec.");

		} finally {
			// Remove itself from the list of running checks
			ThreadLock.getInstance().releaseProcess(sessionId);
		}

	}

}
