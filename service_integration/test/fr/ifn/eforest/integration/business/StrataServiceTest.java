package fr.ifn.eforest.integration.business;

import java.util.HashMap;
import java.util.Map;

import fr.ifn.eforest.integration.AbstractEFDACTest;
import fr.ifn.eforest.integration.business.submissions.strata.StrataService;
import fr.ifn.eforest.integration.business.submissions.SubmissionStatus;
import fr.ifn.eforest.integration.business.submissions.SubmissionStep;
import fr.ifn.eforest.integration.database.rawdata.SubmissionData;

//
// Note : In order to use this Test Class correctly under Eclipse, you need to change the working directory to
// ${workspace_loc:EFDAC - Framework Contract for forest data and services/service_integration}
//

/**
 * Test cases for the strata service.
 */
public class StrataServiceTest extends AbstractEFDACTest {

	// The strata service
	private StrataService strataService = new StrataService();

	/**
	 * Constructor
	 * 
	 * @param name
	 */
	public StrataServiceTest(String name) {
		super(name);
	}

	/**
	 * Test the create and cancel submission functions.
	 */
	public void testSubmission() throws Exception {

		String countryCode = "66";
		String strataFile = "./test/data/STRATA_DESCRIPTION/TEST_STRATA.csv";
		Map<String, String> requestParameters = new HashMap<String, String>();

		// Create a new strata submission
		Integer submissionId = strataService.newSubmission(countryCode);

		try {

			// Simulate the servlet request parameters
			requestParameters.put("SUBMISSION_ID", "" + submissionId);
			requestParameters.put("COUNTRY_CODE", countryCode);

			// Submit the strata data
			strataService.submitStrata(submissionId, strataFile, requestParameters);

			// Get back the submission information
			SubmissionData submission = strataService.getSubmission(submissionId);

			// Check that the status is "OK"
			assertEquals(submission.getStep(), SubmissionStep.DATA_INSERTED);
			assertEquals(submission.getStatus(), SubmissionStatus.OK);

		} catch (Exception e) {
			logger.error(e);
			assertTrue(false);
		} finally {

			// Cancel the location submission
			strataService.cancelSubmission(submissionId);
		}

	}
}
