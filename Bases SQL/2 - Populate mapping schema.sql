--
-- Jouer les scripts suivants (se trouvant dans le répertoire mapping) :
-- nuts_0.sql


SET SEARCH_PATH = mapping, public;

--
-- Add the available map scales
--
DELETE FROM scales;
INSERT INTO scales(scale) VALUES (25000000); -- 25 M
INSERT INTO scales(scale) VALUES (10000000); -- 10 M
INSERT INTO scales(scale) VALUES (5000000);  --  5 M
INSERT INTO scales(scale) VALUES (2500000);  --  2,5 M
INSERT INTO scales(scale) VALUES (1000000);  --  1 M
INSERT INTO scales(scale) VALUES (500000);   --  500 K
INSERT INTO scales(scale) VALUES (250000);   --  250 K
INSERT INTO scales(scale) VALUES (100000);   --  100 K
/*
INSERT INTO scales VALUES (866688.03242073394);
INSERT INTO scales VALUES (433344.01762768999);
INSERT INTO scales VALUES (216672.00739652201);
INSERT INTO scales VALUES (108336.003698261);
INSERT INTO scales VALUES (54168.0018491304);
INSERT INTO scales VALUES (6770.9998768103997);
INSERT INTO scales VALUES (3385.5013557287998);
INSERT INTO scales VALUES (1692.7492605407999);
INSERT INTO scales VALUES (846.37463027039996);
INSERT INTO scales VALUES (1550000);
INSERT INTO scales VALUES (3000000);
INSERT INTO scales VALUES (6000000);
INSERT INTO scales VALUES (423);
INSERT INTO scales VALUES (27084);
INSERT INTO scales VALUES (13542);
*/

--
-- Configure the layers
--


DELETE FROM layer_tree;
DELETE FROM layer;
DELETE FROM layer_service;


-- Define the services
-- Liste des fournisseurs de services (Mapservers, Géoportail, ...)
INSERT INTO layer_service(service_name, config) VALUES ('local_mapserver', '{"urls":["http://localhost:8000/cgi-bin/mapserv?map=/var/www/html/mapserv/ogam.map&"],"params":{"SERVICE":"WMS"}}');
INSERT INTO layer_service(service_name, config) VALUES ('local_tilecache', '{"urls":["http://localhost:8000/cgi-bin/tilecache?"],"params":{"SERVICE":"WMS","VERSION":"1.0.0","REQUEST":"GetMap"}}');
INSERT INTO layer_service(service_name, config) VALUES ('local_mapProxy', '{"urls":["http://localhost:8000/ogam/mapProxy.php?"],"params":{"SERVICE":"WMS","VERSION":"1.1.1","REQUEST":"GetMap"}}');

-- Exemple of a distant WMS mapserver
--INSERT INTO layer_service(service_name, config) VALUES ('mapProxy', '{"urls":["http://test-efdac.ifn.fr/mapProxy.php?"],"params":{"SERVICE":"WMS","VERSION":"1.1.1","REQUEST":"GetMap"}}');
--INSERT INTO layer_service(service_name, config) VALUES ('proxy_wfs', '{"urls":["http://test-efdac.ifn.fr/proxy/getwfs?"],"params":{"SERVICE":"WFS","VERSION":"1.0.0","REQUEST":"GetFeature"}}');
--INSERT INTO layer_service(service_name, config) VALUES ('legend_mapProxy', '{"urls":["http://test-efdac.ifn.fr/mapProxy.php?"],"params":{"SERVICE":"WMS","VERSION":"1.1.1","REQUEST":"GetLegendGraphic"}}');

-- Exemple of a WMTS service (geoportal)
--INSERT INTO layer_service(service_name, config) VALUES ('geoportal_wfs', '{"urls": ["http://wxs-i.ign.fr/7gr31kqe5xttprd2g7zbkqgo/geoportail/wfs?"], "params": {"SERVICE":"WFS","VERSION":"1.0.0","REQUEST":"getFeature"}}');
--INSERT INTO layer_service(service_name, config) VALUES ('geoportal_wms', '{"urls":["http://wxs-i.ign.fr/7gr31kqe5xttprd2g7zbkqgo/geoportail/r/wms?"],"params":{"SERVICE":"WMS","VERSION":"1.3.0","REQUEST":"GetMap"}}');
--INSERT INTO layer_service(service_name, config) VALUES ('geoportal_wmts', '{"urls": ["http://wxs-i.ign.fr/7gr31kqe5xttprd2g7zbkqgo/geoportail/wmts?"],"params":{"SERVICE":"WMTS","VERSION":"1.0.0","REQUEST":"getTile","style":"normal","matrixSet":"PM"}}');



-- Define the layers
-- Liste des couches carto disponibles
INSERT INTO layer (layer_name, layer_label, service_layer_name, isTransparent, isBaseLayer, isUntiled, maxscale, minscale, transitionEffect, imageFormat, has_legend, provider_id, has_sld, activate_type, view_service_name, legend_service_name, print_service_name, detail_service_name, feature_service_name) VALUES ('result_locations', 'Results', 'result_locations', 1, 0, 1, null, null, null, 'PNG',  0, null, 0, 'REQUEST', 'local_mapserver', 'local_mapserver','local_mapserver','local_mapserver', '');
INSERT INTO layer (layer_name, layer_label, service_layer_name, isTransparent, isBaseLayer, isUntiled, maxscale, minscale, transitionEffect, imageFormat, has_legend, provider_id, has_sld, activate_type, view_service_name, legend_service_name, print_service_name, detail_service_name, feature_service_name) VALUES ('all_locations', 'Plot Locations', 'all_locations', 1, 0, 1, null, null, null, 'PNG', 1, null, 0, 'NONE', 'local_mapserver', 'local_mapserver','local_mapserver','local_mapserver', '');
--INSERT INTO layer (layer_name, layer_label, service_layer_name, isTransparent, isBaseLayer, isUntiled, maxscale, minscale, transitionEffect, imageFormat, has_legend, provider_id, has_sld, activate_type, view_service_name, legend_service_name, print_service_name, detail_service_name, feature_service_name) VALUES ('all_harmonized_locations', 'Plot Locations', 'all_harmonized_locations', 1, 0, 1, null, null, null, 'PNG', 1, null, 0, 'NONE', 'local_tilecache', 'legend_mapProxy','local_mapserver','local_mapserver', '');
INSERT INTO layer (layer_name, layer_label, service_layer_name, isTransparent, isBaseLayer, isUntiled, maxscale, minscale, transitionEffect, imageFormat, has_legend, provider_id, has_sld, activate_type, view_service_name, legend_service_name, print_service_name, detail_service_name, feature_service_name) VALUES ('nuts_0', 'Country Boundaries', 'nuts_0', 1, 0, 0, 60000000, 50000, 'resize', 'PNG',  1, null, 0, 'NONE', 'local_tilecache', 'local_mapserver','local_mapserver','local_mapserver', 'local_mapserver');
--INSERT INTO layer (layer_name, layer_label, service_layer_name, isTransparent, isBaseLayer, isUntiled, maxscale, minscale, transitionEffect, imageFormat, has_legend, provider_id, has_sld, activate_type, view_service_name, legend_service_name, print_service_name, detail_service_name, feature_service_name) VALUES ('ORTHOIMAGERY.ORTHOPHOTOS', 'BD Ortho', 'ORTHOIMAGERY.ORTHOPHOTOS', 1, 0, 0, NULL, NULL, 'resize', 'jpeg', 1, NULL, 0, 'NONE', 'geoportal_wmts', 'geoportal_wms', 'geoportal_wms', 'geoportal_wms', '');

-- Define the layers legend
-- Définition de l'arbre des couches, avec leur hiérarchie
INSERT INTO layer_tree(item_id, parent_id, is_layer, is_checked, is_hidden, is_disabled, is_expended, name, checked_group, position) VALUES (1, -1, 1, 0, 0, 1, 0, 'result_locations', null, 1);
INSERT INTO layer_tree(item_id, parent_id, is_layer, is_checked, is_hidden, is_disabled, is_expended, name, checked_group, position) VALUES (2, -1, 1, 0, 1, 0, 0, 'all_locations', null, 2);
--INSERT INTO layer_tree(item_id, parent_id, is_layer, is_checked, is_hidden, is_disabled, is_expended, name, checked_group, position) VALUES (4, -1, 1, 0, 1, 0, 0, 'all_harmonized_locations', null, 4);

INSERT INTO layer_tree(item_id, parent_id, is_layer, is_checked, is_hidden, is_disabled, is_expended, name, checked_group, position) VALUES (20, -1, 1, 1, 0, 0, 0, 'nuts_0', null, 20);
--INSERT INTO layer_tree(item_id, parent_id, is_layer, is_checked, is_hidden, is_disabled, is_expended, name, checked_group, position) VALUES (30, -1, 1, 1, 0, 0, 0, 'ORTHOIMAGERY.ORTHOPHOTOS', null, 30);


--
-- Forbid some layers for some profiles
--


--
-- Configure the bounding box for all data providers
INSERT INTO bounding_box (provider_id, zoom_level, bb_xmin, bb_ymin, bb_xmax, bb_ymax) values ('1', 1, '1690000', '1000000', '7670000', '5340000');
