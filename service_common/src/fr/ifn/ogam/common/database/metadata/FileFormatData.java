package fr.ifn.ogam.common.database.metadata;

/**
 * A file format (a CSV file).
 */
public class FileFormatData extends FormatData {

	/**
	 * The file type (identifier of the set of fields).
	 */
	private String fileType;

	/**
	 * The file extension (CSV).
	 */
	private String fileExtension;

	/**
	 * The position in the dataset.
	 */
	private Integer position;

	/**
	 * A label.
	 */
	private String label;

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
	 * @return the fileExtension
	 */
	public String getFileExtension() {
		return fileExtension;
	}

	/**
	 * @param fileExtension
	 *            the fileExtension to set
	 */
	public void setFileExtension(String fileExtension) {
		this.fileExtension = fileExtension;
	}

	/**
	 * @return the position
	 */
	public Integer getPosition() {
		return position;
	}

	/**
	 * @param position
	 *            the position to set
	 */
	public void setPosition(Integer position) {
		this.position = position;
	}

	/**
	 * @return the label
	 */
	public String getLabel() {
		return label;
	}

	/**
	 * @param label
	 *            the label to set
	 */
	public void setLabel(String label) {
		this.label = label;
	}

}
