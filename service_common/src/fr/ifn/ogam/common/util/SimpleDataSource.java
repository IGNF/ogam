package fr.ifn.ogam.common.util;

import javax.sql.DataSource;
import javax.naming.Reference;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.sql.SQLFeatureNotSupportedException;
import java.util.logging.Logger;
import java.io.PrintWriter;

/**
 * <p>
 * Title: SimpleDataSource
 * </p>
 * <p>
 * Description: A very simple datasource. Creates a new Connection to the
 * database everytime it's ask for one so....
 * </p>
 * <p>
 * Copyright: Copyright (c) 2002
 * <p>
 * <p>
 * Company:
 * </p>
 * 
 * @author unascribed
 * @version 1.0
 */
class SimpleDataSource extends Reference implements DataSource {

	String dbDriver;

	String dbServer;

	String dbLogin;

	String dbPassword;

	/**
	 * The serial version ID used to identify the object
	 */
	private static final long serialVersionUID = -455284123196591243L;

	/**
	 * Constructor.
	 */
	SimpleDataSource() {
		super(SimpleDataSource.class.getName());
	}

	/**
	 * Method getConnection creates Connection to the database.
	 * 
	 * 
	 * @return New Connection each time.
	 * 
	 * @throws java.sql.SQLException
	 * 
	 */
	public Connection getConnection() throws java.sql.SQLException {

		try {
			Class.forName(dbDriver);
		} catch (ClassNotFoundException cnfe) {
			throw new java.sql.SQLException(cnfe.getMessage());
		}
		if (dbLogin != null) {
			return DriverManager.getConnection(dbServer, dbLogin, dbPassword);
		} else {
			// Authentification sans user par Windows NT
			// Pour pouvoir utiliser l'authentification NT il faut copier le
			// fichier ntlmauth.dll
			// qui se trouve dans l'archive jtds.zip dans votre répertoire
			// windows/system32
			return DriverManager.getConnection(dbServer);
		}
	}

	/**
	 * Method getConnection
	 * 
	 * 
	 * @param parm1
	 * @param parm2
	 * 
	 * @return
	 * 
	 * @throws java.sql.SQLException
	 * 
	 */
	public Connection getConnection(String parm1, String parm2)
			throws java.sql.SQLException {
		return getConnection();
	}

	/**
	 * Method getLogWriter not yet implemented.
	 * 
	 * 
	 * @return
	 * 
	 * @throws java.sql.SQLException
	 * 
	 */
	public PrintWriter getLogWriter() throws java.sql.SQLException {

		/** @todo: Implement this javax.sql.DataSource method */
		throw new java.lang.UnsupportedOperationException(
				"Method getLogWriter() not yet implemented.");
	}

	public boolean isWrapperFor(Class iface) {
		/** @todo: Implement this javax.sql.DataSource method */
		throw new java.lang.UnsupportedOperationException(
				"Method isWrapperFor() not yet implemented.");

	}

	public Object unwrap(Class iface) {
		/** @todo: Implement this javax.sql.DataSource method */
		throw new java.lang.UnsupportedOperationException(
				"Method unwrap() not yet implemented.");

	}

	/**
	 * Method getLoginTimeout not yet implemented.
	 * 
	 * 
	 * @return
	 * 
	 * @throws java.sql.SQLException
	 * 
	 */
	public int getLoginTimeout() throws java.sql.SQLException {

		/** @todo: Implement this javax.sql.DataSource method */
		throw new java.lang.UnsupportedOperationException(
				"Method getLoginTimeout() not yet implemented.");
	}

	/**
	 * Method setLogWriter not yet implemented.
	 * 
	 * 
	 * @param parm1
	 * 
	 * @throws java.sql.SQLException
	 * 
	 */
	public void setLogWriter(PrintWriter parm1) throws java.sql.SQLException {

		/** @todo: Implement this javax.sql.DataSource method */
		throw new java.lang.UnsupportedOperationException(
				"Method setLogWriter() not yet implemented.");
	}

	/**
	 * Method setLoginTimeout not yet implemented.
	 * 
	 * 
	 * @param parm1
	 * 
	 * @throws java.sql.SQLException
	 * 
	 */
	public void setLoginTimeout(int parm1) throws java.sql.SQLException {

		/** @todo: Implement this javax.sql.DataSource method */
		throw new java.lang.UnsupportedOperationException(
				"Method setLoginTimeout() not yet implemented.");
	}

	/**
	 * @see java.lang.Object#hashCode()
	 */
	public int hashCode() {
		final int prime = 31;
		int result = super.hashCode();
		result = prime * result
				+ ((dbDriver == null) ? 0 : dbDriver.hashCode());
		result = prime * result + ((dbLogin == null) ? 0 : dbLogin.hashCode());
		result = prime * result
				+ ((dbPassword == null) ? 0 : dbPassword.hashCode());
		result = prime * result
				+ ((dbServer == null) ? 0 : dbServer.hashCode());
		return result;
	}

	/**
	 * @see java.lang.Object#equals(java.lang.Object)
	 */
	public boolean equals(Object obj) {
		if (this == obj) {
			return true;
		}
		if (!super.equals(obj)) {
			return false;
		}
		if (getClass() != obj.getClass()) {
			return false;
		}
		SimpleDataSource other = (SimpleDataSource) obj;
		if (dbDriver == null) {
			if (other.dbDriver != null) {
				return false;
			}
		} else if (!dbDriver.equals(other.dbDriver)) {
			return false;
		}
		if (dbLogin == null) {
			if (other.dbLogin != null) {
				return false;
			}
		} else if (!dbLogin.equals(other.dbLogin)) {
			return false;
		}
		if (dbPassword == null) {
			if (other.dbPassword != null) {
				return false;
			}
		} else if (!dbPassword.equals(other.dbPassword)) {
			return false;
		}
		if (dbServer == null) {
			if (other.dbServer != null) {
				return false;
			}
		} else if (!dbServer.equals(other.dbServer)) {
			return false;
		}
		return true;
	}

	@Override
	public Logger getParentLogger() throws SQLFeatureNotSupportedException {
		// TODO Auto-generated method stub
		return null;
	}

}
