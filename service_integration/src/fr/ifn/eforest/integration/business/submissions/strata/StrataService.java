package fr.ifn.eforest.integration.business.submissions.strata;

import java.util.Map;

import org.apache.log4j.Logger;

import fr.ifn.commons.csv.CSVFile;
import fr.ifn.eforest.common.business.AbstractService;
import fr.ifn.eforest.common.business.Formats;
import fr.ifn.eforest.common.database.metadata.MetadataDAO;
import fr.ifn.eforest.common.database.GenericDAO;
import fr.ifn.eforest.integration.business.IntegrationService;
import fr.ifn.eforest.integration.business.submissions.SubmissionStatus;
import fr.ifn.eforest.integration.business.submissions.SubmissionStep;
import fr.ifn.eforest.integration.business.submissions.SubmissionTypes;
import fr.ifn.eforest.integration.database.rawdata.StrataSubmissionDAO;
import fr.ifn.eforest.integration.database.rawdata.SubmissionDAO;
import fr.ifn.eforest.integration.database.rawdata.SubmissionData;

/**
 * Service managing strata.
 */
public class StrataService extends AbstractService {

	/**
	 * The logger used to log the errors or several information.
	 * 
	 * @see org.apache.log4j.Logger
	 */
	private final transient Logger logger = Logger.getLogger(this.getClass());

	/**
	 * The Data Access Objects.
	 */
	private GenericDAO genericDAO = new GenericDAO();
	private MetadataDAO metadataDAO = new MetadataDAO();
	private SubmissionDAO submissionDAO = new SubmissionDAO();
	private StrataSubmissionDAO strataSubmissionDAO = new StrataSubmissionDAO();

	/**
	 * The generic mapper.
	 */
	private IntegrationService integrationService = new IntegrationService();

	/**
	 * Constructor.
	 */
	public StrataService() {
		super();
	}

	/**
	 * Constructor.
	 * 
	 * @param thread
	 *            The thread that launched the service
	 */
	public StrataService(StrataServiceThread thread) {
		super(thread);
	}

	/**
	 * Get a submission.
	 * 
	 * @param submissionId
	 *            the identifier of the submission
	 * @return the submission object
	 */
	public SubmissionData getSubmission(Integer submissionId) throws Exception {

		return submissionDAO.getSubmission(submissionId);

	}

	/**
	 * Create a new plot location submission.
	 * 
	 * @param codeCountry
	 *            the code country
	 * @return the identifier of the created submission
	 */
	public Integer newSubmission(String codeCountry) throws Exception {

		// Create the submission
		Integer submissionId = submissionDAO.newSubmission(SubmissionTypes.STRATA, codeCountry);

		// Enter the strata submission information
		strataSubmissionDAO.newStrataSubmission(submissionId);

		logger.debug("New strata submission created : " + submissionId);

		return submissionId;

	}

	/**
	 * Cancel a strata submission.
	 * 
	 * @param submissionId
	 *            the identifier of the submission
	 */
	public void cancelSubmission(Integer submissionId) throws Exception {

		// Check that the submissionId is of the good type
		SubmissionData submissionData = submissionDAO.getSubmission(submissionId);
		if (!submissionData.getType().equalsIgnoreCase(SubmissionTypes.STRATA)) {
			throw new Exception("The submission number " + submissionId + " should be of type " + SubmissionTypes.PLOT_LOCATION);
		}

		// Delete strata from the database
		String tableName = metadataDAO.getTableName(Formats.STRATA_DATA);
		genericDAO.deleteRawData(tableName, submissionId);

		// Update the status of the submission
		submissionDAO.updateSubmissionStep(submissionId, SubmissionStep.SUBMISSION_CANCELLED);

		logger.debug("Submission " + submissionId + " cancelled");

	}

	/**
	 * Submit new strata.
	 * 
	 * @param submissionId
	 *            the identifier of the submission
	 * @param strataFile
	 *            the name of the CSV file
	 * @param requestParameters
	 *            the static parameters (the upload dir, ...)
	 * @return SubmissionData
	 */
	public SubmissionData submitStrata(Integer submissionId, String strataFile, Map<String, String> requestParameters) {
		try {
			boolean isSubmitValid = true;

			submissionDAO.updateSubmissionStatus(submissionId, SubmissionStep.DATA_INSERTED, SubmissionStatus.RUNNING);

			// Parse the CSV file
			CSVFile csvFile = new CSVFile(strataFile);

			// Store the name and path of the file
			submissionDAO.addSubmissionFile(submissionId, Formats.STRATA_FILE, strataFile, csvFile.getRowsCount());

			// Check the status of the submission
			SubmissionData submission = submissionDAO.getSubmission(submissionId);
			if (!submission.getType().equalsIgnoreCase(SubmissionTypes.STRATA)) {
				throw new Exception("The submission number " + submissionId + " is not a plot location submission");
			}
			if (submission.getStep().equalsIgnoreCase(SubmissionStep.SUBMISSION_CANCELLED)) {
				throw new Exception("The submission number " + submissionId + " is cancelled");
			}

			// Automatic mapping ...
			isSubmitValid = isSubmitValid && integrationService.insertData(submissionId, null, csvFile, Formats.STRATA_FILE, requestParameters, thread);

			// Update the submission status
			if (isSubmitValid) {
				submissionDAO.updateSubmissionStatus(submissionId, SubmissionStep.DATA_INSERTED, SubmissionStatus.OK);
			} else {
				// Immediately cancel the submission data
				cancelSubmission(submissionId);
				submissionDAO.updateSubmissionStatus(submissionId, SubmissionStep.DATA_INSERTED, SubmissionStatus.ERROR);
			}

			logger.debug("submitStrata : " + strataFile);

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
