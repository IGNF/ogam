/**
 * Licensed under EUPL v1.1 (see http://ec.europa.eu/idabc/eupl).
 * 
 * © European Union, 2008-2012
 *
 * Reuse is authorised, provided the source is acknowledged. The reuse policy of the European Commission is implemented by a Decision of 12 December 2011.
 *
 * The general principle of reuse can be subject to conditions which may be specified in individual copyright notices. 
 * Therefore users are advised to refer to the copyright notices of the individual websites maintained under Europa and of the individual documents. 
 * Reuse is not applicable to documents subject to intellectual property rights of third parties.
 */
package fr.ifn.ogam.integration.business;

import static fr.ifn.ogam.common.business.UnitTypes.DATE;
import static fr.ifn.ogam.common.business.UnitTypes.TIME;
import static fr.ifn.ogam.common.business.checks.CheckCodes.NO_MAPPING;
import static fr.ifn.ogam.common.business.checks.CheckCodes.UNEXPECTED_SQL_ERROR;
import static fr.ifn.ogam.common.business.checks.CheckCodes.WRONG_FIELD_NUMBER;

import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeSet;

import org.apache.log4j.Logger;

import fr.ifn.ogam.common.business.AbstractThread;
import fr.ifn.ogam.common.business.Data;
import fr.ifn.ogam.common.business.GenericMapper;
import fr.ifn.ogam.common.business.MappingTypes;
import fr.ifn.ogam.common.business.Schemas;
import fr.ifn.ogam.common.business.UnitTypes;
import fr.ifn.ogam.common.business.checks.CheckException;
import fr.ifn.ogam.common.database.GenericDAO;
import fr.ifn.ogam.common.database.GenericData;
import fr.ifn.ogam.common.database.metadata.FileFieldData;
import fr.ifn.ogam.common.database.metadata.MetadataDAO;
import fr.ifn.ogam.common.database.metadata.TableFieldData;
import fr.ifn.ogam.common.database.metadata.TableFormatData;
import fr.ifn.ogam.common.database.rawdata.SubmissionDAO;
import fr.ifn.ogam.common.util.CSVFile;
import fr.ifn.ogam.common.util.InconsistentNumberOfColumns;
import fr.ifn.ogam.integration.database.rawdata.CheckErrorDAO;

/**
 * This service manages the integration process.
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
	private SubmissionDAO submissionDAO = new SubmissionDAO();

	/**
	 * Event notifier
	 */
	private IntegrationEventNotifier eventNotifier = new IntegrationEventNotifier();

	/**
	 * Insert a dataset coming from a CSV in database.
	 * 
	 * @param submissionId
	 *            the submission identifier
	 * @param userSrid
	 *            the srid given by the user
	 * @param filePath
	 *            the source data file path
	 * @param sourceFormat
	 *            the source format identifier
	 * @param requestParameters
	 *            the static values (PROVIDER_ID, DATASET_ID, SUBMISSION_ID, ...)
	 * @param thread
	 *            the thread that is running the process (optionnal, this is too keep it informed of the progress)
	 * @return the status of the update
	 */
	public boolean insertData(Integer submissionId, Integer userSrid, String filePath, String sourceFormat, String fileType,
			Map<String, String> requestParameters, AbstractThread thread) throws Exception {

		logger.debug("insertData");
		boolean isInsertValid = true;
		CSVFile csvFile = null;

		try {

			// First get the description of the content of the CSV file
			List<FileFieldData> sourceFieldDescriptors = metadataDAO.getFileFields(sourceFormat);

			// Parse the CSV file and check the number of lines/columns

			try {
				csvFile = new CSVFile(filePath);
			} catch (InconsistentNumberOfColumns ince) {

				// The file number of columns changes from line to line
				CheckException e = new CheckException(WRONG_FIELD_NUMBER);
				e.setSourceFormat(sourceFormat);
				e.setSubmissionId(submissionId);
				throw e;
			}

			// Check that the file is not empty
			if (csvFile.getRowsCount() == 0) {
				return true;
			}

			// check that the file as the expected number of columns
			if (csvFile.getColsCount() != sourceFieldDescriptors.size()) {
				CheckException e = new CheckException(WRONG_FIELD_NUMBER);
				e.setSourceFormat(sourceFormat);
				e.setSubmissionId(submissionId);
				throw e;
			}

			// Store the name and path of the file
			submissionDAO.addSubmissionFile(submissionId, fileType, filePath, csvFile.getRowsCount());

			// Get the destination formats
			Map<String, TableFormatData> destFormatsMap = metadataDAO.getFormatMapping(sourceFormat, MappingTypes.FILE_MAPPING);

			// Prepare the storage of the description of the destination tables
			Map<String, Map<String, TableFieldData>> tableFieldsMap = new HashMap<String, Map<String, TableFieldData>>();

			// Get the description of the destination tables
			Iterator<TableFormatData> destFormatIter = destFormatsMap.values().iterator();
			while (destFormatIter.hasNext()) {
				TableFormatData destFormat = destFormatIter.next();

				// Get the list of fields for the table
				// TODO : Filter on the dataset fields only (+ common fields like provider_id)
				Map<String, TableFieldData> destFieldDescriptors = metadataDAO.getTableFields(destFormat.getFormat());

				// Store in a map
				tableFieldsMap.put(destFormat.getFormat(), destFieldDescriptors);
			}

			// Get the field mapping
			// We create a map, giving for each field name a descriptor with the name of the destination table and column.
			Map<String, TableFieldData> mappedFieldDescriptors = metadataDAO.getFileToTableMapping(sourceFormat);

			// Prepare the common destination fields for each table (indexed by destination format)
			Map<String, GenericData> commonFieldsMap = new HashMap<String, GenericData>();

			// We go thru the expected destination fields of each table
			destFormatIter = destFormatsMap.values().iterator();
			while (destFormatIter.hasNext()) {
				TableFormatData destFormat = destFormatIter.next();

				Map<String, TableFieldData> destFieldDescriptors = tableFieldsMap.get(destFormat.getFormat());

				Iterator<String> destDescriptorIter = destFieldDescriptors.keySet().iterator();
				while (destDescriptorIter.hasNext()) {
					String sourceData = destDescriptorIter.next();
					TableFieldData destFieldDescriptor = destFieldDescriptors.get(sourceData);

					// If the field is not in the mapping
					TableFieldData destFound = mappedFieldDescriptors.get(sourceData);
					if (destFound == null) {

						// We look in the request parameters for the missing field
						String value = requestParameters.get(destFieldDescriptor.getData());
						if (value != null) {

							// We create the metadata for a virtual source file
							FileFieldData fieldData = new FileFieldData();
							fieldData.setData(destFieldDescriptor.getData());
							fieldData.setFormat(destFieldDescriptor.getFormat());
							fieldData.setType(destFieldDescriptor.getType());
							fieldData.setSubtype(destFieldDescriptor.getSubtype());
							fieldData.setUnit(destFieldDescriptor.getUnit());
							fieldData.setIsMandatory(true);

							// We add it to the common fields
							GenericData commonField = new GenericData();
							commonField.setFormat(destFieldDescriptor.getData());
							commonField.setColumnName(destFieldDescriptor.getColumnName());
							commonField.setType(fieldData.getType());
							commonField.setValue(convertType(fieldData, value));
							commonFieldsMap.put(commonField.getFormat(), commonField);
						}
					}
				}

			}

			// Travel the content of the csv file line by line
			int row = 1;
			String[] csvLine = csvFile.readNextLine();
			while (csvLine != null) {

				try {

					if (thread != null) {
						thread.updateInfo("Inserting " + sourceFormat + " data", row, csvFile.getRowsCount());

						if (thread.isCancelled()) {
							return false; // don't finish the job
						}
					}

					// List of tables where to insert data
					Set<String> tablesContent = new TreeSet<String>();

					// Store each column in the destination table container
					for (int col = 0; col < csvFile.getColsCount(); col++) {

						// Get the value to insert
						String value = csvLine[col];

						// The value once transformed into an Object
						Object valueObj = null;

						// Get the field descriptor
						FileFieldData sourceFieldDescriptor = sourceFieldDescriptors.get(col);

						// Check the mask if available and the variable is not a date (date format is tested with a date format)
						if (sourceFieldDescriptor.getMask() != null && !sourceFieldDescriptor.getType().equalsIgnoreCase(DATE)
								&& !sourceFieldDescriptor.getType().equalsIgnoreCase(TIME)) {
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
						commonFieldsMap.put(mappedFieldDescriptor.getData(), data);

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
							String id = genericDAO.insertData(Schemas.RAW_DATA, format, tableName, tableFieldsMap.get(format), commonFieldsMap, userSrid);

							// Notify the event listeners that a line has been inserted
							eventNotifier.afterLineInsertion(submissionId, format, tableName, commonFieldsMap, id);

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

				csvLine = csvFile.readNextLine();
				row++;

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

		} finally {
			if (csvFile != null) {
				csvFile.close();
			}
		}

		return isInsertValid;

	}

}
