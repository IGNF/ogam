package fr.ifn.eforest.integration.servlet;

import java.io.IOException;
import java.util.Iterator;
import java.util.List;

import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.log4j.Logger;

import fr.ifn.eforest.common.business.Schemas;
import fr.ifn.eforest.common.database.metadata.FieldData;
import fr.ifn.eforest.common.database.metadata.DatasetData;
import fr.ifn.eforest.common.database.metadata.FileFieldData;
import fr.ifn.eforest.common.database.metadata.FileFormatData;
import fr.ifn.eforest.common.database.metadata.MetadataDAO;
import fr.ifn.eforest.common.database.metadata.ModeData;
import fr.ifn.eforest.common.database.metadata.TableTreeData;

/**
 * Meta Data Servlet.
 * 
 * Expose some services for the metadata.
 */
public class MetadataServlet extends HttpServlet {

	/**
	 * The logger used to log the errors or several information.
	 * 
	 * @see org.apache.log4j.Logger
	 */
	protected final transient Logger logger = Logger.getLogger(this.getClass());

	/**
	 * The serial version ID used to identify the object.
	 */
	protected static final long serialVersionUID = -123484792196121244L;

	/**
	 * The data access objects.
	 */
	private transient MetadataDAO metadataDAO = new MetadataDAO();

	/**
	 * Input parameters.
	 */

	private static final String ACTION = "action";
	private static final String ACTION_GET_COUNTRIES = "GetCountries";
	private static final String ACTION_GET_JRC_REQUEST = "GetJRCRequests";
	private static final String ACTION_GET_REQUEST_FILES = "GetRequestFiles";
	private static final String ACTION_GET_FILE_FIELDS = "GetFileFields";
	private static final String ACTION_GET_TABLES_TREE = "GetTablesTree";

	private static final String REQUEST_ID = "REQUEST_ID";
	private static final String FILE_FORMAT = "FILE_FORMAT";
	private static final String TABLE_FORMAT = "TABLE_FORMAT";

	/**
	 * Main function of the servlet.
	 * 
	 * @param request
	 *            the request done to the servlet
	 * @param response
	 *            the response sent
	 */
	public void service(HttpServletRequest request, HttpServletResponse response) throws IOException {

		String action = null;

		response.setContentType("text/xml");
		response.setCharacterEncoding("UTF-8");
		ServletOutputStream out = response.getOutputStream();

		try {
			logger.debug("Metadata servlet called");

			action = request.getParameter(ACTION);
			if (action == null) {
				throw new Exception("The " + ACTION + " parameter is mandatory");
			}

			//
			// Get Countries
			//
			if (action.equals(ACTION_GET_COUNTRIES)) {

				out.print(getCountries());

			} else

			//
			// Get JRC Requests
			//
			if (action.equals(ACTION_GET_JRC_REQUEST)) {

				out.print(getJRCRequests());

			} else

			//
			// Get the expected files for a request
			//
			if (action.equals(ACTION_GET_REQUEST_FILES)) {

				String requestId = request.getParameter(REQUEST_ID);
				if (requestId == null) {
					throw new Exception("The " + REQUEST_ID + " parameter is mandatory");
				}
				out.print(getRequestFiles(requestId));

			} else

			//
			// Get the fields of a data field
			//
			if (action.equals(ACTION_GET_FILE_FIELDS)) {

				String fileformat = request.getParameter(FILE_FORMAT);
				if (fileformat == null) {
					throw new Exception("The " + FILE_FORMAT + " parameter is mandatory");
				}

				out.print(getFileFields(fileformat));

			} else

			//
			// Get the tree hierarchy of the table
			//
			if (action.equals(ACTION_GET_TABLES_TREE)) {

				String tableFormat = request.getParameter(TABLE_FORMAT);
				if (tableFormat == null) {
					throw new Exception("The " + TABLE_FORMAT + " parameter is mandatory");
				}

				out.print(getTablesTree(tableFormat));

			} else {
				throw new Exception("The action type is unknown");
			}

		} catch (Exception e) {
			logger.error("Error during data upload", e);
			out.print(e.getMessage());
		}
	}

	/**
	 * Return a JSON String listing the available countries.
	 * 
	 * @return the list of available countries as a JSON string
	 */
	private String getCountries() throws Exception {
		StringBuffer result = new StringBuffer();
		List<ModeData> modesList = metadataDAO.getModes("COUNTRY_CODE");
		result.append("[");
		Iterator<ModeData> modeIter = modesList.iterator();
		while (modeIter.hasNext()) {
			ModeData mode = modeIter.next();
			result.append("{mode:\"" + mode.getMode() + "\",label:\"" + mode.getLabel() + "\"}");
			if (modeIter.hasNext()) {
				result.append(",");
			}
		}
		result.append("]");
		return result.toString();
	}

	/**
	 * Return a JSON String listing the available JRC Requests.
	 * 
	 * * @return the list of available JRC Requests as a JSON string
	 */
	private String getJRCRequests() throws Exception {
		StringBuffer result = new StringBuffer();
		List<DatasetData> requestList = metadataDAO.getDatasets();
		result.append("[");
		Iterator<DatasetData> requestIter = requestList.iterator();
		while (requestIter.hasNext()) {
			DatasetData jrcrequest = requestIter.next();
			result.append("{id:\"" + jrcrequest.getRequestId() + "\",label:\"" + jrcrequest.getLabel() + "\"}");
			if (requestIter.hasNext()) {
				result.append(",");
			}
		}
		result.append("]");
		return result.toString();
	}

	/**
	 * Return a JSON String listing the needed CSV files for a JRC Requests.
	 * 
	 * @param datasetId
	 *            the dataset identifier
	 * @return the list of requested files as a JSON string
	 */
	private String getRequestFiles(String datasetId) throws Exception {
		StringBuffer result = new StringBuffer();
		List<FileFormatData> requestList = metadataDAO.getDatasetFiles(datasetId);
		result.append("[");
		Iterator<FileFormatData> requestIter = requestList.iterator();
		while (requestIter.hasNext()) {
			FileFormatData requestedFile = requestIter.next();
			result.append("{format:\"" + requestedFile.getFormat() + "\",type:\"" + requestedFile.getFileType() + "\"}");
			if (requestIter.hasNext()) {
				result.append(",");
			}
		}
		result.append("]");
		return result.toString();
	}

	/**
	 * Return a JSON String listing the needed fields of a CSV File.
	 * 
	 * @param fileformat
	 *            the file format
	 * @return the list of fields in the file as a JSON string
	 */
	private String getFileFields(String fileformat) throws Exception {
		StringBuffer result = new StringBuffer();

		// Get the fields of the file format
		List<FileFieldData> fields = metadataDAO.getFileFields(fileformat);

		result.append("[");
		Iterator<FileFieldData> fieldsIter = fields.iterator();
		while (fieldsIter.hasNext()) {
			FieldData field = fieldsIter.next();
			result.append("{label:\"" + field.getData() + "\"}");
			if (fieldsIter.hasNext()) {
				result.append(",");
			}
		}
		result.append("]");
		return result.toString();
	}

	/**
	 * Return a JSON String listing the tables hierarchy.
	 * 
	 * @param tableFormat
	 *            the format of the root table
	 * @return the hierarchy of the parent tables as a JSON string
	 */
	private String getTablesTree(String tableFormat) throws Exception {
		StringBuffer result = new StringBuffer();

		// Get the fields of the file format
		List<TableTreeData> tables = metadataDAO.getTablesTree(tableFormat, Schemas.RAW_DATA);

		result.append("[");
		Iterator<TableTreeData> tablesIter = tables.iterator();
		while (tablesIter.hasNext()) {
			TableTreeData field = tablesIter.next();
			result.append("{table:\"" + field.getTable() + "\",parent:\"" + field.getParentTable() + "\"}");
			if (tablesIter.hasNext()) {
				result.append(",");
			}
		}
		result.append("]");
		return result.toString();
	}
}
