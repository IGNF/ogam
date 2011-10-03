package fr.ifn.ogam.common.database.rawdata;

/**
 * Submission data.
 */
public class SubmissionData {

	private Integer submissionId;

	private String status;

	private String step;

	private String providerId;

	private String datasetId;

	private String userLogin;

	/**
	 * @return the submissionId
	 */
	public Integer getSubmissionId() {
		return submissionId;
	}

	/**
	 * @param submissionId
	 *            the submissionId to set
	 */
	public void setSubmissionId(Integer submissionId) {
		this.submissionId = submissionId;
	}

	/**
	 * @return the status
	 */
	public String getStatus() {
		return status;
	}

	/**
	 * @param status
	 *            the status to set
	 */
	public void setStatus(String status) {
		this.status = status;
	}

	/**
	 * @return the step
	 */
	public String getStep() {
		return step;
	}

	/**
	 * @param step
	 *            the step to set
	 */
	public void setStep(String step) {
		this.step = step;
	}

	/**
	 * @return the providerId
	 */
	public String getProviderId() {
		return providerId;
	}

	/**
	 * @param providerId
	 *            the providerId to set
	 */
	public void setProviderId(String providerId) {
		this.providerId = providerId;
	}

	/**
	 * @return the datasetID
	 */
	public String getDatasetId() {
		return datasetId;
	}

	/**
	 * @param datasetId
	 *            the datasetId to set
	 */
	public void setDatasetId(String datasetId) {
		this.datasetId = datasetId;
	}

	/**
	 * @return the userLogin
	 */
	public String getUserLogin() {
		return userLogin;
	}

	/**
	 * @param userLogin
	 *            the userLogin to set
	 */
	public void setUserLogin(String userLogin) {
		this.userLogin = userLogin;
	}

}
