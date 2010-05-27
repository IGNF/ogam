package fr.ifn.eforest.integration.business.submissions.datasubmission;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import org.apache.log4j.Logger;

import fr.ifn.commons.csv.CSVFile;
import fr.ifn.eforest.common.business.AbstractService;
import fr.ifn.eforest.common.business.Formats;
import fr.ifn.eforest.common.business.MappingTypes;
import fr.ifn.eforest.common.business.Schemas;
import fr.ifn.eforest.common.database.metadata.MetadataDAO;
import fr.ifn.eforest.common.database.metadata.RequestFormatData;
import fr.ifn.eforest.common.database.metadata.TableFormatData;
import fr.ifn.eforest.common.database.GenericDAO;
import fr.ifn.eforest.integration.database.rawdata.DataSubmissionDAO;
import fr.ifn.eforest.integration.database.rawdata.DataSubmissionData;
import fr.ifn.eforest.integration.database.rawdata.SubmissionDAO;
import fr.ifn.eforest.integration.database.rawdata.SubmissionData;
import fr.ifn.eforest.integration.business.IntegrationService;
import fr.ifn.eforest.integration.business.submissions.SubmissionStatus;
import fr.ifn.eforest.integration.business.submissions.SubmissionStep;
import fr.ifn.eforest.integration.business.submissions.SubmissionTypes;

/**
 * Service managing plot and tree data.
 */
public class DataService extends AbstractService {

	/**
	 * The logger used to log the errors or several information.
	 * 
	 * @see org.apache.log4j.Logger
	 */
	private final transient Logger logger = Logger.getLogger(this.getClass());

	/**
	 * The Data Access Objects.
	 */
	private SubmissionDAO submissionDAO = new SubmissionDAO();
	private MetadataDAO metadataDAO = new MetadataDAO();
	private GenericDAO genericDAO = new GenericDAO();
	private DataSubmissionDAO dataSubmissionDAO = new DataSubmissionDAO();

	/**
	 * The generic mapper.
	 */
	private IntegrationService integrationService = new IntegrationService();

	/**
	 * Constructor.
	 */
	public DataService() {
		super();
	}

	/**
	 * Constructor.
	 * 
	 * @param thread
	 *            The thread that launched the service
	 */
	public DataService(DataServiceThread thread) {
		super(thread);
	}

	/**
	 * Get a submission.
	 * 
	 * @param submissionId
	 *            the identifier of the submission
	 * @return the data submission object
	 */
	public SubmissionData getSubmission(Integer submissionId) throws Exception {

		return submissionDAO.getSubmission(submissionId);

	}

	/**
	 * Create a new data submission.
	 * 
	 * @param codeCountry
	 *            the code country
	 * @param datasetId
	 *            the dataset identifier
	 * @param userLogin
	 *            the login of the user who creates the submission
	 * @param comment
	 *            a comment
	 * @return the identifier of the created submission
	 */
	public Integer newSubmission(String codeCountry, String datasetId, String userLogin, String comment) throws Exception {

		// Create the submission
		Integer submissionId = submissionDAO.newSubmission(SubmissionTypes.DATA, codeCountry);

		// Enter the data submission information
		dataSubmissionDAO.newDataSubmission(submissionId, datasetId, userLogin, comment);

		logger.debug("New data submission created : " + submissionId);

		return submissionId;

	}

	/**
	 * Validate a data submission.
	 * 
	 * @param submissionId
	 *            the identifier of the submission
	 */
	public void validateSubmission(Integer submissionId) throws Exception {

		// Update the status of the submission
		submissionDAO.validateSubmission(submissionId);

		logger.debug("Data submission validated : " + submissionId);

	}

	/**
	 * Cancel a data submission.
	 * 
	 * @param submissionId
	 *            the identifier of the submission
	 */
	public void cancelSubmission(Integer submissionId) throws Exception {

		// Check that the submissionId is of the good type
		SubmissionData submissionData = submissionDAO.getSubmission(submissionId);
		if (!submissionData.getType().equalsIgnoreCase(SubmissionTypes.DATA)) {
			throw new Exception("The submission number " + submissionId + " should be of type " + SubmissionTypes.DATA);
		}

		// Get some info about the data submission
		DataSubmissionData dataSubmission = dataSubmissionDAO.getSubmission(submissionId);

		// Get the list of requested files concerned by the submission
		List<RequestFormatData> requestedFiles = metadataDAO.getRequestFiles(dataSubmission.getRequestId());

		// Get the list of destination tables concerned by the submission 
		List<TableFormatData> destinationTables = new ArrayList<TableFormatData>();
		Iterator<RequestFormatData> requestedFilesIter = requestedFiles.iterator();
		while (requestedFilesIter.hasNext()) {
			RequestFormatData requestedFile = requestedFilesIter.next();
			destinationTables.addAll(metadataDAO.getFormatMapping(requestedFile.getFormat(), MappingTypes.FILE_MAPPING).values());
		}

		// Get the tables with their ancestors sorted in the right order
		List<String> toDeleteFormats = integrationService.getSortedAncestors(Schemas.RAW_DATA, destinationTables);
		// Exclude the location table from the list
		toDeleteFormats.remove(Formats.LOCATION_DATA);

		// Delete data for the raw_data tables in the right order
		Iterator<String> tableIter = toDeleteFormats.iterator();
		while (tableIter.hasNext()) {
			String tableFormat = tableIter.next();
			String tableName = metadataDAO.getTableName(tableFormat);
			genericDAO.deleteRawData(tableName, submissionId);
		}

		// Update the status of the submission
		submissionDAO.updateSubmissionStep(submissionId, SubmissionStep.SUBMISSION_CANCELLED);

		logger.debug("Submission " + submissionId + " cancelled");

	}

	/**
	 * Submit new data.
	 * 
	 * @param submissionId
	 *            the identifier of the submission
	 * @param countryCode
	 *            the country code
	 * @param requestParameters
	 *            the map of static parameter values (the upload path, ...)
	 * @return the created submission object
	 */
	public SubmissionData submitData(Integer submissionId, String countryCode, Map<String, String> requestParameters) {

		try {

			boolean isSubmitValid = true;

			submissionDAO.updateSubmissionStatus(submissionId, SubmissionStep.DATA_INSERTED, SubmissionStatus.RUNNING);

			// Check the status of the submission
			SubmissionData submission = submissionDAO.getSubmission(submissionId);
			if (submission == null) {
				throw new Exception("The submission number " + submissionId + " doest not exist");
			}
			if (!submission.getType().equalsIgnoreCase(SubmissionTypes.DATA)) {
				throw new Exception("The submission number " + submissionId + " is not a data submission");
			}

			// Get the information about the submission
			DataSubmissionData dataSubmissionInfo = dataSubmissionDAO.getSubmission(submissionId);

			// Get the expected CSV formats for the request
			List<RequestFormatData> fileFormats = metadataDAO.getRequestFiles(dataSubmissionInfo.getRequestId());
			Iterator<RequestFormatData> fileIter = fileFormats.iterator();
			while (fileIter.hasNext()) {

				RequestFormatData fileFormat = fileIter.next();

				// Get the path of the file
				String filePath = requestParameters.get(fileFormat.getFormat());

				// Read the CSV files
				CSVFile csvFile = new CSVFile(filePath);

				// Store the name and path of the file
				submissionDAO.addSubmissionFile(submissionId, fileFormat.getFormat(), filePath, csvFile.getRowsCount());

				// Insert the data in database with automatic mapping ...
				isSubmitValid = isSubmitValid && integrationService.insertData(submissionId, countryCode, csvFile, fileFormat.getFormat(), requestParameters, this.thread);

			}

			// Update the submission status
			if (isSubmitValid) {
				submissionDAO.updateSubmissionStatus(submissionId, SubmissionStep.DATA_INSERTED, SubmissionStatus.OK);
			} else {
				// Immediately cancel the submission data
				cancelSubmission(submissionId);
				submissionDAO.updateSubmissionStatus(submissionId, SubmissionStep.DATA_INSERTED, SubmissionStatus.ERROR);
			}

			logger.debug("data submitted");

		} catch (Exception e) {
			logger.error("Error during upload process", e);
			try {
				submissionDAO.updateSubmissionStatus(submissionId, SubmissionStep.DATA_INSERTED, SubmissionStatus.ERROR);
			} catch (Exception ignored) {
				logger.error("Error while updating process status", e);
			}
		}

		// Return the status of the submission
		if (submissionId != null) {
			try {
				return submissionDAO.getSubmission(submissionId);
			} catch (Exception ignored) {
				return null;
			}
		} else {
			return null;
		}
	}
}
