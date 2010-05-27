package fr.ifn.eforest.integration.servlet;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.fileupload.FileItem;

import fr.ifn.eforest.common.servlet.AbstractUploadServlet;
import fr.ifn.eforest.common.business.ThreadLock;
import fr.ifn.eforest.common.business.Formats;
import fr.ifn.eforest.integration.business.submissions.SubmissionStatus;
import fr.ifn.eforest.integration.business.submissions.strata.StrataService;
import fr.ifn.eforest.integration.business.submissions.strata.StrataServiceThread;
import fr.ifn.eforest.integration.database.rawdata.SubmissionData;

/**
 * StrataServlet.
 */
public class StrataServlet extends AbstractUploadServlet {

	/**
	 * The serial version ID used to identify the object.
	 */
	protected static final long serialVersionUID = -123484792196121245L;

	/**
	 * The business object related to strata.
	 */
	private transient StrataService strataService = new StrataService();

	/**
	 * Input parameters.
	 */
	private static final String COUNTRY_CODE = "COUNTRY_CODE";
	private static final String SUBMISSION_ID = "SUBMISSION_ID";
	private static final String ACTION = "action";
	private static final String ACTION_STRATA_SUBMISSION = "NewStrataSubmission";
	private static final String ACTION_UPLOAD_STRATA = "UploadStrata";
	private static final String ACTION_CANCEL_STRATA_SUBMISSION = "CancelStrataSubmission";
	private static final String ACTION_STATUS = "status";

	/**
	 * Main function of the servlet.
	 * 
	 * @param request
	 *            the request done to the servlet
	 * @param response
	 *            the response sent
	 */
	public void service(HttpServletRequest request, HttpServletResponse response) throws IOException {

		// Permet de stocker temporairement le nom des parametres
		Map<String, String> requestParameters = new HashMap<String, String>();

		String action = null;

		response.setContentType("text/xml");
		response.setCharacterEncoding("UTF-8");
		ServletOutputStream out = response.getOutputStream();

		logRequestParameters(request);

		try {
			logger.debug("Strata Servlet called");

			action = request.getParameter(ACTION);
			if (action == null) {
				throw new Exception("The " + ACTION + " parameter is mandatory");
			}

			// Check the content-type
			String contentType = request.getHeader("content-type");

			//
			// New Submission
			//
			if (action.equals(ACTION_STRATA_SUBMISSION)) {

				String codeCountry = request.getParameter(COUNTRY_CODE);
				if (codeCountry == null) {
					throw new Exception("The " + COUNTRY_CODE + " parameter is mandatory");
				}

				Integer newSubmissionId = strataService.newSubmission(codeCountry);

				out.print(generateResult("" + newSubmissionId));

			} else

			//
			// Cancel the submission
			//
			if (action.equals(ACTION_CANCEL_STRATA_SUBMISSION)) {

				// Get the posted form parameters
				String submissionIDStr = request.getParameter(SUBMISSION_ID);
				if (submissionIDStr == null) {
					throw new Exception("The " + SUBMISSION_ID + " parameter is mandatory");
				}
				Integer submissionID = Integer.valueOf(submissionIDStr);

				// Cancel the submission
				strataService.cancelSubmission(submissionID);

				out.print(generateResult("OK"));
			} else

			//
			// Get the STATE of the process for a submission
			//
			if (action.equals(ACTION_STATUS)) {

				// Get the posted form parameters
				String submissionIDStr = request.getParameter(SUBMISSION_ID);

				if (submissionIDStr == null) {
					throw new Exception("The " + SUBMISSION_ID + " parameter is mandatory");
				}

				Integer submissionID = Integer.valueOf(submissionIDStr);

				// Try to get the instance of the checkservice for this submissionId
				StrataServiceThread process = (StrataServiceThread) ThreadLock.getInstance().getProcess(submissionIDStr);

				if (process != null) {
					// There is a running thread, we get its current status.
					out.print(generateResult(SubmissionStatus.RUNNING, process));
				} else {
					// We try to get the status of the submission
					out.print(generateResult(strataService.getSubmission(submissionID).getStatus()));
				}

			} else

			//
			// Upload some data
			//			
			if (action.equals(ACTION_UPLOAD_STRATA) && contentType.matches("multipart/form-data.*")) {

				// Parse the multipart message
				List uploadedItems = fileUpload.parseRequest(request);
				List<FileItem> fileFieldsList = new ArrayList<FileItem>();
				List<FileItem> formFieldsList = new ArrayList<FileItem>();
				Iterator iter = uploadedItems.iterator();
				while (iter.hasNext()) {
					FileItem item = (FileItem) iter.next();
					if (item.isFormField()) {
						formFieldsList.add(item);
					} else {
						fileFieldsList.add(item);
					}
				}

				// Store the form items in the Map
				Iterator formIter = formFieldsList.iterator();
				while (formIter.hasNext()) {
					FileItem item = (FileItem) formIter.next();
					String fieldName = item.getFieldName().trim();
					String fieldValue = item.getString().trim();
					requestParameters.put(fieldName, fieldValue);
				}

				String submissionIDStr = requestParameters.get(SUBMISSION_ID);

				if (submissionIDStr == null) {
					throw new Exception("The " + SUBMISSION_ID + " parameter is mandatory");
				}
				Integer submissionId = Integer.valueOf(submissionIDStr);

				// Check that the country code is consistent with the submission
				String countryCode = requestParameters.get(COUNTRY_CODE);
				SubmissionData submissionData = strataService.getSubmission(submissionId);
				if (!submissionData.getCountryCode().equalsIgnoreCase(countryCode)) {
					throw new Exception("The country code doesn't match the submission country code");
				}

				// Upload the file items in the directory
				Iterator fileIter = fileFieldsList.iterator();
				while (fileIter.hasNext()) {
					FileItem item = (FileItem) fileIter.next();
					String fieldName = item.getFieldName().trim();
					if (fieldName.equalsIgnoreCase(Formats.STRATA_FILE)) {
						String fileName = pathFileDirectory + separator + submissionId + separator + Formats.STRATA_FILE + separator + item.getName().trim();
						uploadFile(item, fileName);
						requestParameters.put(Formats.STRATA_FILE, fileName);
					}
				}

				String strataFile = requestParameters.get(Formats.STRATA_FILE);
				if (strataFile == null) {
					throw new Exception("The " + Formats.STRATA_FILE + " parameter is mandatory");
				}

				// Check if a thread is already running
				Thread process = ThreadLock.getInstance().getProcess(submissionIDStr);
				if (process != null) {
					throw new Exception("A process is already running for this country");
				}

				// Launch the harmonization thread
				process = new StrataServiceThread(submissionId, strataFile, requestParameters);
				process.start();

				// Register the running thread
				ThreadLock.getInstance().lockProcess(submissionIDStr, process);

				// Output the current status of the check service
				out.print(generateResult(SubmissionStatus.RUNNING));

			} else {
				throw new Exception("The action type is unknown or does not match the expected mime type, valid actions are " + //
						ACTION_STRATA_SUBMISSION + ", " + //
						ACTION_UPLOAD_STRATA + ", " + //
						ACTION_CANCEL_STRATA_SUBMISSION);
			}

		} catch (Exception e) {
			logger.error("Server error", e);
			out.print(generateErrorMessage(e.getMessage()));
		}
	}

}
