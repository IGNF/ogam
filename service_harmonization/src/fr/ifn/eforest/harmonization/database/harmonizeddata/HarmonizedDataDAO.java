package fr.ifn.eforest.harmonization.database.harmonizeddata;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

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
	 * Remove all data from a table for a given country and JRC Request.
	 * 
	 * @param tableName
	 *            the name of the table
	 * @param providerId
	 *            the identifier of the country
	 */
	public void deleteHarmonizedData(String tableName, String providerId) throws Exception {

		Connection con = null;
		PreparedStatement ps = null;
		try {

			con = getConnection();

			// Build the SQL INSERT
			String statement = "DELETE FROM " + tableName + " WHERE provider_id  = ?";

			// Prepare the statement
			ps = con.prepareStatement(statement);

			// Set the values
			ps.setString(1, providerId);

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
	 * Remove all data from a table for a given provider and dataset.
	 * 
	 * @param tableName
	 *            the name of the table
	 * @param providerId
	 *            the identifier of the provider
	 * @param datasetId
	 *            the identifier of the dataset
	 * @return the number of lines in the table
	 * 
	 */
	public int countData(String tableName, String providerId, String datasetId) throws Exception {

		Connection con = null;
		PreparedStatement ps = null;
		ResultSet rs = null;
		try {

			con = getConnection();

			// Build the SQL
			String statement = "SELECT COUNT(*) as count FROM " + tableName + " WHERE provider_id  = ? AND dataset_id = ?";

			// Prepare the statement
			ps = con.prepareStatement(statement);

			// Set the values
			ps.setString(1, providerId);
			ps.setString(2, datasetId);

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

}
