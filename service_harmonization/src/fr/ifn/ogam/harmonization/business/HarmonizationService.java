package fr.ifn.ogam.harmonization.business;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

import org.apache.log4j.Logger;

import fr.ifn.ogam.common.business.AbstractService;
import fr.ifn.ogam.common.business.Data;
import fr.ifn.ogam.common.business.GenericMapper;
import fr.ifn.ogam.common.business.MappingTypes;
import fr.ifn.ogam.common.business.Schemas;
import fr.ifn.ogam.common.business.UnitTypes;
import fr.ifn.ogam.common.business.processing.ProcessingService;
import fr.ifn.ogam.common.business.processing.ProcessingStep;
import fr.ifn.ogam.common.database.GenericDAO;
import fr.ifn.ogam.common.database.GenericData;
import fr.ifn.ogam.common.database.metadata.MetadataDAO;
import fr.ifn.ogam.common.database.metadata.TableFieldData;
import fr.ifn.ogam.common.database.metadata.TableFormatData;
import fr.ifn.ogam.common.database.rawdata.SubmissionDAO;
import fr.ifn.ogam.common.database.rawdata.SubmissionData;
import fr.ifn.ogam.harmonization.database.harmonizeddata.HarmonisationProcessDAO;
import fr.ifn.ogam.harmonization.database.harmonizeddata.HarmonizedDataDAO;

/**
 * Service managing data harmonization.
 */
public class HarmonizationService extends AbstractService {

	/**
	 * The logger used to log the errors or several information.
	 * 
	 * @see org.apache.log4j.Logger
	 */
	private final transient Logger logger = Logger.getLogger(this.getClass());

	// The Data Access Objects
	private MetadataDAO metadataDAO = new MetadataDAO();
	private GenericDAO genericDAO = new GenericDAO();
	private SubmissionDAO submissionDAO = new SubmissionDAO();
	private HarmonizedDataDAO harmonizedDataDAO = new HarmonizedDataDAO();
	private HarmonisationProcessDAO harmonisationProcessDAO = new HarmonisationProcessDAO();

	// The generic mapper
	private GenericMapper genericMapper = new GenericMapper();

	// The post-processing service.
	private ProcessingService processingService = new ProcessingService();

	// Maximum number of lines of data in memory
	private static final int MAX_LINES = 5000;

	/**
	 * Constructor.
	 */
	public HarmonizationService() {
		super();
	}

	/**
	 * Constructor.
	 * 
	 * @param thread
	 *            The thread that launched the service
	 */
	public HarmonizationService(HarmonizationServiceThread thread) {
		super(thread);
	}

	/**
	 * Get the status of the last harmonization process for this request and country.
	 * 
	 * @param datasetId
	 *            The dataset identifier
	 * @param countryCode
	 *            The country code
	 * @return the status of the process
	 */
	public String getHarmonizationStatus(String datasetId, String countryCode) throws Exception {

		return harmonisationProcessDAO.getHarmonizationProcessStatus(datasetId, countryCode);

	}

	/**
	 * Harmonize Data.
	 * 
	 * @param datasetId
	 *            The dataset identifier
	 * @param providerId
	 *            The country code
	 * @return the process identifier
	 */
	public Integer harmonizeData(String datasetId, String providerId) {

		Integer processId = null;

		try {

			logger.debug("harmonize data for " + datasetId + " and provider " + providerId);

			// Initialize the process
			processId = harmonisationProcessDAO.newHarmonizationProcess(datasetId, providerId, HarmonizationStatus.RUNNING);

			// Prepare some static data
			GenericData datasetIdData = new GenericData();
			datasetIdData.setColumnName(Data.DATASET_ID);
			datasetIdData.setFormat(Data.DATASET_ID);
			datasetIdData.setType(UnitTypes.STRING);
			datasetIdData.setValue(datasetId);

			GenericData providerIdData = new GenericData();
			providerIdData.setColumnName(Data.PROVIDER_ID);
			providerIdData.setFormat(Data.PROVIDER_ID);
			providerIdData.setType(UnitTypes.STRING);
			providerIdData.setValue(providerId);

			// Identify the submission we want to include
			List<SubmissionData> listSubmissions = submissionDAO.getActiveSubmissions(providerId, datasetId);

			//
			// Prepare the metadata that we will use
			//
			List<TableFormatData> harmonizedTables = new ArrayList<TableFormatData>(); // The list of destination harmonized tables concerned by the dataset
			// Set<TableFieldData> harmonizedFields = new HashSet<TableFieldData>(); // The list of destination fields concerned by the dataset

			// The list of source raw tables concerned by the dataset
			List<String> rawTables = metadataDAO.getDatasetRawTables(datasetId);

			// Get the harmonized tables corresponding to the raw_data tables
			Iterator<String> rawTablesIter = rawTables.iterator();
			while (rawTablesIter.hasNext()) {
				String rawTable = rawTablesIter.next();

				// Get the list of harmonized tables for each raw table
				harmonizedTables.addAll(metadataDAO.getFormatMapping(rawTable, MappingTypes.HARMONIZATION_MAPPING).values());

			}

			// Sort the tables in the right order (leaf first)
			LinkedList<String> harmonizedTablesFormatSortedList = genericMapper.getSortedTables(Schemas.HARMONIZED_DATA, harmonizedTables);
			logger.debug("harmonizedTablesFormatSortedList : " + harmonizedTablesFormatSortedList);

			//
			// Delete old data
			// from the harmonized tables (starting from the leaf tables)
			//
			Iterator<String> tablesIter = harmonizedTablesFormatSortedList.iterator();
			while (tablesIter.hasNext()) {
				String tableFormat = tablesIter.next();
				TableFormatData tableFormatData = metadataDAO.getTableFormat(tableFormat);
				logger.debug("Removing previous data from table : " + tableFormatData.getTableName());
				if (thread != null) {
					thread.updateInfo("Removing " + tableFormatData.getTableName() + " data", 0, 0);
				}
				harmonizedDataDAO.deleteHarmonizedData(tableFormatData.getTableName(), providerId);
			}

			// For each destination table (starting from the root in the hierarchy to the leaf tables)
			Iterator<String> destTableIter = harmonizedTablesFormatSortedList.descendingIterator();
			while (destTableIter.hasNext()) {
				String destTableFormat = destTableIter.next();

				logger.debug("Preparing to insert data in table : " + destTableFormat);

				// Get the physical name of the destination table
				TableFormatData destTableFormatData = metadataDAO.getTableFormat(destTableFormat);

				// Get the list of destination fields for this table and this dataset
				Map<String, TableFieldData> destFields = metadataDAO.getDatasetHarmonizedFields(destTableFormat);

				// Prepare some static criteria values
				TreeMap<String, GenericData> criteriaFields = new TreeMap<String, GenericData>();
				criteriaFields.put(Data.DATASET_ID, datasetIdData);

				boolean finished = false;
				int count = 0;
				int page = 0;
				int total = countData(destTableFormat, criteriaFields, providerId);
				while (!finished) {

					//
					// Build a giant SELECT from the raw tables
					//
					List<Map<String, GenericData>> sourceData = readSourceData(destTableFormat, criteriaFields, providerId, page, MAX_LINES);

					Iterator<Map<String, GenericData>> sourceIter = sourceData.iterator();
					while (sourceIter.hasNext()) {

						// Get the source data from the source table(s)
						Map<String, GenericData> sourceFields = sourceIter.next();
						if (thread != null) {
							thread.updateInfo("Inserting " + destTableFormatData.getTableName() + " data", count, total);
						}

						// TODO : Read the complementary data corresponding to this line

						// Add the static data for the destination table
						sourceFields.put(Data.DATASET_ID, datasetIdData);
						sourceFields.put(Data.PROVIDER_ID, providerIdData);

						// Insert the record data in the destination table
						genericDAO.insertData(Schemas.HARMONIZED_DATA, destTableFormatData.getTableName(), destFields, sourceFields);
						count++;
					}

					// Check we have read everything
					if (count == total) {
						finished = true;
					}

					page++;

				}

			}

			// Launch post-processing
			SubmissionData submission = new SubmissionData();
			submission.setDatasetId(datasetId);
			submission.setProviderId(providerId);
			processingService.processData(ProcessingStep.HARMONIZATION, submission, this.thread);

			// Log the process in the log table
			harmonisationProcessDAO.updateHarmonizationProcessStatus(processId, HarmonizationStatus.OK);
			harmonisationProcessDAO.updateHarmonizationProcessSubmissions(processId, listSubmissions);

			logger.debug("harmonization done");

		} catch (Exception e) {
			logger.error("Error during harmonization process", e);
			if (processId != null) {
				try {
					harmonisationProcessDAO.updateHarmonizationProcessStatus(processId, HarmonizationStatus.ERROR);
				} catch (Exception ignored) {
					logger.error("Error while updating process status", e);
				}
			}
		}

		return processId;

	}

	/**
	 * Read the raw data that will be needed as a source for the copy into the harmonization tables.
	 * 
	 * @param destTableFormat
	 *            the destination table (in the harmonized schema)
	 * @param criteriaFields
	 *            the definition of the fields that are used
	 * @param countryCode
	 *            the country code
	 * @param page
	 *            the number of pages of data
	 * @param maxlines
	 *            the number of lines per page of data
	 * @return The list of raw data
	 */
	private List<Map<String, GenericData>> readSourceData(String destTableFormat, TreeMap<String, GenericData> criteriaFields, String countryCode, int page,
			int maxlines) throws Exception {

		logger.debug("harmonize data for " + destTableFormat);

		// Get the list of source tables that map to this destination table
		List<TableFormatData> sourceTables = new ArrayList<TableFormatData>();
		sourceTables.addAll(metadataDAO.getSourceTablesMapping(destTableFormat, MappingTypes.HARMONIZATION_MAPPING).values());

		// Get all the ancestors of these tables, sorted in the right order
		LinkedList<String> sourceTablesSortedList = genericMapper.getSortedAncestors(Schemas.RAW_DATA, sourceTables);

		// Build a big JOIN SELECT and read the data
		List<Map<String, GenericData>> result = genericMapper.readData(Schemas.RAW_DATA, sourceTablesSortedList, criteriaFields, countryCode, page, maxlines);

		return result;

	}

	/**
	 * Count the lines of raw data.
	 * 
	 * @param destTableFormat
	 *            the destination table (in the harmonized schema)
	 * @param criteriaFields
	 *            the definition of the fields that are used
	 * @param countryCode
	 *            the country code
	 * @return The list of raw data
	 */
	private int countData(String destTableFormat, TreeMap<String, GenericData> criteriaFields, String countryCode) throws Exception {

		logger.debug("harmonize data for " + destTableFormat);

		// Get the list of source tables that map to this destination table
		List<TableFormatData> sourceTables = new ArrayList<TableFormatData>();
		sourceTables.addAll(metadataDAO.getSourceTablesMapping(destTableFormat, MappingTypes.HARMONIZATION_MAPPING).values());

		// Get all the ancestors of these tables, sorted in the right order
		LinkedList<String> sourceTablesSortedList = genericMapper.getSortedAncestors(Schemas.RAW_DATA, sourceTables);

		// Build a big JOIN SELECT and read the data
		return genericMapper.countData(Schemas.RAW_DATA, sourceTablesSortedList, criteriaFields, countryCode);

	}
}
