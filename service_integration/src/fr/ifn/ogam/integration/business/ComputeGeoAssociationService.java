/**
 * 
 */
package fr.ifn.ogam.integration.business;

import java.util.HashMap;
import java.util.Map;

import org.apache.log4j.Logger;

import fr.ifn.ogam.common.database.GenericData;
import fr.ifn.ogam.common.database.mapping.GeometryDAO;
import fr.ifn.ogam.common.database.referentiels.CommuneDAO;
import fr.ifn.ogam.common.database.referentiels.DepartementDAO;
import fr.ifn.ogam.common.database.referentiels.MailleDAO;
import fr.ifn.ogam.common.util.DSRConstants;

/**
 * 
 * Service used to calculate the attachments of observations geometries and references to administratives limit
 * 
 * @author gautam
 *
 */
public class ComputeGeoAssociationService {

	/***
	 * The logger used to log the errors or several information.**
	 * 
	 * @see org.apache.log4j.Logger
	 */
	private final transient Logger logger = Logger.getLogger(this.getClass());

	/**
	 * DAO for accessing geometry table
	 * 
	 * @see MailleDAO
	 */
	private GeometryDAO geometryDAO = new GeometryDAO();

	/**
	 * DAO for accessing commune table
	 * 
	 * @see CommuneDAO
	 */
	private CommuneDAO communeDAO = new CommuneDAO();

	/**
	 * DAO for accessing maille table
	 * 
	 * @see MailleDAO
	 */
	private MailleDAO mailleDAO = new MailleDAO();

	/**
	 * DAO for accessing departement table
	 * 
	 * @see DepartementDAO
	 */
	private DepartementDAO departementDAO = new DepartementDAO();

	public boolean insertAdministrativeAssociations(String format, String tableName, Map<String, GenericData> values) throws Exception {

		logger.debug("insertAdministrativeAssociations");
		// Champs à récupérer
		String geometry = (String) values.get(DSRConstants.GEOMETRIE).getValue();
		String[] codesCommunes = (String[]) values.get(DSRConstants.CODE_COMMUNE).getValue();
		String[] codesMailles = (String[]) values.get(DSRConstants.CODE_MAILLE).getValue();
		String[] codesDepartements = (String[]) values.get(DSRConstants.CODE_DEPARTEMENT).getValue();

		Map<String, Object> parameters = new HashMap<>();
		parameters.put(DSRConstants.GEOMETRIE, (String) values.get(DSRConstants.GEOMETRIE).getValue());
		parameters.put(DSRConstants.CODE_COMMUNE, codesCommunes);
		parameters.put(DSRConstants.CODE_MAILLE, codesMailles);
		parameters.put(DSRConstants.CODE_DEPARTEMENT, codesDepartements);
		parameters.put(DSRConstants.OGAM_ID, (String) values.get(DSRConstants.OGAM_ID + "_" + format).getValue());
		parameters.put(DSRConstants.PROVIDER_ID, (String) values.get(DSRConstants.PROVIDER_ID).getValue());

		logger.debug("Computing administrative associations for observation with id : " + parameters.get(DSRConstants.OGAM_ID) + " and provider id : "
				+ parameters.get(DSRConstants.PROVIDER_ID) + " in table : " + tableName);

		// Booléens de présence de champs géométriques ou référençant une géométrie
		boolean hasCodesCommunes = !codesCommunes[0].isEmpty();
		boolean hasCodesMailles = !codesMailles[0].isEmpty();
		boolean hasCodesDepartements = !codesDepartements[0].isEmpty();

		try {

			if (geometry != null && !geometry.isEmpty()) {

				logger.debug(geometry);
				String geometryType = geometryDAO.getGeometryType(geometry);
				geometryDAO.createGeometryLinksFromGeometry(format, tableName, parameters);
				if ("POINT".equals(geometryType) || "MULTIPOINT".equals(geometryType)) {
					communeDAO.createCommunesLinksFromPoint(format, tableName, parameters);
					departementDAO.createDepartmentsLinksFromPoint(format, tableName, parameters);
					mailleDAO.createMaillesLinksFromPoint(format, tableName, parameters);
				} else if ("LINESTRING".equals(geometryType) || "MULTILINESTRING".equals(geometryType)) {
					communeDAO.createCommunesLinksFromLine(format, tableName, parameters);
					departementDAO.createDepartmentsLinksFromLine(format, tableName, parameters);
					mailleDAO.createMaillesLinksFromLine(format, tableName, parameters);
				} else if ("POLYGON".equals(geometryType) || "MULTIPOLYGON".equals(geometryType)) {
					communeDAO.createCommunesLinksFromPolygon(format, tableName, parameters);
					departementDAO.createDepartmentsLinksFromPolygon(format, tableName, parameters);
					mailleDAO.createMaillesLinksFromPolygon(format, tableName, parameters);
				}
			} else if (hasCodesCommunes) {
				communeDAO.createCommunesLinksFromCommunes(format, parameters);
				mailleDAO.createMaillesLinksFromCommunes(format, parameters);
				departementDAO.createDepartmentsLinksFromCommunes(format, parameters);
			} else if (hasCodesMailles) {
				mailleDAO.createMaillesLinksFromMailles(format, parameters);
				departementDAO.createDepartmentsLinksFromMailles(format, parameters);
			} else if (hasCodesDepartements) {
				mailleDAO.createMaillesLinksFromDepartements(format, parameters);
				departementDAO.createDepartmentsLinksFromDepartements(format, parameters);
			}

			communeDAO.setCodeCommuneCalcule(format, tableName, parameters);
			communeDAO.setNomCommuneCalcule(format, tableName, parameters);
			mailleDAO.setCodeMailleCalcule(format, tableName, parameters);
			departementDAO.setCodeDepartementCalcule(format, tableName, parameters);

		} catch (

		Exception e) {
			// TODO: handle exception
			throw e;
		}

		return false;
	}

}
