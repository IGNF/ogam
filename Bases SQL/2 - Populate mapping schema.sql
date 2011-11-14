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


DELETE FROM legend;
DELETE FROM layer_definition;

-- Define the layers
INSERT INTO layer_definition(layer_name, layer_label, mapserv_layers, isTransparent, isBaseLayer, isUntiled, isCached, maxscale, minscale, transitionEffect, imageFormat, opacity, has_legend, provider_id, has_sld, activate_type) VALUES ('nuts_0', 'Country Boundaries', 'nuts_0', 1, 0, 0, 1, 60000000, 50000, 'resize', 'PNG', null, 1, null, 0, 'NONE');
INSERT INTO layer_definition(layer_name, layer_label, mapserv_layers, isTransparent, isBaseLayer, isUntiled, isCached, maxscale, minscale, transitionEffect, imageFormat, opacity, has_legend, provider_id, has_sld, activate_type) VALUES ('result_locations', 'Results', 'result_locations', 1, 0, 1, 0, null, null, null, 'PNG', null, 0, null, 0, 'REQUEST');
INSERT INTO layer_definition(layer_name, layer_label, mapserv_layers, isTransparent, isBaseLayer, isUntiled, isCached, maxscale, minscale, transitionEffect, imageFormat, opacity, has_legend, provider_id, has_sld, activate_type) VALUES ('all_locations', 'Plot Locations', 'all_locations', 1, 0, 1, 0, null, null, null, 'PNG', null, 1, null, 0, 'NONE');
INSERT INTO layer_definition(layer_name, layer_label, mapserv_layers, isTransparent, isBaseLayer, isUntiled, isCached, maxscale, minscale, transitionEffect, imageFormat, opacity, has_legend, provider_id, has_sld, activate_type) VALUES ('all_harmonized_locations', 'Plot Locations', 'all_harmonized_locations', 1, 0, 1, 0, null, null, null, 'PNG', null, 1, null, 0, 'NONE');
--INSERT INTO layer_definition(layer_name, layer_label, mapserv_layers, isTransparent, isBaseLayer, isUntiled, isCached, maxscale, minscale, transitionEffect, imageFormat, opacity, has_legend, provider_id, has_sld, activate_type) VALUES ('all_locations_country', 'Plot Locations', 'all_locations_country', 1, 0, 1, 0, null, null, null, 'PNG', null, 1, null, 0, 'NONE');
--INSERT INTO layer_definition(layer_name, layer_label, mapserv_layers, isTransparent, isBaseLayer, isUntiled, isCached, maxscale, minscale, transitionEffect, imageFormat, opacity, has_legend, provider_id, has_sld, activate_type) VALUES ('all_harmonized_locations_country', 'Plot Locations', 'all_harmonized_locations_country', 1, 0, 1, 0, null, null, null, 'PNG', null, 1, null,  0, 'NONE');


--
-- Define the layers legend
--
INSERT INTO legend(item_id, parent_id, is_layer, is_checked, is_hidden, is_disabled, is_expended, name, position) VALUES (1, -1, 1, 1, 0, 1, 0, 'result_locations',1);
INSERT INTO legend(item_id, parent_id, is_layer, is_checked, is_hidden, is_disabled, is_expended, name, position) VALUES (2, -1, 1, 0, 1, 0, 0, 'all_locations',2);
--INSERT INTO legend(item_id, parent_id, is_layer, is_checked, is_hidden, is_disabled, is_expended, name, position) VALUES (3, -1, 1, 0, 1, 0, 0, 'all_locations_country',3);
INSERT INTO legend(item_id, parent_id, is_layer, is_checked, is_hidden, is_disabled, is_expended, name, position) VALUES (4, -1, 1, 0, 1, 0, 0, 'all_harmonized_locations',4);
--INSERT INTO legend(item_id, parent_id, is_layer, is_checked, is_hidden, is_disabled, is_expended, name, position) VALUES (5, -1, 1, 0, 1, 0, 0, 'all_harmonized_locations_country',5);


INSERT INTO legend(item_id, parent_id, is_layer, is_checked, is_hidden, is_disabled, is_expended, name, position) VALUES (20, -1, 1, 1, 0, 0, 0, 'nuts_0',20);


--
-- Forbid some layers for some profiles
--


--
-- Configure the bounding box for all data providers
INSERT INTO bounding_box (provider_id, zoom_level, bb_xmin, bb_ymin, bb_xmax, bb_ymax) values ('1', 1, '3200000', '2060000', '4220000', '3160000');
