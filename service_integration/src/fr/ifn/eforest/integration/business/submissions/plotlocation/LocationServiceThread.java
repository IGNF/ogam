package fr.ifn.eforest.integration.business.submissions.plotlocation;

import java.util.Date;
import java.util.Map;

import org.apache.log4j.Logger;

import fr.ifn.eforest.common.business.AbstractThread;
import fr.ifn.eforest.common.business.ThreadLock;
import fr.ifn.eforest.integration.database.rawdata.SubmissionData;
import fr.ifn.eforest.integration.mail.EforestEmailer;

/**
 * Thread running the plot location importation.
 */
public class LocationServiceThread extends AbstractThread {

	/**
	 * Local variables.
	 */
	private Integer submissionId;
	private String locationFile;
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
	 * @param locationFile
	 *            the name of the CSV file.
	 * @param requestParameters
	 *            the static parameters (the upload dir, ...)
	 * @throws Exception
	 */
	public LocationServiceThread(Integer submissionId, String locationFile, Map<String, String> requestParameters) throws Exception {

		this.submissionId = submissionId;
		this.locationFile = locationFile;
		this.requestParameters = requestParameters;

	}

	/**
	 * Launch in thread mode the check(s).
	 */
	public void run() {

		try {
			Date startDate = new Date();
			logger.debug("Start of the plot location upload process " + startDate + ".");

			// SQL Conformity checks
			LocationService locationService = new LocationService(this);
			SubmissionData submission = locationService.submitPlotLocations(submissionId, locationFile, requestParameters);

			// Log the end the the request
			Date endDate = new Date();
			logger.debug("Plot location upload process terminated successfully in " + (endDate.getTime() - startDate.getTime()) / 1000.00 + " sec.");

			// Send a email
			eforestEmailer.send("New plot location submission", submission);

		} finally {
			// Remove itself from the list of running checks
			ThreadLock.getInstance().releaseProcess("" + submissionId);

		}

	}

}
