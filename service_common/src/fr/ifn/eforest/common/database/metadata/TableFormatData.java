package fr.ifn.eforest.common.database.metadata;

import java.util.ArrayList;
import java.util.List;

/**
 * A table format.
 * 
 * Describes the table.
 */
public class TableFormatData extends FormatData {

	/**
	 * The physical name of the table.
	 */
	private String tableName;

	/**
	 * The name of the schema.
	 */
	private String schemaCode;

	/**
	 * The list of primary keys of the table.
	 */
	private List<String> primaryKeys = new ArrayList<String>();

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
	 * @return the primaryKeys
	 */
	public List<String> getPrimaryKeys() {
		return primaryKeys;
	}

	/**
	 * @param primaryKeys
	 *            the primaryKeys to set
	 */
	public void setPrimaryKeys(List<String> primaryKeys) {
		this.primaryKeys = primaryKeys;
	}

	/**
	 * @param key
	 *            the key to add
	 */
	public void addPrimaryKey(String key) {
		this.primaryKeys.add(key);
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

}
