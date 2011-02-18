package fr.ifn.eforest.integration.database;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import fr.ifn.eforest.integration.AbstractEFDACTest;
import fr.ifn.eforest.integration.business.Formats;
import fr.ifn.eforest.common.business.MappingTypes;
import fr.ifn.eforest.common.database.metadata.FieldData;
import fr.ifn.eforest.common.database.metadata.DatasetData;
import fr.ifn.eforest.common.database.metadata.MetadataDAO;
import fr.ifn.eforest.common.database.metadata.ModeData;
import fr.ifn.eforest.common.database.metadata.RangeData;
import fr.ifn.eforest.common.database.metadata.RequestFormatData;
import fr.ifn.eforest.common.database.metadata.TableFieldData;
import fr.ifn.eforest.common.database.metadata.TableFormatData;
import fr.ifn.eforest.common.database.metadata.TableTreeData;

//
// Note : In order to use this Test Class correctly under Eclipse, you need to change the working directory to
// ${workspace_loc:EFDAC - Framework Contract for forest data and services/service_integration}
//

/**
 * Test cases concerning the metadata.
 */
public class MetadataTest extends AbstractEFDACTest {

	// The DAOs
	private MetadataDAO metadataDAO = new MetadataDAO();

	/**
	 * Constructor
	 * 
	 * @param name
	 */
	public MetadataTest(String name) {
		super(name);
	}

	/**
	 * Test the CheckCode function.
	 */
	public void testCheckCode() throws Exception {

		// The code xxx is not a country code
		assertFalse("The code xxx is not a country code", metadataDAO.checkCode("SPECIES_CODE", "toto"));

		// The code 1 is a country code
		assertTrue("The code 1 is a country code", metadataDAO.checkCode("SPECIES_CODE", "164.002.001"));
	}

	/**
	 * Test the getModes function.
	 */
	public void testGetModes() throws Exception {

		List<ModeData> countryCodes = metadataDAO.getModes("SPECIES_CODE");

		assertEquals("There is 303 differents species codes", 303, countryCodes.size());

	}

	/**
	 * Test the getJRCRequests function.
	 */
	public void testGetDatasets() throws Exception {

		List<DatasetData> datasets = metadataDAO.getDatasets();

		assertEquals("There is 1 datasets configured in database", 1, datasets.size());

	}

	/**
	 * Test the getRange function.
	 */
	public void testGetRange() throws Exception {

		RangeData range = metadataDAO.getRange("PERCENTAGE");

		assertEquals("The PH max range should be 100", new BigDecimal(100), range.getMaxValue());

		assertEquals("The PH min range should be 0", new BigDecimal(0), range.getMinValue());

	}

	/**
	 * Test the getType function.
	 */
	public void testGetType() throws Exception {

		String type = metadataDAO.getType("SPECIES_CODE");

		assertEquals("The type of the data SPECIES_CODE should be CODE", "CODE", type);

	}

	/**
	 * Test the getRequestFiles function.
	 */
	public void testGetRequestFiles() throws Exception {

		String requestID = "REQUEST";

		List<RequestFormatData> requestFormats = metadataDAO.getRequestFiles(requestID);

		RequestFormatData file1 = requestFormats.get(0);
		RequestFormatData file2 = requestFormats.get(1);
		RequestFormatData file3 = requestFormats.get(2);

		assertEquals("The first file of the REQUEST should be LOCATION_FILE", "LOCATION_FILE", file1.getFormat());
		assertEquals("The first file of the REQUEST should be PLOT_FILE", "PLOT_FILE", file2.getFormat());
		assertEquals("The second file of the REQUEST should be SPECIES_FILE", "SPECIES_FILE", file3.getFormat());

	}

	/**
	 * Test the getFileFields function.
	 */
	public void testGetFileFields() throws Exception {

		String fileFormat = Formats.SPECIES_FILE;

		List<FieldData> fields = metadataDAO.getFileFields(fileFormat);

		assertEquals("The basic test tree file should have 5 columns", 5, fields.size());

	}

	/**
	 * Test the getTablesTree function.
	 */
	public void testGetTablesTree() throws Exception {

		String tableFormat = Formats.SPECIES_DATA;
		String schemaCode = "RAW_DATA";

		List<TableTreeData> tables = metadataDAO.getTablesTree(tableFormat, schemaCode);

		assertEquals("The SPECIES_DATA table should have 3 ancestors", 3, tables.size());

		logger.debug(tables);

	}

	/**
	 * Test the getFormatMapping function.
	 */
	public void testGetFormatMapping() throws Exception {

		String tableFormat = Formats.SPECIES_FILE;

		Map<String, TableFormatData> tables = metadataDAO.getFormatMapping(tableFormat, MappingTypes.FILE_MAPPING);

		logger.debug(tables);

		assertTrue("The SPECIES_DATA should be the destination of SPECIES_FILE", tables.containsKey("SPECIES_DATA"));

	}

	/**
	 * Test the getField function.
	 */
	public void testGetField() throws Exception {

		String fieldName = "PLOT_CODE";

		FieldData field = metadataDAO.getFileField(fieldName);
		if (field == null) {
			fail("Field should not be null");
		}

		assertEquals("The field name should correspond", field.getData(), fieldName);
		assertEquals("The PLOT_CODE unit should be PLOT_CODE", field.getUnit(), "PLOT_CODE");

	}

	/**
	 * Test the getFieldMapping function.
	 */
	public void testGetFieldMapping() throws Exception {

		String sourceFormat = Formats.PLOT_FILE;

		Map<String, TableFieldData> mapping = metadataDAO.getFieldMapping(sourceFormat, MappingTypes.FILE_MAPPING);
		if (mapping == null) {
			fail("Mapping should not be null");
		}

		TableFieldData dest = mapping.get("PLOT_CODE");

		assertEquals("The destination of the PLOT_CODE field should be the table PLOT_DATA", dest.getFormat(), "PLOT_DATA");

	}

	/**
	 * Test the getTableFields function.
	 */
	public void testGetTableFields() throws Exception {

		String tableFormat = "PLOT_DATA";

		List<TableFieldData> fields = metadataDAO.getTableFields(tableFormat);

		logger.debug(fields);

		assertEquals("The PLOT_DATA table should contain 8 fields", fields.size(), 8);

	}

	/**
	 * Test the getTableName function.
	 */
	public void testGetTableName() throws Exception {

		String tableFormat = "PLOT_DATA";

		String name = metadataDAO.getTableName(tableFormat);

		assertEquals("The physical name of the PLOT_DATA table should be PLOT_DATA", name, tableFormat);

	}

}
