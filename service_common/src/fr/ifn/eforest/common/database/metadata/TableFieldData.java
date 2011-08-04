package fr.ifn.eforest.common.database.metadata;

/**
 * A table field (a column).
 */
public class TableFieldData extends FieldData {

	// The logical name of the table
	private String format;

	// The physical name of the table
	private String tableName;

	// The physical name of the column
	private String columnName;

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

}
