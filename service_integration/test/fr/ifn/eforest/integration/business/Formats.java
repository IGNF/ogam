package fr.ifn.eforest.integration.business;

/**
 * List the file types.
 */
public interface Formats {

	//
	// CSV File formats
	//

	/**
	 * A location file.
	 */
	String LOCATION_FILE = "LOCATION_FILE";

	/**
	 * A strata file.
	 */
	String STRATA_FILE = "STRATA_FILE";

	/**
	 * A plot file for the work package 3.
	 */
	String WP3_PLOT_FILE = "WP3_PLOT_FILE";

	/**
	 * A species file for the work package 3.
	 */
	String WP3_SPECIES_FILE = "WP3_SPECIES_FILE";

	//
	// Table formats
	//

	/**
	 * The plot table.
	 */
	String PLOT_DATA = "PLOT_DATA";

	/**
	 * The plot complementary data table.
	 */
	String PLOT_VARIABLE = "PLOT_VARIABLE";

	/**
	 * /** The species table.
	 */
	String SPECIES_DATA = "SPECIES_DATA";

	/**
	 * The location table.
	 */
	String LOCATION_DATA = "LOCATION_DATA";

	/**
	 * The strata table.
	 */
	String STRATA_DATA = "STRATA_DATA";

	//
	// Form formats
	//

	/**
	 * The plot form.
	 */
	String PLOT_FORM = "PLOT_FORM";

	/**
	 * The species form.
	 */
	String SPECIES_FORM = "SPECIES_FORM";

}
