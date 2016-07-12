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
public class DepartementDAO {

	/***
	 * The logger used to log the errors or several information.**
	 * 
	 * @see org.apache.log4j.Logger
	 */
	private final transient Logger logger = Logger.getLogger(this.getClass());

	/**
	 * Get a connexion to the database.
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
	 * Populates the table "observation_departement" by getting the departements from a point geometry. If the distance between the point and a departement is
	 * less than 0.00001m, it is considered as the point is inside or on the border of the departement.
	 * 
	 * @param format
	 *            the table_format of the table
	 * @param tableName
	 *            the tablename in raw_data schema
	 * @param parameters
	 *            the following values : ogam_id, provider_id
	 * @throws Exception
	 */
	public void createDepartmentsLinksFromPoint(String format, String tableName, Map<String, Object> parameters) throws Exception {
		logger.debug("createDepartmentsLinksFromPoint");

		Connection con = null;
		PreparedStatement ps = null;
		ResultSet rs = null;

		try {

			con = getConnection();

			StringBuffer stmt = new StringBuffer();
			stmt.append("SELECT DISTINCT ref.code_dept ");
			stmt.append("FROM referentiels.geofla_departement as ref, raw_data." + tableName + " AS m ");
			stmt.append("WHERE st_distance(ref.geom, m.geometrie) < 0.00001 ");
			stmt.append("AND m.ogam_id_" + format + " = '" + parameters.get(DSRConstants.OGAM_ID) + "'");
			stmt.append("AND m.provider_id = '" + parameters.get(DSRConstants.PROVIDER_ID) + "'");

			ps = con.prepareStatement(stmt.toString());
			logger.trace(stmt.toString());
			rs = ps.executeQuery();

			// Count the number of departements found
			int numberOfDepartements = 0;
			List<String> codesDepartements = new ArrayList<String>();
			while (rs.next()) {
				++numberOfDepartements;
				codesDepartements.add(rs.getString("code_dept"));
			}
			for (String codeDepartement : codesDepartements) {
				stmt = new StringBuffer();
				stmt.append("INSERT INTO mapping.observation_departement VALUES ('");
				stmt.append(parameters.get(DSRConstants.OGAM_ID) + "', '" + parameters.get(DSRConstants.PROVIDER_ID) + "', '");
				stmt.append(format + "', '" + codeDepartement + "', ");
				stmt.append(1 / numberOfDepartements + ");");
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
	 * Populates the table "observation_departement" by getting the departements from a linestring or multilinestring geometry. If proportion of the length of
	 * the intersection between the departement and the line and the length of the line is stricty positive, it is considered as the departement covers partly
	 * or totally the line.
	 * 
	 * @param format
	 *            the table_format of the table
	 * @param tableName
	 *            the tablename in raw_data schema
	 * @param parameters
	 *            values including : ogam_id, provider_id
	 * @throws Exception
	 */
	public void createDepartmentsLinksFromLine(String format, String tableName, Map<String, Object> parameters) throws Exception {
		logger.debug("createDepartmentsLinksFromLine");

		Connection con = null;
		PreparedStatement ps = null;

		try {

			con = getConnection();

			StringBuffer stmt = new StringBuffer();
			stmt.append("INSERT INTO mapping.observation_departement ");
			stmt.append("SELECT m.ogam_id_" + format + ",  m.provider_id, '" + format + "', ref.code_dept, ");
			stmt.append("round(cast(St_Length(St_Intersection(m.geometrie, ref.geom))/St_Length(m.geometrie) AS numeric(4,3)), 3)");
			stmt.append("FROM referentiels.geofla_departement AS ref, raw_data." + tableName + " AS m ");
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
	 * Populates the table "observation_departement" by getting the departements from a polygon or multipolygon geometry. If the proportion of the area of the
	 * intersection between the departement and the polygon and the area of the departement is strictly positive, it is considered as the departement covers
	 * partly or totally the polygon.
	 * 
	 * @param format
	 *            the table_format of the table
	 * @param tableName
	 *            the tablename in raw_data schema
	 * @param parameters
	 *            values including : ogam_id, provider_id
	 * @throws Exception
	 */
	public void createDepartmentsLinksFromPolygon(String format, String tableName, Map<String, Object> parameters) throws Exception {
		logger.debug("createDepartmentsLinksFromPolygon");

		Connection con = null;
		PreparedStatement ps = null;

		try {

			con = getConnection();

			StringBuffer stmt = new StringBuffer();

			stmt.append("INSERT INTO mapping.observation_departement ");
			stmt.append("SELECT m.ogam_id_" + format + ",  m.provider_id, '" + format + "', ref.code_dept, ");
			stmt.append("round(cast(st_area(st_intersection(m.geometrie, ref.geom))/st_area(m.geometrie) AS numeric(4,3)), 3) AS pct ");
			stmt.append("FROM referentiels.geofla_departement AS ref, raw_data." + tableName + " AS m ");
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
	 * Populates the table "observation_departement" by getting the departements from a list of departements codes. The calculation is based on the union of the
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
	public void createDepartmentsLinksFromCommune(String format, Map<String, Object> parameters) throws Exception {
		logger.debug("createDepartmentsLinksFromCommune");

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
				stmt.append("INSERT INTO mapping.observation_departement ");
				stmt.append("SELECT '" + ogamId + "', '" + providerId + "', '" + format + "', ref.code_dept, '1' ");
				stmt.append("FROM referentiels.geofla_commune AS ref ");
				stmt.append("WHERE ref.insee_com = '" + codeCommune + "' ");
			}

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
	 * Populates the table "observation_departement" by getting the departements from a list of mailles codes. The calculation is based on the union of the
	 * geometries of the list of mailles given (value X). If the proportion of the area of the intersection between the departement and X and the area of X is
	 * strictly positive, it is considered as the departement covers partly or totally X.
	 * 
	 * @param format
	 *            the table_format of the table
	 * @param tableName
	 *            the tablename in raw_data schema
	 * @param parameters
	 *            values including : ogam_id, provider_id, codemaille
	 * @throws Exception
	 */
	public void createDepartmentsLinksFromMailles(String format, Map<String, Object> parameters) throws Exception {
		logger.debug("createDepartmentsLinksFromMailles");

		Connection con = null;
		PreparedStatement ps = null;
		ResultSet rs = null;

		try {

			con = getConnection();

			String[] codesMailles = ((String[]) parameters.get(DSRConstants.CODE_MAILLE));
			String providerId = (String) parameters.get(DSRConstants.PROVIDER_ID);
			String ogamId = (String) parameters.get(DSRConstants.OGAM_ID);

			StringBuffer stmt = null;

			// Récupérer l'union des géométries
			stmt = new StringBuffer();
			stmt.append("SELECT St_AsText(St_union(grille.geom)) as union ");
			stmt.append("FROM referentiels.grille_10km as grille ");
			stmt.append("WHERE grille.code_10km = '" + codesMailles[0] + "' ");
			for (int i = 1; i < codesMailles.length; ++i) {
				stmt.append("OR grille.code_10km  = '" + codesMailles[i] + "' ");
			}

			ps = con.prepareStatement(stmt.toString());
			logger.trace(stmt.toString());
			rs = ps.executeQuery();
			rs.next();
			String maillesUnion = "ST_GeomFromText('" + rs.getString("union") + "', 4326)";

			stmt = new StringBuffer();
			stmt.append("INSERT INTO mapping.observation_departement ");
			stmt.append("SELECT '" + ogamId + "', '" + providerId + "', '" + format + "', departement.code_dept, ");
			stmt.append("round(cast(st_area(st_intersection(" + maillesUnion + ", departement.geom))/st_area(" + maillesUnion + ") ");
			stmt.append("AS numeric(4,3)), 3) AS pct ");
			stmt.append("FROM referentiels.geofla_departement AS departement ");
			stmt.append("WHERE st_intersects(" + maillesUnion + ", departement.geom) = true ");

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
	 * Populates the table "observation_departement" by getting the departements from a list of departements codes. If the code_dept exists in the
	 * "geofla_departement" referentiel, it is added to the table.
	 * 
	 * @param format
	 *            the table_format of the table
	 * @param tableName
	 *            the tablename in raw_data schema
	 * @param parameters
	 *            values including : ogam_id, provider_id, codedepartement
	 * @throws Exception
	 */
	public void createDepartmentsLinksFromDepartements(String format, Map<String, Object> parameters) throws Exception {
		logger.debug("createDepartmentsLinksFromDepartements");

		Connection con = null;
		PreparedStatement ps = null;

		try {

			con = getConnection();

			String[] codesDepartements = ((String[]) parameters.get(DSRConstants.CODE_DEPARTEMENT));
			String providerId = (String) parameters.get(DSRConstants.PROVIDER_ID);
			String ogamId = (String) parameters.get(DSRConstants.OGAM_ID);

			StringBuffer stmt = null;
			for (String codeDepartement : codesDepartements) {
				stmt = new StringBuffer();
				stmt.append("INSERT INTO mapping.observation_departement ");
				stmt.append("SELECT '" + ogamId + "', '" + providerId + "', '" + format + "', ref.code_dept, '1' ");
				stmt.append("FROM referentiels.geofla_departement AS ref ");
				stmt.append("WHERE ref.code_dept = '" + codeDepartement + "' ");

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
	 * Deletes from tables "observation_departement" all the associations linked to the format.
	 * 
	 * @param format
	 *            the table format
	 * @throws Exception
	 */
	public void deleteDepartmentsFromFormat(String format) throws Exception {
		logger.debug("deleteDepartmentsFromFormat");

		Connection con = null;
		PreparedStatement ps = null;

		try {

			con = getConnection();

			StringBuffer stmt = new StringBuffer();
			stmt.append("DELETE FROM mapping.observation_departement ");
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
	 * Populates the field "codeDepartementCalcule", depending on the value of natureObjetGeo and getting the information from table "observation_departement".
	 * 
	 * @param format
	 *            the table format
	 * @param tableName
	 *            the tablename in raw_data schema
	 * @param parameters
	 *            values including : ogam_id, provider_id, natureobjetgeo
	 * @throws Exception
	 */
	public void setCodeDepartementCalcule(String format, String tableName, Map<String, Object> parameters) throws Exception {
		logger.debug("setCodeDepartementCalcule");

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
			stmt.append("SELECT id_departement ");
			stmt.append("FROM mapping.observation_departement ");
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

			// Create a list of code departements found
			List<String> codesDepartements = new ArrayList<String>();
			while (rs.next()) {
				codesDepartements.add(rs.getString("id_departement"));
			}

			StringBuffer codeDepartementCalcule = new StringBuffer("{");

			for (String codeDepartement : codesDepartements) {
				codeDepartementCalcule.append(codeDepartement);
				codeDepartementCalcule.append(",");
			}

			codeDepartementCalcule.delete(codeDepartementCalcule.length() - 1, codeDepartementCalcule.length());
			codeDepartementCalcule.append("}");

			stmt = new StringBuffer();
			stmt.append("UPDATE raw_data." + tableName + " ");
			stmt.append("SET " + DSRConstants.CODE_DEPARTEMENT_CALC + " = '" + codeDepartementCalcule.toString() + "' ");
			stmt.append("WHERE provider_id = '" + providerId + "' ");
			stmt.append("AND ogam_id_" + format + " = '" + ogamId + "' ");

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

}
