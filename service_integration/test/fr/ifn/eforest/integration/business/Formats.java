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
	 * A plot file.
	 */
	String PLOT_FILE = "PLOT_FILE";

	/**
	 * A species file.
	 */
	String SPECIES_FILE = "SPECIES_FILE";

	//
	// Table formats
	//

	/**
	 * The plot table.
	 */
	String PLOT_DATA = "PLOT_DATA";

	/**
	 * /** The species table.
	 */
	String SPECIES_DATA = "SPECIES_DATA";

	/**
	 * The location table.
	 */
	String LOCATION_DATA = "LOCATION_DATA";

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
