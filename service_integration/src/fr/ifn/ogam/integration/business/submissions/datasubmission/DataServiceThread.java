package fr.ifn.ogam.integration.business.submissions.datasubmission;

import java.util.Date;
import java.util.Map;

import org.apache.log4j.Logger;

import fr.ifn.ogam.common.business.AbstractThread;
import fr.ifn.ogam.common.business.ThreadLock;
import fr.ifn.ogam.common.database.rawdata.SubmissionData;
import fr.ifn.ogam.integration.mail.OGAMEmailer;

/**
 * Thread running the data importation.
 */
public class DataServiceThread extends AbstractThread {

	/**
	 * Local variables.
	 */
	private Integer submissionId;
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
	OGAMEmailer ogamEmailer = new OGAMEmailer();

	/**
	 * Constructs a DataServiceThread object.
	 * 
	 * @param submissionId
	 *            the identifier of the submission
	 * @param requestParameters
	 *            the map of static parameter values (the upload path, ...)
	 * @throws Exception
	 */
	public DataServiceThread(Integer submissionId, Map<String, String> requestParameters) throws Exception {

		this.submissionId = submissionId;
		this.requestParameters = requestParameters;

	}

	/**
	 * Launch in thread mode the check(s).
	 */
	public void run() {

		try {

			Date startDate = new Date();
			logger.debug("Start of the data upload process " + startDate + ".");

			// Submit the data
			DataService dataService = new DataService(this);
			SubmissionData submission = dataService.submitData(submissionId, requestParameters);

			// Log the end the the request
			Date endDate = new Date();
			logger.debug("Data Upload process terminated successfully in " + (endDate.getTime() - startDate.getTime()) / 1000.00 + " sec.");

			// Send a email
			ogamEmailer.send("New data submission", submission);

		} finally {
			// Remove itself from the list of running checks
			ThreadLock.getInstance().releaseProcess("" + submissionId);

		}

	}

}
