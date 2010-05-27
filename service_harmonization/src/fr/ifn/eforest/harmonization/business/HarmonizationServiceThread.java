package fr.ifn.eforest.harmonization.business;

import java.util.Date;

import org.apache.log4j.Logger;

import fr.ifn.eforest.common.business.AbstractThread;
import fr.ifn.eforest.common.business.ThreadLock;

/**
 * Thread running the harmonization process.
 */
public class HarmonizationServiceThread extends AbstractThread {

	//
	// The Thread is always linked to a country code and a JRC Request.
	//
	private String countryCode;
	private String requestId;

	/**
	 * The logger used to log the errors or several information.
	 * 
	 * @see org.apache.log4j.Logger
	 */
	protected final transient Logger logger = Logger.getLogger(this.getClass());

	/**
	 * Constructor.
	 * 
	 * @param requestId
	 *            the dataset identifier
	 * @param countryCode
	 *            the country code
	 * @throws Exception
	 */
	public HarmonizationServiceThread(String requestId, String countryCode) throws Exception {

		this.requestId = requestId;
		this.countryCode = countryCode;

	}

	/**
	 * Launch in thread mode the harmonization process.
	 */
	public void run() {

		try {

			Date startDate = new Date();
			logger.debug("Start of the harmonization process " + startDate + ".");

			// SQL Conformity checks
			HarmonizationService harmonizationService = new HarmonizationService(this);
			harmonizationService.harmonizeData(requestId, countryCode);

			// Log the end the the request
			Date endDate = new Date();
			logger.debug("Harmonization process terminated successfully in " + (endDate.getTime() - startDate.getTime()) / 1000.00 + " sec.");

		} finally {
			// Remove itself from the list of running checks
			String key = requestId + "_" + countryCode;
			ThreadLock.getInstance().releaseProcess(key);

		}

	}

}
