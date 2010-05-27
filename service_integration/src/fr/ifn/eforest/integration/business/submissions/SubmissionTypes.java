package fr.ifn.eforest.integration.business.submissions;

/**
 * List the submission types.
 */
public interface SubmissionTypes {

	/**
	 * A plot location submission (geographic coordinates).
	 */
	String PLOT_LOCATION = "LOCATION";

	/**
	 * A plot location submission (geographic coordinates).
	 */
	String STRATA = "STRATA";

	/**
	 * A generic data submission (PLOT, TREE or SPECIES data).
	 */
	String DATA = "DATA";


}
