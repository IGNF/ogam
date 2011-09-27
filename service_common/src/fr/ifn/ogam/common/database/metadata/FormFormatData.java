package fr.ifn.ogam.common.database.metadata;

/**
 * A form format (a HTML form).
 */
public class FormFormatData extends FormatData {

	/**
	 * The label of the form.
	 */
	private String label;

	/**
	 * The definition of the form.
	 */
	private String definition;

	/**
	 * The position of the form in the dataset.
	 */
	private Integer position;

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
	 * @return the definition
	 */
	public String getDefinition() {
		return definition;
	}

	/**
	 * @param definition
	 *            the definition to set
	 */
	public void setDefinition(String definition) {
		this.definition = definition;
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

}
