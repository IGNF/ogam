package fr.ifn.eforest.common.business;

/**
 * Abstract Service for the Eforest application.
 */
public class AbstractService {

	// The thread running this service
	protected AbstractThread thread = null;

	/**
	 * Constructor.
	 */
	public AbstractService() {
		super();
	}

	/**
	 * Constructor.
	 * 
	 * @param thread
	 *            the thread to notify during the process
	 */
	public AbstractService(AbstractThread thread) {
		super();
		this.thread = thread;
	}

}
