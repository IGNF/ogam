package fr.ifn.eforest.common.database.metadata;

/**
 * A table format.
 * 
 * Describes the table.
 */
public class TableFormatData {

	private String format;

	private String tableName;

	private String schemaCode;

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
	 * @return the tableName
	 */
	public String getTableName() {
		return tableName;
	}

	/**
	 * @param tableName
	 *            the tableName to set
	 */
	public void setTableName(String tableName) {
		this.tableName = tableName;
	}

	/**
	 * @return the schemaCode
	 */
	public String getSchemaCode() {
		return schemaCode;
	}

	/**
	 * @param schemaCode
	 *            the schemaCode to set
	 */
	public void setSchemaCode(String schemaCode) {
		this.schemaCode = schemaCode;
	}

	/**
	 * Return a String description of the Object.
	 * 
	 * @return the string
	 */
	@Override
	public String toString() {
		return getFormat() + " - " + getTableName();
	}

	/**
	 * Return the hashcode of the object.
	 * 
	 * @return the hashcode
	 */
	@Override
	public int hashCode() {
		final int prime = 31;
		int result = 1;
		result = prime * result + ((format == null) ? 0 : format.hashCode());
		result = prime * result + ((schemaCode == null) ? 0 : schemaCode.hashCode());
		return result;
	}

	/**
	 * Check if two objects are equal.
	 * 
	 * @param obj
	 *            The object to compare with
	 * @return 0 if equals, -1 or 1 otherwise.
	 */
	@Override
	public boolean equals(Object obj) {
		if (this == obj) {
			return true;
		}
		if (obj == null) {
			return false;
		}
		if (getClass() != obj.getClass()) {
			return false;
		}
		TableFormatData other = (TableFormatData) obj;
		if (format == null) {
			if (other.format != null) {
				return false;
			}
		} else if (!format.equals(other.format)) {
			return false;
		}
		if (schemaCode == null) {
			if (other.schemaCode != null) {
				return false;
			}
		} else if (!schemaCode.equals(other.schemaCode)) {
			return false;
		}
		return true;
	}

}
