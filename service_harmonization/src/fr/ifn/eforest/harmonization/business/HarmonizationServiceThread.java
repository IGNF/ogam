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
	private String datasetId;
	private String providerId;

	/**
	 * The logger used to log the errors or several information.
	 * 
	 * @see org.apache.log4j.Logger
	 */
	protected final transient Logger logger = Logger.getLogger(this.getClass());

	/**
	 * Constructor.
	 * 
	 * @param datasetId
	 *            the dataset identifier
	 * @param providerId
	 *            the country code
	 * @throws Exception
	 */
	public HarmonizationServiceThread(String datasetId, String providerId) throws Exception {

		this.datasetId = datasetId;
		this.providerId = providerId;

	}

	/**
	 * Launch in thread mode the harmonization process.
	 */
	public void run() {

		try {

			Date startDate = new Date();
			logger.debug("Start of the harmonization process " + startDate + ".");

			// Harmonize data
			HarmonizationService harmonizationService = new HarmonizationService(this);
			harmonizationService.harmonizeData(datasetId, providerId);

			// Log the end the the request
			Date endDate = new Date();
			logger.debug("Harmonization process terminated successfully in " + (endDate.getTime() - startDate.getTime()) / 1000.00 + " sec.");

		} finally {
			// Remove itself from the list of running checks
			String key = datasetId + "_" + providerId;
			ThreadLock.getInstance().releaseProcess(key);

		}

	}

}
