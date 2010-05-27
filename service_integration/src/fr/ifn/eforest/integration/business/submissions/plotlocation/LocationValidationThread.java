package fr.ifn.eforest.integration.business.submissions.plotlocation;

import java.util.Date;

import org.apache.log4j.Logger;

import fr.ifn.eforest.common.business.AbstractThread;
import fr.ifn.eforest.common.business.ThreadLock;

/**
 * Thread running the plot location validation (pre-calculation of some data).
 */
public class LocationValidationThread extends AbstractThread {

	/**
	 * Local variables.
	 */
	private Integer submissionId;

	/**
	 * The logger used to log the errors or several information.
	 * 
	 * @see org.apache.log4j.Logger
	 */
	protected final transient Logger logger = Logger.getLogger(this.getClass());

	/**
	 * Constructs a LocationValidationThread object.
	 * 
	 * @param submissionId
	 *            the identifier of the submission
	 * @throws Exception
	 */
	public LocationValidationThread(Integer submissionId) throws Exception {

		this.submissionId = submissionId;

	}

	/**
	 * Launch in thread mode the check(s).
	 */
	public void run() {

		try {
			updateInfo("Validating plot location", 0, 1);

			Date startDate = new Date();
			logger.debug("Start of the plot location validation process " + startDate + ".");

			// SQL Conformity checks
			LocationService locationService = new LocationService(this);
			locationService.validatePlotLocations(submissionId);

			// Log the end the the request
			Date endDate = new Date();
			logger.debug("Plot location validation process terminated successfully in " + (endDate.getTime() - startDate.getTime()) / 1000.00 + " sec.");

		} finally {
			// Remove itself from the list of running checks
			ThreadLock.getInstance().releaseProcess("" + submissionId);

		}

	}

}
