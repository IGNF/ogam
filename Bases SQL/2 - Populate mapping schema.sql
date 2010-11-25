--
-- Jouer les scripts suivants (se trouvant dans le répertoire mapping) :
-- nuts_rg.sql
-- nuts_0.sql
-- grid_eu25_50k.sql
-- ...


SET SEARCH_PATH = mapping, public;


-- Add the available map scales
INSERT INTO scales(scale) VALUES (25000000); -- 25 M
INSERT INTO scales(scale) VALUES (10000000); -- 10 M
INSERT INTO scales(scale) VALUES (5000000);  --  5 M
INSERT INTO scales(scale) VALUES (2500000);  --  2,5 M
INSERT INTO scales(scale) VALUES (1000000);  --  1 M
INSERT INTO scales(scale) VALUES (500000);   --  500 K
INSERT INTO scales(scale) VALUES (250000);   --  250 K
INSERT INTO scales(scale) VALUES (100000);   --  100 K

-- Define the layers
INSERT INTO layer_definition(layer_name, layer_label, mapserv_layers, isTransparent, isBaseLayer, isUntiled, isCached, maxscale, minscale, transitionEffect, imageFormat, opacity, has_legend, country_code, has_sld, activate_type) VALUES ('forestmap', 'Forest / Non Forest', 'forestmap', 1, 0, 0, 1, null, null, 'resize', 'PNG', null, 1, null, 0, 'NONE');
INSERT INTO layer_definition(layer_name, layer_label, mapserv_layers, isTransparent, isBaseLayer, isUntiled, isCached, maxscale, minscale, transitionEffect, imageFormat, opacity, has_legend, country_code, has_sld, activate_type) VALUES ('nuts_0', 'Country Boundaries', 'nuts_0', 1, 0, 0, 1, 60000000, 50000, 'resize', 'PNG', null, 1, null, 0, 'NONE');
INSERT INTO layer_definition(layer_name, layer_label, mapserv_layers, isTransparent, isBaseLayer, isUntiled, isCached, maxscale, minscale, transitionEffect, imageFormat, opacity, has_legend, country_code, has_sld, activate_type) VALUES ('result_locations', 'Results', 'result_locations', 1, 0, 1, 0, null, null, null, 'PNG', null, 0, null, 0, 'REQUEST');
INSERT INTO layer_definition(layer_name, layer_label, mapserv_layers, isTransparent, isBaseLayer, isUntiled, isCached, maxscale, minscale, transitionEffect, imageFormat, opacity, has_legend, country_code, has_sld, activate_type) VALUES ('all_locations', 'Plot Locations', 'all_locations', 1, 0, 1, 0, null, null, null, 'PNG', null, 1, null, 0, 'NONE');
INSERT INTO layer_definition(layer_name, layer_label, mapserv_layers, isTransparent, isBaseLayer, isUntiled, isCached, maxscale, minscale, transitionEffect, imageFormat, opacity, has_legend, country_code, has_sld, activate_type) VALUES ('all_harmonized_locations', 'Plot Locations', 'all_harmonized_locations', 1, 0, 1, 0, null, null, null, 'PNG', null, 1, null, 0, 'NONE');
INSERT INTO layer_definition(layer_name, layer_label, mapserv_layers, isTransparent, isBaseLayer, isUntiled, isCached, maxscale, minscale, transitionEffect, imageFormat, opacity, has_legend, country_code, has_sld, activate_type) VALUES ('all_locations_country', 'Plot Locations', 'all_locations_country', 1, 0, 1, 0, null, null, null, 'PNG', null, 1, null, 0, 'NONE');
INSERT INTO layer_definition(layer_name, layer_label, mapserv_layers, isTransparent, isBaseLayer, isUntiled, isCached, maxscale, minscale, transitionEffect, imageFormat, opacity, has_legend, country_code, has_sld, activate_type) VALUES ('all_harmonized_locations_country', 'Plot Locations', 'all_harmonized_locations_country', 1, 0, 1, 0, null, null, null, 'PNG', null, 1, null,  0, 'NONE');


--
-- Define the layers legend
--
INSERT INTO legend(item_id, parent_id, is_layer, is_checked, is_hidden, is_disabled, is_expended, name, position) VALUES (1, -1, 1, 1, 0, 1, 0, 'result_locations',1);
INSERT INTO legend(item_id, parent_id, is_layer, is_checked, is_hidden, is_disabled, is_expended, name, position) VALUES (2, -1, 1, 0, 1, 0, 0, 'all_locations',2);
INSERT INTO legend(item_id, parent_id, is_layer, is_checked, is_hidden, is_disabled, is_expended, name, position) VALUES (3, -1, 1, 0, 1, 0, 0, 'all_locations_country',3);
INSERT INTO legend(item_id, parent_id, is_layer, is_checked, is_hidden, is_disabled, is_expended, name, position) VALUES (4, -1, 1, 0, 1, 0, 0, 'all_harmonized_locations',4);
INSERT INTO legend(item_id, parent_id, is_layer, is_checked, is_hidden, is_disabled, is_expended, name, position) VALUES (5, -1, 1, 0, 1, 0, 0, 'all_harmonized_locations_country',5);


INSERT INTO legend(item_id, parent_id, is_layer, is_checked, is_hidden, is_disabled, is_expended, name, position) VALUES (20, -1, 1, 1, 0, 0, 0, 'nuts_0',20);
INSERT INTO legend(item_id, parent_id, is_layer, is_checked, is_hidden, is_disabled, is_expended, name, position) VALUES (30, -1, 1, 1, 0, 0, 0, 'forestmap',30);


--
-- Forbid some layers for some profiles
--


--
-- Configure the bounding box for all countries
--
-- for nuts codes, see http://en.wikipedia.org/wiki/Nomenclature_of_Territorial_Units_for_Statistics 
INSERT INTO bounding_box (code_country, country_name, zoom_level, nuts_code) values ('999','Europe', 0, null);
INSERT INTO bounding_box (code_country, country_name, zoom_level, nuts_code) values ('1','France', 1, 'FR');
INSERT INTO bounding_box (code_country, country_name, zoom_level, nuts_code) values ('2','Belgium', 3, 'BE');
INSERT INTO bounding_box (code_country, country_name, zoom_level, nuts_code) values ('3','Netherlands', 2, 'NL');
INSERT INTO bounding_box (code_country, country_name, zoom_level, nuts_code) values ('4','Germany', 2, 'DE');
INSERT INTO bounding_box (code_country, country_name, zoom_level, nuts_code) values ('5','Italy', 2, 'IT');
INSERT INTO bounding_box (code_country, country_name, zoom_level, nuts_code) values ('6','United Kingdom',2, 'UK');
INSERT INTO bounding_box (code_country, country_name, zoom_level, nuts_code) values ('7','Ireland', 2, 'IE');
INSERT INTO bounding_box (code_country, country_name, zoom_level, nuts_code) values ('8','Denmark', 2, 'DK');
INSERT INTO bounding_box (code_country, country_name, zoom_level, nuts_code) values ('9','Greece', 2, 'GR');
INSERT INTO bounding_box (code_country, country_name, zoom_level, nuts_code) values ('10','Portugal', 2, 'PT');
INSERT INTO bounding_box (code_country, country_name, zoom_level, nuts_code) values ('11','Spain', 2, 'ES');
INSERT INTO bounding_box (code_country, country_name, zoom_level, nuts_code) values ('12','Luxembourg',2, 'LU');
INSERT INTO bounding_box (code_country, country_name, zoom_level, nuts_code) values ('13','Sweden',2, 'SE');
INSERT INTO bounding_box (code_country, country_name, zoom_level, nuts_code) values ('14','Austria',2, 'AT');
INSERT INTO bounding_box (code_country, country_name, zoom_level, nuts_code) values ('15','Finland',2, 'FI');
INSERT INTO bounding_box (code_country, country_name, zoom_level, nuts_code) values ('50','Switzerland', 2, 'CH');
INSERT INTO bounding_box (code_country, country_name, zoom_level, nuts_code) values ('51','Hungary', 2, 'HU');
INSERT INTO bounding_box (code_country, country_name, zoom_level, nuts_code) values ('52','Romania', 2, 'RO');
INSERT INTO bounding_box (code_country, country_name, zoom_level, nuts_code) values ('53','Poland', 2, 'PL');
INSERT INTO bounding_box (code_country, country_name, zoom_level, nuts_code) values ('54','Slovak Republic', 2, 'SK');
INSERT INTO bounding_box (code_country, country_name, zoom_level, nuts_code) values ('55','Norway', 2, 'NO');
INSERT INTO bounding_box (code_country, country_name, zoom_level, nuts_code) values ('56','Lithuania', 2, 'LT');
INSERT INTO bounding_box (code_country, country_name, zoom_level, nuts_code) values ('64','Latvia', 2, 'LV');
INSERT INTO bounding_box (code_country, country_name, zoom_level, nuts_code) values ('59','Estonia', 2, 'EE');
INSERT INTO bounding_box (code_country, country_name, zoom_level, nuts_code) values ('57','Croatia', 2, 'HR');
INSERT INTO bounding_box (code_country, country_name, zoom_level, nuts_code) values ('60','Slovenia', 2, 'SI');
INSERT INTO bounding_box (code_country, country_name, zoom_level, nuts_code) values ('58','Czech Republic', 2, 'CZ');
INSERT INTO bounding_box (code_country, country_name, zoom_level, nuts_code) values ('61','Republic of Moldova', 2, null);
INSERT INTO bounding_box (code_country, country_name, zoom_level, nuts_code) values ('62','Russia', 2, null);
INSERT INTO bounding_box (code_country, country_name, zoom_level, nuts_code) values ('63','Bulgaria', 2, 'BG');
INSERT INTO bounding_box (code_country, country_name, zoom_level, nuts_code) values ('65','Belarus', 2, null);
INSERT INTO bounding_box (code_country, country_name, zoom_level, nuts_code) values ('66','Cyprus', 2, 'CY');



--
-- Update the bounding boxes using the NUTS boundaries
--

-- Calculate the bounding box for all europe

-- Get the extend of the country boundaries
select extent(transform(setSRID(the_geom,4326), 3035))
from nuts_rg
where stat_levl_ = 0;

-- Find the real BBOX for Europe
-- XMIN = -2823914
-- YMIN = -3074765.5
-- XMAX = 10025893
-- YMAX =  5414824.5
--UPDATE bounding_box set bb_xmin = -2823914, bb_ymin = -3074765.5, bb_xmax = 10025893, bb_ymax = 5414824.5 WHERE code_country = 999

-- XLONG = 12849807
-- YLONG = 8489590
/*
select (bb_xmax - bb_xmin) as x_long, (bb_ymax - bb_ymin) as y_long
from bounding_box
where code_country = '999';


-- XCENTER = 3600989.5
-- YCENTER = 1170029.5
select (bb_xmax + bb_xmin) / 2 as x_center, (bb_ymax + bb_ymin) / 2 as y_center
from bounding_box
where code_country = '999';

-- Make the bbox square in order to allow the use of tilecache
-- Defines a square BBOX for Europe
select x_center - (12849807 / 2) as x_min, y_center - (12849807 / 2) as y_min, x_center + (12849807 / 2) as x_max, y_center + (12849807 / 2) as y_max
from (
	select (bb_xmax + bb_xmin) / 2 as x_center, (bb_ymax + bb_ymin) / 2 as y_center
	from bounding_box
	where code_country = '999'
) as foo;
*/

--
-- Define the center of the countries
-- 
update bounding_box
set bb_xmin = xmin(bbox), 
    bb_ymin = ymin(bbox), 
    bb_xmax = xmax(bbox), 
    bb_ymax = ymax(bbox)
from (
select box3d(transform(setSRID(the_geom,4326), 3035)) as bbox,code_country 
from bounding_box bb
left join nuts_rg nuts on (bb.nuts_code = nuts.nuts_id)
where nuts.stat_levl_ = 0
) as foo
where bounding_box.code_country = foo.code_country
and nuts_code is not null;


-- Override the center of France (because of DOM-TOM)
update bounding_box
set bb_xmin = '3200000', 
    bb_ymin = '2060000', 
    bb_xmax = '4220000',    
    bb_ymax = '3160000'
where code_country = '1';


UPDATE bounding_box set bb_xmin = -2823913.5, bb_ymin = -5254873.5, bb_xmax = 10025892.5, bb_ymax = 7594932.5 WHERE code_country = '999';


-- Change the center of Europe (because of French DOM-TOM)
-- The bbox must stay square
update bounding_box
set bb_xmin = bb_xmin + 500000, 
    bb_ymin = bb_ymin + 2000000, 
    bb_xmax = bb_xmax + 500000,
    bb_ymax = bb_ymax + 2000000
where code_country = '999';


--
-- Define the grids available for agregation
--
-- INSERT INTO grid_definition (grid_name, grid_label, grid_table, location_column, aggregation_layer_name, position) VALUES ('nuts0','Countries', 'nuts_0', 'cell_id_nuts0', 'aggregated_result_nuts0', 1);
INSERT INTO grid_definition (grid_name, grid_label, grid_table, location_column, aggregation_layer_name, position) VALUES ('50x50','50 km x 50 km', 'grid_eu25_50k', 'cell_id_50', 'aggregated_result_50', 2);
INSERT INTO grid_definition (grid_name, grid_label, grid_table, location_column, aggregation_layer_name, position) VALUES ('100x100','100 km x 100 km', 'grid_eu25_100k', 'cell_id_100', 'aggregated_result_100', 3);



--
-- Define the classes for raster data
--
INSERT INTO RASTER_CLASS_DEFINITION (DATA, VALUE, COLOR, LABEL) VALUES ('BASAL_AREA', '-1', 'FFFFFF', '0'); -- lower limit
INSERT INTO RASTER_CLASS_DEFINITION (DATA, VALUE, COLOR, LABEL) VALUES ('BASAL_AREA', '0', '004400', '0 - 10');
INSERT INTO RASTER_CLASS_DEFINITION (DATA, VALUE, COLOR, LABEL) VALUES ('BASAL_AREA', '10', '006600', '10 - 20');
INSERT INTO RASTER_CLASS_DEFINITION (DATA, VALUE, COLOR, LABEL) VALUES ('BASAL_AREA', '20', '009900', '20 - 30');
INSERT INTO RASTER_CLASS_DEFINITION (DATA, VALUE, COLOR, LABEL) VALUES ('BASAL_AREA', '30', '00FF00', '&gt; 30');
INSERT INTO RASTER_CLASS_DEFINITION (DATA, VALUE, COLOR, LABEL) VALUES ('BASAL_AREA', '50000', '000000', 'other'); -- upper limit
--
-- Define the classes for raster data
--
INSERT INTO CLASS_DEFINITION (DATA, MIN_VALUE, MAX_VALUE, COLOR, LABEL) VALUES ('BASAL_AREA', 0, 0, 'FFFFFF', '0');
INSERT INTO CLASS_DEFINITION (DATA, MIN_VALUE, MAX_VALUE, COLOR, LABEL) VALUES ('BASAL_AREA', 0, 10, '004400', '0 - 10');
INSERT INTO CLASS_DEFINITION (DATA, MIN_VALUE, MAX_VALUE, COLOR, LABEL) VALUES ('BASAL_AREA', 10, 20, '006600', '10 - 20');
INSERT INTO CLASS_DEFINITION (DATA, MIN_VALUE, MAX_VALUE, COLOR, LABEL) VALUES ('BASAL_AREA', 20, 30, '009900', '20 - 30');
INSERT INTO CLASS_DEFINITION (DATA, MIN_VALUE, MAX_VALUE, COLOR, LABEL) VALUES ('BASAL_AREA', 30, 50000, '00FF00', '&gt; 30');

