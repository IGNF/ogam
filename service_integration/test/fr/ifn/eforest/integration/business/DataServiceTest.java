package fr.ifn.eforest.integration.business;

import java.util.HashMap;
import java.util.Map;

import fr.ifn.eforest.integration.AbstractEFDACTest;
import fr.ifn.eforest.integration.business.checks.CheckService;
import fr.ifn.eforest.integration.business.submissions.datasubmission.DataService;
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
		String providerId = "test_provider";
		String locationFile = "./test/data/PLOT_LOCATION/PLOT_LOCATION.CSV";
		String plotFile = "./test/data/WP3_REQUEST/PLOT_DATA.CSV";
		String speciesFile = "./test/data/WP3_REQUEST/SPECIES_DATA.CSV";

		String requestId = "WP3_REQUEST";
		String userLogin = "Test user";

		Integer dataSubmissionId = null;

		try {

			// Create a new data submission
			dataSubmissionId = dataService.newSubmission(providerId, requestId, userLogin);

			// Simulate the data servlet request parameters
			Map<String, String> dataParameters = new HashMap<String, String>();
			dataParameters.put(SUBMISSION_ID, "" + dataSubmissionId);
			dataParameters.put(PROVIDER_ID, providerId);
			dataParameters.put(REF_YEAR_BEGIN, "2006");
			dataParameters.put(REF_YEAR_END, "2009");
			dataParameters.put(Formats.LOCATION_FILE, locationFile);
			dataParameters.put(Formats.WP3_PLOT_FILE, plotFile);
			dataParameters.put(Formats.WP3_SPECIES_FILE, speciesFile);

			// Submit Data
			dataService.submitData(dataSubmissionId, dataParameters);

			// Get the data submission status
			SubmissionData submission = dataService.getSubmission(dataSubmissionId);

			// Check that the step is "DATA_INSERTED"
			assertEquals(submission.getStep(), SubmissionStep.DATA_INSERTED);
			assertEquals(submission.getStatus(), SubmissionStatus.OK);

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

		}

	}

}
