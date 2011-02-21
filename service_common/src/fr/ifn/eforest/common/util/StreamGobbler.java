package fr.ifn.eforest.common.util;

import java.io.*;

/**
 * Classe permettant de lire en continu la sortie d'un processus.
 */
public class StreamGobbler extends Thread {

	InputStream is;

	String content = "";

	/**
	 * Constructor
	 * 
	 * @param is
	 *            The input stream
	 */
	public StreamGobbler(InputStream is) {
		this.is = is;
	}

	/**
	 * Read the content of an input stream.
	 */
	public void run() {
		try {
			InputStreamReader isr = new InputStreamReader(is);
			BufferedReader br = new BufferedReader(isr);
			String line = null;
			while ((line = br.readLine()) != null) {
				content += line + "\n";
			}
		} catch (IOException ioe) {
			ioe.printStackTrace();
		}
	}

	/**
	 * Return the read data.
	 * 
	 * @return the content
	 */
	public String getContent() {
		return content;
	}

}