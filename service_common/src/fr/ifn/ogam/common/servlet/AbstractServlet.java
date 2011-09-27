package fr.ifn.eforest.common.servlet;

import java.util.Enumeration;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

import org.apache.log4j.Logger;

import fr.ifn.eforest.common.business.AbstractThread;

/**
 * Abstract Servlet for the eForest project.
 */
public abstract class AbstractServlet extends HttpServlet {

	protected static final String XMLHEADER = "<?xml version=\"1.0\" encoding=\"UTF-8\" ?>";

	/**
	 * The logger used to log the errors or several information.
	 * 
	 * @see org.apache.log4j.Logger
	 */
	protected final transient Logger logger = Logger.getLogger(this.getClass());

	/**
	 * The serial version ID used to identify the object.
	 */
	protected static final long serialVersionUID = -123484792196121243L;

	/**
	 * Return an Error Message.
	 * 
	 * @param errorMessage
	 *            the error message
	 * @return the XML corresponding to the error message
	 */
	protected String generateErrorMessage(String errorMessage) {
		StringBuffer result = new StringBuffer(XMLHEADER);
		result.append("<Result>");
		result.append("<Status>KO</Status>");
		result.append("<ErrorMessage>" + errorMessage + "</ErrorMessage>");
		result.append("</Result>");
		return result.toString();
	}

	/**
	 * Return an Error Message with a code.
	 * 
	 * @param errorCode
	 *            the code of the error
	 * @param errorMessage
	 *            the error message
	 * @return the XML corresponding to the error message
	 */
	protected String generateErrorMessage(String errorCode, String errorMessage) {
		StringBuffer result = new StringBuffer(XMLHEADER);
		result.append("<Result>");
		result.append("<Status>KO</Status>");
		result.append("<ErrorCode>" + errorCode + "</ErrorCode>");
		result.append("<ErrorMessage>" + errorMessage + "</ErrorMessage>");
		result.append("</Result>");
		return result.toString();
	}

	/**
	 * Return a correct result.
	 * 
	 * @param value
	 *            the value to return
	 * @return the XML corresponding to the value
	 */
	protected String generateResult(String value) {
		StringBuffer result = new StringBuffer(XMLHEADER);
		result.append("<Result>");
		result.append("<Status>OK</Status>");
		result.append("<Value>" + value + "</Value>");
		result.append("</Result>");
		return result.toString();
	}

	/**
	 * Return a correct result plus some information about the status of the process.
	 * 
	 * @param value
	 *            the value to return
	 * @return the XML corresponding to the value
	 */
	protected String generateResult(String value, AbstractThread process) {
		StringBuffer result = new StringBuffer(XMLHEADER);
		result.append("<Result>");
		result.append("<Status>OK</Status>");
		result.append("<Value>" + value + "</Value>");
		result.append("<TaskName>" + process.getTaskName() + "</TaskName>");
		result.append("<CurrentCount>" + process.getCurrentCount() + "</CurrentCount>");
		result.append("<TotalCount>" + process.getTotalCount() + "</TotalCount>");
		result.append("</Result>");
		return result.toString();
	}

	/**
	 * Log the request parameters.
	 * 
	 * @param request
	 *            the HTTP request to log
	 */
	protected void logRequestParameters(HttpServletRequest request) {
		HttpSession session = request.getSession();
		if (session == null) {
			logger.debug("Session is null");
		} else {
			logger.debug("Session id " + request.getSession().getId());
		}

		Enumeration paramEnum = request.getParameterNames();
		while (paramEnum.hasMoreElements()) {
			String param = (String) paramEnum.nextElement();
			logger.debug("Parametre : " + param + "   valeur : " + request.getParameter(param));
		}

		Enumeration attribEnum = request.getAttributeNames();
		while (attribEnum.hasMoreElements()) {
			String param = (String) attribEnum.nextElement();
			logger.debug("Attribut : " + param + "   valeur : " + request.getAttribute(param));
		}
	}

}
