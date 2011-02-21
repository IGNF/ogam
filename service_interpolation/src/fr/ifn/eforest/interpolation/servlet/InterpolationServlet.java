package fr.ifn.eforest.interpolation.servlet;

import java.io.IOException;

import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.log4j.Logger;

import fr.ifn.eforest.common.servlet.AbstractUploadServlet;
import fr.ifn.eforest.common.business.ThreadLock;
import fr.ifn.eforest.interpolation.business.InterpolationServiceThread;

/**
 * InterpolationServlet Servlet. <br>
 */
public class InterpolationServlet extends AbstractUploadServlet {

	/**
	 * The logger used to log the errors or several information.
	 * 
	 * @see org.apache.log4j.Logger
	 */
	private final transient Logger logger = Logger.getLogger(this.getClass());

	/**
	 * The serial version ID used to identify the object.
	 */
	private static final long serialVersionUID = -455284792196591246L;

	/**
	 * Input parameters.
	 */
	private static final String ACTION = "action";
	private static final String ACTION_INTERPOLATE = "InterpolateData";
	private static final String ACTION_STATUS = "status";

	private static final String SESSION_ID = "SESSION_ID";
	private static final String DATASET_ID = "DATASET_ID";
	private static final String SQL_WHERE = "SQL_WHERE";
	private static final String FORMAT = "FORMAT";
	private static final String DATA = "DATA";
	private static final String METHOD = "METHOD";
	private static final String GRID_SIZE = "GRID_SIZE";
	private static final String MAXDIST = "MAXDIST";
	private static final String LAYER_NAME = "LAYER_NAME";

	/**
	 * Main function of the servlet.
	 * 
	 * @param request
	 *            the request done to the servlet
	 * @param response
	 *            the response sent
	 */
	public void service(HttpServletRequest request, HttpServletResponse response) throws IOException {

		response.setContentType("text/xml");
		response.setCharacterEncoding("UTF-8");

		String action = null;
		ServletOutputStream out = response.getOutputStream();

		logRequestParameters(request);

		try {

			logger.debug("Interpolation Servlet called");

			action = request.getParameter(ACTION);
			if (action == null) {
				throw new Exception("The " + ACTION + " parameter is mandatory");
			}

			/*
			 * Get the STATE of the process
			 */
			if (action.equals(ACTION_STATUS)) {

				String sessionId = request.getParameter(SESSION_ID);
				if (sessionId == null) {
					throw new Exception("The " + SESSION_ID + " parameter is mandatory");
				}

				// Try to get the instance of the checkservice for this submissionId
				InterpolationServiceThread process = (InterpolationServiceThread) ThreadLock.getInstance().getProcess(sessionId);

				if (process != null) {
					// There is a running thread, we get its current status.
					out.print(generateResult("RUNNING", process));
				} else {
					// We try to get the status of the last harmonization
					out.print(generateResult("OK"));
				}

			} else

			/*
			 * Launch the interpolation of data
			 */
			if (action.equals(ACTION_INTERPOLATE)) {

				// Check the mandatory parameters
				String datasetId = request.getParameter(DATASET_ID);
				if (datasetId == null) {
					throw new Exception("The " + DATASET_ID + " parameter is mandatory");
				}
				String sessionId = request.getParameter(SESSION_ID);
				if (sessionId == null) {
					throw new Exception("The " + SESSION_ID + " parameter is mandatory");
				}
				String sql = request.getParameter(SQL_WHERE);
				if (sql == null) {
					throw new Exception("The " + SQL_WHERE + " parameter is mandatory");
				}
				String format = request.getParameter(FORMAT);
				if (format == null) {
					throw new Exception("The " + FORMAT + " parameter is mandatory");
				}
				String data = request.getParameter(DATA);
				if (data == null) {
					throw new Exception("The " + DATA + " parameter is mandatory");
				}
				String method = request.getParameter(METHOD);
				if (method == null) {
					throw new Exception("The " + METHOD + " parameter is mandatory");
				}
				String layerName = request.getParameter(LAYER_NAME);
				if (layerName == null) {
					throw new Exception("The " + LAYER_NAME + " parameter is mandatory");
				}

				String gridSizeStr = request.getParameter(GRID_SIZE);
				if (gridSizeStr == null) {
					throw new Exception("The " + GRID_SIZE + " parameter is mandatory");
				}
				Integer gridSize = null;
				try {
					gridSize = new Integer(gridSizeStr);
				} catch (Exception e) {
					throw new Exception("The " + GRID_SIZE + " parameter should be an integer");
				}

				String maxDistStr = request.getParameter(MAXDIST);
				if (maxDistStr == null) {
					throw new Exception("The " + MAXDIST + " parameter is mandatory");
				}
				Integer maxDist = null;
				try {
					maxDist = new Integer(maxDistStr);
				} catch (Exception e) {
					throw new Exception("The " + MAXDIST + " parameter should be an integer");
				}

				// Check if a thread is already running
				InterpolationServiceThread process = (InterpolationServiceThread) ThreadLock.getInstance().getProcess(sessionId);
				if (process != null) {
					throw new Exception("A process is already running for this interpolation");
				}

				// Launch the interpolation service thread
				process = new InterpolationServiceThread(sessionId, datasetId, sql, format, data, layerName, method, gridSize, maxDist);
				process.start();

				// Register the running thread
				ThreadLock.getInstance().lockProcess(sessionId, process);

				// Output the current status of the check service
				out.print(generateResult("RUNNING", process));

			} else {
				throw new Exception("The action type is unknown, should be " + ACTION_INTERPOLATE);
			}

		} catch (Exception e) {
			logger.error("Error during data interpolation", e);
			out.print(generateErrorMessage(e.getMessage()));
		}
	}
}
