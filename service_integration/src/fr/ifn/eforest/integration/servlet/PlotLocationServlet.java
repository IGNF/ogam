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
import fr.ifn.eforest.common.business.AbstractThread;
import fr.ifn.eforest.common.business.ThreadLock;
import fr.ifn.eforest.common.business.Formats;
import fr.ifn.eforest.integration.business.submissions.SubmissionStatus;
import fr.ifn.eforest.integration.business.submissions.plotlocation.LocationService;
import fr.ifn.eforest.integration.business.submissions.plotlocation.LocationServiceThread;
import fr.ifn.eforest.integration.business.submissions.plotlocation.LocationValidationThread;
import fr.ifn.eforest.integration.database.rawdata.SubmissionData;

/**
 * PlotLocationServlet.
 */
public class PlotLocationServlet extends AbstractUploadServlet {

	/**
	 * The serial version ID used to identify the object.
	 */
	protected static final long serialVersionUID = -123484792196121243L;

	/**
	 * The business object related to plot locations.
	 */
	private transient LocationService locationService = new LocationService();

	/**
	 * Input parameters.
	 */
	private static final String COUNTRY_CODE = "COUNTRY_CODE";
	private static final String SUBMISSION_ID = "SUBMISSION_ID";
	private static final String ACTION = "action";
	// For the plot location servlet
	private static final String ACTION_NEW_LOCATION_SUBMISSION = "NewLocationSubmission";
	private static final String ACTION_UPLOAD_LOCATIONS = "UploadLocations";
	private static final String ACTION_CANCEL_LOCATION_SUBMISSION = "CancelLocationSubmission";
	private static final String ACTION_STATUS = "status";
	private static final String ACTION_VALIDATION_PLOT_LOCATION_SUBMISSION = "ValidatePlotLocationSubmission";
	private static final String ACTION_VALIDATION_STATUS = "validationStatus";

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
			logger.debug("Plot Location Servlet called");

			action = request.getParameter(ACTION);
			if (action == null) {
				throw new Exception("The " + ACTION + " parameter is mandatory");
			}

			// Check the content-type
			String contentType = request.getHeader("content-type");

			//
			// New Submission
			//
			if (action.equals(ACTION_NEW_LOCATION_SUBMISSION)) {

				String codeCountry = request.getParameter(COUNTRY_CODE);
				if (codeCountry == null) {
					throw new Exception("The " + COUNTRY_CODE + " parameter is mandatory");
				}

				Integer newSubmissionId = locationService.newSubmission(codeCountry);

				out.print(generateResult("" + newSubmissionId));

			} else

			//
			// Cancel the submission
			//
			if (action.equals(ACTION_CANCEL_LOCATION_SUBMISSION)) {

				// Get the posted form parameters
				String submissionIDStr = request.getParameter(SUBMISSION_ID);
				if (submissionIDStr == null) {
					throw new Exception("The " + SUBMISSION_ID + " parameter is mandatory");
				}
				Integer submissionID = Integer.valueOf(submissionIDStr);

				// Cancel the submission
				locationService.cancelSubmission(submissionID);

				out.print(generateResult("OK"));
			} else

			//
			// Validation the submission and precalculate some values
			//
			if (action.equals(ACTION_VALIDATION_PLOT_LOCATION_SUBMISSION)) {

				// Get the posted form parameters
				String submissionIDStr = request.getParameter(SUBMISSION_ID);
				if (submissionIDStr == null) {
					throw new Exception("The " + SUBMISSION_ID + " parameter is mandatory");
				}
				Integer submissionID = Integer.valueOf(submissionIDStr);

				// Get a thread for the process
				AbstractThread process = (AbstractThread) ThreadLock.getInstance().getProcess(submissionIDStr);
				if (process != null) {
					throw new Exception("A process is already running for this submission");
				}

				// Launch the harmonization thread
				process = new LocationValidationThread(submissionID);
				process.start();

				// Register the running thread
				ThreadLock.getInstance().lockProcess(submissionIDStr, process);

				out.print(generateResult(SubmissionStatus.RUNNING, process));
			} else

			//
			// Get the STATUS of the process for a submission
			//
			if (action.equals(ACTION_STATUS)) {

				// Get the posted form parameters
				String submissionIDStr = request.getParameter(SUBMISSION_ID);

				if (submissionIDStr == null) {
					throw new Exception("The " + SUBMISSION_ID + " parameter is mandatory");
				}

				Integer submissionID = Integer.valueOf(submissionIDStr);

				// Try to get the instance of the checkservice for this submissionId
				AbstractThread process = (AbstractThread) ThreadLock.getInstance().getProcess(submissionIDStr);

				if (process != null) {
					// There is a running thread, we get its current status.
					out.print(generateResult(SubmissionStatus.RUNNING, process));
				} else {
					// We try to get the status of the submission
					out.print(generateResult(locationService.getSubmission(submissionID).getStatus()));
				}

			} else

			//
			// Get the STATUS of the validation for a submission
			//
			if (action.equals(ACTION_VALIDATION_STATUS)) {

				// Get the posted form parameters
				String submissionIDStr = request.getParameter(SUBMISSION_ID);

				if (submissionIDStr == null) {
					throw new Exception("The " + SUBMISSION_ID + " parameter is mandatory");
				}

				Integer submissionID = Integer.valueOf(submissionIDStr);

				// Try to get the instance of the checkservice for this submissionId
				AbstractThread process = (AbstractThread) ThreadLock.getInstance().getProcess(submissionIDStr);

				if (process != null) {
					// There is a running thread, we get its current status.
					out.print(generateResult(SubmissionStatus.RUNNING, process));
				} else {
					// We try to get the status of the submission
					out.print(generateResult(locationService.getSubmission(submissionID).getStatus()));
				}

			} else

			//
			// Upload some data
			//			
			if (action.equals(ACTION_UPLOAD_LOCATIONS) && contentType.matches("multipart/form-data.*")) {

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
				SubmissionData submissionData = locationService.getSubmission(submissionId);
				if (!submissionData.getCountryCode().equalsIgnoreCase(countryCode)) {
					throw new Exception("The country code doesn't match the submission country code");
				}

				// Upload the file items in the directory
				Iterator fileIter = fileFieldsList.iterator();
				while (fileIter.hasNext()) {
					FileItem item = (FileItem) fileIter.next();
					String fieldName = item.getFieldName().trim();
					if (fieldName.equalsIgnoreCase(Formats.LOCATION_FILE)) {
						String fileName = pathFileDirectory + separator + submissionId + separator + Formats.LOCATION_FILE + separator + item.getName().trim();
						uploadFile(item, fileName);
						requestParameters.put(Formats.LOCATION_FILE, fileName);
					}
				}

				String plotFile = requestParameters.get(Formats.LOCATION_FILE);
				if (plotFile == null) {
					throw new Exception("The " + Formats.LOCATION_FILE + " parameter is mandatory");
				}

				// Check if a thread is already running
				Thread process = ThreadLock.getInstance().getProcess(submissionIDStr);
				if (process != null) {
					throw new Exception("A process is already running for this country");
				}

				// Launch the harmonization thread
				process = new LocationServiceThread(submissionId, plotFile, requestParameters);
				process.start();

				// Register the running thread
				ThreadLock.getInstance().lockProcess(submissionIDStr, process);

				// Output the current status of the check service
				out.print(generateResult(SubmissionStatus.RUNNING));

			} else {
				throw new Exception("The action type is unknown or does not match the expected mime type, valid actions are " + //
						ACTION_NEW_LOCATION_SUBMISSION + ", " + //
						ACTION_UPLOAD_LOCATIONS + ", " + //
						ACTION_CANCEL_LOCATION_SUBMISSION + ", " + // 
						ACTION_STATUS + ", " + //
						ACTION_VALIDATION_PLOT_LOCATION_SUBMISSION + ", " + //
						ACTION_VALIDATION_STATUS);
			}

		} catch (Exception e) {
			logger.error("Server error", e);
			out.print(generateErrorMessage(e.getMessage()));
		}
	}

}
