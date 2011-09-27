package fr.ifn.eforest.common.util;

import java.io.IOException;
import java.util.Hashtable;
import javax.naming.Context;
import javax.naming.InitialContext;
import javax.naming.NamingException;

/**
 * <p>
 * Title: JNDIUnitTestHelper
 * </p>
 * <p>
 * Description: Simple class used to simulate a JNDI DataSource for use in UnitTests
 * </p>
 * Usage is Simple in setUp for your UnitTest:<br>
 * 
 * <pre>
 * if (JNDIUnitTestHelper.notInitialized()) {
 * 	JNDIUnitTestHelper.init(&quot;jndi_unit_test_helper.properties&quot;);
 * }
 * </pre>
 * 
 * <p>
 * Copyright: Copyright (c) 2002
 * </p>
 * <p>
 * Company: JavaRanch
 * </p>
 * 
 * @author Carl Trusiak, Sheriff
 * @version 1.0
 */
public class JNDIUnitTestHelper {

	private boolean initialized;

	private Context ctx;

	private String jndiName;

	private static String contextFactoryName = JNDIUnitTestHelper.class.getPackage().getName() + ".SimpleContextFactory";

	/**
	 * Intializes the pool and sets it in the InitialContext
	 * 
	 * @param dbDriver
	 * @param dbUrl
	 * @param dbLogin
	 * @param dbPassword
	 * @param aJndiName
	 * @throws IOException
	 * @throws NamingException
	 */
	public JNDIUnitTestHelper(String dbDriver, String dbUrl, String dbLogin, String dbPassword, String aJndiName) throws IOException, NamingException {

		SimpleDataSource source = new SimpleDataSource();
		source.dbDriver = dbDriver;
		source.dbServer = dbUrl;
		source.dbLogin = dbLogin;
		source.dbPassword = dbPassword;
		jndiName = aJndiName;

		// Set up environment for creating initial context
		Hashtable env = new Hashtable();
		env.put(Context.INITIAL_CONTEXT_FACTORY, contextFactoryName);
		System.setProperty(Context.INITIAL_CONTEXT_FACTORY, contextFactoryName);
		ctx = new InitialContext(env);
		// Register the data source to JNDI naming service
		ctx.bind(jndiName, source);
		initialized = true;
	}

	/**
	 * determines if the pool was successfully initialized or not.
	 * 
	 * @return boolean true if the pool was not successfully initialized.
	 */
	public boolean notInitialized() {
		return !initialized;
	}

	/**
	 * shutdowns down the pool and ends the Thread that DbConnectionBroker starts.
	 * 
	 * @throws NamingException
	 */
	public void shutdown() throws NamingException {

		ctx.unbind(jndiName);
		initialized = false;
	}

	/**
	 * Gets the name of the datasource, useful in test because this is configurable for the tests ran.
	 * 
	 * @return String
	 */
	public String getJndiName() {
		return jndiName;
	}

	/**
	 * Gets the name of the context factory.
	 * 
	 * @return String
	 */
	public static String getContextFactoryName() {
		return contextFactoryName;
	}
}
