package fr.ifn.eforest.interpolation.business;

import java.io.BufferedReader;
import java.io.InputStreamReader;

import org.rosuda.JRI.Rengine;
import org.rosuda.JRI.RMainLoopCallbacks;

/**
 * Text Console for R outputs.<br/>
 * <br/>
 * This is a wrapper that simulates the R environment for the engine.<br/>
 * The methods are callbacks called by the R engine.
 */
class TextConsole implements RMainLoopCallbacks {

	/**
	 * Indicate that the R engine is busy.
	 * 
	 * @param re
	 *            the engine
	 * @param which
	 *            the identifier of the engine
	 */
	public void rBusy(Rengine re, int which) {
		System.out.println("rBusy(" + which + ")");
	}

	/**
	 * Read data from the console.
	 * 
	 * @param re
	 *            the engine
	 * @param prompt
	 *            the prompt to display
	 * @param addToHistory
	 *            add the line to history or not
	 * @return the data read from the console
	 */
	public String rReadConsole(Rengine re, String prompt, int addToHistory) {
		System.out.print(prompt);
		try {
			BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
			String s = br.readLine();
			return (s == null || s.length() == 0) ? s : s + "\n";
		} catch (Exception e) {
			System.out.println("jriReadConsole exception: " + e.getMessage());
		}
		return null;
	}

	/**
	 * Display a message.
	 * 
	 * @param re
	 *            the engine
	 * @param message
	 *            the message to display
	 */
	public void rShowMessage(Rengine re, String message) {
		System.out.println("rShowMessage \"" + message + "\"");
	}

	/**
	 * Should return the path to a file.
	 * 
	 * @param re
	 *            the engine
	 * @param newFile
	 *            is it a new file
	 * @return the file path
	 */
	public String rChooseFile(Rengine re, int newFile) {
		System.out.println("rChooseFile");
		return "";
	}

	/**
	 * Flush the console.
	 * 
	 * @param re
	 *            the engine
	 */
	public void rFlushConsole(Rengine re) {
		System.out.println("rFlushConsole");
	}

	/**
	 * Load console history.
	 * 
	 * @param re
	 *            the engine
	 * @param filename
	 *            the name of the file
	 */
	public void rLoadHistory(Rengine re, String filename) {
		System.out.println("rLoadHistory");
	}

	/**
	 * Save console History.
	 * 
	 * @param re
	 *            the engine
	 * @param filename
	 *            the name of the file
	 */
	public void rSaveHistory(Rengine re, String filename) {
		System.out.println("rSaveHistory");
	}

	/**
	 * Write to the console.
	 * 
	 * @param re
	 *            the engine
	 * @param text
	 *            the text to write
	 * @param arg2
	 *            ???
	 */
	public void rWriteConsole(Rengine re, String text, int arg2) {
		System.out.print(text);
	}
}