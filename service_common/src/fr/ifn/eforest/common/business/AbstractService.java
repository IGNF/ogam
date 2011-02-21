package fr.ifn.eforest.common.business;

/**
 * Abstract Service for the Eforest application.
 */
public class AbstractService {

	// The thread running this service 
	protected AbstractThread thread = null;

	/**
	 * Constructor
	 */
	public AbstractService() {
		super();
	}

	/**
	 * Constructor
	 */
	public AbstractService(AbstractThread thread) {
		super();
		this.thread = thread;
	}

}
