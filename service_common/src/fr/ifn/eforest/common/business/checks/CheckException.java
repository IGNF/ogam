package fr.ifn.eforest.common.business.checks;

import java.util.HashMap;
import java.util.Map;

import fr.ifn.eforest.common.database.metadata.ChecksDAO;

/**
 * Exception linked to a check.
 */
public class CheckException extends Exception {

	// Error Labels
	private static Map<Integer, String> errorLabels = new HashMap<Integer, String>();

	// Initialise the check error labels
	static {
		ChecksDAO checksDAO = new ChecksDAO();
		initialiseErrorLabels(checksDAO.getDescriptions());
	}

	/**
	 * Serial UID.
	 */
	private static final long serialVersionUID = -3450099086293043774L;

	// The check code
	private Integer checkCode = null;

	// The expected value
	private String expectedValue = null;

	// The found value
	private String foundValue = null;

	// The line number
	private Integer lineNumber = 0;

	// The source format
	private String sourceFormat = null;

	// The source data
	private String sourceData = null;

	// The submissionId
	private Integer submissionId = null;

	// The plot code
	private String plotCode = null;

	/**
	 * Constructor.
	 * 
	 * @param checkCode
	 *            the identifier of the check.
	 */
	public CheckException(Integer checkCode) {
		super(getErrorLabel(checkCode));
		this.checkCode = checkCode;
	}

	/**
	 * Initialise the error label table.
	 * 
	 * @param anErrorLabels
	 *            the map of error labels.
	 */
	public static void initialiseErrorLabels(Map<Integer, String> anErrorLabels) {
		errorLabels = anErrorLabels;
	}

	/**
	 * Return the label corresponding to a code.
	 * 
	 * @param checkCode
	 *            the identifier of the check.
	 * @return the corresponding label.
	 */
	public static String getErrorLabel(Integer checkCode) {
		String label = errorLabels.get(checkCode);
		if (label == null) {
			label = "Unknow error type";
		}
		return label;
	}

	/**
	 * Return the check identifier.
	 * 
	 * @return the check code
	 */
	public Integer getCheckCode() {
		return checkCode;
	}

	/**
	 * Set the check identifier.
	 * 
	 * @param checkCode
	 *            the checkCode to set
	 */
	public void setCheckCode(Integer checkCode) {
		this.checkCode = checkCode;
	}

	/**
	 * @return the expectedValue
	 */
	public String getExpectedValue() {
		return expectedValue;
	}

	/**
	 * @param expectedValue
	 *            the expectedValue to set
	 */
	public void setExpectedValue(String expectedValue) {
		this.expectedValue = expectedValue;
	}

	/**
	 * @return the foundValue
	 */
	public String getFoundValue() {
		return foundValue;
	}

	/**
	 * @param foundValue
	 *            the foundValue to set
	 */
	public void setFoundValue(String foundValue) {
		this.foundValue = foundValue;
	}

	/**
	 * @return the lineNumber
	 */
	public Integer getLineNumber() {
		return lineNumber;
	}

	/**
	 * @param lineNumber
	 *            the lineNumber to set
	 */
	public void setLineNumber(Integer lineNumber) {
		this.lineNumber = lineNumber;
	}

	/**
	 * @return the submissionId
	 */
	public Integer getSubmissionId() {
		return submissionId;
	}

	/**
	 * @param submissionId
	 *            the submissionId to set
	 */
	public void setSubmissionId(Integer submissionId) {
		this.submissionId = submissionId;
	}

	/**
	 * @return the sourceFormat
	 */
	public String getSourceFormat() {
		return sourceFormat;
	}

	/**
	 * @param sourceFormat
	 *            the sourceFormat to set
	 */
	public void setSourceFormat(String sourceFormat) {
		this.sourceFormat = sourceFormat;
	}

	/**
	 * @return the plotCode
	 */
	public String getPlotCode() {
		return plotCode;
	}

	/**
	 * @param plotCode
	 *            the plotCode to set
	 */
	public void setPlotCode(String plotCode) {
		this.plotCode = plotCode;
	}

	/**
	 * @return the sourceData
	 */
	public String getSourceData() {
		return sourceData;
	}

	/**
	 * @param sourceData
	 *            the sourceData to set
	 */
	public void setSourceData(String sourceData) {
		this.sourceData = sourceData;
	}

}
