package fr.ifn.eforest.common.util;

/**
 * Information about a line of the CSV file.
 */
public class LineInfo {

	/**
	 * The line number.
	 */
	private int lineNumber;

	/**
	 * The number of columns on the line.
	 */
	private int colNumber;

	/**
	 * @return the lineNumber
	 */
	public int getLineNumber() {
		return lineNumber;
	}

	/**
	 * @param lineNumber
	 *            the lineNumber to set
	 */
	public void setLineNumber(int lineNumber) {
		this.lineNumber = lineNumber;
	}

	/**
	 * @return the colNumber
	 */
	public int getColNumber() {
		return colNumber;
	}

	/**
	 * @param colNumber
	 *            the colNumber to set
	 */
	public void setColNumber(int colNumber) {
		this.colNumber = colNumber;
	}

}
