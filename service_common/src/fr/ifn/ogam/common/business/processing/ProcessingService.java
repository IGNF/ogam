package fr.ifn.ogam.common.business.processing;

import java.util.Date;
import java.util.Iterator;
import java.util.List;

import org.apache.log4j.Logger;

import fr.ifn.ogam.common.business.AbstractThread;
import fr.ifn.ogam.common.business.Data;
import fr.ifn.ogam.common.database.processing.ProcessData;
import fr.ifn.ogam.common.database.processing.ProcessingDAO;
import fr.ifn.ogam.common.database.rawdata.SubmissionData;

/**
 * Service managing the post-process treatments.
 */
public class ProcessingService {

	/**
	 * The local logger.
	 */
	private final transient Logger logger = Logger.getLogger(this.getClass());

	/**
	 * Declare the DAOs.
	 */
	private ProcessingDAO processingDAO = new ProcessingDAO();

	/**
	 * Run the post-processing treatments.
	 * 
	 * @param step
	 *            the step of the process (INTEGRATION or HARMONIZATION)
	 * @param SubmissionData
	 *            the submission
	 * @param thread
	 *            the thread to notify during the process advancement
	 */
	public void processData(String step, SubmissionData submission, AbstractThread thread) throws Exception {

		List<ProcessData> processesList;

		try {

			long startTime = new Date().getTime();
			logger.debug("Start post-processing ...");

			// Get the list of process to run
			processesList = processingDAO.getProcesses(step);

			// Run each process
			Iterator<ProcessData> processesIter = processesList.iterator();
			while (processesIter.hasNext()) {
				ProcessData process = processesIter.next();

				// Fill the statement with contextual info
				String stmt = process.getStatement();
				stmt = stmt.replaceAll("\\%" + Data.DATASET_ID + "\\%", submission.getDatasetId());
				stmt = stmt.replaceAll("\\%" + Data.PROVIDER_ID + "\\%", submission.getProviderId());
				stmt = stmt.replaceAll("\\%" + Data.SUBMISSION_ID + "\\%", "" + submission.getSubmissionId());
				process.setStatement(stmt);

				// Keep the thread informed of the current status
				thread.setCurrentCount(0);
				thread.setTotalCount(1);
				thread.setTaskName(process.getLabel());

				// Launchs the checks
				processingDAO.executeProcess(process);

			}

			long endTime = new Date().getTime();
			logger.debug("Total post-processing time : " + (endTime - startTime) / 1000.00 + "s.");

		} catch (Exception e) {
			throw new Exception("Post-processing error : " + e.getMessage());
		}

	}
}
