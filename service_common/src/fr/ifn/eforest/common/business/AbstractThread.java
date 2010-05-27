package fr.ifn.eforest.common.business;

/**
 * Represent a process of the Eforest Application.
 */
public class AbstractThread extends Thread {

	// We store the current status of the process
	private String taskName;
	private Integer currentCount;
	private Integer totalCount;

	/**
	 * @return the currentName
	 */
	public String getTaskName() {
		return taskName;
	}

	/**
	 * @param currentName
	 *            the currentName to set
	 */
	public void setTaskName(String taskName) {
		this.taskName = taskName;
	}

	/**
	 * @return the currentCount
	 */
	public Integer getCurrentCount() {
		return currentCount;
	}

	/**
	 * @param currentCount
	 *            the currentCount to set
	 */
	public void setCurrentCount(Integer currentCount) {
		this.currentCount = currentCount;
	}

	/**
	 * @return the totalCount
	 */
	public Integer getTotalCount() {
		return totalCount;
	}

	/**
	 * @param totalCount
	 *            the totalCount to set
	 */
	public void setTotalCount(Integer totalCount) {
		this.totalCount = totalCount;
	}

	/**
	 * Update the information about the current process.
	 * 
	 * @param name
	 *            The name of the current task
	 * @param current
	 *            The position in the current task
	 * @param total
	 *            The number of items in the current task
	 */
	public void updateInfo(String name, Integer current, Integer total) {
		setTaskName(name);
		setCurrentCount(current);
		setTotalCount(total);
	}

}
