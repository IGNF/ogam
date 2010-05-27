package fr.ifn.eforest.integration.business;

import java.util.HashMap;
import java.util.Map;

import fr.ifn.eforest.integration.AbstractEFDACTest;
import fr.ifn.eforest.integration.business.checks.CheckService;
import fr.ifn.eforest.integration.business.submissions.datasubmission.DataService;
import fr.ifn.eforest.common.business.Formats;
import fr.ifn.eforest.integration.business.submissions.plotlocation.LocationService;
import fr.ifn.eforest.integration.business.submissions.strata.StrataService;
import fr.ifn.eforest.integration.business.submissions.SubmissionStatus;
import fr.ifn.eforest.integration.business.submissions.SubmissionStep;
import fr.ifn.eforest.integration.database.rawdata.SubmissionDAO;
import fr.ifn.eforest.integration.database.rawdata.SubmissionData;

//
// Note : In order to use this Test Class correctly under Eclipse, you need to change the working directory to
// ${workspace_loc:EFDAC - Framework Contract for forest data and services/service_integration}
//

/**
 * Test cases for the Data service.
 */
public class DataServiceTest extends AbstractEFDACTest {

	// The services
	private DataService dataService = new DataService();
	private LocationService locationService = new LocationService();
	private StrataService strataService = new StrataService();
	private CheckService checkService = new CheckService();

	// The DAOs
	private SubmissionDAO submissionDAO = new SubmissionDAO();

	/**
	 * Constructor
	 * 
	 * @param name
	 */
	public DataServiceTest(String name) {
		super(name);
	}

	/**
	 * Test the data submission function.
	 */
	public void testDataSubmission() throws Exception {

		// Parameters
		String countryCode = "66";
		String locationFile = "./test/data/PLOT_LOCATION/PLOT_LOCATION.CSV";
		String strataFile = "./test/data/STRATA_DESCRIPTION/TEST_STRATA.csv";
		String plotFile = "./test/data/WP3_REQUEST/PLOT_DATA.CSV";
		String speciesFile = "./test/data/WP3_REQUEST/SPECIES_DATA.CSV";

		String requestId = "WP3_REQUEST";
		String userLogin = "Test user";
		String comment = "JUnit Test";

		Integer locationSubmissionId = null;
		Integer strataSubmissionId = null;
		Integer dataSubmissionId = null;

		try {

			// Create a new location submission
			locationSubmissionId = locationService.newSubmission(countryCode);

			// Simulate the location servlet request parameters
			Map<String, String> locationParameters = new HashMap<String, String>();
			locationParameters.put(SUBMISSION_ID, "" + locationSubmissionId);
			locationParameters.put(COUNTRY_CODE, countryCode);

			// Submit the location data
			locationService.submitPlotLocations(locationSubmissionId, locationFile, locationParameters);

			// Create a new strata submission
			strataSubmissionId = strataService.newSubmission(countryCode);

			// Simulate the location servlet request parameters
			Map<String, String> strataParameters = new HashMap<String, String>();
			strataParameters.put(SUBMISSION_ID, "" + strataSubmissionId);
			strataParameters.put(COUNTRY_CODE, countryCode);

			// Submit the location data
			strataService.submitStrata(strataSubmissionId, strataFile, strataParameters);

			// Create a new data submission
			dataSubmissionId = dataService.newSubmission(countryCode, requestId, userLogin, comment);

			// Simulate the data servlet request parameters
			Map<String, String> dataParameters = new HashMap<String, String>();
			dataParameters.put(SUBMISSION_ID, "" + dataSubmissionId);
			dataParameters.put(COUNTRY_CODE, countryCode);
			dataParameters.put(REF_YEAR_BEGIN, "2006");
			dataParameters.put(REF_YEAR_END, "2009");
			dataParameters.put(Formats.WP3_PLOT_FILE, plotFile);
			dataParameters.put(Formats.WP3_SPECIES_FILE, speciesFile);

			// Submit Data
			dataService.submitData(dataSubmissionId, countryCode, dataParameters);

			// Get the data submission status
			SubmissionData submission = dataService.getSubmission(dataSubmissionId);

			// Check that the step is "DATA_INSERTED"
			assertEquals(submission.getStep(), SubmissionStep.DATA_INSERTED);
			assertEquals(submission.getStatus(), SubmissionStatus.OK);
			assertEquals(countryCode, submission.getCountryCode());

			// Check the submission
			checkService.runChecks(dataSubmissionId);

			// Get the data submission status
			String submissionStatus = checkService.checkSubmissionStatus(dataSubmissionId);

			// Check that the step is "DATA_CHECKED"
			assertEquals(submissionStatus, SubmissionStatus.OK);

			// Validate the submission
			dataService.validateSubmission(dataSubmissionId);

			// Get the data submission status
			submission = submissionDAO.getSubmission(dataSubmissionId);

			// Check that the step is "DATA_VALIDATED"
			assertEquals(submission.getStep(), SubmissionStep.DATA_VALIDATED);
			assertEquals(submission.getStatus(), SubmissionStatus.OK);

		} catch (Exception e) {
			logger.error(e);
			assertTrue(false);
		} finally {

			// Cancel the data submission
			if (dataSubmissionId != null) {
				dataService.cancelSubmission(dataSubmissionId);
			}

			// Cancel the strata submission
			if (strataSubmissionId != null) {
				strataService.cancelSubmission(strataSubmissionId);
			}

			// Cancel the location submission
			locationService.cancelSubmission(locationSubmissionId);

		}

	}

}
