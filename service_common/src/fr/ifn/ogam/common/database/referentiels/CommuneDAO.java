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
 * 
 * DAO for methods involving communes georeferencing.
 * 
 * @author gautam
 *
 */
public class CommuneDAO {

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
	 * Populates the table "observation_commune" by getting the communes from a point geometry. If the distance between the point and a commune is less than
	 * 0.00001m, it is considered as the point is inside or on the border of the commune.
	 * 
	 * @param format
	 *            the table_format of the table
	 * @param tableName
	 *            the tablename in raw_data schema
	 * @param parameters
	 *            the following values : ogam_id, provider_id
	 * @throws Exception
	 */
	public void createCommunesLinksFromPoint(String format, String tableName, Map<String, Object> parameters) throws Exception {
		logger.debug("createCommunesLinksFromPoint");

		Connection con = null;
		PreparedStatement ps = null;
		ResultSet rs = null;

		try {

			con = getConnection();

			StringBuffer stmt = new StringBuffer();
			stmt.append("SELECT DISTINCT ref.insee_com ");
			stmt.append("FROM referentiels.geofla_commune AS ref, raw_data." + tableName + " AS m ");
			stmt.append("WHERE st_distance(ref.geom, m.geometrie) < 0.00001 ");
			stmt.append("AND m.ogam_id_" + format + " = '" + parameters.get(DSRConstants.OGAM_ID) + "' ");
			stmt.append("AND m.provider_id = '" + parameters.get(DSRConstants.PROVIDER_ID) + "';");

			ps = con.prepareStatement(stmt.toString());
			logger.trace(stmt.toString());
			rs = ps.executeQuery();

			// Count the number of communes found
			int numberOfCommunes = 0;
			List<String> codesCommunes = new ArrayList<String>();
			while (rs.next()) {
				++numberOfCommunes;
				codesCommunes.add(rs.getString("insee_com"));
			}
			for (String codeCommune : codesCommunes) {
				stmt = new StringBuffer();
				stmt.append("INSERT INTO mapping.observation_commune VALUES ('");
				stmt.append(parameters.get(DSRConstants.OGAM_ID) + "', '" + parameters.get(DSRConstants.PROVIDER_ID) + "', '");
				stmt.append(format + "', '" + codeCommune + "', ");
				stmt.append(1 / numberOfCommunes + ");");
				ps = con.prepareStatement(stmt.toString());
				logger.trace(stmt.toString());
				ps.executeUpdate();
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
				logger.error("Error while closing statement : " + e.getMessage());
			}
		}

	}

	/**
	 * Populates the table "observation_commune" by getting the communes from a linestring or multilinestring geometry. If proportion of the length of the
	 * intersection between the commune and the line and the length of the line is stricty positive, it is considered as the commune covers partly or totally
	 * the line.
	 * 
	 * @param format
	 *            the table_format of the table
	 * @param tableName
	 *            the tablename in raw_data schema
	 * @param parameters
	 *            values including : ogam_id, provider_id
	 * @throws Exception
	 */
	public void createCommunesLinksFromLine(String format, String tableName, Map<String, Object> parameters) throws Exception {
		logger.debug("createCommunesLinksFromLine");

		Connection con = null;
		PreparedStatement ps = null;

		try {

			con = getConnection();

			StringBuffer stmt = new StringBuffer();
			stmt.append("INSERT INTO mapping.observation_commune ");
			stmt.append("SELECT m.ogam_id_" + format + ",  m.provider_id, '" + format + "', ref.insee_com, ");
			stmt.append("round(cast(St_Length(St_Intersection(m.geometrie, ref.geom))/St_Length(m.geometrie) AS numeric(4,3)), 3)");
			stmt.append("FROM referentiels.geofla_commune AS ref, raw_data." + tableName + " AS m ");
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
	 * Populates the table "observation_commune" by getting the communes from a polygon or multipolygon geometry. If the proportion of the area of the
	 * intersection between the commune and the polygon and the area of the polygon is strictly positive, it is considered as the commune covers partly or
	 * totally the polygon.
	 * 
	 * @param format
	 *            the table_format of the table
	 * @param tableName
	 *            the tablename in raw_data schema
	 * @param parameters
	 *            values including : ogam_id, provider_id
	 * @throws Exception
	 */
	public void createCommunesLinksFromPolygon(String format, String tableName, Map<String, Object> parameters) throws Exception {
		logger.debug("createCommunesLinksFromPolygon");

		Connection con = null;
		PreparedStatement ps = null;

		try {

			con = getConnection();

			StringBuffer stmt = new StringBuffer();

			stmt.append("INSERT INTO mapping.observation_commune ");
			stmt.append("SELECT m.ogam_id_" + format + ",  m.provider_id, '" + format + "', ref.insee_com, ");
			stmt.append("round(cast(st_area(st_intersection(m.geometrie, ref.geom))/st_area(m.geometrie) AS numeric(4,3)), 3) AS pct ");
			stmt.append("FROM referentiels.geofla_commune AS ref, raw_data." + tableName + " AS m ");
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
	 * Populates the table "observation_commune" by getting the communes from a list of communes codes. If the code commune exists in the geofla_commune
	 * referentiel, it is added to the table.
	 * 
	 * @param format
	 *            the table_format of the table
	 * @param tableName
	 *            the tablename in raw_data schema
	 * @param parameters
	 *            values including : ogam_id, provider_id, the codescommunes
	 * @throws Exception
	 */
	public void createCommunesLinksFromCommunes(String format, Map<String, Object> parameters) throws Exception {
		logger.debug("createCommunesLinksFromCommunes");

		Connection con = null;
		PreparedStatement ps = null;

		try {

			con = getConnection();

			String[] codesCommunes = ((String[]) parameters.get(DSRConstants.CODE_COMMUNE));
			String providerId = (String) parameters.get(DSRConstants.PROVIDER_ID);
			String ogamId = (String) parameters.get(DSRConstants.OGAM_ID);

			StringBuffer stmt = null;
			for (String codeCommune : codesCommunes) {
				stmt = new StringBuffer();
				stmt.append("INSERT INTO mapping.observation_commune ");
				stmt.append("SELECT '" + ogamId + "', '" + providerId + "', '" + format + "', ref.insee_com, '1' ");
				stmt.append("FROM referentiels.geofla_commune AS ref ");
				stmt.append("WHERE ref.insee_com = '" + codeCommune + "' ");

				ps = con.prepareStatement(stmt.toString());
				logger.trace(stmt.toString());
				ps.executeUpdate();
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
				logger.error("Error while closing statement : " + e.getMessage());
			}
		}
	}

	/**
	 * Deletes from tables "observation_commune" all the associations linked to the format.
	 * 
	 * @param format
	 *            the table format
	 * @throws Exception
	 */
	public void deleteCommunesFromFormat(String format) throws Exception {
		logger.debug("deleteCommunesFromFormat");

		Connection con = null;
		PreparedStatement ps = null;

		try {

			con = getConnection();

			StringBuffer stmt = new StringBuffer();
			stmt.append("DELETE FROM mapping.observation_commune ");
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

	/**
	 * 
	 * Populates the field "codeCommuneCalcule", depending on the value of natureObjetGeo and getting the information from table "observation_commune".
	 * 
	 * @param format
	 *            the table format
	 * @param tableName
	 *            the tablename in raw_data schema
	 * @param parameters
	 *            values including : ogam_id, provider_id, natureobjetgeo
	 * @throws Exception
	 */
	public void setCodeCommuneCalcule(String format, String tableName, Map<String, Object> parameters) throws Exception {
		logger.debug("setCodeCommuneCalcule");

		Connection con = null;
		PreparedStatement ps = null;
		ResultSet rs = null;

		try {

			con = getConnection();

			StringBuffer stmt = null;

			String providerId = (String) parameters.get(DSRConstants.PROVIDER_ID);
			String ogamId = (String) parameters.get(DSRConstants.OGAM_ID);
			String natureObjetGeo = (String) parameters.get(DSRConstants.NATURE_OBJET_GEO);

			// Get the list of the mailles
			stmt = new StringBuffer();
			stmt.append("SELECT id_commune ");
			stmt.append("FROM mapping.observation_commune ");
			stmt.append("WHERE id_observation = '" + ogamId + "' ");
			stmt.append("AND id_provider = '" + providerId + "' ");
			stmt.append("AND table_format = '" + format + "' ");

			if ("In".equals(natureObjetGeo)) {
				stmt.append("ORDER BY percentage DESC LIMIT 1");
			} else if ("St".equals(natureObjetGeo)) {
				stmt.append("ORDER BY percentage DESC");
			}

			ps = con.prepareStatement(stmt.toString());
			logger.trace(stmt.toString());
			rs = ps.executeQuery();

			// Create a list of code communes found
			List<String> codesCommunes = new ArrayList<String>();
			while (rs.next()) {
				codesCommunes.add(rs.getString("id_commune"));
			}

			StringBuffer codeCommuneCalcule = new StringBuffer("{");

			for (String codeCommune : codesCommunes) {
				codeCommuneCalcule.append(codeCommune);
				codeCommuneCalcule.append(",");
			}

			if (!codesCommunes.isEmpty()) {
				codeCommuneCalcule.delete(codeCommuneCalcule.length() - 1, codeCommuneCalcule.length());
				codeCommuneCalcule.append("}");
			} else {
				codeCommuneCalcule.append("\"\"}");
			}

			stmt = new StringBuffer();
			stmt.append("UPDATE raw_data." + tableName + " ");
			stmt.append("SET " + DSRConstants.CODE_COMMUNE_CALC + " = '" + codeCommuneCalcule.toString() + "' ");
			stmt.append("WHERE provider_id = '" + providerId + "' ");
			stmt.append("AND ogam_id_" + format + " = '" + ogamId + "' ");

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
	 * 
	 * Populates the field "nomCommuneCalcule", depending on the value of natureObjetGeo and getting the information from table "observation_commune".
	 * 
	 * @param format
	 *            the table format
	 * @param tableName
	 *            the tablename in raw_data schema
	 * @param parameters
	 *            values including : ogam_id, provider_id, natureobjetgeo
	 * @throws Exception
	 */
	public void setNomCommuneCalcule(String format, String tableName, Map<String, Object> parameters) throws Exception {
		logger.debug("setNomCommuneCalcule");

		Connection con = null;
		PreparedStatement ps = null;
		ResultSet rs = null;

		try {

			con = getConnection();

			StringBuffer stmt = null;

			String providerId = (String) parameters.get(DSRConstants.PROVIDER_ID);
			String ogamId = (String) parameters.get(DSRConstants.OGAM_ID);
			String natureObjetGeo = (String) parameters.get(DSRConstants.NATURE_OBJET_GEO);

			// Get the list of the mailles
			stmt = new StringBuffer();
			stmt.append("SELECT id_commune ");
			stmt.append("FROM mapping.observation_commune ");
			stmt.append("WHERE id_observation = '" + ogamId + "' ");
			stmt.append("AND id_provider = '" + providerId + "' ");
			stmt.append("AND table_format = '" + format + "' ");

			if ("In".equals(natureObjetGeo)) {
				stmt.append("ORDER BY percentage DESC LIMIT 1");
			} else if ("St".equals(natureObjetGeo)) {
				stmt.append("ORDER BY percentage DESC");
			}

			ps = con.prepareStatement(stmt.toString());
			logger.trace(stmt.toString());
			rs = ps.executeQuery();

			// Create a list of code communes found
			List<String> codesCommunes = new ArrayList<String>();
			while (rs.next()) {
				codesCommunes.add(rs.getString("id_commune"));
			}

			// For each code commune, find the name of the commune
			StringBuffer nomCommuneCalcule = new StringBuffer("{");

			for (String codeCommune : codesCommunes) {
				stmt = new StringBuffer();
				stmt.append("SELECT nom_com ");
				stmt.append("FROM referentiels.geofla_commune ");
				stmt.append("WHERE insee_com = '" + codeCommune + "' ");

				ps = con.prepareStatement(stmt.toString());
				logger.trace(stmt.toString());
				rs = ps.executeQuery();
				rs.next();
				nomCommuneCalcule.append(rs.getString("nom_com"));
				nomCommuneCalcule.append(",");
			}

			if (!codesCommunes.isEmpty()) {
				nomCommuneCalcule.delete(nomCommuneCalcule.length() - 1, nomCommuneCalcule.length());
				nomCommuneCalcule.append("}");
			} else {
				nomCommuneCalcule.append("\"\"}");
			}

			stmt = new StringBuffer();
			stmt.append("UPDATE raw_data." + tableName + " ");
			stmt.append("SET " + DSRConstants.NOM_COMMUNE_CALC + " = '" + nomCommuneCalcule.toString() + "' ");
			stmt.append("WHERE provider_id = '" + providerId + "' ");
			stmt.append("AND ogam_id_" + format + " = '" + ogamId + "' ");

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

}
