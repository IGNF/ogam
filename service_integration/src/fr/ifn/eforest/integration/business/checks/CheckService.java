package fr.ifn.eforest.integration.business.checks;

import java.util.Date;
import java.util.List;

import org.apache.log4j.Logger;

import fr.ifn.eforest.common.business.submissions.SubmissionStatus;
import fr.ifn.eforest.common.business.submissions.SubmissionStep;
import fr.ifn.eforest.common.database.metadata.CheckData;
import fr.ifn.eforest.common.database.metadata.ChecksDAO;
import fr.ifn.eforest.common.database.rawdata.SubmissionDAO;
import fr.ifn.eforest.common.database.rawdata.SubmissionData;
import fr.ifn.eforest.integration.database.rawdata.CheckErrorDAO;

/**
 * Service managing the checks.
 */
public class CheckService {

	/**
	 * The local logger.
	 */
	private final transient Logger logger = Logger.getLogger(this.getClass());

	/**
	 * Declare the DAOs.
	 */
	private SubmissionDAO submissionDAO = new SubmissionDAO();
	private ChecksDAO checksDAO = new ChecksDAO();
	private CheckErrorDAO checkErrorDAO = new CheckErrorDAO();

	/**
	 * Get the status of the submission.
	 * 
	 * @param submissionId
	 *            the identifier of the submission
	 * @return the status of the submission
	 * @throws Exception
	 */
	public String checkSubmissionStatus(int submissionId) throws Exception {

		SubmissionData submission = submissionDAO.getSubmission(submissionId);

		return submission.getStatus();

	}

	/**
	 * Checks the submissions.
	 * 
	 * @param submissionId
	 *            the identifier of the submission
	 */
	public void runChecks(Integer submissionId) {

		List<CheckData> checksList;

		try {

			long startTime = new Date().getTime();
			logger.debug("Start checks ...");

			// Change the status of the submission
			submissionDAO.updateSubmissionStatus(submissionId, SubmissionStep.DATA_CHECKED, SubmissionStatus.RUNNING);

			// Get the list of checks to run
			SubmissionData submission = submissionDAO.getSubmission(submissionId);
			checksList = checksDAO.getChecks(submission.getDatasetId(), submission.getProviderId());

			// Launchs the checks
			checksDAO.executeChecks(submissionId, checksList);

			long endTime = new Date().getTime();
			logger.debug("Total check time : " + (endTime - startTime) / 1000.00 + "s.");

			// Gets the number of errors and of warnings for the step(s)
			int nbrErrors = checkErrorDAO.countPerCheck(submissionId, CheckStep.CONFORMITY, CheckLevel.ERROR);
			int nbrWarnings = checkErrorDAO.countPerCheck(submissionId, CheckStep.CONFORMITY, CheckLevel.WARNING);

			logger.debug("Compliance check(s) ended with " + nbrErrors + " error(s) and " + nbrWarnings + " warning(s).");

			// Update the submission status
			if (nbrErrors == 0) {
				if (nbrWarnings == 0) {
					submissionDAO.updateSubmissionStatus(submissionId, SubmissionStep.DATA_CHECKED, SubmissionStatus.OK);
				} else {
					submissionDAO.updateSubmissionStatus(submissionId, SubmissionStep.DATA_CHECKED, SubmissionStatus.WARNING);
				}
			} else {
				submissionDAO.updateSubmissionStatus(submissionId, SubmissionStep.DATA_CHECKED, SubmissionStatus.ERROR);
			}

		} catch (Exception e) {
			// Update the status of the submission to "CRASH"
			try {
				// Set the submission status
				submissionDAO.updateSubmissionStatus(submissionId, SubmissionStep.DATA_CHECKED, SubmissionStatus.CRASH);

			} catch (Exception ignored) {
				logger.error("Error while updating submission status to CRASH", ignored);
			}
		}

	}
}
