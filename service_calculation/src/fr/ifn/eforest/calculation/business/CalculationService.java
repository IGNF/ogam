package fr.ifn.eforest.calculation.business;

import java.sql.Connection;
import java.sql.SQLException;

import org.apache.log4j.Logger;

import fr.ifn.eforest.calculation.database.aggregateddata.AggregationDAO;
import fr.ifn.eforest.common.business.AbstractService;
import fr.ifn.eforest.common.database.mapping.GridDAO;
import fr.ifn.eforest.common.database.mapping.GridData;
import fr.ifn.eforest.common.database.metadata.MetadataDAO;
import fr.ifn.eforest.common.database.metadata.TableFieldData;

/**
 * Calculation Service.
 */
public class CalculationService extends AbstractService {

	/**
	 * The logger used to log the errors or several information.
	 * 
	 * @see org.apache.log4j.Logger
	 */
	private final transient Logger logger = Logger.getLogger(this.getClass());

	// Les DAOs
	private AggregationDAO aggregationDAO = new AggregationDAO();
	private MetadataDAO metadataDAO = new MetadataDAO();
	private GridDAO gridDAO = new GridDAO();

	/**
	 * Constructor.
	 */
	public CalculationService() {
		super();
	}

	/**
	 * Constructor.
	 * 
	 * @param thread
	 *            The thread that launched the service
	 */
	public CalculationService(CalculationServiceThread thread) {
		super(thread);
	}

	/**
	 * Aggregate Data.
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
	 */
	public void aggregateData(String datasetId, String sessionId, String variableName, String variableFormat, String gridName, String sql) {
		Connection con = null;
		try {

			logger.debug("Aggregate data");

			con = aggregationDAO.getConnection();
			con.setAutoCommit(false);

			// Retrieve some information about the quantitative variable
			TableFieldData variable = metadataDAO.getTableField(variableFormat, variableName);

			// Identify the domain of the variable
			TableFieldData domain = aggregationDAO.getVariableDomain(variableFormat, variableName);

			// Retrieve some information about the grid where to aggregate
			GridData grid = gridDAO.getGrid(gridName);
			if (grid == null) {
				throw new Exception("No grid definition for grid name " + gridName);
			}

			// Clean the result database
			if (thread != null) {
				thread.updateInfo("Clean the result database", 0, 0);
			}
			aggregationDAO.cleanResults(sessionId);

			// Simple aggretation
			aggregationDAO.simpleAggregation(con, sessionId, grid, domain, variable, sql);

			/**
			 * Adrian's algorithme
			 */
			/*
			// Aggregate the value per cluster and cell
			if (thread != null) {
				thread.updateInfo("Aggregate the value per cluster and cell", 0, 0);
			}
			aggregationDAO.calculateValuePerClusterAndCell(con, grid, domain, variable, sql);

			// Calculate the number of plots per cluster and cell
			if (thread != null) {
				thread.updateInfo("Calculate the number of plots per cluster and cell", 0, 0);
			}
			aggregationDAO.calculatePlotsPerClusterAndCell(con, datasetId, grid, domain);

			// Aggregate the value per cell
			if (thread != null) {
				thread.updateInfo("Aggregate the value per cell", 0, 0);
			}
			aggregationDAO.calculateValuePerCell(con, sessionId);
			*/

			con.commit();

			logger.debug("Data aggregated");

		} catch (Exception e) {
			logger.error("Error while aggregating data", e);
		} finally {
			try {
				if (con != null) {
					con.rollback();
					con.close();
				}
			} catch (SQLException e) {
				logger.error("Error while closing statement : " + e.getMessage());
			}
		}

	}
}
