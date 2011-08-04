package fr.ifn.eforest.common.business;

/**
 * List the types of mapping.
 */
public interface MappingTypes {

	/**
	 * Map a field from the database to a form.
	 */
	String FORM_MAPPING = "FORM";

	/**
	 * Map a field from a file to the raw database.
	 */
	String FILE_MAPPING = "FILE";

	/**
	 * Map a field from the raw database to the harmonization database.
	 */
	String HARMONIZATION_MAPPING = "HARMONIZE";

}
