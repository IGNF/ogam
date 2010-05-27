package fr.ifn.eforest.common.database.metadata;

/**
 * A dataset.
 * 
 * Describes a dataset (a JRC Request).
 */
public class DatasetData {

	private String datasetId;

	private String label;

	/**
	 * @return the requestId
	 */
	public String getRequestId() {
		return datasetId;
	}

	/**
	 * @param requestId
	 *            the requestId to set
	 */
	public void setRequestId(String requestId) {
		this.datasetId = requestId;
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

	/**
	 * Return a String representation of the object.
	 * 
	 * @return the string
	 */
	@Override
	public String toString() {
		return getLabel();
	}

}
