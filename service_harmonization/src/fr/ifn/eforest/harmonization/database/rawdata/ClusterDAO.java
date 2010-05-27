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
 * Data Access Object used to manage clusters.
 */
public class ClusterDAO {

	private Logger logger = Logger.getLogger(this.getClass());

	/**
	 * Clean the old clusters.
	 */
	private static final String CLEAN_CLUSTERS_STMT = "DELETE FROM cluster WHERE request_id = ? AND country_code = ?";
	private static final String CLEAN_STRATUM_CLUSTERS_STMT = "DELETE FROM stratum_cluster WHERE request_id = ? AND country_code = ?";
	private static final String CLEAN_STANDARDIZED_CLUSTERS_STMT = "DELETE FROM standardized_cluster WHERE request_id = ? AND country_code = ?";

	/**
	 * Insert the new clusters.
	 */
	private static final String INSERT_CLUSTERS_STMT = "INSERT INTO cluster (request_id, country_code, stratum_code, cluster_code, statistical_weight, no_plot_in_cluster) " + //
			" SELECT ds.request_id, d.country_code, d.stratum_code, cluster_code, statistical_weight, count(*) AS nb_plot_in_cluster " + //
			" FROM plot_data d " + //
			" INNER JOIN location l ON (l.country_code = d.country_code AND l.plot_code = d.plot_code) " + //
			" LEFT JOIN data_submission ds ON (d.submission_id = ds.submission_id) " + //
			" WHERE d.submission_id IN (SELECT submission_id" + //
			" FROM data_submission " + //
			" LEFT JOIN submission using (submission_id) " + //
			" WHERE request_id = ? " + //
			" AND country_code = ? " + //
			" AND step <> 'CANCELLED' ) " + // 
			" GROUP by ds.request_id, d.country_code, stratum_code, cluster_code, statistical_weight";

	/**
	 * Calculate the total stratum area.
	 */
	private static final String CALCULATE_TOTAL_STRATUM_AREA_STMT = "INSERT INTO stratum_cluster (request_id, country_code, stratum_code, total_stratum_area, avg_weight, nb_clusters) " + //
			" SELECT c.request_id, c.country_code, c.stratum_code, total_stratum_area, sum(statistical_weight) / count(*) AS avg_weight, count(*) AS nb_clusters " + // 
			" FROM cluster c " + //
			" INNER JOIN strata s ON s.country_code = c.country_code AND s.stratum_code = c.stratum_code " + //
			" WHERE c.request_id = ? " + //
			" AND   c.country_code = ? " + //
			" GROUP by c.request_id, c.country_code, c.stratum_code, total_stratum_area";

	/**
	 * Update the cluster standardised weights.
	 */
	private static final String UPDATE_CLUSTER_STANDARDISED_WEIGHT_STMT = "INSERT INTO standardized_cluster (request_id, country_code, stratum_code, cluster_code, no_plot_in_cluster, standardised_weight) "
			+ //
			" SELECT c.request_id, c.country_code, c.stratum_code, c.cluster_code, c.no_plot_in_cluster, (statistical_weight / avg_weight) * (total_stratum_area / nb_clusters) as standardised_weight "
			+ //
			" FROM cluster c " + //
			" INNER JOIN stratum_cluster s ON c.country_code = s.country_code AND c.stratum_code = s.stratum_code " + //
			" WHERE c.request_id = ? " + //
			" AND   c.country_code = ? ";

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
	 * Create the cluster table from the plot locations.
	 * 
	 * @param datasetId
	 *            the identifier of the dataset
	 * @param countryCode
	 *            the country code
	 */
	public void recalculateClusterWeights(String datasetId, String countryCode) throws Exception {

		Connection con = null;
		PreparedStatement ps = null;
		try {

			con = getConnection();

			// Clean the previous values
			logger.debug("Clean the previous cluster values");
			ps = con.prepareStatement(CLEAN_CLUSTERS_STMT);
			ps.setString(1, datasetId);
			ps.setString(2, countryCode);
			ps.execute();

			ps.close();

			logger.debug("Clean the previous strata values");
			ps = con.prepareStatement(CLEAN_STRATUM_CLUSTERS_STMT);
			ps.setString(1, datasetId);
			ps.setString(2, countryCode);
			ps.execute();

			ps.close();

			logger.debug("Clean the previous cluster values");
			ps = con.prepareStatement(CLEAN_STANDARDIZED_CLUSTERS_STMT);
			ps.setString(1, datasetId);
			ps.setString(2, countryCode);
			ps.execute();

			ps.close();

			// Copy the clusters for the country
			logger.debug("Copy the clusters for the country");
			ps = con.prepareStatement(INSERT_CLUSTERS_STMT);
			ps.setString(1, datasetId);
			ps.setString(2, countryCode);
			ps.execute();

			ps.close();

			// Calculate the total strata area 
			logger.debug("Calculate the total strata area");
			ps = con.prepareStatement(CALCULATE_TOTAL_STRATUM_AREA_STMT);
			ps.setString(1, datasetId);
			ps.setString(2, countryCode);
			ps.execute();

			ps.close();

			// Calculate the standardised cluster weight
			logger.debug("Calculate the standardised cluster weight");
			ps = con.prepareStatement(UPDATE_CLUSTER_STANDARDISED_WEIGHT_STMT);
			ps.setString(1, datasetId);
			ps.setString(2, countryCode);
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
