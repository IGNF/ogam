package fr.ifn.eforest.common.business;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.regex.Pattern;

import org.apache.log4j.Logger;

import fr.ifn.commons.util.SIGUtils;
import fr.ifn.commons.util.SynchronizedDateFormat;
import fr.ifn.eforest.common.business.Data;
import fr.ifn.eforest.common.business.Formats;
import fr.ifn.eforest.common.business.UnitTypes;
import fr.ifn.eforest.common.business.checks.CheckException;
import fr.ifn.eforest.common.database.metadata.FieldData;
import fr.ifn.eforest.common.database.metadata.MetadataDAO;
import fr.ifn.eforest.common.database.metadata.RangeData;
import fr.ifn.eforest.common.database.metadata.TableFieldData;
import fr.ifn.eforest.common.database.metadata.TableFormatData;
import fr.ifn.eforest.common.database.metadata.TableTreeData;
import fr.ifn.eforest.common.database.GenericDAO;
import fr.ifn.eforest.common.database.GenericData;
import static fr.ifn.eforest.common.business.checks.CheckCodes.*;
import static fr.ifn.eforest.common.business.UnitTypes.*;

/**
 * Class used to copy some data from one source to another using the metadata.
 */
public class GenericMapper {

	/**
	 * The logger used to log the errors or several information.
	 * 
	 * @see org.apache.log4j.Logger
	 */
	private final transient Logger logger = Logger.getLogger(this.getClass());

	/**
	 * The database accessors.
	 */
	private MetadataDAO metadataDAO = new MetadataDAO();
	private GenericDAO genericDAO = new GenericDAO();

	private List<TableFieldData> readColumns = new ArrayList<TableFieldData>();

	/**
	 * Check that a code value correspond to an existing code.
	 * 
	 * @param unit
	 *            the unit of the field to check
	 * @param fieldValue
	 *            the code to check
	 */
	protected void checkCode(String unit, String fieldValue) throws Exception {

		if (!metadataDAO.checkCode(unit, fieldValue)) {
			CheckException ce = new CheckException(INVALID_CODE_FIELD);
			throw ce;
		}
	}

	/**
	 * Check that a code value correspond to an existing range.
	 * 
	 * @param data
	 *            the data of the field to check
	 * @param fieldValue
	 *            the field value
	 * @return the range as a BigDecimal
	 */
	protected BigDecimal checkRange(FieldData fieldDescriptor, String fieldValue) throws Exception {

		RangeData range = metadataDAO.getRange(fieldDescriptor.getUnit());
		BigDecimal value = null;

		try {
			value = new BigDecimal(fieldValue);
		} catch (Exception e) {
			throw new CheckException(INVALID_TYPE_FIELD);
		}

		if (range == null) {
			CheckException ce = new CheckException(INVALID_RANGE_FIELD);
			ce.setExpectedValue("Range undefined for data : " + fieldDescriptor.getData());
			throw ce;
		} else if (value.compareTo(range.getMinValue()) < 0 || value.compareTo(range.getMaxValue()) > 0) {
			CheckException ce = new CheckException(INVALID_RANGE_FIELD);
			ce.setExpectedValue(range.getMinValue() + " < x < " + range.getMaxValue());
			throw ce;
		}

		return value;

	}

	/**
	 * Convert a String representing a coordinate to a Long.
	 * 
	 * @param coordinate
	 *            the coordinate to check
	 * @return the coordinate as a decimal value
	 */
	protected BigDecimal getCoordinate(String coordinate) throws Exception {
		return new BigDecimal(SIGUtils.degreesToDecimals(coordinate));
	}

	/**
	 * Check that a value is consistent with the expected type. And convert the strig value to the expected type
	 * 
	 * @param fieldDescriptor
	 *            the descriptor of the field
	 * @param fieldValue
	 *            the field as a String
	 * @return the field value casted to its correct type
	 */
	protected Object convertType(FieldData fieldDescriptor, String fieldValue) throws Exception {

		try {

			Object result = null;

			// Just in case, replace the comma with a dot
			String normalizedFieldValue = fieldValue.replace(",", ".");

			String type = fieldDescriptor.getType();

			if (normalizedFieldValue.equalsIgnoreCase("") && fieldDescriptor.getIsMandatory()) {
				throw new CheckException(MANDATORY_FIELD_MISSING);
			}

			if (type.equalsIgnoreCase(STRING)) {
				result = fieldValue;
			}

			if (type.equalsIgnoreCase(CODE) && !normalizedFieldValue.equalsIgnoreCase("")) {
				checkCode(fieldDescriptor.getUnit(), normalizedFieldValue);
				result = fieldValue;
			}

			if (type.equalsIgnoreCase(RANGE) && !normalizedFieldValue.equalsIgnoreCase("")) {
				result = checkRange(fieldDescriptor, normalizedFieldValue);
			}

			if (type.equalsIgnoreCase(NUMERIC)) {
				try {
					result = new BigDecimal(normalizedFieldValue);
				} catch (Exception e) {
					if (fieldDescriptor.getIsMandatory()) {
						throw new CheckException(INVALID_TYPE_FIELD);
					}
				}
			}

			if (type.equalsIgnoreCase(INTEGER)) {
				try {
					result = Integer.parseInt(normalizedFieldValue);
				} catch (Exception e) {
					if (fieldDescriptor.getIsMandatory()) {
						throw new CheckException(INVALID_TYPE_FIELD);
					}
				}
			}

			if (type.equalsIgnoreCase(COORDINATE)) {
				try {
					result = getCoordinate(normalizedFieldValue);
				} catch (Exception e) {
					if (fieldDescriptor.getIsMandatory()) {
						throw new CheckException(INVALID_TYPE_FIELD);
					}
				}
			}

			if (type.equalsIgnoreCase(DATE)) {
				try {
					SynchronizedDateFormat formatter = new SynchronizedDateFormat(fieldDescriptor.getMask());
					formatter.setLenient(false);
					result = formatter.parse(normalizedFieldValue);
				} catch (Exception e) {
					if (fieldDescriptor.getIsMandatory()) {
						CheckException ce = new CheckException(INVALID_DATE_FIELD);
						ce.setExpectedValue(fieldDescriptor.getMask());
						throw ce;
					}

				}
			}

			if (type.equalsIgnoreCase(BOOLEAN)) {
				try {
					if (normalizedFieldValue.trim().equals("1") || normalizedFieldValue.trim().equalsIgnoreCase("true")) {
						result = Boolean.TRUE;
					} else {
						result = Boolean.FALSE;
					}
				} catch (Exception e) {
					if (fieldDescriptor.getIsMandatory()) {
						throw new CheckException(INVALID_TYPE_FIELD);
					}
				}
			}

			return result;

		} catch (CheckException ce) {

			// Fill the data
			ce.setSourceData(fieldDescriptor.getData());
			throw ce;
		}
	}

	/**
	 * Check that a value is consistent with the expected mask (regular expression).
	 * 
	 * @param mask
	 *            the expected mask
	 * @param fieldValue
	 *            the value
	 */
	protected void checkMask(String mask, String fieldValue) throws CheckException {
		if (!Pattern.matches(mask, fieldValue)) {
			throw new CheckException(INVALID_FORMAT);
		}
	}

	/**
	 * Get a list of tables used with their ancestors, sorted from the leaf to the root.
	 * 
	 * @param schema
	 *            the schema in which we are working
	 * @param destinationTables
	 *            the list of tables we want to sort
	 * @return The list of tables used with their ancestors, sorted from the leaf to the root
	 */
	public LinkedList<String> getSortedAncestors(String schema, List<TableFormatData> destinationTables) throws Exception {

		LinkedList<String> sortedTablesList = new LinkedList<String>();
		Iterator<TableFormatData> destinationTablesIter = destinationTables.iterator();
		while (destinationTablesIter.hasNext()) {
			TableFormatData table = destinationTablesIter.next();
			String tableFormat = table.getFormat();

			// Get the list of ancestors of the table
			List<TableTreeData> ancestors = metadataDAO.getTablesTree(tableFormat, schema);

			// Check if one of the ancestors of the current table is already in the resulting list
			boolean found = false;
			Iterator<TableTreeData> ancestorsIter = ancestors.iterator();
			while (ancestorsIter.hasNext() && !found) {
				TableTreeData ancestor = ancestorsIter.next();
				int index = sortedTablesList.indexOf(ancestor.getParentTable());
				if (index != -1) {
					found = true;
					// We insert the table just before its ancestor
					List<String> beforeFormats = sortedTablesList.subList(0, index);
					List<String> afterFormats = sortedTablesList.subList(index, sortedTablesList.size());
					sortedTablesList = new LinkedList<String>();
					sortedTablesList.addAll(beforeFormats);
					sortedTablesList.add(table.getFormat());
					sortedTablesList.addAll(afterFormats);

				}
			}
			if (!found) {
				// If not found, we add the and all its ancestors 
				ancestorsIter = ancestors.iterator();
				while (ancestorsIter.hasNext()) {
					TableTreeData ancestor = ancestorsIter.next();

					if (!sortedTablesList.contains(ancestor.getTable())) {
						sortedTablesList.add(ancestor.getTable());
					}
				}
			}
		}

		return sortedTablesList;

	}

	/**
	 * Build the SQL select corresponding to the data to harmonize. Populate the list of colums to read
	 * 
	 * @param schema
	 *            the schema in which we are working
	 * @param sourceTables
	 *            the tables we want to read
	 * @param criteriaFields
	 *            some static values that can be used in the WHERE criteria
	 * @return The list of values
	 */
	private String buildSelect(String schema, LinkedList<String> sourceTables, TreeMap<String, GenericData> criteriaFields, String countryCode) throws Exception {

		String SELECT = "";
		String FROM = "";
		String WHERE = "";
		String ORDER = "";

		this.readColumns = new ArrayList<TableFieldData>();

		// Build the SQL Request
		Iterator<String> sourceTablesIter = sourceTables.descendingIterator();
		while (sourceTablesIter.hasNext()) {
			String sourceTableFormat = sourceTablesIter.next();

			// Get the descriptor of the table
			List<TableFieldData> sourceFields = metadataDAO.getTableFields(sourceTableFormat, countryCode);
			TableTreeData tableDescriptor = metadataDAO.getTableDescriptor(sourceTableFormat, schema);
			String tableName = metadataDAO.getTableName(sourceTableFormat);

			// Build the SELECT clause
			Iterator<TableFieldData> sourceFieldsIter = sourceFields.iterator();
			while (sourceFieldsIter.hasNext()) {
				TableFieldData sourceField = sourceFieldsIter.next();
				if (SELECT.equals("")) {
					SELECT += "SELECT ";
				} else {
					SELECT += ", ";
				}
				if (ORDER.equals("")) {
					ORDER += "ORDER BY ";
				} else {
					ORDER += ", ";
				}
				SELECT += sourceField.getTableName() + "." + sourceField.getColumnName() + " AS " + sourceField.getFormat() + "_" + sourceField.getFieldName() + " ";
				ORDER += sourceField.getTableName() + "." + sourceField.getColumnName();
				this.readColumns.add(sourceField);
			}

			// Build the FROM clause
			if (FROM.equals("")) {
				FROM += " FROM " + tableName;
			} else {
				FROM += " LEFT JOIN " + tableName + " ON (";
				Iterator<String> keyIter = tableDescriptor.getKeys().iterator();
				while (keyIter.hasNext()) {
					String key = keyIter.next();
					String parentTableName = metadataDAO.getTableName(tableDescriptor.getParentTable());
					FROM += tableName + "." + key + " = " + parentTableName + "." + key;
					if (keyIter.hasNext()) {
						FROM += " AND ";
					}
				}
				FROM += ")";
			}

			// Build the WHERE clause

			// When we find a source field that match one of our criteria, we add the clause
			sourceFieldsIter = sourceFields.iterator();
			while (sourceFieldsIter.hasNext()) {
				TableFieldData sourceField = sourceFieldsIter.next();

				if (criteriaFields.containsKey(sourceField.getFieldName()) &&
						!((sourceField.getFormat().equals(Formats.LOCATION_DATA) || sourceField.getFormat().equals(Formats.STRATA_DATA)) && sourceField.getFieldName().equals(Data.SUBMISSION_ID))) {
					if (WHERE.equals("")) {
						WHERE += " WHERE ";
					} else {
						WHERE += " AND ";
					}
					WHERE += sourceField.getTableName() + "." + sourceField.getColumnName() + " = ";

					// Change the criteria depending on the type of the value
					GenericData value = criteriaFields.get(sourceField.getFieldName());
					if (value.getType().equalsIgnoreCase(UnitTypes.INTEGER) || value.getType().equalsIgnoreCase(UnitTypes.NUMERIC)) {
						WHERE += value.getValue();
					} else {
						WHERE += "'" + value.getValue() + "'";
					}
				}
			}

		}

		return SELECT + FROM + WHERE + ORDER;
	}

	/**
	 * Read data from a list of source tables.<br>
	 * <br>
	 * Build a SELECT request with the JOIN of all the source tables. <br>
	 * TODO : Add the complementary tables. <br>
	 * TODO : Limit the read values to the values needed by the JRC Request.<br>
	 * 
	 * @param schema
	 *            the schema in which we are working
	 * @param sourceTables
	 *            the tables we want to read
	 * @param criteriaFields
	 *            some static values that can be used in the WHERE criteria
	 * @return The list of values
	 */
	public List<Map<String, GenericData>> readData(String schema, LinkedList<String> sourceTables, TreeMap<String, GenericData> criteriaFields, String countryCode, int page, int maxlines)
			throws Exception {

		String SQL = buildSelect(schema, sourceTables, criteriaFields, countryCode);

		// Calculate the limits
		String LIMIT = " LIMIT " + maxlines;
		String OFFSET = " OFFSET " + page * maxlines;
		SQL = SQL + LIMIT + OFFSET;

		logger.debug("************************************");
		logger.debug("SQL " + SQL);
		logger.debug("************************************");

		return genericDAO.readData(SQL, this.readColumns);
	}

	/**
	 * Count the number of lines to harmonize.
	 * 
	 * @param schema
	 *            the schema in which we are working
	 * @param sourceTables
	 *            the tables we want to read
	 * @param criteriaFields
	 *            some static values that can be used in the WHERE criteria
	 * @return The list of values
	 */
	public int countData(String schema, LinkedList<String> sourceTables, TreeMap<String, GenericData> criteriaFields, String countryCode) throws Exception {

		String SQL = buildSelect(schema, sourceTables, criteriaFields, countryCode);

		return genericDAO.countData(SQL);
	}
}
