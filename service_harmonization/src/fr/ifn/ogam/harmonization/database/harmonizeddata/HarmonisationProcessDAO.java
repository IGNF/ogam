/**
 * Licensed under EUPL v1.1 (see http://ec.europa.eu/idabc/eupl).
 * 
 * © European Union, 2008-2012
 *
 * Reuse is authorised, provided the source is acknowledged. The reuse policy of the European Commission is implemented by a Decision of 12 December 2011.
 *
 * The general principle of reuse can be subject to conditions which may be specified in individual copyright notices. 
 * Therefore users are advised to refer to the copyright notices of the individual websites maintained under Europa and of the individual documents. 
 * Reuse is not applicable to documents subject to intellectual property rights of third parties.
 */
package fr.ifn.ogam.harmonization.database.harmonizeddata;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Iterator;
import java.util.List;

import javax.naming.Context;
import javax.naming.InitialContext;
import javax.naming.NamingException;
import javax.sql.DataSource;

import org.apache.log4j.Logger;

import fr.ifn.ogam.common.database.rawdata.SubmissionData;

/**
 * Data Access Object used to access the harmonization log.
 */
public class HarmonisationProcessDAO {

	private Logger logger = Logger.getLogger(this.getClass());

	/**
	 * Get the next harmonization process id.
	 */
	private static final String GET_NEXT_HARMONIZATION_PROCESS_ID_STMT = "SELECT nextval('harmonization_process_harmonization_process_id_seq') as harmonization_process_id";

	/**
	 * Create a new harmonization process.
	 */
	private static final String CREATE_HARMONIZATION_PROCESS_STMT = "INSERT INTO harmonization_process (harmonization_process_id, dataset_id, provider_id, harmonization_status) VALUES (?, ?, ?, ?)";

	/**
	 * Update the process status.
	 */
	private static final String UPDATE_HARMONIZATION_PROCESS_STATUS_STMT = "UPDATE harmonization_process SET harmonization_status = ? WHERE harmonization_process_id = ?";

	/**
	 * Update the process submission.
	 */
	private static final String UPDATE_HARMONIZATION_PROCESS_SUBMISSION_STMT = "INSERT INTO harmonization_process_submissions (harmonization_process_id, raw_data_submission_id) VALUES (?, ?)";

	/**
	 * Delete the process log.
	 */
	private static final String DELETE_HARMONIZATION_PROCESS_SUBMISSION_STMT = "DELETE FROM harmonization_process_submissions WHERE harmonization_process_id = ?";
	private static final String DELETE_HARMONIZATION_PROCESS_STMT = "DELETE FROM harmonization_process WHERE harmonization_process_id = ?";

	/**
	 * Get the status of the last harmonization process.
	 */
	private static final String GET_HARMONIZATION_PROCESS_STATUS_STMT = "SELECT harmonization_status FROM harmonization_process WHERE dataset_id = ? AND provider_id = ? ORDER BY harmonization_process_id DESC LIMIT 1";

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
	 * Get the status of the last harmonization process for this dataset and provider.
	 * 
	 * @param datasetId
	 *            the identifier of the dataset
	 * @param providerId
	 *            the code of the country
	 * @return the status of the last harmonization process
	 */
	public String getHarmonizationProcessStatus(String datasetId, String providerId) throws Exception {

		Connection con = null;
		PreparedStatement ps = null;
		ResultSet rs = null;
		try {

			con = getConnection();

			// Get the submission ID from the sequence
			ps = con.prepareStatement(GET_HARMONIZATION_PROCESS_STATUS_STMT);
			ps.setString(1, datasetId);
			ps.setString(2, providerId);
			logger.trace(GET_HARMONIZATION_PROCESS_STATUS_STMT);
			rs = ps.executeQuery();

			if (rs.next()) {
				return rs.getString("harmonization_status");
			} else {
				throw new Exception("No harmonization process log found for this country and request id");
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
	}

	/**
	 * Create a new harmonization process.
	 * 
	 * @param datasetId
	 *            the dataset identifier
	 * @param providerId
	 *            the country code
	 * @param harmonizationStatus
	 *            the status of the process
	 * @return the harmonisation process id
	 */
	public Integer newHarmonizationProcess(String datasetId, String providerId, String harmonizationStatus) throws Exception {

		Connection con = null;
		PreparedStatement ps = null;
		ResultSet rs = null;
		Integer processId = null;
		try {

			con = getConnection();

			// Get the submission ID from the sequence
			ps = con.prepareStatement(GET_NEXT_HARMONIZATION_PROCESS_ID_STMT);
			logger.trace(GET_NEXT_HARMONIZATION_PROCESS_ID_STMT);
			rs = ps.executeQuery();

			rs.next();
			processId = rs.getInt("harmonization_process_id");

			// close the previous statement
			if (ps != null) {
				ps.close();
			}

			// Get the submission ID from the sequence
			ps = con.prepareStatement(CREATE_HARMONIZATION_PROCESS_STMT);
			logger.trace(CREATE_HARMONIZATION_PROCESS_STMT);
			ps.setInt(1, processId);
			ps.setString(2, datasetId);
			ps.setString(3, providerId);
			ps.setString(4, harmonizationStatus);
			ps.execute();

			return processId;

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
	 * Update the harmonization process status.
	 * 
	 * @param processId
	 *            the identifier of the harmonization process
	 * @param status
	 *            the new status of the process
	 */
	public void updateHarmonizationProcessStatus(Integer processId, String status) throws Exception {

		Connection con = null;
		PreparedStatement ps = null;
		try {

			con = getConnection();

			// Get the submission ID from the sequence
			ps = con.prepareStatement(UPDATE_HARMONIZATION_PROCESS_STATUS_STMT);
			logger.trace(UPDATE_HARMONIZATION_PROCESS_STATUS_STMT);
			ps.setString(1, status);
			ps.setInt(2, processId);
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
	 * Update the list of raw data submissions used for this harmonized data.
	 * 
	 * @param processId
	 *            the identifier of the harmonization process
	 * @param listSubmissionID
	 *            the identifiers of raw data submissions
	 */
	public void updateHarmonizationProcessSubmissions(Integer processId, List<SubmissionData> listSubmissions) throws Exception {

		Connection con = null;
		PreparedStatement ps = null;
		try {

			con = getConnection();

			Iterator<SubmissionData> submissionsIter = listSubmissions.iterator();

			while (submissionsIter.hasNext()) {

				SubmissionData submission = submissionsIter.next();

				// Get the submission ID from the sequence
				ps = con.prepareStatement(UPDATE_HARMONIZATION_PROCESS_SUBMISSION_STMT);
				logger.trace(UPDATE_HARMONIZATION_PROCESS_SUBMISSION_STMT);
				ps.setInt(1, processId);
				ps.setInt(2, submission.getSubmissionId());
				ps.execute();

				ps.close();
			}

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
	 * Remove a log of harmonization.
	 * 
	 * @param processId
	 *            the process identifier
	 */
	public void deleteHarmonizationProcess(Integer processId) throws Exception {

		Connection con = null;
		PreparedStatement ps = null;
		try {

			con = getConnection();

			// Remove the submissions attached to the process
			ps = con.prepareStatement(DELETE_HARMONIZATION_PROCESS_SUBMISSION_STMT);

			// Set the values
			ps.setInt(1, processId);

			// Execute the query
			ps.execute();
			ps.close();

			// Remove the process
			ps = con.prepareStatement(DELETE_HARMONIZATION_PROCESS_STMT);

			// Set the values
			ps.setInt(1, processId);

			// Execute the query
			ps.execute();

		} catch (Exception e) {
			// Low level log
			logger.error("Error while deleting process log", e);
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
