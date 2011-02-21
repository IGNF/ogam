package fr.ifn.eforest.common.database.metadata;

/**
 * A request format (a CSV File specification).
 */
public class RequestFormatData {

	private String format;

	private String fileType;

	/**
	 * @return the format
	 */
	public String getFormat() {
		return format;
	}

	/**
	 * @param format
	 *            the format to set
	 */
	public void setFormat(String format) {
		this.format = format;
	}

	/**
	 * @return the fileType
	 */
	public String getFileType() {
		return fileType;
	}

	/**
	 * @param fileType
	 *            the fileType to set
	 */
	public void setFileType(String fileType) {
		this.fileType = fileType;
	}

	/**
	 * Return a String representation of the Object.
	 * 
	 * @return the string
	 */
	@Override
	public String toString() {
		return getFormat();
	}

}
