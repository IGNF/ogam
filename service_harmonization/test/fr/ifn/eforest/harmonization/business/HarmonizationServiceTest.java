package fr.ifn.eforest.harmonization.business;

import fr.ifn.eforest.harmonization.AbstractEFDACTest;
import fr.ifn.eforest.harmonization.business.HarmonizationService;
import fr.ifn.eforest.harmonization.database.harmonizeddata.HarmonisationProcessDAO;
import fr.ifn.eforest.harmonization.database.harmonizeddata.HarmonizedDataDAO;

//
// Note : In order to use this Test Class correctly under Eclipse, you need to change the working directory to
// ${workspace_loc:EFDAC - Framework Contract for forest data and services/service_integration}
//

/**
 * Test cases for the Harmonization service.
 */
public class HarmonizationServiceTest extends AbstractEFDACTest {

	// The services
	private HarmonizationService harmonizationService = new HarmonizationService();

	// The DAOs
	private HarmonizedDataDAO harmonizedDataDAO = new HarmonizedDataDAO();
	private HarmonisationProcessDAO harmonisationProcessDAO = new HarmonisationProcessDAO();

	/**
	 * Constructor
	 * 
	 * @param name
	 */
	public HarmonizationServiceTest(String name) {
		super(name);
	}

	/**
	 * Test the data submission function.
	 */
	public void testHarmonizeData() throws Exception {

		// Parameters
		String countryCode = "66";

		String requestId = "WP3_REQUEST";

		Integer processId = null;

		try {

			//
			// Launch the harmonization process
			//
			processId = harmonizationService.harmonizeData(requestId, countryCode);

			// Check that we have some data in the harmonized tables
			assertEquals(7, harmonizedDataDAO.countData("harmonized_location", countryCode, requestId));
			assertEquals(1, harmonizedDataDAO.countData("harmonized_plot_data", countryCode, requestId));
			assertEquals(3, harmonizedDataDAO.countData("harmonized_species_data", countryCode, requestId));

		} catch (Exception e) {
			logger.error(e);
			assertTrue(false);
		} finally {

			// Delete the data from the harmonized tables
			logger.debug("");
			logger.debug("Removing test data");
			logger.debug("");

			// Remove the inserted data
			harmonizedDataDAO.deleteHarmonizedData("harmonized_species_data", countryCode, requestId);
			harmonizedDataDAO.deleteHarmonizedData("harmonized_plot_data", countryCode, requestId);
			harmonizedDataDAO.deleteHarmonizedData("harmonized_location", countryCode, requestId);

			// Delete the harmonization log
			if (processId != null) {
				harmonisationProcessDAO.deleteHarmonizationProcess(processId);
			}

		}

	}
}
