package fr.ifn.eforest.calculation.servlet;

import java.io.IOException;

import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.log4j.Logger;

import fr.ifn.eforest.calculation.business.CalculationServiceThread;
import fr.ifn.eforest.common.business.ThreadLock;
import fr.ifn.eforest.common.servlet.AbstractServlet;

/**
 * CalculationServlet Servlet. <br>
 */
public class CalculationServlet extends AbstractServlet {

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
	private static final String ACTION_AGGREGATE_DATA = "AggregateData";
	private static final String ACTION_STATUS = "status";

	private static final String DATASET_ID = "DATASET_ID";
	private static final String SESSION_ID = "SESSION_ID";
	private static final String VARIABLE_NAME = "VARIABLE_NAME";
	private static final String VARIABLE_FORMAT = "VARIABLE_FORMAT";
	private static final String GRID = "GRID";
	private static final String SQL = "SQL";

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

			logger.debug("Calculation Servlet called");

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
				CalculationServiceThread process = (CalculationServiceThread) ThreadLock.getInstance().getProcess(sessionId);

				if (process != null) {
					// There is a running thread, we get its current status.
					out.print(generateResult("RUNNING", process));
				} else {
					// We try to get the status of the last harmonization
					out.print(generateResult("OK"));
				}

			} else

			/* 
			 * Launch the calculation of aggregated values
			 */
			if (action.equals(ACTION_AGGREGATE_DATA)) {

				String sessionId = request.getParameter(SESSION_ID);
				if (sessionId == null) {
					throw new Exception("The " + SESSION_ID + " parameter is mandatory");
				}
				String datasetId = request.getParameter(DATASET_ID);
				if (sessionId == null) {
					throw new Exception("The " + DATASET_ID + " parameter is mandatory");
				}
				String variableName = request.getParameter(VARIABLE_NAME);
				if (variableName == null) {
					throw new Exception("The " + VARIABLE_NAME + " parameter is mandatory");
				}
				String variableFormat = request.getParameter(VARIABLE_FORMAT);
				if (variableFormat == null) {
					throw new Exception("The " + VARIABLE_FORMAT + " parameter is mandatory");
				}
				String grid = request.getParameter(GRID);
				if (grid == null) {
					throw new Exception("The " + GRID + " parameter is mandatory");
				}
				String sql = request.getParameter(SQL);
				if (sql == null) {
					throw new Exception("The " + SQL + " parameter is mandatory");
				}

				// Check if a thread is already running
				CalculationServiceThread process = (CalculationServiceThread) ThreadLock.getInstance().getProcess(sessionId);
				if (process != null) {
					throw new Exception("A process is already running for this interpolation");
				}

				// Launch the harmonization thread
				process = new CalculationServiceThread(datasetId, sessionId, variableName, variableFormat, grid, sql);
				process.start();

				// Register the running thread
				ThreadLock.getInstance().lockProcess(sessionId, process);

				// Output the current status of the check service
				out.print(generateResult("RUNNING", process));

			} else {
				throw new Exception("The action type is unknown");
			}

		} catch (Exception e) {
			logger.error("Error during data calculation", e);
			out.print(generateErrorMessage(e.getMessage()));
		}
	}
}
