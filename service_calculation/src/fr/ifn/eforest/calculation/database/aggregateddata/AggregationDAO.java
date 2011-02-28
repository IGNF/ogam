package fr.ifn.eforest.calculation.database.aggregateddata;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.util.Map;

import javax.naming.Context;
import javax.naming.InitialContext;
import javax.naming.NamingException;
import javax.sql.DataSource;

import org.apache.log4j.Logger;

import fr.ifn.eforest.common.business.MappingTypes;
import fr.ifn.eforest.common.database.mapping.GridData;
import fr.ifn.eforest.common.database.metadata.MetadataDAO;
import fr.ifn.eforest.common.database.metadata.TableFieldData;

/**
 * Data Access Object used to manage clusters.
 */
public class AggregationDAO {

	private Logger logger = Logger.getLogger(this.getClass());

	private Logger sqllogger = Logger.getLogger("SQLLogger");

	private MetadataDAO metadataDAO = new MetadataDAO();

	/**
	 * Clean previous results.
	 */
	private static final String CLEAN_RESULTS_STMT = "DELETE FROM aggregated_result WHERE session_id = ? OR ((NOW()-_creationdt)> '5 day') ";

	/**
	 * Get a connexion to the database.
	 * 
	 * @return The <code>Connection</code>
	 * @throws NamingException
	 * @throws SQLException
	 */
	public Connection getConnection() throws NamingException, SQLException {

		Context initContext = new InitialContext();
		DataSource ds = (DataSource) initContext.lookup("java:/comp/env/jdbc/aggregateddata");
		Connection cx = ds.getConnection();

		return cx;
	}

	/**
	 * Aggregate the value per cluster and cell.
	 * 
	 * @param con
	 *            the connexion
	 * @param sessionId
	 *            the session identifier
	 * @param grid
	 *            the grid where to aggregate the variable
	 * @param domain
	 *            the domain of validity of the variable
	 * @param variable
	 *            the quantitative variable to aggregate
	 * @param sql
	 *            the SQL query corresponding to the user selection
	 */
	public void simpleAggregation(Connection con, String sessionId, GridData grid, TableFieldData domain, TableFieldData variable, String sql) throws Exception {

		PreparedStatement ps = null;
		try {

			String request = "INSERT INTO aggregated_result (session_id, cell_id, average_value, value_count) ";
			request += " SELECT '" + sessionId + "' as session_id, ";
			request += " coalesce(foo.cell_id, '') as cell_id, ";
			request += " AVG(foo.plotValue) as average_value, ";
			request += " COUNT (foo.*) as plot_count ";
			request += " FROM (";
			request += "       SELECT SUM(" + variable.getColumnName() + ") as plotValue, "; // the value to aggregate
			request += "       MAX(" + grid.getLocationColumn() + ") as cell_id "; // the cell_id (should be always the same for a given plot)
			request += "       " + sql; // The criteria for the selection of plots
			request += "       AND " + domain.getTableName() + "." + domain.getColumnName() + " = '1'  "; // Filter the plots corresponding to the domain
			request += "       GROUP BY LOCATION_DATA.plot_code";
			request += "      ) as foo ";
			request += " GROUP BY foo.cell_id";

			// Preparation of the request
			ps = con.prepareStatement(request);
			sqllogger.debug(request + ";");
			ps.execute();

		} finally {
			try {
				if (ps != null) {
					ps.close();
				}
			} catch (SQLException e) {
				logger.error("Error while closing statement : " + e.getMessage());
			}

		}
	}

	/**
	 * Aggregate the value per cluster and cell.
	 * 
	 * @param con
	 *            the connexion
	 * @param grid
	 *            the grid where to aggregate the variable
	 * @param domain
	 *            the domain of validity of the variable
	 * @param variable
	 *            the quantitative variable to aggregate
	 * @param sql
	 *            the SQL query corresponding to the user selection
	 */
	public void calculateValuePerClusterAndCell(Connection con, GridData grid, TableFieldData domain, TableFieldData variable, String sql) throws Exception {

		PreparedStatement ps = null;
		try {

			String request = "CREATE TEMP TABLE value_per_cluster ON COMMIT DROP AS ";
			request += " SELECT country_code, cluster_code, cell_id, avg(value_cluster_cell) AS value_cluster_cell"; // average the basal area per cluster
			request += " FROM ( ";
			request += " SELECT location_data.country_code, location_data.cluster_code, " + grid.getLocationColumn()
					+ " as cell_id, location_data.plot_code, sum(" + variable.getColumnName() + ") AS value_cluster_cell "; // average the basal area per
																															// cluster
			request += sql;
			request += " AND " + domain.getTableName() + "." + domain.getColumnName() + " = '1'  "; // Filter the plots corresponding to the domain
			request += " GROUP BY location_data.country_code, location_data.cluster_code, location_data.plot_code, " + grid.getLocationColumn(); // Group by the
																																					// requested
																																					// Grid
			request += " ) as foo";
			request += " GROUP BY country_code, cluster_code, cell_id";

			// Preparation of the request
			ps = con.prepareStatement(request);
			sqllogger.debug(request.replaceAll("ON COMMIT DROP ", "") + ";");
			ps.execute();

			// Create an index on the table
			ps.close();
			ps = con.prepareStatement("CREATE INDEX value_per_cluster_IDX ON value_per_cluster (country_code, cluster_code, cell_id)");
			ps.execute();

		} finally {
			try {
				if (ps != null) {
					ps.close();
				}
			} catch (SQLException e) {
				logger.error("Error while closing statement : " + e.getMessage());
			}

		}
	}

	/**
	 * Calculate the number of plots per cluster and cell.
	 * 
	 * @param con
	 *            the connexion
	 * @param datasetId
	 *            the identifier of the dataset
	 * @param grid
	 *            the grid where to aggregate the variable
	 * @param domain
	 *            the domain of validity of the variable
	 */
	public void calculatePlotsPerClusterAndCell(Connection con, String datasetId, GridData grid, TableFieldData domain) throws Exception {

		PreparedStatement ps = null;
		try {

			String request = "CREATE TEMP TABLE nb_plots_per_cluster ON COMMIT DROP AS";
			request += " SELECT location_data.country_code, location_data.cluster_code, " + grid.getLocationColumn() + " as cell_id, count(*) AS nb_plots ";
			request += " FROM plot_data plot_data ";
			request += " LEFT JOIN data_submission USING (submission_id) ";
			request += " INNER JOIN location location_data ON (location_data.country_code = plot_data.country_code AND location_data.plot_code = plot_data.plot_code) ";
			request += " AND data_submission.request_id = '" + datasetId + "'"; // Filter the submissions corresponding to the request_id
			request += " AND " + domain.getTableName() + "." + domain.getColumnName() + " = '1'  "; // Filter the plots corresponding to the domain
			request += " GROUP by location_data.country_code, location_data.cluster_code, " + grid.getLocationColumn(); // Group by the requested Grid

			// Preparation of the request
			ps = con.prepareStatement(request);
			sqllogger.debug(request.replaceAll("ON COMMIT DROP ", "") + ";");
			ps.execute();

		} finally {
			try {
				if (ps != null) {
					ps.close();
				}
			} catch (SQLException e) {
				logger.error("Error while closing statement : " + e.getMessage());
			}
		}
	}

	/**
	 * Aggregate the value per cell.
	 * 
	 * @param con
	 *            the connexion
	 * @param sessionId
	 *            the identifier of the user session
	 */
	public void calculateValuePerCell(Connection con, String sessionId) throws Exception {

		PreparedStatement ps = null;
		try {

			String request = "INSERT INTO aggregated_result (session_id, cell_id, average_value, value_count) "
					+
					//
					" SELECT '"
					+ sessionId
					+ "', cl.cell_id, sum(standardised_weight * nb_plots * value_cluster_cell) / (avg(standardised_weight) * avg(nb_plots) * count(*)) AS estim_value, sum(nb_plots) as value_count "
					+
					//
					" FROM standardized_cluster bj  "
					+ //
					" INNER JOIN nb_plots_per_cluster p ON (p.country_code = bj.country_code AND p.cluster_code = bj.cluster_code)"
					+ //
					" INNER JOIN value_per_cluster cl ON (cl.country_code = bj.country_code AND cl.cluster_code = bj.cluster_code AND cl.cell_id = p.cell_id) "
					+ //
					" GROUP BY cl.cell_id";

			// Preparation of the request
			ps = con.prepareStatement(request + ";");

			sqllogger.debug(request);
			ps.execute();

		} finally {
			try {
				if (ps != null) {
					ps.close();
				}
			} catch (SQLException e) {
				logger.error("Error while closing statement : " + e.getMessage());
			}
		}
	}

	/**
	 * Aggregate the value per cell.
	 * 
	 * @param sessionId
	 *            the identifier of the user session
	 */
	public void cleanResults(String sessionId) throws Exception {

		Connection con = null;
		PreparedStatement ps = null;
		try {

			con = getConnection();

			sqllogger.debug("***********************************************************");

			String request = CLEAN_RESULTS_STMT;

			// Preparation of the request
			ps = con.prepareStatement(request);
			ps.setString(1, sessionId);

			sqllogger.debug(request + ";");
			ps.execute();

		} finally {
			try {
				if (ps != null) {
					ps.close();
				}
			} catch (SQLException e) {
				logger.error("Error while closing statement : " + e.getMessage());
			}
			try {
				if (con != null) {
					con.close();
				}
			} catch (SQLException e) {
				logger.error("Error while closing statement : " + e.getMessage());
			}
		}
	}

	/**
	 * Return the domain field linked to a table field (a quantitative variable).
	 * 
	 * @param sourceformat
	 *            the source format (table)
	 * @param sourcefield
	 *            the source field (column)
	 * @return the domain field (column)
	 */
	public TableFieldData getVariableDomain(String sourceformat, String sourcefield) throws Exception {

		Map<String, TableFieldData> mappedFields = metadataDAO.getTableToTableFieldMapping(sourceformat, "DOMAIN_MAPPING");

		if (mappedFields == null) {
			throw new Exception("No domain found for variable " + sourceformat);
		}

		TableFieldData field = mappedFields.get(sourcefield);

		return field;
	}

}
