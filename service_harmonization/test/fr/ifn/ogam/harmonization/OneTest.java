/**
 * Licensed under EUPL v1.1 (see http://ec.europa.eu/idabc/eupl).
 * 
 * © European Union, 2008-2012
 *
 * Reuse is authorised, provided the source is acknowledged. The reuse policy of the European Commission is implemented by a Decision of 12 December 2011.
 *
 * The general principle of reuse can be subject to conditions which may be specified in individual copyright notices. 
 * Therefore users are advised to refer to the copyright notices of the individual websites maintained under Europa and of the individual documents. 
 * Reuse is not applicable to documents subject to intellectual property rights of third parties.
 */
package fr.ifn.ogam.harmonization;

import fr.ifn.ogam.harmonization.business.HarmonizationServiceTest;
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
