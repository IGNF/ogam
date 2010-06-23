package fr.ifn.eforest.common.util;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.io.Reader;
import java.io.Writer;
import java.util.*;

import fr.ifn.eforest.common.util.StringUtils;

/**
 * Utility class used to load a CSV file.
 * 
 * @author Glob
 * @version 0.1
 */
public class CSVFile {

	// Number of rows in the file
	private int rowsCount;

	// Number of lines in the file
	private int fileLineNumber;

	// Number of columns in the file
	private int colsCount;

	// The content of the file, stored as an Array.
	private List fileContent;

	// The cell separator
	private final static char CELL_SEPARATOR = ';';

	// The text separator (used to avoid breaking cells when a separator is inside a String)
	private final static char TEXT_SEPARATOR = '"';

	/**
	 * Constructor.
	 * 
	 * @param path
	 *            le chemin du fichier à parser.
	 * @throws FileNotFoundException
	 *             si le fichier spécifié n'existe pas.
	 */
	public CSVFile(String path) throws FileNotFoundException {
		fileContent = new ArrayList();
		FileReader fileReader = new FileReader(path);
		readFromFile(fileReader);
	}

	/**
	 * Constructor.
	 * 
	 * @param reader
	 *            un reader dans lequel on lit le fichier CSV.
	 */
	public CSVFile(Reader reader) {
		fileContent = new ArrayList();
		readFromFile(reader);
	}

	/**
	 * Return the content of the file as a list.
	 * 
	 * @return the content
	 */
	public List getFileContent() {
		return fileContent;
	}

	/**
	 * Read the data from the file.
	 * 
	 * @param reader
	 *            A reader on the file
	 */
	private void readFromFile(Reader reader) {
		BufferedReader buffReader = new BufferedReader(reader);
		if (buffReader != null) {
			try {
				String tempLine = "";
				while (tempLine != null) {
					tempLine = buffReader.readLine();
					if (tempLine != null && !tempLine.trim().startsWith("//") && !tempLine.trim().equals("")) {
						readFromLine(tempLine);
					}
					fileLineNumber++;
				}
			} catch (IOException e) {
				System.err.println("Error reading CSV file: " + e.toString());
			} finally {
				try {
					buffReader.close();
				} catch (IOException e) {
					System.err.println("Erreur closing CSV file: " + e.toString());
				}
			}
		}
	}

	/**
	 * Read data from one line.
	 * 
	 * @param tempLine
	 *            one line
	 */
	private void readFromLine(String tempLine) {
		if (tempLine == null) {
			return;
		}
		List currentLine = new ArrayList();
		fileContent.add(currentLine);
		rowsCount++;
		// setRowsCount(getRowsCount() + 1);
		if (tempLine.trim().length() == 0) {
			return;
		}
		int colCount = 0;
		int cursorBegin = 0;
		int cursorEnd = tempLine.indexOf(CELL_SEPARATOR);
		while (cursorBegin > -1) {
			while (cursorEnd != -1 && tempLine.charAt(cursorBegin) == TEXT_SEPARATOR && tempLine.charAt(cursorEnd - 1) != TEXT_SEPARATOR) {
				cursorEnd = tempLine.indexOf(CELL_SEPARATOR, cursorEnd + 1);
			}
			if (cursorEnd == -1) {
				currentLine.add(StringUtils.trimQuotes(tempLine.substring(cursorBegin)));
				cursorBegin = cursorEnd;
			} else {
				currentLine.add(StringUtils.trimQuotes(tempLine.substring(cursorBegin, cursorEnd)));
				cursorBegin = cursorEnd + 1;
			}
			cursorEnd = tempLine.indexOf(CELL_SEPARATOR, cursorBegin);
			colCount++;
		}
		if (colCount > getColsCount()) {
			setColsCount(Math.max(getColsCount(), colCount));
		}
	}

	/**
	 * Returns the colsCount.
	 * 
	 * @return int
	 */
	public int getColsCount() {
		return colsCount;
	}

	/**
	 * Returns the rowsCount.
	 * 
	 * @return int
	 */
	public int getRowsCount() {
		return rowsCount;
	}

	/**
	 * Returns the fileLineNumber.
	 * 
	 * @return int
	 */
	public int getFileLineNumber() {
		return fileLineNumber;
	}

	/**
	 * Returns the lines where the number of column is different than what is expected.
	 * 
	 * @param colnbr
	 *            The expected number of columns
	 * @return List The rows having more or less colunms than expected
	 */
	public List<LineInfo> getWrongColumnNumberLines(int colnbr) {
		List colsCounts = new ArrayList();
		for (int row = 0; row < getRowsCount(); row++) {
			int lineSize = ((ArrayList) fileContent.get(row)).size();
			if (lineSize != colnbr) {
				LineInfo lineInfo = new LineInfo();
				lineInfo.setColNumber(lineSize); //The row column number
				lineInfo.setLineNumber(row + 1); //The row number
				colsCounts.add(lineInfo);
			}
		}
		return colsCounts;
	}

	/**
	 * Sets the colsCount.
	 * 
	 * @param colsCount
	 *            The colsCount to set
	 */
	public void setColsCount(int colsCount) {
		this.colsCount = colsCount;
	}

	/**
	 * Sets the rowsCount.
	 * 
	 * @param rowsCount
	 *            The rowsCount to set
	 */
	public void setRowsCount(int rowsCount) {
		this.rowsCount = rowsCount;
	}

	/**
	 * Method getData.
	 * 
	 * @param row
	 *            la ligne voulue
	 * @param col
	 *            la colonne voulue
	 * @return String la valeur à l'enplacement spécifié. Null si outOfBound.
	 */
	public String getData(int row, int col) {
		if (row < 0 || col < 0 || row > (getRowsCount() - 1) || col > (getColsCount() - 1)) {
			return null;
		}
		try {
			List theRow = (List) fileContent.get(row);
			String result = (String) theRow.get(col);
			return (result == null ? "" : result);
		} catch (IndexOutOfBoundsException e) {
			return "";
		}
	}

	/**
	 * Method setData.
	 * 
	 * @param row
	 *            le numéro de ligne (commence à 0).
	 * @param col
	 *            le numéro de colonne (commence à 0).
	 * @param data
	 *            les données à insérer.
	 */
	public void setData(int row, int col, String data) {
		if (row < 0 || col < 0 || row > (getRowsCount() - 1) || col > (getColsCount() - 1)) {
			throw new IndexOutOfBoundsException();
		}
		List theRow = (List) fileContent.get(row);
		theRow.set(col, data);
	}

	/**
	 * Method write.
	 * 
	 * @param filePath
	 *            le fichier dans lequel sauver les données.
	 * @throws IOException
	 *             si une erreur survient.
	 */
	public void write(String filePath) throws IOException {
		FileWriter fileWriter = new FileWriter(filePath);
		write(fileWriter);
	}

	/**
	 * Method write.
	 * 
	 * @param aWriter
	 *            le writer dans lequel on veut écrire les données.
	 * @throws IOException
	 *             si une erreur survient.
	 */
	public void write(Writer aWriter) throws IOException {
		BufferedWriter writer;
		writer = new BufferedWriter(aWriter);
		int fileSize = getRowsCount();
		int colCount = getColsCount();
		for (int i = 0; i < fileSize; i++) {
			for (int j = 0; j < colCount; j++) {
				writer.write(getData(i, j));
				if (j + 1 < colCount) {
					writer.write(CELL_SEPARATOR);
				}
			}
			if (i + 1 < fileSize) {
				writer.write("\n");
			}
		}
		writer.flush();
		writer.close();
	}
}
