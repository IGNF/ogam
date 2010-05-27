package fr.ifn.eforest.integration.database.rawdata;

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
 * Data Access Object used to manage data submissions.
 */
public class DataSubmissionDAO {

	private Logger logger = Logger.getLogger(this.getClass());

	/**
	 * Insert a data submission.
	 */
	private static final String CREATE_DATA_SUBMISSION_STMT = "INSERT INTO data_submission (submission_id, request_id, user_login, comment) values (?, ?, ?, ?)";

	/**
	 * Get the country code of the data submission.
	 */
	private static final String GET_SUBMISSION_STMT = "SELECT request_id, country_code, comment, user_login " + //
			" FROM data_submission " + //
			" LEFT JOIN submission using (submission_id) " + //
			" WHERE data_submission.submission_id = ?";

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
	 * Create a new location submission.
	 * 
	 * @param submissionId
	 *            the submission identifier
	 * @param datasetId
	 *            the dataset identifier
	 * @param userLogin
	 *            the login of the user creating the submission
	 * @param comment
	 *            a comment
	 */
	public void newDataSubmission(Integer submissionId, String datasetId, String userLogin, String comment) throws Exception {

		Connection con = null;
		PreparedStatement ps = null;
		try {

			con = getConnection();

			// Insert the submission in the table
			// Preparation of the request
			ps = con.prepareStatement(CREATE_DATA_SUBMISSION_STMT);
			ps.setInt(1, submissionId);
			ps.setString(2, datasetId);
			ps.setString(3, userLogin);
			ps.setString(4, comment);

			logger.trace(CREATE_DATA_SUBMISSION_STMT);
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
				logger.error("Error while closing connexion : " + e.getMessage());
			}
		}
	}

	/**
	 * Some information about the data submission.
	 * 
	 * @param submissionId
	 *            the identifier of the submission
	 * @return the data submission
	 */
	public DataSubmissionData getSubmission(Integer submissionId) throws Exception {
		DataSubmissionData result = null;
		Connection con = null;
		PreparedStatement ps = null;
		ResultSet rs = null;

		try {

			con = getConnection();

			ps = con.prepareStatement(GET_SUBMISSION_STMT);
			ps.setInt(1, submissionId);
			logger.trace(GET_SUBMISSION_STMT);
			rs = ps.executeQuery();

			if (rs.next()) {
				result = new DataSubmissionData();
				result.setCountryCode(rs.getString("country_code"));
				result.setRequestId(rs.getString("request_id"));
				result.setUserLogin(rs.getString("user_login"));
				result.setComment(rs.getString("comment"));
			}

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

		return result;
	}

}
