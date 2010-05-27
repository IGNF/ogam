package fr.ifn.eforest.integration;

//import fr.ifn.eforest.integration.business.DataServiceTest;
import fr.ifn.eforest.integration.business.GenericMapperTest;
import fr.ifn.eforest.integration.business.DataServiceTest;
import fr.ifn.eforest.integration.business.LocationServiceTest;
import fr.ifn.eforest.integration.database.MetadataTest;

import junit.framework.Test;
import junit.framework.TestSuite;

public class OneTest {

	/**
	 * Methode de lancement des tests.
	 */
	public static Test suite() {

		TestSuite suite = new TestSuite();

		//suite.addTest(new LocationServiceTest("testSubmitPlotLocation"));
		suite.addTest(new DataServiceTest("testDataSubmission"));
		//suite.addTest(new MetadataTest("testGetTablesTree"));
		//suite.addTest(new GenericMapperTest("testGetSortedAncestors"));
		//suite.addTest(new HarmonizationServiceTest("testHarmonizeData"));

		return suite;
	}
}
