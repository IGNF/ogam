/**
 * 
 */
package fr.ifn.ogam.common.database.referentiels;

import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

import javax.naming.Context;
import javax.naming.InitialContext;
import javax.naming.NamingException;
import javax.sql.DataSource;

import org.apache.log4j.Logger;

import fr.ifn.ogam.common.database.GenericDAO;
import fr.ifn.ogam.common.database.metadata.TableFormatData;
import fr.ifn.ogam.common.util.DSRConstants;

/**
 * 
 * DAO for methods involving communes georeferencing.
 * 
 * @author gpastakia
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
	 * DAO for generic requests
	 * 
	 * @see GenericDao
	 */
	private GenericDAO genericDao = new GenericDAO();

	/**
	 * Add in the table "observation_commune" the links to the communes that intersects the geometry defined by 'parameters' (ogam_id and provider_id of the
	 * observation that hold the geometry). This function must be used only if geometry is a point or multipoint.
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

		StringBuffer stmt = new StringBuffer();
		stmt.append("SELECT DISTINCT ref.insee_com ");
		stmt.append("FROM referentiels.geofla_commune AS ref, raw_data." + tableName + " AS m ");
		stmt.append("WHERE St_Intersects(ref.geom, m.geometrie) = true ");
		stmt.append("AND m.ogam_id_" + format + " = '" + parameters.get(DSRConstants.OGAM_ID) + "' ");
		stmt.append("AND m.provider_id = '" + parameters.get(DSRConstants.PROVIDER_ID) + "';");

		ResultSet rs = genericDao.executeQueryRequest(stmt.toString());
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
			genericDao.executeUpdateRequest(stmt.toString());
		}

	}

	/**
	 * Add in the table "observation_commune" the links to the communes that intersects the geometry defined by 'parameters' (ogam_id and provider_id of the
	 * observation that hold the geometry). This function must be used only if geometry is a linestring or multilinestring.
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

		String ogamId = parameters.get(DSRConstants.OGAM_ID).toString();
		String providerId = parameters.get(DSRConstants.PROVIDER_ID).toString();

		Float length = genericDao.getGeometryLength(format, tableName, ogamId, providerId);

		if (length >= 0) {
			StringBuffer stmt = new StringBuffer();
			stmt.append("INSERT INTO mapping.observation_commune ");
			stmt.append("SELECT m.ogam_id_" + format + ",  m.provider_id, '" + format + "', ref.insee_com, ");
			if (length > 0) {
				stmt.append("round(cast(St_Length(St_Intersection(m.geometrie, ref.geom))/St_Length(m.geometrie) AS numeric(4,3)), 3) ");
			} else {
				stmt.append("1 ");
			}
			stmt.append("FROM referentiels.geofla_commune AS ref, raw_data." + tableName + " AS m ");
			if (length > 0) {
				stmt.append("WHERE St_Intersects(m.geometrie, ref.geom) = true ");
			} else {
				stmt.append("WHERE St_Distance(m.geometrie, ref.geom) = 0 ");
			}
			stmt.append("AND m.ogam_id_" + format + " = '" + ogamId + "' ");
			stmt.append("AND m.provider_id = '" + providerId + "'");

			genericDao.executeUpdateRequest(stmt.toString());
		}
	}

	/**
	 * Add in the table "observation_commune" the links to the communes that intersects the geometry defined by 'parameters' (ogam_id and provider_id of the
	 * observation that hold the geometry). This function must only be used if geometry is a polygon or multipolygon.
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

		String ogamId = parameters.get(DSRConstants.OGAM_ID).toString();
		String providerId = parameters.get(DSRConstants.PROVIDER_ID).toString();

		Float area = genericDao.getGeometryArea(format, tableName, ogamId, providerId);
		if (area >= 0) {
			StringBuffer stmt = new StringBuffer();

			stmt.append("INSERT INTO mapping.observation_commune ");
			stmt.append("SELECT m.ogam_id_" + format + ",  m.provider_id, '" + format + "', ref.insee_com, ");
			if (area > 0) {
				stmt.append("round(cast(St_Area(St_Intersection(m.geometrie, ref.geom))/St_Area(m.geometrie) AS numeric(4,3)), 3) AS pct ");
			} else {
				stmt.append("1 ");
			}
			stmt.append("FROM referentiels.geofla_commune AS ref, raw_data." + tableName + " AS m ");
			if (area > 0) {
				stmt.append("WHERE St_Intersects(m.geometrie, ref.geom) = true ");
			} else {
				stmt.append("WHERE St_Distance(m.geometrie, ref.geom) = 0 ");
			}
			stmt.append("AND m.ogam_id_" + format + " = '" + ogamId + "' ");
			stmt.append("AND m.provider_id = '" + providerId + "'");

			genericDao.executeUpdateRequest(stmt.toString());
		}
	}

	/**
	 * Add in the table "observation_commune" the links to the communes that are listed in the observation defined by 'parameters' (ogam_id and provider_id of
	 * the observation). If the commune code is not known in the commune referential, it is just ignored.
	 * 
	 * 
	 * @param format
	 *            the table_format of the table
	 * @param parameters
	 *            values including : ogam_id, provider_id, the codescommunes
	 * @throws Exception
	 */
	public void createCommunesLinksFromCommunes(String format, Map<String, Object> parameters) throws Exception {

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

			genericDao.executeUpdateRequest(stmt.toString());
		}
	}

	/**
	 * Add in the table "observation_commune" the links to the communes that intersects the mailles listed in the observation defined by 'parameters' (ogam_id
	 * and provider_id of the observation). If the code is not known in the maille referential, it is just ignored.
	 * 
	 * @param format
	 *            the table_format of the table
	 * @param parameters
	 *            values including : ogam_id, provider_id, the codemaille
	 * @throws Exception
	 */
	public void createCommunesLinksFromMailles(String format, Map<String, Object> parameters) throws Exception {
		logger.debug("createCommunesLinksFromMailles");

		String[] codesMailles = ((String[]) parameters.get(DSRConstants.CODE_MAILLE));
		String providerId = (String) parameters.get(DSRConstants.PROVIDER_ID);
		String ogamId = (String) parameters.get(DSRConstants.OGAM_ID);

		StringBuffer stmt = null;

		// Récupérer l'union des géométries
		stmt = new StringBuffer();
		stmt.append("SELECT St_AsText(St_union(grille.geom)) as union ");
		stmt.append("FROM referentiels.codemaillevalue as grille ");
		stmt.append("WHERE grille.code_10km = '" + codesMailles[0] + "' ");
		for (int i = 1; i < codesMailles.length; ++i) {
			stmt.append("OR grille.code_10km  = '" + codesMailles[i] + "' ");
		}

		ResultSet rs = genericDao.executeQueryRequest(stmt.toString());
		rs.next();
		String maillesUnion = "ST_GeomFromText('" + rs.getString("union") + "', 4326)";

		// Récupérer la liste des codes communes
		stmt = new StringBuffer();
		stmt.append("SELECT commune.insee_com ");
		stmt.append("FROM referentiels.geofla_commune AS commune ");
		stmt.append("WHERE St_Intersects(" + maillesUnion + ", commune.geom) = true ;");

		rs = genericDao.executeQueryRequest(stmt.toString());

		List<String> codesCommunes = new ArrayList<String>();
		while (rs.next()) {
			codesCommunes.add(rs.getString("insee_com"));
		}
		String codesCommunesStr = codesCommunes.toString().replace("[", "{").replace("]", "}").replace("'", "''");

		stmt = new StringBuffer();
		stmt.append("INSERT INTO mapping.observation_commune ");
		stmt.append("SELECT '" + ogamId + "', '" + providerId + "', '" + format + "', commune.insee_com, ");
		stmt.append("round(cast(" + 1 / codesCommunes.size() + "AS numeric(4,3)), 3) AS pct ");
		stmt.append("FROM referentiels.geofla_commune AS commune ");
		stmt.append("WHERE commune.insee_com = ANY ('" + codesCommunesStr + "'::text[]);");

		genericDao.executeUpdateRequest(stmt.toString());
	}

	/**
	 * Add in the table "observation_commune" the links to the communes that intersects the departments listed in the observation defined by 'parameters'
	 * (ogam_id and provider_id of the observation). If the code is not known in the dept referential, it is just ignored.
	 * 
	 * @param format
	 *            the table_format of the table
	 * @param parameters
	 *            values including : ogam_id, provider_id, the codemaille
	 * @throws Exception
	 */
	public void createCommunesLinksFromDepartements(String format, Map<String, Object> parameters) throws Exception {
		logger.debug("createCommunesLinksFromDepartements");

		String[] codesDepartements = ((String[]) parameters.get(DSRConstants.CODE_DEPARTEMENT));
		String providerId = (String) parameters.get(DSRConstants.PROVIDER_ID);
		String ogamId = (String) parameters.get(DSRConstants.OGAM_ID);
		String codesDepartementsStr = Arrays.asList(codesDepartements).toString().replace("[", "{").replace("]", "}").replace("'", "''");

		StringBuffer stmt = null;
		// Récupérer la liste des codes communes
		stmt = new StringBuffer();
		stmt.append("SELECT commune.insee_com ");
		stmt.append("FROM referentiels.geofla_commune AS commune, referentiels.geofla_departement AS departement ");
		stmt.append("WHERE commune.code_dept = departement.code_dept ");
		stmt.append("AND departement.code_dept = ANY('" + codesDepartementsStr + "'::text[]);");

		ResultSet rs = genericDao.executeQueryRequest(stmt.toString());

		List<String> codesCommunes = new ArrayList<String>();
		while (rs.next()) {
			codesCommunes.add(rs.getString("insee_com"));
		}
		String codesCommunesStr = codesCommunes.toString().replace("[", "{").replace("]", "}").replace("'", "''");

		stmt = new StringBuffer();
		stmt.append("INSERT INTO mapping.observation_commune ");
		stmt.append("SELECT '" + ogamId + "', '" + providerId + "', '" + format + "', commune.insee_com, ");
		stmt.append("round(cast(" + 1 / codesCommunes.size() + "AS numeric(4,3)), 3) AS pct ");
		stmt.append("FROM referentiels.geofla_commune AS commune ");
		stmt.append("WHERE commune.insee_com = ANY ('" + codesCommunesStr + "'::text[]);");

		genericDao.executeUpdateRequest(stmt.toString());
	}

	/**
	 * Deletes from tables "observation_commune" all the associations linked to the format. Code is executed only if table above exists.
	 * 
	 * @param format
	 *            the table format
	 * @param submissionId
	 *            the identifier of the submission
	 * @throws Exception
	 */
	public void deleteCommunesFromFormat(TableFormatData tableFormat, Integer submissionId) throws Exception {
		logger.debug("deleteCommunesFromFormat");

		String tableName = tableFormat.getTableName();
		String format = tableFormat.getFormat();

		StringBuffer stmt = new StringBuffer();
		stmt.append("SELECT to_regclass('mapping.observation_commune') as oc_reg");
		ResultSet rs = genericDao.executeQueryRequest(stmt.toString());

		String ocReg;

		if (rs.next()) {
			ocReg = rs.getString("oc_reg");
			if (ocReg != null) {
				stmt = new StringBuffer();
				stmt.append("DELETE FROM mapping.observation_commune as oc ");
				stmt.append("USING raw_data." + tableName + " as rd ");
				stmt.append("WHERE oc.id_observation = rd.ogam_id_" + format + " ");
				stmt.append("AND oc.id_provider = rd.provider_id ");
				stmt.append("AND submission_id = " + submissionId + ";");

				genericDao.executeUpdateRequest(stmt.toString());
			}
		}
	}

	/**
	 * 
	 * Populates the field "codeCommuneCalcule" by getting the information from table "observation_commune".
	 * 
	 * @param format
	 *            the table format
	 * @param tableName
	 *            the tablename in raw_data schema
	 * @param parameters
	 *            values including : ogam_id, provider_id
	 * @throws Exception
	 */
	public void setCodeCommuneCalcule(String format, String tableName, Map<String, Object> parameters) throws Exception {
		logger.debug("setCodeCommuneCalcule");

		StringBuffer stmt = null;

		String providerId = (String) parameters.get(DSRConstants.PROVIDER_ID);
		String ogamId = (String) parameters.get(DSRConstants.OGAM_ID);

		// Get the list of the mailles
		stmt = new StringBuffer();
		stmt.append("SELECT id_commune ");
		stmt.append("FROM mapping.observation_commune ");
		stmt.append("WHERE id_observation = '" + ogamId + "' ");
		stmt.append("AND id_provider = '" + providerId + "' ");
		stmt.append("AND table_format = '" + format + "' ");

		ResultSet rs = genericDao.executeQueryRequest(stmt.toString());

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

		genericDao.executeUpdateRequest(stmt.toString());
	}

	/**
	 * 
	 * Populates the field "nomCommuneCalcule" by getting the information from table "observation_commune".
	 * 
	 * @param format
	 *            the table format
	 * @param tableName
	 *            the tablename in raw_data schema
	 * @param parameters
	 *            values including : ogam_id, provider_id
	 * @throws Exception
	 */
	public void setNomCommuneCalcule(String format, String tableName, Map<String, Object> parameters) throws Exception {
		logger.debug("setNomCommuneCalcule");

		StringBuffer stmt = null;

		String providerId = (String) parameters.get(DSRConstants.PROVIDER_ID);
		String ogamId = (String) parameters.get(DSRConstants.OGAM_ID);

		// Get the list of the communes
		stmt = new StringBuffer();
		stmt.append("SELECT id_commune ");
		stmt.append("FROM mapping.observation_commune ");
		stmt.append("WHERE id_observation = '" + ogamId + "' ");
		stmt.append("AND id_provider = '" + providerId + "' ");
		stmt.append("AND table_format = '" + format + "' ");

		ResultSet rs = genericDao.executeQueryRequest(stmt.toString());

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

			rs = genericDao.executeQueryRequest(stmt.toString());
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
		stmt.append("SET " + DSRConstants.NOM_COMMUNE_CALC + " = '" + nomCommuneCalcule.toString().replace("'", "''") + "' ");
		stmt.append("WHERE provider_id = '" + providerId + "' ");
		stmt.append("AND ogam_id_" + format + " = '" + ogamId + "' ");

		genericDao.executeUpdateRequest(stmt.toString());
	}

}
