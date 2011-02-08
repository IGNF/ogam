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

		assertEquals("There is 34 differents country codes", 34, countryCodes.size());

	}

	/**
	 * Test the getJRCRequests function.
	 */
	public void testGetJRCRequests() throws Exception {

		List<DatasetData> datasets = metadataDAO.getDatasets();

		assertEquals("There is 2 datasets configured in database", 2, datasets.size());

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

		String type = metadataDAO.getType("COUNTRY_CODE");

		assertEquals("The type of the data COUNTRY_CODE should be CODE", "CODE", type);

	}

	/**
	 * Test the getRequestFiles function.
	 */
	public void testGetRequestFiles() throws Exception {

		String requestID = "WP3_REQUEST";

		List<RequestFormatData> requestFormats = metadataDAO.getRequestFiles(requestID);

		RequestFormatData file1 = requestFormats.get(0);
		RequestFormatData file2 = requestFormats.get(1);

		assertEquals("The first file of the WP3_REQUEST should be WP3_PLOT_FILE", "WP3_PLOT_FILE", file1.getFormat());
		assertEquals("The second file of the WP3_REQUEST should be WP3_SPECIES_FILE", "WP3_SPECIES_FILE", file2.getFormat());

	}

	/**
	 * Test the getFileFields function.
	 */
	public void testGetFileFields() throws Exception {

		String fileFormat = Formats.WP3_SPECIES_FILE;

		List<FieldData> fields = metadataDAO.getFileFields(fileFormat);

		assertEquals("The basic test tree file should have 7 columns", 7, fields.size());

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

		String tableFormat = Formats.WP3_SPECIES_FILE;

		Map<String, TableFormatData> tables = metadataDAO.getFormatMapping(tableFormat, MappingTypes.FILE_MAPPING);

		logger.debug(tables);

		assertTrue("The SPECIES_DATA should be the destination of WP3_SPECIES_FILE", tables.containsKey("SPECIES_DATA"));

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

		String sourceFormat = "WP3_PLOT_FILE";

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

		assertEquals("The PLOT_DATA table should contain 15 fields", fields.size(), 15);

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
