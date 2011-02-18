package fr.ifn.eforest.common.database.metadata;

/**
 * A table field (a column).
 */
public class TableFieldData {

	// The logical name of the table
	private String format;

	// The logical name of the data
	private String fieldName;

	// The physical name of the table
	private String tableName;

	// The physical name of the column
	private String columnName;

	// The type of the unit (NUMERIC, STRING, ...)
	private String type;

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
	 * @return the columnName
	 */
	public String getColumnName() {
		return columnName;
	}

	/**
	 * @param columnName
	 *            the columnName to set
	 */
	public void setColumnName(String columnName) {
		this.columnName = columnName;
	}

	/**
	 * @return the fieldName
	 */
	public String getFieldName() {
		return fieldName;
	}

	/**
	 * @param fieldName
	 *            the fieldName to set
	 */
	public void setFieldName(String fieldName) {
		this.fieldName = fieldName;
	}

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
	 * @return the type
	 */
	public String getType() {
		return type;
	}

	/**
	 * @param type
	 *            the type to set
	 */
	public void setType(String type) {
		this.type = type;
	}

	/**
	 * Return a description of the object.
	 * 
	 * @return the string
	 */
	@Override
	public String toString() {
		return getTableName() + " - " + getColumnName();
	}

	/**
	 * Return the hashcode of the object.
	 * 
	 * @return the hashcode
	 */
	public int hashCode() {
		final int prime = 31;
		int result = 1;
		result = prime * result + ((fieldName == null) ? 0 : fieldName.hashCode());
		result = prime * result + ((format == null) ? 0 : format.hashCode());
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
		TableFieldData other = (TableFieldData) obj;
		if (fieldName == null) {
			if (other.fieldName != null) {
				return false;
			}
		} else if (!fieldName.equals(other.fieldName)) {
			return false;
		}
		if (format == null) {
			if (other.format != null) {
				return false;
			}
		} else if (!format.equals(other.format)) {
			return false;
		}
		return true;
	}

}
