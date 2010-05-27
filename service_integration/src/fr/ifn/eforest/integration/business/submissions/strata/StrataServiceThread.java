package fr.ifn.eforest.integration.business.submissions.strata;

import java.util.Date;
import java.util.Map;

import org.apache.log4j.Logger;

import fr.ifn.eforest.common.business.AbstractThread;
import fr.ifn.eforest.common.business.ThreadLock;
import fr.ifn.eforest.integration.database.rawdata.SubmissionData;
import fr.ifn.eforest.integration.mail.EforestEmailer;

/**
 * Thread running the strata importation.
 */
public class StrataServiceThread extends AbstractThread {

	/**
	 * Local variables.
	 */
	private Integer submissionId;
	private String strataFile;
	private Map<String, String> requestParameters;

	/**
	 * The logger used to log the errors or several information.
	 * 
	 * @see org.apache.log4j.Logger
	 */
	protected final transient Logger logger = Logger.getLogger(this.getClass());

	/**
	 * Emailer service.
	 */
	EforestEmailer eforestEmailer = new EforestEmailer();

	/**
	 * Constructs a LocationServiceThread object.
	 * 
	 * @param submissionId
	 *            the identifier of the submission
	 * @param strataFile
	 *            the name of the CSV file
	 * @param requestParameters
	 *            the static parameters (the upload dir, ...)
	 * @throws Exception
	 */
	public StrataServiceThread(Integer submissionId, String strataFile, Map<String, String> requestParameters) throws Exception {

		this.submissionId = submissionId;
		this.strataFile = strataFile;
		this.requestParameters = requestParameters;

	}

	/**
	 * Launch in thread mode the check(s).
	 */
	public void run() {

		try {
			Date startDate = new Date();
			logger.debug("Start of the strata upload process " + startDate + ".");

			// SQL Conformity checks
			StrataService strataService = new StrataService(this);
			SubmissionData submission = strataService.submitStrata(submissionId, strataFile, requestParameters);

			// Log the end the the request
			Date endDate = new Date();
			logger.debug("Strata upload process terminated successfully in " + (endDate.getTime() - startDate.getTime()) / 1000.00 + " sec.");

			// Send a email
			eforestEmailer.send("New strata submission", submission);

		} finally {
			// Remove itself from the list of running checks
			ThreadLock.getInstance().releaseProcess("" + submissionId);

		}

	}

}
