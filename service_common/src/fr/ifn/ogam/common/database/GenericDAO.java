package fr.ifn.ogam.common.database;

import java.math.BigDecimal;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Date;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

import javax.naming.Context;
import javax.naming.InitialContext;
import javax.naming.NamingException;
import javax.sql.DataSource;

import org.apache.log4j.Logger;

import fr.ifn.ogam.common.util.SqlStateSQL99;
import fr.ifn.ogam.common.business.checks.CheckException;
import fr.ifn.ogam.common.database.mapping.GeometryDAO;
import fr.ifn.ogam.common.database.metadata.TableFieldData;
import static fr.ifn.ogam.common.business.UnitTypes.*;
import static fr.ifn.ogam.common.business.checks.CheckCodes.*;

/**
 * Data Access Object allowing to acces the raw_data tables.
 */
public class GenericDAO {

	private Logger logger = Logger.getLogger(this.getClass());

	// DAOs
	private GeometryDAO geometryDAO = new GeometryDAO();

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
	 * Insert a line of data in a destination table.
	 * 
	 * @param schema
	 *            the name of the schema
	 * @param tableName
	 *            the name of the destination table
	 * @param tableColumns
	 *            the descriptor of the columns of the destination table
	 * @param valueColumns
	 *            the list of values to insert in the table
	 * 
	 * @throws Exception
	 */
	public void insertData(String schema, String tableName, Map<String, TableFieldData> tableColumns, Map<String, GenericData> valueColumns) throws Exception {

		Connection con = null;
		PreparedStatement ps = null;
		try {

			con = getConnection();

			// Prepare the SQL values
			StringBuffer colNames = new StringBuffer();
			StringBuffer colValues = new StringBuffer();
			Iterator<String> columnsIter = tableColumns.keySet().iterator();
			while (columnsIter.hasNext()) {
				String sourceData = columnsIter.next();

				GenericData colData = valueColumns.get(sourceData);

				// If colData is null, the field is not mapped and is probably not expected (we hope)
				if (colData != null) {

					if (!colNames.toString().equalsIgnoreCase("")) {
						colNames.append(", ");
						colValues.append(", ");
					}

					colNames.append(colData.getColumnName());
					if (colData.getType().equalsIgnoreCase(GEOM)) {
						// TODO : Check the format
						if (colData.getValue() == null || colData.getValue().equals("")) {
							colValues.append("null");
						} else {
							// We suppose that the SRID is the one expected in the table
							TableFieldData tableData = tableColumns.get(sourceData);
							Integer srid = geometryDAO.getSRID(tableData.getTableName(), tableData.getColumnName());
							colValues.append("ST_GeomFromText('" + colData.getValue() + "', " + srid + ")");
						}
					} else {
						colValues.append("?");
					}

				}
			}

			// Build the SQL INSERT
			String statement = "INSERT INTO " + tableName + " (" + colNames.toString() + ") VALUES (" + colValues.toString() + ")";
			logger.trace(statement);

			// Prepare the statement
			ps = con.prepareStatement(statement);

			// Set the values
			columnsIter = tableColumns.keySet().iterator();
			int count = 1;
			while (columnsIter.hasNext()) {
				String sourceData = columnsIter.next();
				GenericData colData = valueColumns.get(sourceData);

				if (colData != null) {

					if (colData.getType().equalsIgnoreCase(STRING)) {
						ps.setString(count, (String) colData.getValue());
					} else if (colData.getType().equalsIgnoreCase(CODE)) {
						ps.setString(count, (String) colData.getValue());
					} else if (colData.getType().equalsIgnoreCase(IMAGE)) {
						ps.setString(count, (String) colData.getValue());
					} else if (colData.getType().equalsIgnoreCase(NUMERIC)) {
						if (colData.getValue() == null) {
							ps.setNull(count, java.sql.Types.DECIMAL);
						} else {
							ps.setBigDecimal(count, (BigDecimal) colData.getValue());
						}
					} else if (colData.getType().equalsIgnoreCase(INTEGER)) {
						if (colData.getValue() == null) {
							ps.setNull(count, java.sql.Types.INTEGER);
						} else {
							ps.setInt(count, (Integer) colData.getValue());
						}
					} else if (colData.getType().equalsIgnoreCase(DATE)) {
						if (colData.getValue() == null) {
							ps.setNull(count, java.sql.Types.DATE);
						} else {
							Date date = (Date) colData.getValue();
							ps.setTimestamp(count, new java.sql.Timestamp(date.getTime()));
						}
					} else if (colData.getType().equalsIgnoreCase(BOOLEAN)) {
						if (colData.getValue() == null) {
							ps.setNull(count, java.sql.Types.BOOLEAN);
						} else {
							String bool = ((Boolean) colData.getValue()) ? "1" : "0";
							ps.setString(count, bool);
						}
					} else if (colData.getType().equalsIgnoreCase(ARRAY)) {
						if (colData.getValue() == null) {
							ps.setNull(count, java.sql.Types.ARRAY);
						} else {
							String[] value = (String[]) colData.getValue();
							java.sql.Array array = con.createArrayOf("varchar", value);
							ps.setArray(count, array);
						}
					} else if (colData.getType().equalsIgnoreCase(GEOM)) {
						// Do nothing and don't increment the count
						count--;
					} else {
						throw new Exception("Unexpected type");
					}

					count++;
				}

			}

			// Execute the query
			ps.execute();

		} catch (SQLException sqle) {

			// Log the exception
			logger.error("Error while inserting generic data", sqle);

			if (SqlStateSQL99.ERRCODE_UNIQUE_VIOLATION.equalsIgnoreCase(sqle.getSQLState())) {
				throw new CheckException(DUPLICATE_ROW);
			} else if (SqlStateSQL99.ERRCODE_DATATYPE_MISMATCH.equalsIgnoreCase(sqle.getSQLState())) {
				throw new CheckException(INVALID_TYPE_FIELD);
			} else if (SqlStateSQL99.ERRCODE_STRING_DATA_RIGHT_TRUNCATION.equalsIgnoreCase(sqle.getSQLState())) {
				throw new CheckException(STRING_TOO_LONG);
			} else if (SqlStateSQL99.ERRCODE_NOT_NULL_VIOLATION.equalsIgnoreCase(sqle.getSQLState())) {
				throw new CheckException(MANDATORY_FIELD_MISSING);
			} else if (SqlStateSQL99.ERRCODE_FOREIGN_KEY_VIOLATION.equalsIgnoreCase(sqle.getSQLState())) {
				CheckException ce = new CheckException(INTEGRITY_CONSTRAINT);
				String message = sqle.getMessage();
				int pos = message.indexOf("Détail : ");
				if (pos == -1) {
					pos = message.indexOf("Detail : ");
				}
				if (pos != -1) {
					message = message.substring(pos + 9);
				}
				ce.setFoundValue(message);
				throw ce;
			} else {
				logger.error("SQL STATE : " + sqle.getSQLState());
				throw new CheckException(UNEXPECTED_SQL_ERROR);
			}
		} catch (Exception e) {

			// Log the exception
			logger.error("Error while inserting generic data", e);

			// Rethrow e
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
				logger.error("Error while closing statement : " + e.getMessage());
			}
		}
	}

	/**
	 * Remove all data from a submisson.
	 * 
	 * @param tableName
	 *            the name of the table
	 * @param submissionId
	 *            the identifier of the submission
	 */
	public void deleteRawData(String tableName, Integer submissionId) throws Exception {

		Connection con = null;
		PreparedStatement ps = null;
		try {

			con = getConnection();

			// Build the SQL INSERT
			String statement = "DELETE FROM " + tableName + " WHERE submission_id  = ?";

			// Prepare the statement
			ps = con.prepareStatement(statement);

			// Set the values
			ps.setInt(1, submissionId);

			// Execute the query
			logger.trace(statement);
			ps.execute();

		} catch (SQLException sqle) {

			// log the exception
			logger.error("Error while deleting raw data", sqle);

			if (SqlStateSQL99.ERRCODE_FOREIGN_KEY_VIOLATION.equalsIgnoreCase(sqle.getSQLState())) {
				throw new CheckException(INTEGRITY_CONSTRAINT);
			}
		} catch (Exception e) {
			// log the exception
			logger.error("Error while deleting raw data", e);

			// Rethrow e
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

	/**
	 * Execute a generic SELECT SQL request and read the data.
	 * 
	 * @param statement
	 *            The SQL request to execute
	 * @param fields
	 *            The descriptors of the columns to read
	 * @return a list of result field
	 */
	public List<Map<String, GenericData>> readData(String statement, List<TableFieldData> fields) throws Exception {

		Connection con = null;
		PreparedStatement ps = null;
		ResultSet rs = null;
		List<Map<String, GenericData>> result = new ArrayList<Map<String, GenericData>>();

		try {
			con = getConnection();
			ps = con.prepareStatement(statement);

			rs = ps.executeQuery();

			while (rs.next()) {

				Map<String, GenericData> resultLine = new TreeMap<String, GenericData>();

				Iterator<TableFieldData> fieldsIter = fields.iterator();
				while (fieldsIter.hasNext()) {
					TableFieldData field = fieldsIter.next();
					String columnName = field.getFormat() + "_" + field.getData();

					GenericData data = new GenericData();
					data.setColumnName(field.getColumnName());
					data.setFormat(field.getData());
					data.setType(field.getType());
					if (field.getType().equalsIgnoreCase(STRING)) {
						data.setValue(rs.getString(columnName));
					} else if (field.getType().equalsIgnoreCase(CODE)) {
						data.setValue(rs.getString(columnName));
					} else if (field.getType().equalsIgnoreCase(ARRAY)) {
						java.sql.Array arrayRes = rs.getArray(columnName);

						Object arrayRes2 = arrayRes.getArray();
						String[] res = (String[]) arrayRes2; // Cast in a array of strings

						data.setValue(res);

					} else if (field.getType().equalsIgnoreCase(IMAGE)) {
						data.setValue(rs.getString(columnName));
					} else if (field.getType().equalsIgnoreCase(GEOM)) {
						data.setValue(rs.getObject(columnName));
					} else if (field.getType().equalsIgnoreCase(NUMERIC)) {
						data.setValue(rs.getBigDecimal(columnName));
					} else if (field.getType().equalsIgnoreCase(INTEGER)) {
						data.setValue(rs.getInt(columnName));
					} else if (field.getType().equalsIgnoreCase(DATE)) {
						String val = rs.getString(columnName);
						if (val == null) {
							data.setValue(null);
						} else {
							data.setValue(new Date(rs.getTimestamp(columnName).getTime()));
						}
					} else if (field.getType().equalsIgnoreCase(BOOLEAN)) {
						String val = rs.getString(columnName);
						if (val == null) {
							data.setValue(null);
						} else {
							if (val.equalsIgnoreCase("1")) {
								data.setValue(Boolean.TRUE);
							} else {
								data.setValue(Boolean.FALSE);
							}
						}
					} else {
						throw new Exception("Unexpected type : " + field.getType() + " for field " + field.getData());
					}

					resultLine.put(data.getFormat(), data);

				}

				result.add(resultLine);

			}

			return result;

		} catch (Exception e) {
			logger.trace(statement);
			logger.error("Error while reading generic data", e);
			throw e;
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
	 * Count the number of lines returned by a select statement.
	 * 
	 * @param statement
	 *            The SQL request to execute
	 * @return a list of result field
	 */
	public int countData(String statement) throws Exception {

		Connection con = null;
		PreparedStatement ps = null;
		ResultSet rs = null;

		try {
			con = getConnection();
			ps = con.prepareStatement("SELECT COUNT(*) as count FROM (" + statement + ") as foo");

			rs = ps.executeQuery();

			if (rs.next()) {
				return rs.getInt("count");
			} else {
				return 0;
			}

		} catch (Exception e) {
			logger.trace(statement);
			logger.error("Error while reading generic data", e);
			throw e;
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

}
