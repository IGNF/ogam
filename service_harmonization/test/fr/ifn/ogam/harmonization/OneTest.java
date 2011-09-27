package fr.ifn.eforest.harmonization;

import fr.ifn.eforest.harmonization.business.HarmonizationServiceTest;
import junit.framework.Test;
import junit.framework.TestSuite;

public class OneTest {

	/**
	 * Methode de lancement des tests.
	 */
	public static Test suite() {

		TestSuite suite = new TestSuite();

		suite.addTest(new HarmonizationServiceTest("testHarmonizeData"));

		return suite;
	}
}
