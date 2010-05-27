package fr.ifn.eforest.integration.business;

import java.util.ArrayList;
import java.util.List;

import fr.ifn.eforest.integration.AbstractEFDACTest;
import fr.ifn.eforest.common.business.GenericMapper;
import fr.ifn.eforest.common.business.MappingTypes;
import fr.ifn.eforest.common.business.Schemas;
import fr.ifn.eforest.common.database.metadata.MetadataDAO;
import fr.ifn.eforest.common.database.metadata.TableFormatData;

//
// Note : In order to use this Test Class correctly under Eclipse, you need to change the working directory to
// ${workspace_loc:EFDAC - Framework Contract for forest data and services/service_integration}
//

/**
 * Test cases for the Data service.
 */
public class GenericMapperTest extends AbstractEFDACTest {

	// The services
	private GenericMapper genericMapper = new GenericMapper();

	// The DAOs
	private MetadataDAO metadataDAO = new MetadataDAO();

	/**
	 * Constructor
	 * 
	 * @param name
	 */
	public GenericMapperTest(String name) {
		super(name);
	}

	/**
	 * Test the sorting function.
	 */
	public void testGetSortedAncestors() throws Exception {

		// Get the description of the tables linked with some files
		List<TableFormatData> destinationTables = new ArrayList<TableFormatData>();
		destinationTables.addAll(metadataDAO.getFormatMapping("WP3_PLOT_FILE", MappingTypes.FILE_MAPPING).values());
		destinationTables.addAll(metadataDAO.getFormatMapping("WP3_SPECIES_FILE", MappingTypes.FILE_MAPPING).values());

		// Get the ancestors of these tables, in the right order
		List<String> sortedList = genericMapper.getSortedAncestors(Schemas.RAW_DATA, destinationTables);

		// Test with PLOT and TREE in the raw_data schema
		logger.debug("sortedList : " + sortedList.toString());
		assertEquals(3, sortedList.size());
		assertEquals("SPECIES_DATA", sortedList.get(0));
		assertEquals("PLOT_DATA", sortedList.get(1));
		assertEquals("LOCATION_DATA", sortedList.get(2));

	}

}
