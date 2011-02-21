package fr.ifn.eforest.integration.business;

import static fr.ifn.eforest.common.business.UnitTypes.*;
import static fr.ifn.eforest.common.business.checks.CheckCodes.*;

import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeSet;

import org.apache.log4j.Logger;

import fr.ifn.eforest.common.util.CSVFile;
import fr.ifn.eforest.common.util.LineInfo;
import fr.ifn.eforest.common.business.AbstractThread;
import fr.ifn.eforest.common.business.Data;
import fr.ifn.eforest.common.business.GenericMapper;
import fr.ifn.eforest.common.business.MappingTypes;
import fr.ifn.eforest.common.business.Schemas;
import fr.ifn.eforest.common.business.UnitTypes;
import fr.ifn.eforest.common.business.checks.CheckException;
import fr.ifn.eforest.common.database.GenericDAO;
import fr.ifn.eforest.common.database.GenericData;
import fr.ifn.eforest.common.database.metadata.FieldData;
import fr.ifn.eforest.common.database.metadata.MetadataDAO;
import fr.ifn.eforest.common.database.metadata.TableFieldData;
import fr.ifn.eforest.common.database.metadata.TableFormatData;
import fr.ifn.eforest.integration.database.rawdata.CheckErrorDAO;

/**
 * This service manages the intergration process.
 */
public class IntegrationService extends GenericMapper {

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
	private CheckErrorDAO checkErrorDAO = new CheckErrorDAO();

	/**
	 * Insert a dataset coming from a CSV in database.
	 * 
	 * @param submissionId
	 *            the submission identifier
	 * @param csvFile
	 *            the source data file
	 * @param sourceFormat
	 *            the source format identifier
	 * @param requestParameters
	 *            the static values (COUNTRY_CODE, REQUEST_ID, ...)
	 * @param thread
	 *            the thread that is running the process (optionnal, this is too keep it informed of the progress)
	 */
	public boolean insertData(Integer submissionId, CSVFile csvFile, String sourceFormat, Map<String, String> requestParameters, AbstractThread thread)
			throws Exception {

		logger.debug("insertData");
		boolean isInsertValid = true;
		try {

			// First get the description of the content of the CSV file
			List<FieldData> sourceFieldDescriptors = metadataDAO.getFileFields(sourceFormat);

			// Check that the content of the file match the description
			if (csvFile.getRowsCount() == 0) {
				CheckException e = new CheckException(EMPTY_FILE);
				e.setSourceFormat(sourceFormat);
				e.setSubmissionId(submissionId);
				throw e;
			}

			// Get the lines where the number of columns is more than expected
			List<LineInfo> wrongColsCounts = csvFile.getWrongColumnNumberLines(sourceFieldDescriptors.size());
			if (wrongColsCounts.size() > 0) {
				if (csvFile.getRowsCount() == wrongColsCounts.size()) {
					// All the lignes have a wrong number of column
					CheckException e = new CheckException(WRONG_FIELD_NUMBER);
					e.setSourceFormat(sourceFormat);
					e.setSubmissionId(submissionId);
					LineInfo wrongColsCountsRows = wrongColsCounts.get(0);
					e.setLineNumber(wrongColsCountsRows.getLineNumber());
					e.setFoundValue("" + wrongColsCountsRows.getColNumber());
					e.setExpectedValue("" + sourceFieldDescriptors.size());
					throw e;
				} else {
					// Few lignes have a wrong number of column
					for (int i = 0; i < wrongColsCounts.size(); i++) {
						CheckException e = new CheckException(WRONG_FIELD_NUMBER);
						e.setSourceFormat(sourceFormat);
						e.setSubmissionId(submissionId);
						LineInfo wrongColsCountsRows = wrongColsCounts.get(i);
						e.setLineNumber(wrongColsCountsRows.getLineNumber());
						e.setFoundValue("" + wrongColsCountsRows.getColNumber());
						e.setExpectedValue("" + sourceFieldDescriptors.size());
						if (i != wrongColsCounts.size() - 1) {
							e.setSourceFormat(sourceFormat);
							e.setSubmissionId(submissionId);
							logger.error("CheckException", e);
							// Store the check exception in database
							checkErrorDAO.createCheckError(e);
						} else {
							throw e;
						}

					}
				}
			}

			// Get the destination formats
			Map<String, TableFormatData> destFormatsMap = metadataDAO.getFormatMapping(sourceFormat, MappingTypes.FILE_MAPPING);

			// Prepare the storage of the description of the destination tables
			Map<String, List<TableFieldData>> tableFieldsMap = new HashMap<String, List<TableFieldData>>();

			// Get the description of the destination tables
			Iterator<TableFormatData> destFormatIter = destFormatsMap.values().iterator();
			while (destFormatIter.hasNext()) {
				TableFormatData destFormat = destFormatIter.next();

				// Get the list of fiels for the table
				List<TableFieldData> destFieldDescriptors = metadataDAO.getTableFields(destFormat.getFormat());

				// Store in a map
				tableFieldsMap.put(destFormat.getFormat(), destFieldDescriptors);
			}

			// Get the field mapping
			// We create a map, giving for each field name a descriptor with the name of the destination table and column.
			Map<String, TableFieldData> mappedFieldDescriptors = metadataDAO.getFieldMapping(sourceFormat, MappingTypes.FILE_MAPPING);

			// Prepare the common destination fields for each table (indexed by destination format)
			Map<String, GenericData> commonFieldsMap = new HashMap<String, GenericData>();

			// We go thru the expected destination fields of each table
			destFormatIter = destFormatsMap.values().iterator();
			while (destFormatIter.hasNext()) {
				TableFormatData destFormat = destFormatIter.next();

				List<TableFieldData> destFieldDescriptors = tableFieldsMap.get(destFormat.getFormat());

				Iterator<TableFieldData> destDescriptorIter = destFieldDescriptors.iterator();
				while (destDescriptorIter.hasNext()) {
					TableFieldData destFieldDescriptor = destDescriptorIter.next();

					// If the field is not in the mapping
					TableFieldData destFound = mappedFieldDescriptors.get(destFieldDescriptor.getFieldName());
					if (destFound == null) {

						// We look in the request parameters for the missing field
						String value = requestParameters.get(destFieldDescriptor.getFieldName());
						if (value != null) {

							// We get the metadata for the fieldFieldData
							FieldData fieldData = metadataDAO.getFileField(destFieldDescriptor.getFieldName());

							// We add it to the common fields
							GenericData commonField = new GenericData();
							commonField.setFormat(destFieldDescriptor.getFieldName());
							commonField.setColumnName(destFieldDescriptor.getColumnName());
							commonField.setType(fieldData.getType());
							commonField.setValue(convertType(fieldData, value));
							commonFieldsMap.put(commonField.getFormat(), commonField);
						}
					}
				}

			}

			// Travel the content of the csv file line by line
			for (int row = 0; row < csvFile.getRowsCount(); row++) {

				try {

					if (thread != null) {
						thread.updateInfo("Inserting " + sourceFormat + " data", row, csvFile.getRowsCount());
					}

					// List of tables where to insert data
					Set<String> tablesContent = new TreeSet<String>();

					// Store each column in the destination table container
					for (int col = 0; col < csvFile.getColsCount(); col++) {

						// Get the value to insert
						String value = csvFile.getData(row, col);

						// The value once transformed into an Object
						Object valueObj = null;

						// Get the field descriptor
						FieldData sourceFieldDescriptor = sourceFieldDescriptors.get(col);

						// Check the mask if available and the variable is not a date (date format is tested with a date format)
						if (sourceFieldDescriptor.getMask() != null && !sourceFieldDescriptor.getType().equalsIgnoreCase(DATE)) {
							try {
								checkMask(sourceFieldDescriptor.getMask(), value);
							} catch (CheckException e) {
								// Complete the description of the problem
								e.setSourceFormat(sourceFormat);
								e.setExpectedValue(sourceFieldDescriptor.getMask());
								e.setFoundValue(value);
								e.setSourceData(sourceFieldDescriptor.getData());
								e.setLineNumber(row + 1);
								e.setSubmissionId(submissionId);
								throw e;
							}
						}

						// Check and convert the type
						try {
							valueObj = convertType(sourceFieldDescriptor, value);
						} catch (CheckException e) {
							// Complete the description of the problem
							e.setSourceFormat(sourceFormat);
							e.setSourceData(sourceFieldDescriptor.getData());
							if (e.getExpectedValue() == null) {
								e.setExpectedValue(sourceFieldDescriptor.getType());
							}
							e.setFoundValue(value);
							e.setLineNumber(row + 1);
							e.setSubmissionId(submissionId);
							throw e;
						}

						// Get the mapped column destination
						TableFieldData mappedFieldDescriptor = mappedFieldDescriptors.get(sourceFieldDescriptor.getData());

						if (mappedFieldDescriptor == null) {
							CheckException e = new CheckException(NO_MAPPING);
							e.setSourceFormat(sourceFormat);
							e.setFoundValue(sourceFieldDescriptor.getData());
							e.setLineNumber(row + 1);
							e.setSubmissionId(submissionId);
							throw e;
						}

						// Create the descriptor of the data
						GenericData data = new GenericData();
						data.setFormat(mappedFieldDescriptor.getFormat());
						data.setColumnName(mappedFieldDescriptor.getColumnName());
						data.setType(sourceFieldDescriptor.getType());
						data.setValue(valueObj);

						// Store the descriptor in the common list
						commonFieldsMap.put(sourceFieldDescriptor.getData(), data);

						// Store the name of the table
						tablesContent.add(mappedFieldDescriptor.getFormat());

					}

					// Insert the content of the line in the destination tables
					Iterator<String> tablesIter = tablesContent.iterator();
					while (tablesIter.hasNext()) {
						String format = tablesIter.next();

						// Get the destination table name
						TableFormatData destTable = destFormatsMap.get(format);
						String tableName = destTable.getTableName();

						try {

							// Increment the line number
							GenericData lineNumber = new GenericData();
							lineNumber.setColumnName(Data.LINE_NUMBER);
							lineNumber.setType(UnitTypes.INTEGER);
							lineNumber.setFormat(Data.LINE_NUMBER);
							lineNumber.setValue(row + 1);
							commonFieldsMap.put(Data.LINE_NUMBER, lineNumber);

							// Insert a list of values in the destination table
							genericDAO.insertData(Schemas.RAW_DATA, tableName, tableFieldsMap.get(format), commonFieldsMap);
						} catch (CheckException e) {
							// Complete the description of the problem
							e.setSourceFormat(sourceFormat);
							e.setLineNumber(row + 1);
							e.setSubmissionId(submissionId);
							throw e;
						}

					}

				} catch (CheckException ce) {
					// Line-Level catch of checked exceptions
					isInsertValid = false;
					logger.error("CheckException", ce);

					// We store the check exception in database and continue to the next line
					checkErrorDAO.createCheckError(ce);

				}

			}
		} catch (CheckException ce) {
			// File-Level catch of checked exceptions
			isInsertValid = false;
			ce.setSourceFormat(sourceFormat);
			ce.setSubmissionId(submissionId);
			logger.error("CheckException", ce);

			// Store the check exception in database
			checkErrorDAO.createCheckError(ce);

		} catch (Exception e) {
			// File-Level catch of unexpected exceptions
			isInsertValid = false;
			CheckException ce = new CheckException(UNEXPECTED_SQL_ERROR);
			ce.setSourceFormat(sourceFormat);
			ce.setSubmissionId(submissionId);
			logger.error("Unexpected Exception", e);

			// Store the check exception in database
			checkErrorDAO.createCheckError(ce);

		}

		return isInsertValid;

	}

}
