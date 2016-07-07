/**
 * 
 */
package fr.ifn.ogam.common.database.referentiels;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import javax.naming.Context;
import javax.naming.InitialContext;
import javax.naming.NamingException;
import javax.sql.DataSource;

import org.apache.log4j.Logger;

import fr.ifn.ogam.common.util.DSRConstants;

/**
 * @author gautam
 *
 */
public class MailleDAO {

	/***
	 * The logger used to log the errors or several information.**
	 * 
	 * @see org.apache.log4j.Logger
	 */
	private final transient Logger logger = Logger.getLogger(this.getClass());

	/**
	 * Get a connection to the database.
	 * 
	 * @return The <code>Connection</code>
	 * @throws NamingException
	 * @throws SQLException
	 */
	public Connection getConnection() throws NamingException, SQLException {

		Context initContext = new InitialContext();
		DataSource ds = (DataSource) initContext.lookup("java:/comp/env/jdbc/metadata");
		Connection cx = ds.getConnection();

		return cx;
	}

	/**
	 * Populates the table "observation_maille" by getting the mailles from a point geometry. If the distance between the point and a maille is less than
	 * 0.00001m, it is considered as the point is inside or on the border of the maille.
	 * 
	 * @param format
	 *            the table_format of the table
	 * @param tableName
	 *            the tablename in raw_data schema
	 * @param parameters
	 *            the following values : ogam_id, provider_id
	 * @throws Exception
	 */
	public void createMaillesLinksFromPoint(String format, String tableName, Map<String, Object> parameters) throws Exception {
		logger.debug("createMaillesLinksFromPoint");

		Connection con = null;
		PreparedStatement ps = null;
		ResultSet rs = null;

		try {

			con = getConnection();

			StringBuffer stmt = new StringBuffer();
			stmt.append("SELECT DISTINCT ref.code_10km ");
			stmt.append("FROM referentiels.grille_10km AS ref, raw_data." + tableName + " AS m ");
			stmt.append("WHERE st_distance(ref.geom, m.geometrie) < 0.00001 ");
			stmt.append("AND m.ogam_id_" + format + " = '" + parameters.get(DSRConstants.OGAM_ID) + "'");
			stmt.append("AND m.provider_id = '" + parameters.get(DSRConstants.PROVIDER_ID) + "'");

			ps = con.prepareStatement(stmt.toString());
			logger.trace(stmt.toString());
			rs = ps.executeQuery();

			// Count the number of departements found
			int numberOfMailles = 0;
			List<String> codesMailles = new ArrayList<String>();
			while (rs.next()) {
				++numberOfMailles;
				codesMailles.add(rs.getString("code_10km"));
			}
			for (String codeMaille : codesMailles) {
				stmt = new StringBuffer();
				stmt.append("INSERT INTO mapping.observation_maille VALUES ('");
				stmt.append(parameters.get(DSRConstants.OGAM_ID) + "', '" + parameters.get(DSRConstants.PROVIDER_ID) + "', '");
				stmt.append(format + "', '" + codeMaille + "', ");
				stmt.append(1 / numberOfMailles + ");");
				ps = con.prepareStatement(stmt.toString());
				logger.trace(stmt.toString());
				ps.executeUpdate();
			}

		} finally

		{
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
	 * Populates the table "observation_maille" by getting the mailles from a linestring or multilinestring geometry. If proportion of the length of the
	 * intersection between the maille and the line and the length of the line is stricty positive, it is considered as the maille covers partly or totally the
	 * line.
	 * 
	 * @param format
	 *            the table_format of the table
	 * @param tableName
	 *            the tablename in raw_data schema
	 * @param parameters
	 *            values including : ogam_id, provider_id
	 * @throws Exception
	 */
	public void createMaillesLinksFromLine(String format, String tableName, Map<String, Object> parameters) throws Exception {
		logger.debug("createMaillesLinksFromLine");

		Connection con = null;
		PreparedStatement ps = null;

		try {

			con = getConnection();

			StringBuffer stmt = new StringBuffer();
			stmt.append("INSERT INTO mapping.observation_maille ");
			stmt.append("SELECT m.ogam_id_" + format + ",  m.provider_id, '" + format + "', ref.code_10km, ");
			stmt.append("round(cast(St_Length(St_Intersection(m.geometrie, ref.geom))/St_Length(m.geometrie) AS numeric(4,3)), 3)");
			stmt.append("FROM referentiels.grille_10km AS ref, raw_data." + tableName + " AS m ");
			stmt.append("WHERE st_intersects(m.geometrie, ref.geom) = true ");
			stmt.append("AND St_Length(m.geometrie) > 0 ");
			stmt.append("AND m.ogam_id_" + format + " = '" + parameters.get(DSRConstants.OGAM_ID) + "' ");
			stmt.append("AND m.provider_id = '" + parameters.get(DSRConstants.PROVIDER_ID) + "'");

			ps = con.prepareStatement(stmt.toString());
			logger.trace(stmt.toString());
			ps.executeUpdate();

		} finally

		{
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
	 * Populates the table "observation_maille" by getting the mailles from a polygon or multipolygon geometry. If the proportion of the area of the
	 * intersection between the maille and the polygon and the area of the polygon is strictly positive, it is considered as the maille covers partly or totally
	 * the polygon.
	 * 
	 * @param format
	 *            the table_format of the table
	 * @param tableName
	 *            the tablename in raw_data schema
	 * @param parameters
	 *            values including : ogam_id, provider_id
	 * @throws Exception
	 */
	public void createMaillesLinksFromPolygon(String format, String tableName, Map<String, Object> parameters) throws Exception {
		logger.debug("createMaillesLinksFromPolygon");

		Connection con = null;
		PreparedStatement ps = null;

		try {

			con = getConnection();

			StringBuffer stmt = new StringBuffer();

			stmt.append("INSERT INTO mapping.observation_maille ");
			stmt.append("SELECT m.ogam_id_" + format + ",  m.provider_id, '" + format + "', ref.code_10km, ");
			stmt.append("round(cast(st_area(st_intersection(m.geometrie, ref.geom))/st_area(m.geometrie) AS numeric(4,3)), 3) AS pct ");
			stmt.append("FROM referentiels.grille_10km AS ref, raw_data." + tableName + " AS m ");
			stmt.append("WHERE st_intersects(m.geometrie, ref.geom) = true ");
			stmt.append("AND st_area(m.geometrie) > 0 ");
			stmt.append("AND m.ogam_id_" + format + " = '" + parameters.get(DSRConstants.OGAM_ID) + "' ");
			stmt.append("AND m.provider_id = '" + parameters.get(DSRConstants.PROVIDER_ID) + "'");
			ps = con.prepareStatement(stmt.toString());
			logger.trace(stmt.toString());
			ps.executeUpdate();

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
	 * Populates the table "observation_maille" by getting the mailles from a list of communes codes. The calculation is based on the union of the geometries of
	 * the list of communes given (value X). If the proportion of the area of the intersection between the maille and X and the area of X is strictly positive,
	 * it is considered as the maille covers partly or totally X.
	 * 
	 * @param format
	 *            the table_format of the table
	 * @param tableName
	 *            the tablename in raw_data schema
	 * @param parameters
	 *            values including : ogam_id, provider_id, codecommune
	 * @throws Exception
	 */
	public void createMaillesLinksFromCommunes(String format, Map<String, Object> parameters) throws Exception {
		logger.debug("createMaillesLinksFromCommunes");

		Connection con = null;
		PreparedStatement ps = null;
		ResultSet rs = null;

		try {

			con = getConnection();

			String[] codesCommunes = ((String[]) parameters.get(DSRConstants.CODE_COMMUNE));
			String providerId = (String) parameters.get(DSRConstants.PROVIDER_ID);
			String ogamId = (String) parameters.get(DSRConstants.OGAM_ID);

			StringBuffer stmt = null;

			// Récupérer l'union des géométries
			stmt = new StringBuffer();
			stmt.append("SELECT St_AsText(St_union(commune.geom)) as union ");
			stmt.append("FROM referentiels.geofla_commune as commune ");
			stmt.append("WHERE commune.insee_com = '" + codesCommunes[0] + "' ");
			for (int i = 1; i < codesCommunes.length; ++i) {
				stmt.append("OR commune.insee_com = '" + codesCommunes[i] + "' ");
			}

			ps = con.prepareStatement(stmt.toString());
			logger.trace(stmt.toString());
			rs = ps.executeQuery();
			rs.next();
			String communesUnion = "ST_GeomFromText('" + rs.getString("union") + "', 4326)";

			stmt = new StringBuffer();
			stmt.append("INSERT INTO mapping.observation_maille ");
			stmt.append("SELECT '" + ogamId + "', '" + providerId + "', '" + format + "', grille.code_10km, ");
			stmt.append("round(cast(st_area(st_intersection(" + communesUnion + ", grille.geom))/st_area(" + communesUnion + ") ");
			stmt.append("AS numeric(4,3)), 3) AS pct ");
			stmt.append("FROM referentiels.grille_10km AS grille ");
			stmt.append("WHERE st_intersects(" + communesUnion + ", grille.geom) = true ");

			ps = con.prepareStatement(stmt.toString());
			ps.executeUpdate();

		} finally

		{
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
	 * Populates the table "observation_maille" by getting the mailles from a list of mailles codes. If the code 10km exists in the "grille_10km" referentiel,
	 * it is added to the table.
	 * 
	 * @param format
	 *            the table_format of the table
	 * @param tableName
	 *            the tablename in raw_data schema
	 * @param parameters
	 *            values including : ogam_id, provider_id, codemaille
	 * @throws Exception
	 */
	public void createMaillesLinksFromMailles(String format, Map<String, Object> parameters) throws Exception {
		logger.debug("createMaillesLinksFromMailles");

		Connection con = null;
		PreparedStatement ps = null;

		try {

			con = getConnection();

			String[] codeMailles = ((String[]) parameters.get(DSRConstants.CODE_MAILLE));
			String providerId = (String) parameters.get(DSRConstants.PROVIDER_ID);
			String ogamId = (String) parameters.get(DSRConstants.OGAM_ID);

			StringBuffer stmt = null;
			for (String codeMaille : codeMailles) {
				stmt = new StringBuffer();
				stmt.append("INSERT INTO mapping.observation_maille ");
				stmt.append("SELECT '" + ogamId + "', '" + providerId + "', '" + format + "', ref.code_10km, '1' ");
				stmt.append("FROM referentiels.grille_10km AS ref ");
				stmt.append("WHERE ref.code_10km = '" + codeMaille + "' ");

				ps = con.prepareStatement(stmt.toString());
				logger.trace(stmt.toString());
				ps.executeUpdate();
			}
		} finally

		{
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
	 * Populates the table "observation_maille" by getting the mailles from a list of departements codes. The calculation is based on the union of the
	 * geometries of the list of departements given (value X). If the proportion of the area of the intersection between the maille and X and the area of X is
	 * strictly positive, it is considered as the maille covers partly or totally X.
	 * 
	 * @param format
	 *            the table_format of the table
	 * @param tableName
	 *            the tablename in raw_data schema
	 * @param parameters
	 *            values including : ogam_id, provider_id, codedepartement
	 * @throws Exception
	 */
	public void createMaillesLinksFromDepartements(String format, Map<String, Object> parameters) throws Exception {
		logger.debug("createMaillesLinksFromDepartements");

		Connection con = null;
		PreparedStatement ps = null;
		ResultSet rs = null;

		try {

			con = getConnection();

			String[] codesDepartements = ((String[]) parameters.get(DSRConstants.CODE_DEPARTEMENT));
			String providerId = (String) parameters.get(DSRConstants.PROVIDER_ID);
			String ogamId = (String) parameters.get(DSRConstants.OGAM_ID);

			StringBuffer stmt = null;

			// Récupérer l'union des géométries
			stmt = new StringBuffer();
			stmt.append("SELECT St_AsText(St_union(departement.geom)) as union ");
			stmt.append("FROM referentiels.geofla_departement as departement ");
			stmt.append("WHERE departement.code_dept = '" + codesDepartements[0] + "' ");
			for (int i = 1; i < codesDepartements.length; ++i) {
				stmt.append("OR departement.code_dept  = '" + codesDepartements[i] + "' ");
			}

			ps = con.prepareStatement(stmt.toString());
			logger.trace(stmt.toString());
			rs = ps.executeQuery();
			rs.next();
			String departementsUnion = "ST_GeomFromText('" + rs.getString("union") + "', 4326)";

			stmt = new StringBuffer();
			stmt.append("INSERT INTO mapping.observation_maille ");
			stmt.append("SELECT '" + ogamId + "', '" + providerId + "', '" + format + "', grille.code_10km, ");
			stmt.append("round(cast(st_area(st_intersection(" + departementsUnion + ", grille.geom))/st_area(" + departementsUnion + ") ");
			stmt.append("AS numeric(4,3)), 3) AS pct ");
			stmt.append("FROM referentiels.grille_10km AS grille ");
			stmt.append("WHERE st_intersects(" + departementsUnion + ", grille.geom) = true ");

			ps = con.prepareStatement(stmt.toString());
			ps.executeUpdate();

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
	 * Deletes from tables "observation_maille" all the associations linked to the format.
	 * 
	 * @param format
	 *            the table format
	 * @throws Exception
	 */
	public void deleteMaillesFromFormat(String format) throws Exception {
		logger.debug("deleteMaillesFromFormat");

		Connection con = null;
		PreparedStatement ps = null;

		try {

			con = getConnection();

			StringBuffer stmt = new StringBuffer();
			stmt.append("DELETE FROM mapping.observation_maille ");
			stmt.append("USING metadata.table_format as tf ");
			stmt.append("WHERE tf.format = format");

			ps = con.prepareStatement(stmt.toString());
			logger.debug(stmt.toString());
			ps.executeUpdate();

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
