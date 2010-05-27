package fr.ifn.eforest.common.database.metadata;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.StringTokenizer;

import javax.naming.Context;
import javax.naming.InitialContext;
import javax.naming.NamingException;
import javax.sql.DataSource;

import org.apache.log4j.Logger;

import fr.ifn.commons.db.LocalCache;
import fr.ifn.eforest.common.business.MappingTypes;

/**
 * Data Access Object used to access metadaa.
 */
public class MetadataDAO {

	private Logger logger = Logger.getLogger(this.getClass());

	/**
	 * Local cache, for static data.
	 */
	private static LocalCache tableNamesCache = LocalCache.getLocalCache();
	private static LocalCache modesCache = LocalCache.getLocalCache();
	private static LocalCache modeExistCache = LocalCache.getLocalCache();
	private static LocalCache rangeCache = LocalCache.getLocalCache();
	private static LocalCache fileFieldsCache = LocalCache.getLocalCache();
	private static LocalCache requestFormatsCache = LocalCache.getLocalCache();
	private static LocalCache tableTreeCache = LocalCache.getLocalCache();

	/**
	 * Get the fields of a csv file format.
	 */
	private static final String GET_FILE_FIELDS_STMT = "SELECT data.data, data.unit, mask, unit.type as type, is_mandatory " + //
			" FROM file_field " + //
			" LEFT JOIN data on (file_field.data = data.data)" + //
			" LEFT JOIN unit on (data.unit = unit.unit)" + //			
			" WHERE format = ? " + //
			" ORDER BY position ASC";

	/**
	 * Get description of one field.
	 */
	private static final String GET_FILE_FIELD_STMT = "SELECT data.data, data.unit, mask, unit.type as type, is_mandatory  " + //
			" FROM data " + //
			" LEFT JOIN unit on (data.unit = unit.unit)" + //			
			" LEFT JOIN file_field on (file_field.data = data.data)" + //
			" WHERE data.data = ? ";

	/**
	 * Get the fields of a table format.
	 */
	private static final String GET_TABLE_FIELDS_STMT = "SELECT table_field.data as fieldname, table_name, column_name, is_column_oriented, table_format.format, unit.type " + //
			" FROM table_format " + //
			" LEFT JOIN table_field on (table_field.format = table_format.format) " + //
			" LEFT JOIN data on (table_field.data = data.data) " + //
			" LEFT JOIN unit on (data.unit = unit.unit) " + //
			" WHERE table_format.format = ? " + //
			" AND is_calculated <> '1'";

	/**
	 * Get the description of one field of a table format.
	 */
	private static final String GET_TABLE_FIELD_STMT = "SELECT table_field.data as fieldname, table_name, column_name, is_column_oriented, table_format.format, unit.type " + //
			" FROM table_format " + //
			" LEFT JOIN table_field on (table_field.format = table_format.format) " + //
			" LEFT JOIN data on (table_field.data = data.data) " + //
			" LEFT JOIN unit on (data.unit = unit.unit) " + //
			" WHERE table_format.format = ? " + //
			" AND   table_field.data = ? ";

	/**
	 * Get the destination columns of the mapping.
	 */
	private static final String GET_FIELD_MAPPING_STMT = "SELECT field_mapping.src_data as fieldname, field_mapping.dst_format as format, table_name, column_name, is_column_oriented, unit.type " + //
			" FROM field_mapping" + //
			" LEFT JOIN table_format on (field_mapping.dst_format = table_format.format) " + //
			" LEFT JOIN table_field on (field_mapping.dst_format = table_field.format and field_mapping.dst_data = table_field.data)" + //
			" LEFT JOIN data on (table_field.data = data.data) " + //
			" LEFT JOIN unit on (data.unit = unit.unit) " + //
			" WHERE field_mapping.src_format = ? " + //
			" AND   field_mapping.mapping_type = ? ";

	/**
	 * Get the destination tables of the mapping.
	 */
	private static final String GET_FORMAT_MAPPING_STMT = "SELECT DISTINCT table_format.format as format, table_name, is_column_oriented " + //
			" FROM field_mapping" + //
			" LEFT JOIN table_format on (field_mapping.dst_format = table_format.format) " + //
			" WHERE field_mapping.src_format = ? " + //
			" AND   field_mapping.mapping_type = ? ";

	/**
	 * Get the source tables of the mapping.
	 */
	private static final String GET_SOUCE_FORMAT_MAPPING_STMT = "SELECT DISTINCT table_format.format as format, table_name, is_column_oriented " + //
			" FROM field_mapping" + //
			" LEFT JOIN table_format on (field_mapping.src_format = table_format.format) " + //
			" WHERE field_mapping.dst_format = ? " + //
			" AND   field_mapping.mapping_type = ? ";

	/**
	 * Get type of a field.
	 */
	private static final String GET_TYPE_STMT = "SELECT type " + //
			" FROM unit " + //
			" LEFT JOIN data on (data.unit = unit.unit)" + //	
			" WHERE data.data = ? ";

	/**
	 * Get the list of modes of a given unit.
	 */
	private static final String GET_MODES_STMT = "SELECT code, label FROM mode WHERE unit = ? ORDER BY position, code";

	/**
	 * Get the one mode of a given unit.
	 */
	private static final String GET_MODE_STMT = "SELECT label FROM mode WHERE unit = ? AND code = ?";

	/**
	 * Check if a mode exists.
	 */
	private static final String CHECK_MODE_EXIST_STMT = "SELECT mode FROM mode WHERE unit = ? AND code = ?";

	/**
	 * Get a range value.
	 */
	private static final String GET_RANGE_STMT = "SELECT min, max FROM range WHERE unit = ?";

	/**
	 * Get the table physical name.
	 */
	private static final String GET_TABLE_FORMAT_STMT = "SELECT table_name, is_column_oriented, format, schema_code FROM table_format WHERE format = ?";

	/**
	 * Get the list of available datasets.
	 */
	private static final String GET_DATASET_STMT = "SELECT dataset_id, label FROM dataset";

	/**
	 * Get the tables used by a given dataset.
	 */
	private static final String GET_DATASET_TABLES_STMT = "SELECT DISTINCT table_format.format, is_column_oriented, table_name, table_format.schema_code " + //
			" FROM dataset_fields " + //
			" LEFT JOIN table_format using (format) " + //
			" WHERE dataset_id = ? " + //
			" AND table_format.schema_code = ? ";

	/**
	 * Get the expected formats for a jrc request.
	 */
	private static final String GET_REQUEST_FORMATS_STMT = "SELECT file_format.format, file_type " + //
			"FROM dataset_files " + //
			"LEFT JOIN file_format USING (format) " + //
			"WHERE dataset_id = ? " + //
			"ORDER BY position";

	/**
	 * Get the description of the table in the tables hierarchie.
	 */
	private static final String GET_TABLE_TREE_STMT = "SELECT child_table, parent_table, join_key " + //
			" FROM table_tree " + // 
			" WHERE child_table = ? " + // 
			" AND schema_code = ?";

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
	 * Return the physical name of a logical table format.
	 * 
	 * @param format
	 *            the logical name of a table (ex : "LOCATION_DATA")
	 * @return the physical name of the table (ex : "LOCATION")
	 */
	public String getTableName(String format) throws Exception {
		return getTableFormat(format).getTableName();
	}

	/**
	 * Return the table format a logical table.
	 * 
	 * @param format
	 *            the logical name of a table (ex : "LOCATION_DATA")
	 * @return table format descriptor
	 */
	public TableFormatData getTableFormat(String format) throws Exception {
		TableFormatData result = null;
		Connection con = null;
		PreparedStatement ps = null;
		ResultSet rs = null;

		result = (TableFormatData) tableNamesCache.get(format);

		if (result == null) {

			try {

				con = getConnection();

				ps = con.prepareStatement(GET_TABLE_FORMAT_STMT);
				ps.setString(1, format);
				logger.trace(GET_TABLE_FORMAT_STMT);
				rs = ps.executeQuery();

				if (rs.next()) {
					result = new TableFormatData();
					result.setFormat(format);
					result.setTableName(rs.getString("table_name"));
					result.setColumnOriented(rs.getBoolean("is_column_oriented"));
					result.setSchemaCode(rs.getString("schema_code"));
				}

				tableNamesCache.put(format, result);

			} finally {
				try {
					if (rs != null) {
						rs.close();
					}
				} catch (SQLException e) {
					logger.error("Error while closing statement : " + e.getMessage());
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
					logger.error("Error while closing statement : " + e.getMessage());
				}
			}
		}

		return result;
	}

	/**
	 * Return all the available datasets (JRC Requests).
	 * 
	 * @return The list of available datasets
	 */
	public List<DatasetData> getDatasets() throws Exception {
		List<DatasetData> result = null;
		Connection con = null;
		PreparedStatement ps = null;
		ResultSet rs = null;

		try {

			result = new ArrayList<DatasetData>();

			con = getConnection();

			ps = con.prepareStatement(GET_DATASET_STMT);
			logger.trace(GET_DATASET_STMT);
			rs = ps.executeQuery();

			while (rs.next()) {
				DatasetData request = new DatasetData();
				request.setRequestId(rs.getString("dataset_id"));
				request.setLabel(rs.getString("label"));
				result.add(request);
			}

		} finally {
			try {
				if (rs != null) {
					rs.close();
				}
			} catch (SQLException e) {
				logger.error("Error while closing statement : " + e.getMessage());
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
				logger.error("Error while closing statement : " + e.getMessage());
			}
		}

		return result;

	}

	/**
	 * Check that a code value correspond to an existing code (used during conformity checking).
	 * 
	 * @param unit
	 *            The unit ot test
	 * @param mode
	 *            The mode to test
	 * @return true if the mode exist for this unit
	 */
	public boolean checkCode(String unit, String mode) throws Exception {
		boolean result = false;
		Connection con = null;
		PreparedStatement ps = null;
		ResultSet rs = null;
		try {

			String key = unit + "_" + mode;
			Object foundValue = modeExistCache.get(key);

			if (foundValue != null) {
				return true;
			} else {

				con = getConnection();

				ps = con.prepareStatement(CHECK_MODE_EXIST_STMT);
				ps.setString(1, unit);
				ps.setString(2, mode);
				logger.trace(CHECK_MODE_EXIST_STMT);
				rs = ps.executeQuery();

				if (rs.next()) {
					modeExistCache.put(key, rs.getString(1));
					result = true;
				}

			}

		} finally {
			try {
				if (rs != null) {
					rs.close();
				}
			} catch (SQLException e) {
				logger.error("Error while closing statement : " + e.getMessage());
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
				logger.error("Error while closing statement : " + e.getMessage());
			}
		}

		return result;
	}

	/**
	 * Get a range for a unit.
	 * 
	 * @param unit
	 *            The unit of type RANGE (example : "PH")
	 * @return The range of the unit
	 */
	public RangeData getRange(String unit) throws Exception {
		RangeData result = null;
		Connection con = null;
		PreparedStatement ps = null;
		ResultSet rs = null;
		try {

			result = (RangeData) rangeCache.get(unit);

			if (result == null) {

				con = getConnection();

				ps = con.prepareStatement(GET_RANGE_STMT);
				ps.setString(1, unit);
				logger.trace(GET_RANGE_STMT);
				rs = ps.executeQuery();

				if (rs.next()) {
					result = new RangeData();
					result.setMinValue(rs.getBigDecimal("min"));
					result.setMaxValue(rs.getBigDecimal("max"));
				}

				rangeCache.put(unit, result);

			}

		} finally {
			try {
				if (rs != null) {
					rs.close();
				}
			} catch (SQLException e) {
				logger.error("Error while closing statement : " + e.getMessage());
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
				logger.error("Error while closing statement : " + e.getMessage());
			}
		}

		return result;
	}

	/**
	 * Get one mode for a unit.
	 * 
	 * @param unit
	 *            The unit of type MODE (example : "COUNTRY_CODE");
	 * @param code
	 *            The code of type MODE (example : "01");
	 * @return the mode label.
	 */
	public String getMode(String unit, String code) throws Exception {
		Connection con = null;
		PreparedStatement ps = null;
		ResultSet rs = null;
		String result = null;
		try {

			con = getConnection();

			ps = con.prepareStatement(GET_MODE_STMT);
			ps.setString(1, unit);
			ps.setString(2, code);
			logger.trace(GET_MODE_STMT);
			rs = ps.executeQuery();

			if (rs.next()) {
				result = rs.getString("label");
			}

		} finally {
			try {
				if (rs != null) {
					rs.close();
				}
			} catch (SQLException e) {
				logger.error("Error while closing statement : " + e.getMessage());
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
				logger.error("Error while closing statement : " + e.getMessage());
			}
		}
		return result;

	}

	/**
	 * Get the list of available modes for a unit.
	 * 
	 * @param unit
	 *            The unit of type MODE (example : "COUNTRY_CODE");
	 * @return the list of modes
	 */
	public List<ModeData> getModes(String unit) throws Exception {
		List<ModeData> result = null;
		Connection con = null;
		PreparedStatement ps = null;
		ResultSet rs = null;
		try {

			result = (List<ModeData>) modesCache.get(unit);

			if (result == null) {

				result = new ArrayList<ModeData>();

				con = getConnection();

				ps = con.prepareStatement(GET_MODES_STMT);
				ps.setString(1, unit);
				logger.trace(GET_MODES_STMT);
				rs = ps.executeQuery();

				while (rs.next()) {
					ModeData mode = new ModeData();
					mode.setMode(rs.getString("code"));
					mode.setLabel(rs.getString("label"));
					result.add(mode);
				}

				modesCache.put(unit, result);

			}

		} finally {
			try {
				if (rs != null) {
					rs.close();
				}
			} catch (SQLException e) {
				logger.error("Error while closing statement : " + e.getMessage());
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
				logger.error("Error while closing statement : " + e.getMessage());
			}
		}

		return result;
	}

	/**
	 * Get the type of a data.
	 * 
	 * @param data
	 *            the data object (example : "BASAL_AREA")
	 * @return the type of the data (example : "NUMERIC");
	 */
	public String getType(String data) throws Exception {
		String result = null;
		Connection con = null;
		PreparedStatement ps = null;
		ResultSet rs = null;
		try {

			con = getConnection();

			ps = con.prepareStatement(GET_TYPE_STMT);
			ps.setString(1, data);
			logger.trace(GET_TYPE_STMT);
			rs = ps.executeQuery();

			if (rs.next()) {
				result = rs.getString("type");
			}

		} finally {
			try {
				if (rs != null) {
					rs.close();
				}
			} catch (SQLException e) {
				logger.error("Error while closing statement : " + e.getMessage());
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
				logger.error("Error while closing statement : " + e.getMessage());
			}
		}
		return result;
	}

	/**
	 * Get the description of the fields of a table.
	 * 
	 * @param tableformat
	 *            the logical name of the table
	 * @param countryCode
	 *            the code of the country
	 * @return the list of fields of the table
	 */
	public List<TableFieldData> getTableFields(String tableformat, String countryCode) throws Exception {
		List<TableFieldData> result = new ArrayList<TableFieldData>();
		Connection con = null;
		PreparedStatement ps = null;
		ResultSet rs = null;
		try {

			con = getConnection();

			ps = con.prepareStatement(GET_TABLE_FIELDS_STMT);
			ps.setString(1, tableformat);
			logger.trace(GET_TABLE_FIELDS_STMT);
			rs = ps.executeQuery();

			while (rs.next()) {
				TableFieldData field = new TableFieldData();
				field.setColumnName(rs.getString("column_name"));
				field.setTableName(rs.getString("table_name"));
				field.setColumnOriented(rs.getBoolean("is_column_oriented"));
				field.setFieldName(rs.getString("fieldname"));
				field.setFormat(rs.getString("format"));
				field.setType(rs.getString("type"));
				result.add(field);
			}

		} finally {
			try {
				if (rs != null) {
					rs.close();
				}
			} catch (SQLException e) {
				logger.error("Error while closing statement : " + e.getMessage());
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
				logger.error("Error while closing statement : " + e.getMessage());
			}
		}
		return result;
	}

	/**
	 * Get the description of one field of a table.
	 * 
	 * @param tableformat
	 *            the logical name of the table
	 * @param data
	 *            the logical name of the field
	 * @return the field of the table
	 */
	public TableFieldData getTableField(String tableformat, String data) throws Exception {

		Connection con = null;
		PreparedStatement ps = null;
		ResultSet rs = null;
		try {

			con = getConnection();

			ps = con.prepareStatement(GET_TABLE_FIELD_STMT);
			ps.setString(1, tableformat);
			ps.setString(2, data);
			logger.trace(GET_TABLE_FIELD_STMT);
			rs = ps.executeQuery();

			if (rs.next()) {
				TableFieldData field = new TableFieldData();
				field.setColumnName(rs.getString("column_name"));
				field.setTableName(rs.getString("table_name"));
				field.setColumnOriented(rs.getBoolean("is_column_oriented"));
				field.setFieldName(rs.getString("fieldname"));
				field.setFormat(rs.getString("format"));
				field.setType(rs.getString("type"));
				return field;
			} else {
				return null;
			}

		} finally {
			try {
				if (rs != null) {
					rs.close();
				}
			} catch (SQLException e) {
				logger.error("Error while closing statement : " + e.getMessage());
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
				logger.error("Error while closing statement : " + e.getMessage());
			}
		}
	}

	/**
	 * Get the description of one File Field.
	 * 
	 * @param data
	 *            the logical name of the data corresponding to the field
	 * @return the field descriptor
	 */
	public FieldData getFileField(String data) throws Exception {
		FieldData result = null;
		Connection con = null;
		PreparedStatement ps = null;
		ResultSet rs = null;
		try {

			con = getConnection();

			ps = con.prepareStatement(GET_FILE_FIELD_STMT);
			ps.setString(1, data);
			logger.trace(GET_FILE_FIELD_STMT);
			rs = ps.executeQuery();

			if (rs.next()) {
				result = new FieldData();
				result.setData(rs.getString("data"));
				result.setUnit(rs.getString("unit"));
				result.setMask(rs.getString("mask"));
				result.setType(rs.getString("type"));
				result.setIsMandatory(rs.getBoolean("is_mandatory"));
			}

		} finally {
			try {
				if (rs != null) {
					rs.close();
				}
			} catch (SQLException e) {
				logger.error("Error while closing statement : " + e.getMessage());
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
				logger.error("Error while closing statement : " + e.getMessage());
			}
		}
		return result;
	}

	/**
	 * Get the description of the fields of a CSV File.
	 * 
	 * @param fileformat
	 *            the logical name of the file
	 * @param countryCode
	 *            the country code
	 * @return the list of field descriptors
	 */
	public List<FieldData> getFileFields(String fileformat) throws Exception {
		List<FieldData> result = null;
		Connection con = null;
		PreparedStatement ps = null;
		ResultSet rs = null;
		try {

			String key = fileformat;
			result = (List<FieldData>) fileFieldsCache.get(key);

			if (result == null) {

				result = new ArrayList<FieldData>();

				con = getConnection();

				ps = con.prepareStatement(GET_FILE_FIELDS_STMT);
				ps.setString(1, fileformat);
				logger.trace(GET_FILE_FIELDS_STMT);
				rs = ps.executeQuery();

				while (rs.next()) {
					FieldData field = new FieldData();
					field.setData(rs.getString("data"));
					field.setUnit(rs.getString("unit"));
					field.setMask(rs.getString("mask"));
					field.setType(rs.getString("type"));
					field.setIsMandatory(rs.getBoolean("is_mandatory"));
					result.add(field);
				}

				fileFieldsCache.put(key, result);

			}

		} finally {
			try {
				if (rs != null) {
					rs.close();
				}
			} catch (SQLException e) {
				logger.error("Error while closing statement : " + e.getMessage());
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
				logger.error("Error while closing statement : " + e.getMessage());
			}
		}
		return result;
	}

	/**
	 * Get the CSV Files composing a JRC Request.
	 * 
	 * @param requestId
	 *            the identifier of the JRC Request
	 * @return the list of file descriptors
	 */
	public List<RequestFormatData> getRequestFiles(String requestId) throws Exception {
		List<RequestFormatData> result = null;
		Connection con = null;
		PreparedStatement ps = null;
		ResultSet rs = null;
		try {

			result = (List<RequestFormatData>) requestFormatsCache.get(requestId);

			if (result == null) {

				result = new ArrayList<RequestFormatData>();

				con = getConnection();

				ps = con.prepareStatement(GET_REQUEST_FORMATS_STMT);
				ps.setString(1, requestId);
				logger.trace(GET_REQUEST_FORMATS_STMT);
				rs = ps.executeQuery();

				while (rs.next()) {
					RequestFormatData fileformat = new RequestFormatData();
					fileformat.setFormat(rs.getString("format"));
					fileformat.setFileType(rs.getString("file_type"));
					result.add(fileformat);
				}

				requestFormatsCache.put(requestId, result);

			}

		} finally {
			try {
				if (rs != null) {
					rs.close();
				}
			} catch (SQLException e) {
				logger.error("Error while closing statement : " + e.getMessage());
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
				logger.error("Error while closing statement : " + e.getMessage());
			}
		}
		return result;
	}

	/**
	 * Return the domain field linked to a table field (a quantitative variable).
	 * 
	 * @param sourceformat
	 *            the source format (table)
	 * @param sourcefield
	 *            the source field (column)
	 * @return the domain field (column)
	 */
	public TableFieldData getVariableDomain(String sourceformat, String sourcefield) throws Exception {

		Map<String, TableFieldData> mappedFields = getFieldMapping(sourceformat, MappingTypes.DOMAIN_MAPPING);

		if (mappedFields == null) {
			throw new Exception("No domain found for variable " + sourceformat);
		}

		TableFieldData field = mappedFields.get(sourcefield);

		return field;
	}

	/**
	 * Get the destination tables for a given source format (a file).
	 * 
	 * @param sourceformat
	 *            the logical name of a file format
	 * @param mappingType
	 *            the type of mapping
	 * @return a map where we have for each logical name of a destination table the corresponding table descriptor
	 */
	public Map<String, TableFormatData> getFormatMapping(String sourceformat, String mappingType) throws Exception {
		Map<String, TableFormatData> result = new HashMap<String, TableFormatData>();
		Connection con = null;
		PreparedStatement ps = null;
		ResultSet rs = null;
		try {

			con = getConnection();

			ps = con.prepareStatement(GET_FORMAT_MAPPING_STMT);
			ps.setString(1, sourceformat);
			ps.setString(2, mappingType);

			logger.trace(GET_FORMAT_MAPPING_STMT);
			rs = ps.executeQuery();

			while (rs.next()) {
				TableFormatData format = new TableFormatData();

				// format, table_name, is_column_oriented
				format.setFormat(rs.getString("format"));
				format.setTableName(rs.getString("table_name"));
				format.setColumnOriented(rs.getBoolean("is_column_oriented"));
				result.put(format.getFormat(), format);
			}

		} finally {
			try {
				if (rs != null) {
					rs.close();
				}
			} catch (SQLException e) {
				logger.error("Error while closing statement : " + e.getMessage());
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
				logger.error("Error while closing statement : " + e.getMessage());
			}
		}
		return result;
	}

	/**
	 * Get the source tables for a given destination format.
	 * 
	 * @param destformat
	 *            the logical name of a file format
	 * @param mappingType
	 *            the type of mapping
	 * @return a map where we have for each logical name of a destination table the corresponding table descriptor
	 */
	public Map<String, TableFormatData> getSourceFormatMapping(String destformat, String mappingType) throws Exception {
		Map<String, TableFormatData> result = new HashMap<String, TableFormatData>();
		Connection con = null;
		PreparedStatement ps = null;
		ResultSet rs = null;
		try {

			con = getConnection();

			ps = con.prepareStatement(GET_SOUCE_FORMAT_MAPPING_STMT);
			ps.setString(1, destformat);
			ps.setString(2, mappingType);

			logger.trace(GET_SOUCE_FORMAT_MAPPING_STMT);
			rs = ps.executeQuery();

			while (rs.next()) {
				TableFormatData format = new TableFormatData();

				// format, table_name, is_column_oriented
				format.setFormat(rs.getString("format"));
				format.setTableName(rs.getString("table_name"));
				format.setColumnOriented(rs.getBoolean("is_column_oriented"));
				result.put(format.getFormat(), format);
			}

		} finally {
			try {
				if (rs != null) {
					rs.close();
				}
			} catch (SQLException e) {
				logger.error("Error while closing statement : " + e.getMessage());
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
				logger.error("Error while closing statement : " + e.getMessage());
			}
		}
		return result;
	}

	/**
	 * Get the destination columns of a mapping (a file).
	 * 
	 * @param sourceformat
	 *            the logical name of a file format
	 * @param mappingType
	 *            the type of mapping
	 * @return a map where we have the list of destination table fields indexed by the logical name
	 */
	public Map<String, TableFieldData> getFieldMapping(String sourceformat, String mappingType) throws Exception {
		Map<String, TableFieldData> result = new HashMap<String, TableFieldData>();
		Connection con = null;
		PreparedStatement ps = null;
		ResultSet rs = null;
		try {

			con = getConnection();

			ps = con.prepareStatement(GET_FIELD_MAPPING_STMT);
			ps.setString(1, sourceformat);
			ps.setString(2, mappingType);

			logger.trace(GET_FIELD_MAPPING_STMT);
			rs = ps.executeQuery();

			while (rs.next()) {
				TableFieldData field = new TableFieldData();
				field.setColumnName(rs.getString("column_name"));
				field.setTableName(rs.getString("table_name"));
				field.setColumnOriented(rs.getBoolean("is_column_oriented"));
				field.setFieldName(rs.getString("fieldname"));
				field.setFormat(rs.getString("format"));
				field.setType(rs.getString("type"));
				result.put(field.getFieldName(), field);
			}

		} finally {
			try {
				if (rs != null) {
					rs.close();
				}
			} catch (SQLException e) {
				logger.error("Error while closing statement : " + e.getMessage());
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
				logger.error("Error while closing statement : " + e.getMessage());
			}
		}
		return result;
	}

	/**
	 * Get the descriptor of one table.
	 * 
	 * @param tableFormat
	 *            the logical name of a table (example : "LOCATION")
	 * @param schemaCode
	 *            the name of a schema (example : "RAW_DATA")
	 * @return the descriptor of the table
	 */
	public TableTreeData getTableDescriptor(String tableFormat, String schemaCode) throws Exception {

		// The descriptor of the table is always the first item of the table hierarchy
		return getTablesTree(tableFormat, schemaCode).get(0);
	}

	/**
	 * Get the hierarchy of tables from the specified table format to the root ancestor.
	 * 
	 * @param tableFormat
	 *            the logical name of a table (example : "LOCATION")
	 * @param schemaCode
	 *            the name of a schema (example : "RAW_DATA")
	 * @return the list of ancestors of the table with the join keys for each ancestor
	 */
	public List<TableTreeData> getTablesTree(String tableFormat, String schemaCode) throws Exception {
		List<TableTreeData> result = null;
		TableTreeData table = null;
		Connection con = null;
		PreparedStatement ps = null;
		ResultSet rs = null;

		String key = "TablesTreeCache_" + tableFormat + "_" + schemaCode;
		result = (List<TableTreeData>) tableTreeCache.get(key);

		if (result == null) {

			result = new ArrayList<TableTreeData>();

			try {

				con = getConnection();

				ps = con.prepareStatement(GET_TABLE_TREE_STMT);
				ps.setString(1, tableFormat);
				ps.setString(2, schemaCode);

				logger.trace(GET_TABLE_TREE_STMT);
				rs = ps.executeQuery();

				if (rs.next()) {

					table = new TableTreeData();
					table.setTable(rs.getString("child_table"));
					table.setParentTable(rs.getString("parent_table"));
					String keys = rs.getString("join_key");
					if (keys != null) {
						StringTokenizer tokenizer = new StringTokenizer(keys, ",");
						while (tokenizer.hasMoreTokens()) {
							table.addKey(tokenizer.nextToken());
						}
					}
					result.add(table);
				}

				// Recursively call the function
				if (table != null && !table.getParentTable().equals("*")) {
					result.addAll(getTablesTree(table.getParentTable(), schemaCode));
				}

				tableTreeCache.put(key, result);

			} finally {
				try {
					if (rs != null) {
						rs.close();
					}
				} catch (SQLException e) {
					logger.error("Error while closing statement : " + e.getMessage());
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
					logger.error("Error while closing statement : " + e.getMessage());
				}
			}
		}
		return result;
	}

	/**
	 * Get the raw_data tables used by a dataset.
	 * 
	 * @param requestId
	 *            the identifier of the dataset
	 * @param schemaCode
	 *            the name of the schema (RAW_DATA or HARMONIZED_DATA)
	 * @return the list of table descriptors
	 */
	public Set<TableFormatData> getDatasetTables(String requestId, String schemaCode) throws Exception {
		Set<TableFormatData> result = null;
		Connection con = null;
		PreparedStatement ps = null;
		ResultSet rs = null;
		try {

			result = new HashSet<TableFormatData>();

			con = getConnection();

			ps = con.prepareStatement(GET_DATASET_TABLES_STMT);
			ps.setString(1, requestId);
			ps.setString(2, schemaCode);
			logger.trace(GET_DATASET_TABLES_STMT);
			rs = ps.executeQuery();

			while (rs.next()) {
				TableFormatData tableformat = new TableFormatData();
				tableformat.setFormat(rs.getString("format"));
				tableformat.setColumnOriented(rs.getBoolean("is_column_oriented"));
				tableformat.setTableName(rs.getString("table_name"));
				tableformat.setSchemaCode(rs.getString("schema_code"));
				result.add(tableformat);
			}

		} finally {
			try {
				if (rs != null) {
					rs.close();
				}
			} catch (SQLException e) {
				logger.error("Error while closing statement : " + e.getMessage());
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
				logger.error("Error while closing statement : " + e.getMessage());
			}
		}
		return result;
	}

}
