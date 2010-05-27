package fr.ifn.eforest.integration.business;

import java.util.HashMap;
import java.util.Map;

import fr.ifn.eforest.integration.AbstractEFDACTest;
import fr.ifn.eforest.integration.business.checks.CheckService;
import fr.ifn.eforest.integration.business.submissions.plotlocation.LocationService;
import fr.ifn.eforest.integration.business.submissions.SubmissionStatus;
import fr.ifn.eforest.integration.business.submissions.SubmissionStep;
import fr.ifn.eforest.integration.database.rawdata.SubmissionDAO;
import fr.ifn.eforest.integration.database.rawdata.SubmissionData;

//
// Note : In order to use this Test Class correctly under Eclipse, you need to change the working directory to
// ${workspace_loc:EFDAC - Framework Contract for forest data and services/service_integration}
//

/**
 * Test cases for the Plot Location service.
 */
public class LocationServiceTest extends AbstractEFDACTest {

	// The location service
	private LocationService locationService = new LocationService();
	private CheckService checkService = new CheckService();

	// The DAOs
	private SubmissionDAO submissionDAO = new SubmissionDAO();

	/**
	 * Constructor
	 * 
	 * @param name
	 */
	public LocationServiceTest(String name) {
		super(name);
	}

	/**
	 * Test the create and cancel submission functions.
	 */
	public void testSubmission() throws Exception {

		String countryCode = "66";

		// Create a new location submission
		Integer submissionId = locationService.newSubmission(countryCode);

		// Get back the country code
		SubmissionData submission = submissionDAO.getSubmission(submissionId);

		assertEquals(SubmissionStep.INITIALISED, submission.getStep());
		assertEquals(countryCode, submission.getCountryCode());

		// Cancel the submission
		locationService.cancelSubmission(submissionId);

		// Get back the submission information
		submission = locationService.getSubmission(submissionId);

		// Check that the status is "cancelled"
		assertEquals(SubmissionStep.SUBMISSION_CANCELLED, submission.getStep());
	}

	/**
	 * Test the submit plot location function.
	 */
	public void testSubmitPlotLocation() throws Exception {

		String countryCode = "66";
		String locationFile = "./test/data/PLOT_LOCATION/PLOT_LOCATION.CSV";
		Map<String, String> requestParameters = new HashMap<String, String>();

		// Create a new location submission
		Integer submissionId = locationService.newSubmission(countryCode);

		try {

			// Simulate the servlet request parameters
			requestParameters.put("SUBMISSION_ID", "" + submissionId);
			requestParameters.put("COUNTRY_CODE", countryCode);

			// Submit the location data
			locationService.submitPlotLocations(submissionId, locationFile, requestParameters);

			// Get back the submission information
			SubmissionData submission = submissionDAO.getSubmission(submissionId);

			// Check that the status is "OK"
			assertEquals(submission.getStep(), SubmissionStep.DATA_INSERTED);
			assertEquals(submission.getStatus(), SubmissionStatus.OK);

			// Check the submission
			checkService.runChecks(submissionId);

			// Get the data submission status
			submission = submissionDAO.getSubmission(submissionId);

			// Check that the step is "DATA_CHECKED"
			assertEquals(submission.getStep(), SubmissionStep.DATA_CHECKED);

			// Validate the plot locations (pre-calculate the coordinates)
			locationService.validatePlotLocations(submissionId);

			// Get back the submission information
			submission = submissionDAO.getSubmission(submissionId);

			// Check that the status is "OK"
			assertEquals(submission.getStep(), SubmissionStep.DATA_VALIDATED);
			assertEquals(submission.getStatus(), SubmissionStatus.OK);

		} catch (Exception e) {
			logger.error(e);
			assertTrue(false);
		} finally {

			// Cancel the location submission
			locationService.cancelSubmission(submissionId);
		}

	}

	/**
	 * Test the submit plot location function with an empty file.
	 */
	public void testErrorFileEmpty() throws Exception {

		String countryCode = "66";
		String locationFile = "./test/data/PLOT_LOCATION/PLOT_LOCATION_EMPTY.CSV";
		Map<String, String> requestParameters = new HashMap<String, String>();

		// Create a new location submission
		Integer submissionId = locationService.newSubmission(countryCode);

		try {

			// Simulate the servlet request parameters
			requestParameters.put("SUBMISSION_ID", "" + submissionId);
			requestParameters.put("COUNTRY_CODE", countryCode);

			// Submit the location data
			locationService.submitPlotLocations(submissionId, locationFile, requestParameters);

			// Get back the submission information
			SubmissionData submission = submissionDAO.getSubmission(submissionId);

			// Check that the status is "submitted"
			assertEquals(submission.getStep(), SubmissionStep.DATA_INSERTED);
			assertEquals(submission.getStatus(), SubmissionStatus.ERROR);

		} catch (Exception e) {
			logger.error(e);
			assertTrue(false);
		}

		// Cancel the submission
		locationService.cancelSubmission(submissionId);

	}

	/**
	 * Test the submit plot location function with an bad file.
	 */
	public void testErrorFileWrongColumn() throws Exception {

		String countryCode = "66";
		String locationFile = "./test/data/PLOT_LOCATION/PLOT_LOCATION_WRONG_COLUMN_NUMBER.CSV";
		Map<String, String> requestParameters = new HashMap<String, String>();

		// Create a new location submission
		Integer submissionId = locationService.newSubmission(countryCode);

		try {

			// Simulate the servlet request parameters
			requestParameters.put("SUBMISSION_ID", "" + submissionId);
			requestParameters.put("COUNTRY_CODE", countryCode);

			// Submit the location data
			locationService.submitPlotLocations(submissionId, locationFile, requestParameters);

			// Get back the submission information
			SubmissionData submission = submissionDAO.getSubmission(submissionId);

			// Check that the status is "submitted"
			assertEquals(submission.getStep(), SubmissionStep.DATA_INSERTED);
			assertEquals(submission.getStatus(), SubmissionStatus.ERROR);

		} catch (Exception e) {
			logger.error(e);
			assertTrue(false);
		}

		// Cancel the submission
		locationService.cancelSubmission(submissionId);

	}

}
