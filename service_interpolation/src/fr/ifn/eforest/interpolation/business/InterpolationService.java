package fr.ifn.eforest.interpolation.business;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;

import org.apache.log4j.Logger;

import fr.ifn.eforest.common.util.ExecLauncher;
import fr.ifn.eforest.common.util.ProcessInfo;
import fr.ifn.eforest.common.business.AbstractService;
import fr.ifn.eforest.common.database.website.ApplicationParametersDAO;
import fr.ifn.eforest.interpolation.dabatase.raw_data.InterpolationDAO;

/**
 * Interpolation Service.
 */
public class InterpolationService extends AbstractService {

	/**
	 * The logger used to log the errors or several information.
	 * 
	 * @see org.apache.log4j.Logger
	 */
	private final transient Logger logger = Logger.getLogger(this.getClass());

	// The DAOs
	private ApplicationParametersDAO parameterDAO = new ApplicationParametersDAO();
	private InterpolationDAO interpolationDAO = new InterpolationDAO();

	/**
	 * Constructor.
	 */
	public InterpolationService() {
		super();
	}

	/**
	 * Constructor.
	 * 
	 * @param thread
	 *            The thread that launched the service
	 */
	public InterpolationService(InterpolationServiceThread thread) {
		super(thread);
	}

	/**
	 * Export the data in a CSV file.
	 * 
	 * @param sessionId
	 *            the session identifier of the user
	 * @param sql
	 *            the FROM/WHERE part of the SQL query
	 * @param format
	 *            the logical name of the table containing the value
	 * @param data
	 *            the logical name of the column containing the value
	 * @return the pathname of the generated file
	 */
	public String exportData(String sessionId, String sql, String format, String data) {
		logger.debug("Exporting data");
		String filename = "";

		try {
			if (thread != null) {
				thread.updateInfo("Export the data in a CSV file", 0, 0);
			}

			// Read application parameters
			ApplicationParametersDAO parameterDAO = new ApplicationParametersDAO();
			String pathFileDirectory = parameterDAO.getApplicationParameter("UploadDirectory");

			// Generate the file name
			filename = pathFileDirectory + "/" + "interpolation" + "/" + sessionId;
			logger.debug("Export file : " + filename);

			// Export the data from the database			
			interpolationDAO.exportRawData(sql, format, data, filename);

		} catch (Exception e) {
			logger.error("Error while exporting data", e);
		}

		return filename;
	}

	/**
	 * Run the Interpolation process.
	 * 
	 * @param sessionId
	 *            the session identifier of the user
	 * @param datasetId
	 *            the identifier of the dataset
	 * @param layerName
	 *            the name of the resulting layer
	 * @param srcFileName
	 *            the name of the file containing the data to interpolate
	 * @param method
	 *            the interpolation method to use
	 * @param gridSize
	 *            the grid size
	 * @param maxDist
	 *            the max distance for IDW interpolation
	 */
	public void interpolateData(String sessionId, String datasetId, String layerName, String srcFileName, String method, Integer gridSize, Integer maxDist) {

		try {

			logger.debug("Interpolating data");
			if (thread != null) {
				thread.updateInfo("Interpolating data", 0, 0);
			}

			// Initialize the process		
			logger.debug("Initialize the process");

			// Get the destination path 
			String pathFileDirectory = parameterDAO.getApplicationParameter("InterpolationResultDirectory");
			String installDirectory = parameterDAO.getApplicationParameter("RInstallDirectory");
			String destFileName = pathFileDirectory + sessionId + "_" + layerName + ".asc";

			String script = "";
			if (method.equalsIgnoreCase("IDW")) {
				script = generateIDWScript(srcFileName, destFileName, gridSize, maxDist);
			} else {
				throw new Exception("Unknown interpolation method");
			}

			// Save the script in a R file
			String rfile = pathFileDirectory + sessionId + "Interpolation.R";
			logger.debug("Save the script in a R file : " + rfile);
			writeFile(rfile, script);

			// Launch the R engine as an external process
			logger.debug("Launch the R engine");
			ExecLauncher execLauncher = new ExecLauncher();
			ProcessInfo processInfo = execLauncher.execCommand(installDirectory + "R  --vanilla < " + rfile);

			logger.debug("Process exit value : " + processInfo.getExitValue());
			logger.debug("Process output : " + processInfo.getOutput());
			logger.debug("Process error : " + processInfo.getError());
			if (processInfo.getExitValue() != 0) {
				throw new Exception("Error during R calculation" + processInfo.getError());
			}

			// Remove the script
			new File(rfile).delete();

			logger.debug("Interpolation terminée");

		} catch (Exception e) {
			logger.error("Error while interpolating data", e);
		}

	}

	/**
	 * Process inverse weighted distance interpolation.
	 * 
	 * @param srcFileName
	 *            the name of the file containing the data to interpolate
	 * @param destFileName
	 *            the name of the resulting file
	 * @param gridSize
	 *            the grid size
	 * @param maxDist
	 *            the max distance for IDW interpolation
	 * @return the generated script
	 */
	public String generateIDWScript(String srcFileName, String destFileName, Integer gridSize, Integer maxDist) throws Exception {

		// 
		String script = "";

		// Loading gstat library
		script += "library(sp);\n";
		script += "library(gstat);\n";

		// Lecture du fichier contenant les coordonnées et la valeur à interpoler
		script += "gtot <- read.table(\"" + srcFileName + "\", header = T, sep=\";\");\n";

		// Calcul d'une grille à partir des coordonnées min/max
		script += "aa <- seq(round(min(gtot$X)/" + gridSize + ")*" + gridSize + ", round(max(gtot$X)/" + gridSize + ")*" + gridSize + ", by=" + gridSize + ");\n";

		script += "bb <- seq(round(min(gtot$Y)/" + gridSize + ")*" + gridSize + ", round(max(gtot$Y)/" + gridSize + ")*" + gridSize + ", by=" + gridSize + ");\n";

		script += "a <- rep(aa, length(bb));\n";

		script += "b <- rep(bb, length(aa));\n";

		script += "b <- sort(b, decreasing=F);\n";

		script += "grid <- data.frame(x=a, y=b);\n";

		// Défini l'objet gtot comme possédant des coordonnées spatiales
		script += "coordinates(gtot) = ~X + Y\n";

		// Défini l'objet Grid comme étant une grille
		// on lui affecte une topologie de grille
		script += "gridded(grid) = ~x+y\n";

		// Calcul l'IDW de la variable

		// (première colonne du fichier = GTOT), 
		// avec les coordonnées spacialtes gtot,
		// sur la grille Grid
		// avec une distance max de 5km
		script += "gtot_idw <- idw( (VALUE)~1 , gtot, grid, maxdist = " + maxDist + ")\n";

		// Sauvegarde les données au format ESRI asciigrid
		script += "write.asciigrid(gtot_idw, \"" + destFileName + "\", attr = 1, na.value = -9999)\n";

		// On termine la session R
		script += "q(save=\"no\")\n";

		return script;

	}

	/**
	 * Save a file on the disk.
	 * 
	 * @param filename
	 *            the file name and path
	 * @param content
	 *            the content of the file
	 */
	private void writeFile(String filename, String content) throws Exception {
		BufferedWriter out = new BufferedWriter(new FileWriter(filename));
		out.write(content);
		out.close();

	}

}
