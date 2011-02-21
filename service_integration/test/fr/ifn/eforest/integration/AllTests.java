package fr.ifn.eforest.integration;

import fr.ifn.eforest.integration.business.DataServiceTest;
import fr.ifn.eforest.integration.business.GenericMapperTest;
import fr.ifn.eforest.integration.database.MetadataTest;
import junit.framework.Test;
import junit.framework.TestSuite;

//
//Note : In order to use this Test Class correctly under Eclipse, you need to change the working directory to
//${workspace_loc:EFDAC - Framework Contract for forest data and services/service_integration}
//

/**
 * Run all the available tests.
 */
public class AllTests {

	public static Test suite() {
		TestSuite suite = new TestSuite("Test for fr.ifn.efdac.integration");

		suite.addTestSuite(DataServiceTest.class);
		suite.addTestSuite(GenericMapperTest.class);
		suite.addTestSuite(MetadataTest.class);
		return suite;
	}

}
