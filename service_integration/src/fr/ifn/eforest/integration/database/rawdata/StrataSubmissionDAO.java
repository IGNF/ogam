package fr.ifn.eforest.integration.database.rawdata;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;

import javax.naming.Context;
import javax.naming.InitialContext;
import javax.naming.NamingException;
import javax.sql.DataSource;

import org.apache.log4j.Logger;

/**
 * Data Access Object used to manage strata submissions.
 */
public class StrataSubmissionDAO {

	private Logger logger = Logger.getLogger(this.getClass());

	/**
	 * Insert a strata submission.
	 */
	private static final String CREATE_STRATA_SUBMISSION_STMT = "INSERT INTO strata_submission (submission_id) values (?)";

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
	 * Create a new strata submission.
	 * 
	 * @param submissionId
	 *            the identifier of the submission
	 */
	public void newStrataSubmission(Integer submissionId) throws Exception {

		Connection con = null;
		PreparedStatement ps = null;
		try {

			con = getConnection();

			// Insert the submission in the table
			// Preparation of the request
			ps = con.prepareStatement(CREATE_STRATA_SUBMISSION_STMT);
			ps.setInt(1, submissionId);

			logger.trace(CREATE_STRATA_SUBMISSION_STMT);
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
