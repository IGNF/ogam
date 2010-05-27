package fr.ifn.eforest.harmonization.database.rawdata;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;

import javax.naming.Context;
import javax.naming.InitialContext;
import javax.naming.NamingException;
import javax.sql.DataSource;

import org.apache.log4j.Logger;

/**
 * Data Access Object used to manage plot location.
 */
public class LocationDAO {

	private Logger logger = Logger.getLogger(this.getClass());

	/**
	 * Calculate the cell identifiers for a plot location.
	 */
	private static final String VALIDATE_PLOT_LOCATION_STMT = "SELECT calculatecellid(?)";

	/**
	 * Get a connexion to the database.
	 * 
	 * @return The <code>Connection</code>
	 * @throws NamingException
	 * @throws SQLException
	 */
	private Connection getConnection() throws NamingException, SQLException {

		Context initContext = new InitialContext();
		DataSource ds = (DataSource) initContext.lookup("java:/comp/env/jdbc/rawdata");
		Connection cx = ds.getConnection();

		return cx;
	}

	/**
	 * Validate the plot locations. Calculate the cell identifiers corresponding to the plot location.
	 * 
	 * @param submissionId
	 *            the identifier of the submission
	 */
	public void validatePlotLocations(Integer submissionId) throws Exception {

		Connection con = null;
		PreparedStatement ps = null;
		try {

			con = getConnection();

			// Insert the submission in the table
			// Preparation of the request
			ps = con.prepareStatement(VALIDATE_PLOT_LOCATION_STMT);
			ps.setInt(1, submissionId);

			logger.trace(VALIDATE_PLOT_LOCATION_STMT);
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

}
