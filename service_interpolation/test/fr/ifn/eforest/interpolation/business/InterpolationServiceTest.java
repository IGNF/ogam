package fr.ifn.eforest.interpolation.business;

import org.apache.log4j.BasicConfigurator;
import org.apache.log4j.ConsoleAppender;
import org.apache.log4j.Layout;
import org.apache.log4j.Level;
import org.apache.log4j.Logger;
import org.apache.log4j.PatternLayout;

import fr.ifn.eforest.interpolation.business.InterpolationService;
import junit.framework.TestCase;

/**
 * Test class for interplation
 */
public class InterpolationServiceTest extends TestCase {

	protected static Logger logger = null;

	/**
	 * Initialise the test session.
	 */
	protected void setUp() throws Exception {
		try {
			// Initialise Log4J
			if (logger == null) {
				logger = Logger.getLogger(this.getClass());

				// Log general
				Layout layout = new PatternLayout("%-5p [%t]: %m%n");
				ConsoleAppender appender = new ConsoleAppender(layout, ConsoleAppender.SYSTEM_OUT);
				BasicConfigurator.configure(appender);
				Logger.getRootLogger().setLevel(Level.TRACE);

			}

		} catch (Exception e) {
			e.printStackTrace();
		}

		// Call the DBUnit setup method
		super.setUp();
	}

	/**
	 * Clean the test session.
	 */
	protected void tearDown() throws Exception {
	}

	/**
	 * Test one interpolation.
	 */
	public void testServiceInterpolation() {
		try {
			InterpolationService service = new InterpolationService();
			service.generateIDWScript("C:/workspace/Eforest/website/htdocs/upload/interpolation/test4.csv", "C:/workspace/Eforest/Mapserv/generated_content/test3.asc", 1000, 5000);
		} catch (Exception e) {
			e.printStackTrace();
			fail();
		}
	}

}
