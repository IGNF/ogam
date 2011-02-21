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

	/**
	 * Map a field from the raw database (qualitative value, for exemple basal_area) to the related domain field (domain_basal_area).
	 */
	String DOMAIN_MAPPING = "DOMAIN";

}
