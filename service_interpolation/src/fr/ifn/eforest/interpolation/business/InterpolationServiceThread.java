package fr.ifn.eforest.interpolation.business;

import java.io.File;
import java.util.Date;

import org.apache.log4j.Logger;

import fr.ifn.eforest.common.business.AbstractThread;
import fr.ifn.eforest.common.business.ThreadLock;

/**
 * Thread running the interpolation process.
 */
public class InterpolationServiceThread extends AbstractThread {

	// Attributes
	private String sessionId;
	private String datasetId;
	private String sql;
	private String format;
	private String data;
	private String method;
	private Integer gridSize;
	private Integer maxDist;
	private String layerName;

	/**
	 * The logger used to log the errors or several information.
	 * 
	 * @see org.apache.log4j.Logger
	 */
	protected final transient Logger logger = Logger.getLogger(this.getClass());

	/**
	 * Constructor.
	 * 
	 * @param sessionId
	 *            the session identifier of the user
	 * @param datasetId
	 *            the identifier of the dataset
	 * @param sql
	 *            the FROM/WHERE part of the SQL query
	 * @param format
	 *            the logical name of the table containing the value
	 * @param data
	 *            the logical name of the column containing the value
	 * @param layerName
	 *            the name of the resulting layer
	 * @param method
	 *            the interpolation method to use
	 * @param gridSize
	 *            the grid size
	 * @param maxDist
	 *            the max distance for IDW interpolation
	 * @throws Exception
	 */
	public InterpolationServiceThread(String sessionId, String datasetId, String sql, String format, String data, String layerName, String method, Integer gridSize, Integer maxDist) throws Exception {

		this.sessionId = sessionId;
		this.datasetId = datasetId;
		this.sql = sql;
		this.format = format;
		this.data = data;
		this.method = method;
		this.gridSize = gridSize;
		this.maxDist = maxDist;
		this.layerName = layerName;
	}

	/**
	 * Launch in thread mode the interpolation process.
	 */
	public void run() {

		try {

			Date startDate = new Date();
			logger.debug("Start of the interpolation process " + startDate + ".");

			// Initialise the service
			InterpolationService interpolationService = new InterpolationService(this);

			// Export the data in a CSV file
			String filename = interpolationService.exportData(sessionId, sql, format, data);

			// Launch the R process
			interpolationService.interpolateData(sessionId, datasetId, layerName, filename, method, gridSize, maxDist);

			// Delete the temporary file
			try {
				new File(filename).delete();
			} catch (Exception ignored) {
				logger.debug("Error while deleting interpolation CSV file : " + ignored.getMessage());
			}

			// Log the end the the process
			Date endDate = new Date();
			logger.debug("Interpolation process terminated successfully in " + (endDate.getTime() - startDate.getTime()) / 1000.00 + " sec.");

		} finally {
			// Remove itself from the list of running checks
			ThreadLock.getInstance().releaseProcess(sessionId);

		}

	}

}
