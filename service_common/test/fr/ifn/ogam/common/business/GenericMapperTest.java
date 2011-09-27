package fr.ifn.ogam.common.business;

import java.util.ArrayList;
import java.util.List;

import fr.ifn.ogam.common.business.GenericMapper;
import fr.ifn.ogam.common.database.metadata.MetadataDAO;
import fr.ifn.ogam.common.database.metadata.TableFormatData;

//
// Note : In order to use this Test Class correctly under Eclipse, you need to change the working directory to
// ${workspace_loc:EFDAC - Framework Contract for forest data and services/service_integration}
//

/**
 * Test cases for the Generic mapper.
 */
public class GenericMapperTest extends AbstractEFDACTest {

	private GenericMapper mapper = new GenericMapper();
	private MetadataDAO metadataDao = new MetadataDAO();

	/**
	 * Constructor
	 * 
	 * @param name
	 */
	public GenericMapperTest(String name) {
		super(name);
	}

	/**
	 * Test the the sorting of tables.
	 */
	public void testGetSortedTables() throws Exception {

		try {
			TableFormatData location = metadataDao.getTableFormat("LOCATION_DATA");
			TableFormatData plotData = metadataDao.getTableFormat("PLOT_DATA");
			TableFormatData treeData = metadataDao.getTableFormat("TREE_DATA");

			List<TableFormatData> tables = new ArrayList<TableFormatData>();
			tables.add(treeData);
			tables.add(location);
			tables.add(plotData);

			List<String> sortedTables = mapper.getSortedTables("RAW_DATA", tables);

			assertEquals("TREE_DATA", sortedTables.get(0));
			assertEquals("PLOT_DATA", sortedTables.get(1));
			assertEquals("LOCATION_DATA", sortedTables.get(2));

		} catch (Exception e) {
			logger.error(e);
			assertTrue(false);
		}
	}
}
