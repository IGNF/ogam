package fr.ifn.eforest.common.database.metadata;

/**
 * A file field (a column in a CSv file).
 */
public class FileFieldData extends FieldData {

	/**
	 * Indicate if the field is mandatory
	 */
	private Boolean isMandatory;

	/**
	 * The mask of the field
	 */
	private String mask;

	/**
	 * @return the isMandatory
	 */
	public Boolean getIsMandatory() {
		return isMandatory;
	}

	/**
	 * @param isMandatory
	 *            the isMandatory to set
	 */
	public void setIsMandatory(Boolean isMandatory) {
		this.isMandatory = isMandatory;
	}

	/**
	 * @return the mask
	 */
	public String getMask() {
		return mask;
	}

	/**
	 * @param mask
	 *            the mask to set
	 */
	public void setMask(String mask) {
		this.mask = mask;
	}

}
