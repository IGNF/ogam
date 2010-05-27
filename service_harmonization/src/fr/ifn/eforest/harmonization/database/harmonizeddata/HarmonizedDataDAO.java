package fr.ifn.eforest.harmonization.database.harmonizeddata;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import javax.naming.Context;
import javax.naming.InitialContext;
import javax.naming.NamingException;
import javax.sql.DataSource;

import org.apache.log4j.Logger;

/**
 * Data Access Object allowing to acces the harmonized data tables.
 */
public class HarmonizedDataDAO {

	private Logger logger = Logger.getLogger(this.getClass());

	/**
	 * Get the list of active location submissions.
	 */
	private static final String GET_ACTIVE_LOCATION_SUBMISSIONS_STMT = "SELECT location_submission.submission_id " + //
			" FROM location_submission " + //
			" LEFT JOIN submission using (submission_id) " + //
			" WHERE country_code = ? " + //
			" AND step <> 'CANCELLED' " + //
			" ORDER BY submission_id DESC";

	/**
	 * Get the list of active submissions.
	 */
	private static final String GET_ACTIVE_SUBMISSIONS_STMT = "SELECT data_submission.submission_id " + //
			" FROM data_submission " + //
			" LEFT JOIN submission using (submission_id) " + //
			" WHERE country_code = ? " + //
			" AND request_id = ? " + //
			" AND step = 'VALIDATED' " + //
			" ORDER BY submission_id DESC";

	/**
	 * Get a connexion to the database.
	 * 
	 * @return The <code>Connection</code>
	 * @throws NamingException
	 * @throws SQLException
	 */
	private Connection getConnection() throws NamingException, SQLException {

		Context initContext = new InitialContext();
		DataSource ds = (DataSource) initContext.lookup("java:/comp/env/jdbc/harmonizeddata");
		Connection cx = ds.getConnection();

		return cx;
	}

	/**
	 * Return the list of active location submissions for a given country code.
	 * 
	 * @param countryCode
	 *            the country code
	 * @return the list of submission identifiers
	 */
	public List<Integer> getActiveLocationSubmission(String countryCode) throws Exception {
		Connection con = null;
		PreparedStatement ps = null;
		ResultSet rs = null;
		List<Integer> result = new ArrayList<Integer>();
		try {

			con = getConnection();

			ps = con.prepareStatement(GET_ACTIVE_LOCATION_SUBMISSIONS_STMT);
			ps.setString(1, countryCode);
			logger.trace(GET_ACTIVE_LOCATION_SUBMISSIONS_STMT);
			rs = ps.executeQuery();

			while (rs.next()) {
				result.add(rs.getInt("submission_id"));
			}

			return result;

		} finally {
			try {
				if (rs != null) {
					rs.close();
				}
			} catch (SQLException e) {
				logger.error("Error while closing resultset : " + e.getMessage());
			}
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
				logger.error("Error while closing connexion : " + e.getMessage());
			}
		}

	}

	/**
	 * Return the list of active data submissions for a given country code and dataset id.
	 * 
	 * @param countryCode
	 *            the country code
	 * @param datasetId
	 *            the identifier of the dataset (JRC Request)
	 * @return the list of submission identifiers
	 */
	public List<Integer> getActiveDataSubmission(String countryCode, String datasetId) throws Exception {
		Connection con = null;
		PreparedStatement ps = null;
		ResultSet rs = null;
		List<Integer> result = new ArrayList<Integer>();
		try {

			con = getConnection();

			ps = con.prepareStatement(GET_ACTIVE_SUBMISSIONS_STMT);
			ps.setString(1, countryCode);
			ps.setString(2, datasetId);
			logger.trace(GET_ACTIVE_SUBMISSIONS_STMT);
			rs = ps.executeQuery();

			while (rs.next()) {
				result.add(rs.getInt("submission_id"));
			}

			return result;

		} finally {
			try {
				if (rs != null) {
					rs.close();
				}
			} catch (SQLException e) {
				logger.error("Error while closing resultset : " + e.getMessage());
			}
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
				logger.error("Error while closing connexion : " + e.getMessage());
			}
		}

	}

	/**
	 * Remove all data from a table for a given country and JRC Request.
	 * 
	 * @param tableName
	 *            the name of the table
	 * @param countryCode
	 *            the identifier of the country
	 * @param requestID
	 *            the identifier of the JRC Request
	 */
	public void deleteHarmonizedData(String tableName, String countryCode, String requestID) throws Exception {

		Connection con = null;
		PreparedStatement ps = null;
		try {

			con = getConnection();

			// Build the SQL INSERT
			String statement = "DELETE FROM " + tableName + " WHERE country_code  = ? AND request_id = ?";

			// Prepare the statement
			ps = con.prepareStatement(statement);

			// Set the values
			ps.setString(1, countryCode);
			ps.setString(2, requestID);

			// Execute the query
			logger.trace(statement);
			ps.execute();

		} catch (Exception e) {
			// Low level log			
			logger.error("Error while deleting harmonized data", e);
			throw e;
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
				logger.error("Error while closing connexion : " + e.getMessage());
			}
		}
	}

	/**
	 * Remove all data from a table for a given country and JRC Request.
	 * 
	 * @param tableName
	 *            the name of the table
	 * @param countryCode
	 *            the identifier of the country
	 * @param requestID
	 *            the identifier of the JRC Request
	 * @return the number of lines in the table for this JRC Request and Country
	 * 
	 */
	public int countData(String tableName, String countryCode, String requestID) throws Exception {

		Connection con = null;
		PreparedStatement ps = null;
		ResultSet rs = null;
		try {

			con = getConnection();

			// Build the SQL INSERT
			String statement = "SELECT COUNT(*) as count FROM " + tableName + " WHERE country_code  = ? AND request_id = ?";

			// Prepare the statement
			ps = con.prepareStatement(statement);

			// Set the values
			ps.setString(1, countryCode);
			ps.setString(2, requestID);

			// Execute the query
			logger.trace(statement);
			rs = ps.executeQuery();

			if (rs.next()) {
				return rs.getInt("count");
			} else {
				return -1;
			}

		} catch (Exception e) {
			// Low level log			
			logger.error("Error while deleting harmonized data", e);
			throw e;
		} finally {
			try {
				if (rs != null) {
					rs.close();
				}
			} catch (SQLException e) {
				logger.error("Error while closing statement : " + e.getMessage());
			}
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
				logger.error("Error while closing connexion : " + e.getMessage());
			}
		}
	}

	/**
	 * Update the plot location as the center of a 1 km x 1km grid if needed. And remove the lat/long information.
	 * 
	 * @param datasetId
	 *            the identifier of the dataset
	 * @param countryCode
	 *            the country code (used to get the correct 1x1 grid)
	 */
	public void blurPlotLocation(String datasetId, String countryCode) throws Exception {

		Connection con = null;
		PreparedStatement ps = null;
		try {

			con = getConnection();

			String statement = " UPDATE harmonized_location " + //  
					" SET the_geom = realcoordinate.the_geom, lat = 0, long = 0 " + //
					" FROM ( " + //  
					"    SELECT request_id, country_code, plot_code, Centroid(grid.the_geom) as the_geom " + //
					"    FROM harmonized_location " + // 
					"    JOIN grid_eu25_1k_" + countryCode + " as grid ON (ST_Intersects(harmonized_location.the_geom, grid.the_geom)) " + // 
					"    WHERE harmonized_location.country_code = ? " + //  
					"    AND harmonized_location.request_id = ? " + //
					"    AND harmonized_location.is_plot_coordinates_degraded = '0' " + // 
					" ) as realcoordinate " + // 
					" WHERE harmonized_location.request_id = realcoordinate.request_id " + //
					" AND harmonized_location.country_code = realcoordinate.country_code " + // 
					" AND harmonized_location.plot_code = realcoordinate.plot_code";

			// Prepare the statement
			ps = con.prepareStatement(statement);

			// Set the values
			ps.setString(1, countryCode);
			ps.setString(2, datasetId);

			// Execute the query
			logger.trace(statement);
			ps.execute();

		} catch (Exception e) {
			// Low level log			
			logger.error("Error while updating harmonized data", e);
			throw e;
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
				logger.error("Error while closing connexion : " + e.getMessage());
			}
		}
	}
}
