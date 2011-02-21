package fr.ifn.eforest.interpolation.dabatase.raw_data;

import java.io.FileWriter;
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
 * Data Access Object used to extract the raw data needed for interpolation.
 */
public class InterpolationDAO {

	private Logger logger = Logger.getLogger(this.getClass());

	/**
	 * Get a connexion to the database.
	 * 
	 * @return The <code>Connection</code>
	 * @throws NamingException
	 * @throws SQLException
	 */
	public Connection getConnection() throws NamingException, SQLException {

		Context initContext = new InitialContext();
		DataSource ds = (DataSource) initContext.lookup("java:/comp/env/jdbc/rawdata");
		Connection cx = ds.getConnection();

		return cx;
	}

	/**
	 * Aggregate the value per cluster and cell.
	 * 
	 * @param sql
	 *            the SQL query corresponding to the user selection
	 * @param format
	 *            the logical name of the table containing the value
	 * @param data
	 *            the logical name of the column containing the value
	 * @param filename
	 *            the name of the file where is exported the data
	 */
	public void exportRawData(String sql, String format, String data, String filename) throws Exception {

		ResultSet rs = null;
		PreparedStatement ps = null;
		Connection con = null;
		FileWriter writer = null;

		try {

			// Preparation of the request
			String request = "SELECT X(ST_transform(the_geom,3035)) as x, Y(ST_transform(the_geom,3035)) as y, coalesce(sum(" + format + "." + data + "),0) as value ";
			request += sql;
			request += " GROUP BY x, y";

			logger.debug("Export Query : " + request);

			// Execution of the request
			con = getConnection();
			ps = con.prepareStatement(request);
			rs = ps.executeQuery();

			// read the result and export it to a CSV
			writer = new FileWriter(filename);
			writer.append("X;Y;VALUE\n"); // header
			while (rs.next()) {
				writer.append(rs.getString("x"));
				writer.append(";");
				writer.append(rs.getString("y"));
				writer.append(";");
				writer.append(rs.getString("value"));
				writer.append("\n");
			}

		} finally {
			try {
				if (writer != null) {
					writer.close();
				}
			} catch (Exception e) {
				logger.error("Error while closing file writer : " + e.getMessage());
			}
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
}
