--
-- Jouer les scripts suivants (se trouvant dans le répertoire Référentiels) :
-- nuts_0.sql
-- communes.sql
-- departements.sql

SET client_encoding TO 'UTF8';
SET SEARCH_PATH = mapping, public;


-- Add the available map scales
DELETE FROM scales;
INSERT INTO scales(scale) VALUES (25000000); -- 25 M
INSERT INTO scales(scale) VALUES (10000000); -- 10 M
INSERT INTO scales(scale) VALUES (5000000);  --  5 M
INSERT INTO scales(scale) VALUES (2500000);  --  2,5 M
INSERT INTO scales(scale) VALUES (1000000);  --  1 M
INSERT INTO scales(scale) VALUES (500000);   --  500 K
INSERT INTO scales(scale) VALUES (250000);   --  250 K
INSERT INTO scales(scale) VALUES (100000);   --  100 K

DELETE FROM layer_tree;
DELETE FROM layer;
DELETE FROM layer_service;

-- Define the services
INSERT INTO layer_service (service_name, config) VALUES ('geoportal_wms', '{"urls":["http://wxs-i.ign.fr/7gr31kqe5xttprd2g7zbkqgo/geoportail/r/wms?"],"params":{"SERVICE":"WMS","VERSION":"1.3.0","REQUEST":"GetMap"}}');
INSERT INTO layer_service (service_name, config) VALUES ('legend_mapProxy', '{"urls":["http://www.ogam.fr/mapProxy.php?"],"params":{"SERVICE":"WMS","VERSION":"1.1.1","REQUEST":"GetLegendGraphic"}}');
INSERT INTO layer_service (service_name, config) VALUES ('mapProxy', '{"urls":["http://www.ogam.fr/mapProxy.php?"],"params":{"SERVICE":"WMS","VERSION":"1.1.1","REQUEST":"GetMap"}}');
INSERT INTO layer_service (service_name, config) VALUES ('proxy_wfs', '{"urls":["http://www.ogam.fr/proxy/getwfs?"],"params":{"SERVICE":"WFS","VERSION":"1.0.0","REQUEST":"GetFeature"}}');
INSERT INTO layer_service (service_name, config) VALUES ('geoportal_wmts', '{"urls":["http://wxs-i.ign.fr/7gr31kqe5xttprd2g7zbkqgo/geoportail/wmts?"],"params":{"SERVICE":"WMTS","VERSION":"1.0.0","REQUEST":"getTile","style":"normal","matrixSet":"PM"}}');
INSERT INTO layer_service (service_name, config) VALUES ('local_mapserver', '{"urls":["http://localhost/cgi-bin/mapserv.ogam?"],"params":{"SERVICE":"WMS","VERSION":"1.1.1","REQUEST":"GetMap"}}');

-- Define the layers
INSERT INTO layer (layer_name, layer_label, service_layer_name, istransparent, default_opacity, isbaselayer, isuntiled, maxscale, minscale, has_legend, transitioneffect, imageformat, provider_id, has_sld, activate_type, view_service_name, legend_service_name, print_service_name, detail_service_name, feature_service_name, layer_group_id) VALUES ('fonds', 'Fonds', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 4);
INSERT INTO layer (layer_name, layer_label, service_layer_name, istransparent, default_opacity, isbaselayer, isuntiled, maxscale, minscale, has_legend, transitioneffect, imageformat, provider_id, has_sld, activate_type, view_service_name, legend_service_name, print_service_name, detail_service_name, feature_service_name, layer_group_id) VALUES ('nuts_0', 'Country Boundaries', 'nuts_0', 1, NULL, 0, 0, NULL, 500000, 1, 'resize', 'PNG', NULL, 0, 'NONE', 'mapProxy', 'legend_mapProxy', 'mapProxy', 'mapProxy', 'proxy_wfs', 5);
INSERT INTO layer (layer_name, layer_label, service_layer_name, istransparent, default_opacity, isbaselayer, isuntiled, maxscale, minscale, has_legend, transitioneffect, imageformat, provider_id, has_sld, activate_type, view_service_name, legend_service_name, print_service_name, detail_service_name, feature_service_name, layer_group_id) VALUES ('result_locations', 'Results', 'result_locations', 1, NULL, 0, 1, NULL, NULL, 1, NULL, 'PNG', NULL, 0, 'REQUEST', 'mapProxy', 'legend_mapProxy', 'mapProxy', NULL, NULL, 7);
INSERT INTO layer (layer_name, layer_label, service_layer_name, istransparent, default_opacity, isbaselayer, isuntiled, maxscale, minscale, has_legend, transitioneffect, imageformat, provider_id, has_sld, activate_type, view_service_name, legend_service_name, print_service_name, detail_service_name, feature_service_name, layer_group_id) VALUES ('plot_location_detail', 'pld', 'plot_location_detail', 1, 0, NULL, NULL, NULL, NULL, NULL, NULL, 'PNG', NULL, NULL, 'NONE', 'mapProxy', NULL, 'mapProxy', 'local_mapserver', NULL, NULL);
INSERT INTO layer (layer_name, layer_label, service_layer_name, istransparent, default_opacity, isbaselayer, isuntiled, maxscale, minscale, has_legend, transitioneffect, imageformat, provider_id, has_sld, activate_type, view_service_name, legend_service_name, print_service_name, detail_service_name, feature_service_name, layer_group_id) VALUES ('all_locations', 'Plot Locations', 'all_locations', 1, NULL, 0, 1, NULL, NULL, 1, NULL, 'PNG', NULL, 0, 'NONE', 'mapProxy', 'legend_mapProxy', 'local_mapserver', 'local_mapserver', 'proxy_wfs', 2);
INSERT INTO layer (layer_name, layer_label, service_layer_name, istransparent, default_opacity, isbaselayer, isuntiled, maxscale, minscale, has_legend, transitioneffect, imageformat, provider_id, has_sld, activate_type, view_service_name, legend_service_name, print_service_name, detail_service_name, feature_service_name, layer_group_id) VALUES ('all_harmonized_locations', 'Plot Locations', 'all_harmonized_locations', 1, NULL, 0, 1, NULL, NULL, 1, NULL, 'PNG', NULL, 0, 'NONE', 'mapProxy', 'legend_mapProxy', 'local_mapserver', 'local_mapserver', NULL, 1);
INSERT INTO layer (layer_name, layer_label, service_layer_name, istransparent, default_opacity, isbaselayer, isuntiled, maxscale, minscale, has_legend, transitioneffect, imageformat, provider_id, has_sld, activate_type, view_service_name, legend_service_name, print_service_name, detail_service_name, feature_service_name, layer_group_id) VALUES ('ORTHOIMAGERY.ORTHOPHOTOS', 'BD Ortho', 'ORTHOIMAGERY.ORTHOPHOTOS', 1, 50, 0, 0, NULL, NULL, 1, 'resize', 'jpeg', NULL, 0, 'NONE', 'geoportal_wmts', NULL, 'geoportal_wms', 'geoportal_wms', NULL, 6);

-- Define the layers tree
INSERT INTO layer_tree (item_id, parent_id, is_layer, is_checked, is_hidden, is_disabled, is_expended, name, "position", checked_group) VALUES (27, '-1', 1, 0, 1, 0, 0, 'plot_location_detail', 6, NULL);
INSERT INTO layer_tree (item_id, parent_id, is_layer, is_checked, is_hidden, is_disabled, is_expended, name, "position", checked_group) VALUES (2, '-1', 1, 1, 0, 0, 0, 'all_locations', 2, NULL);
INSERT INTO layer_tree (item_id, parent_id, is_layer, is_checked, is_hidden, is_disabled, is_expended, name, "position", checked_group) VALUES (6, '-1', 0, 0, 0, 0, 1, 'fonds', 1, NULL);
INSERT INTO layer_tree (item_id, parent_id, is_layer, is_checked, is_hidden, is_disabled, is_expended, name, "position", checked_group) VALUES (4, '6', 1, 1, 0, 0, 0, 'nuts_0', 2, NULL);
INSERT INTO layer_tree (item_id, parent_id, is_layer, is_checked, is_hidden, is_disabled, is_expended, name, "position", checked_group) VALUES (5, '6', 1, 0, 0, 0, 0, 'ORTHOIMAGERY.ORTHOPHOTOS', 1, NULL);
INSERT INTO layer_tree (item_id, parent_id, is_layer, is_checked, is_hidden, is_disabled, is_expended, name, "position", checked_group) VALUES (1, '-1', 1, 0, 0, 1, 0, 'result_locations', 1, NULL);

--
-- Forbid some layers for some profiles
--

--
-- Configure the bounding box for all data providers
INSERT INTO bounding_box (provider_id, bb_xmin, bb_ymin, bb_xmax, bb_ymax, zoom_level) VALUES ('1', 3200000, 2060000, 4220000, 3160000, 1);