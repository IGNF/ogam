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

--
-- Configure the layers
--
DELETE FROM layer_tree;
DELETE FROM layer;
DELETE FROM layer_service;


-- Define the services
INSERT INTO layer_service (service_name, config) VALUES ('Private_Mapserv_WMS_GetMap', '{"urls":["http://localhost/mapserv-ogam?"],"params":{"SERVICE":"WMS","VERSION":"1.1.1","REQUEST":"GetMap"}}');
INSERT INTO layer_service (service_name, config) VALUES ('Private_Tilecache_WMS_GetMap', '{"urls":["http://localhost/tilecache-ogam?"],"params":{"SERVICE":"WMS","VERSION":"1.0.0","REQUEST":"GetMap"}}');
INSERT INTO layer_service (service_name, config) VALUES ('Local_Proxy_WFS_GetFeature', '{"urls":["http://192.168.50.4/proxy/getwfs?"],"params":{"SERVICE":"WFS","VERSION":"1.0.0","REQUEST":"GetFeature"}}');
INSERT INTO layer_service (service_name, config) VALUES ('Local_MapProxy_WMS_GetLegendGraphic', '{"urls":["http://192.168.50.4/mapProxy.php?"],"params":{"SERVICE":"WMS","VERSION":"1.1.1","REQUEST":"GetLegendGraphic"}}');
INSERT INTO layer_service (service_name, config) VALUES ('Local_MapProxy_Mapserv_WMS_GetMap', '{"urls":["http://192.168.50.4/mapProxy.php?"],"params":{"SERVICE":"WMS","VERSION":"1.1.1","REQUEST":"GetMap"}}');
INSERT INTO layer_service (service_name, config) VALUES ('Local_MapProxy_Tilecache_WMS_GetMap', '{"urls":["http://192.168.50.4/mapProxy.php?"],"params":{"SERVICE":"WMS","VERSION":"1.1.1","REQUEST":"GetMap","USECACHE":true}}');
INSERT INTO layer_service (service_name, config) VALUES ('Local_MapProxy_WFS_GetFeature', '{"urls":["http://192.168.50.4/mapProxy.php?"],"params":{"SERVICE":"WFS","VERSION":"1.1.0","REQUEST":"GetFeature"}}');
INSERT INTO layer_service (service_name, config) VALUES ('Geoportal_WMS_GetMap', '{"urls":["http://wxs-i.ign.fr/7gr31kqe5xttprd2g7zbkqgo/geoportail/r/wms?"],"params":{"SERVICE":"WMS","VERSION":"1.3.0","REQUEST":"GetMap"}}');
INSERT INTO layer_service (service_name, config) VALUES ('Geoportal_WMTS_GetTile', '{"urls":["http://wxs-i.ign.fr/7gr31kqe5xttprd2g7zbkqgo/geoportail/wmts?"],"params":{"SERVICE":"WMTS","VERSION":"1.0.0","REQUEST":"getTile","style":"normal","matrixSet":"PM","requestEncoding":"KVP","maxExtent":[-20037508, -20037508, 20037508, 20037508],"serverResolutions":[156543.033928,78271.516964,39135.758482,19567.879241,9783.939621,4891.969810,2445.984905,1222.992453,611.496226,305.748113,152.874057,76.437028,38.218514,19.109257,9.554629,4.777302,2.388657,1.194329,0.597164,0.298582,0.149291,0.074646],"tileOrigin":[-20037508,20037508]}}');
-- Integration config
INSERT INTO layer_service (service_name, config) VALUES ('Integration_Mapserv_WMS_GetMap', '{"urls":["http://ogam-integration.ign.fr/cgi-bin/mapserv.ogam?"],"params":{"SERVICE":"WMS","VERSION":"1.1.1","REQUEST":"GetMap"}}');
INSERT INTO layer_service (service_name, config) VALUES ('Integration_Mapserv_WMS_GetLegendGraphic', '{"urls":["http://ogam-integration.ign.fr/cgi-bin/mapserv.ogam?"],"params":{"SERVICE":"WMS","VERSION":"1.1.1","REQUEST":"GetLegendGraphic"}}');
INSERT INTO layer_service (service_name, config) VALUES ('Integration_TileCache_WMS_GetMap', '{"urls":["http://ogam-integration.ign.fr/cgi-bin/tilecache?"],"params":{"SERVICE":"WMS","VERSION":"1.0.0","REQUEST":"GetMap"}}');
INSERT INTO layer_service (service_name, config) VALUES ('Integration_MapProxy_WMS_GetMap', '{"urls":["http://ogam-integration.ign.fr/mapProxy.php?"],"params":{"SERVICE":"WMS","VERSION":"1.1.1","REQUEST":"GetMap"}}');


-- Define the layers
-- Locations
INSERT INTO layer (layer_name, layer_label, service_layer_name, istransparent, default_opacity, isbaselayer, isuntiled, isvector, maxscale, minscale, has_legend, provider_id, activate_type, view_service_name, legend_service_name, print_service_name, detail_service_name, feature_service_name) VALUES ('result_locations', 'Résultats', 'result_locations', 1, 100, 0, 1, 1, NULL, NULL, 0, NULL, 'REQUEST', 'Local_MapProxy_Mapserv_WMS_GetMap', 'Local_MapProxy_WMS_GetLegendGraphic', 'Local_MapProxy_Mapserv_WMS_GetMap', 'Local_MapProxy_Mapserv_WMS_GetMap', NULL);
INSERT INTO layer (layer_name, layer_label, service_layer_name, istransparent, default_opacity, isbaselayer, isuntiled, isvector, maxscale, minscale, has_legend, provider_id, activate_type, view_service_name, legend_service_name, print_service_name, detail_service_name, feature_service_name) VALUES ('all_locations', 'Localisations', 'all_locations', 1, 100, 0, 1, 1, NULL, NULL, 1, NULL, 'NONE', 'Local_MapProxy_Mapserv_WMS_GetMap', 'Local_MapProxy_WMS_GetLegendGraphic', 'Local_MapProxy_Mapserv_WMS_GetMap', 'Local_MapProxy_Mapserv_WMS_GetMap', 'Local_MapProxy_WFS_GetFeature');
-- TODO: Filter the layer in function of the context page
-- INSERT INTO layer (layer_name, layer_label, service_layer_name, istransparent, default_opacity, isbaselayer, isuntiled, isvector, maxscale, minscale, has_legend, provider_id, activate_type, view_service_name, legend_service_name, print_service_name, detail_service_name, feature_service_name) VALUES ('all_harmonized_locations', 'Toutes les localisations', 'all_harmonized_locations', 1, 100, 0, 1, 1, NULL, NULL, 1, NULL, 'NONE', 'Local_MapProxy_Mapserv_WMS_GetMap', 'Local_MapProxy_WMS_GetLegendGraphic', 'Local_MapProxy_Mapserv_WMS_GetMap', 'Local_MapProxy_Mapserv_WMS_GetMap', 'Local_MapProxy_WFS_GetFeature');
INSERT INTO layer (layer_name, layer_label, service_layer_name, istransparent, default_opacity, isbaselayer, isuntiled, isvector, maxscale, minscale, has_legend, provider_id, activate_type, view_service_name, legend_service_name, print_service_name, detail_service_name, feature_service_name) VALUES ('location_detail', 'Détail', 'plot_location_detail', 1, 100, 0, 0, 1, NULL, NULL, 0, NULL, 'NONE', NULL, NULL, NULL, 'Local_MapProxy_Mapserv_WMS_GetMap', NULL);
-- Boundaries
INSERT INTO layer (layer_name, layer_label, service_layer_name, istransparent, default_opacity, isbaselayer, isuntiled, isvector, maxscale, minscale, has_legend, provider_id, activate_type, view_service_name, legend_service_name, print_service_name, detail_service_name, feature_service_name) VALUES ('boundaries', 'Limites administratives', NULL, 0, 0, 0, 0, 0, 0, 0, 1, NULL, 'NONE', NULL, NULL, NULL, NULL, NULL);
INSERT INTO layer (layer_name, layer_label, service_layer_name, istransparent, default_opacity, isbaselayer, isuntiled, isvector, maxscale, minscale, has_legend, provider_id, activate_type, view_service_name, legend_service_name, print_service_name, detail_service_name, feature_service_name) VALUES ('countries', 'Pays', 'nuts_0', 1, 100, 0, 0, 0, NULL, 500000, 1, NULL, 'NONE', 'Local_MapProxy_Tilecache_WMS_GetMap', 'Local_MapProxy_WMS_GetLegendGraphic', 'Local_MapProxy_Tilecache_WMS_GetMap', 'Local_MapProxy_Tilecache_WMS_GetMap', 'Local_MapProxy_WFS_GetFeature');
INSERT INTO layer (layer_name, layer_label, service_layer_name, istransparent, default_opacity, isbaselayer, isuntiled, isvector, maxscale, minscale, has_legend, provider_id, activate_type, view_service_name, legend_service_name, print_service_name, detail_service_name, feature_service_name) VALUES ('departements', 'Départements', 'departements', 1, 100, 0, 0, 0, 5000000, 1, 1, NULL, 'NONE', 'Local_MapProxy_Tilecache_WMS_GetMap', 'Local_MapProxy_WMS_GetLegendGraphic', 'Local_MapProxy_Tilecache_WMS_GetMap', 'Local_MapProxy_Tilecache_WMS_GetMap', 'Local_MapProxy_WFS_GetFeature');
INSERT INTO layer (layer_name, layer_label, service_layer_name, istransparent, default_opacity, isbaselayer, isuntiled, isvector, maxscale, minscale, has_legend, provider_id, activate_type, view_service_name, legend_service_name, print_service_name, detail_service_name, feature_service_name) VALUES ('communes', 'Communes', 'communes', 1, 100, 0, 0, 0, 500000, 1, 1, NULL, 'NONE', 'Local_MapProxy_Tilecache_WMS_GetMap', 'Local_MapProxy_WMS_GetLegendGraphic', 'Local_MapProxy_Tilecache_WMS_GetMap', 'Local_MapProxy_Tilecache_WMS_GetMap', 'Local_MapProxy_WFS_GetFeature');
-- Background
INSERT INTO layer (layer_name, layer_label, service_layer_name, istransparent, default_opacity, isbaselayer, isuntiled, isvector, maxscale, minscale, has_legend, provider_id, activate_type, view_service_name, legend_service_name, print_service_name, detail_service_name, feature_service_name) VALUES ('background', 'Fonds', NULL, 0, 0, 0, 0, 0, 0, 0, 1, NULL, 'NONE', NULL, NULL, NULL, NULL, NULL);
INSERT INTO layer (layer_name, layer_label, service_layer_name, istransparent, default_opacity, isbaselayer, isuntiled, isvector, maxscale, minscale, has_legend, provider_id, activate_type, view_service_name, legend_service_name, print_service_name, detail_service_name, feature_service_name) VALUES ('ortho_photos', 'Photos aériennes', 'ORTHOIMAGERY.ORTHOPHOTOS', 0, 50, 0, 0, 0, 0, 0, 0, NULL, 'NONE', 'Geoportal_WMTS_GetTile', NULL, 'Geoportal_WMS_GetMap', 'Geoportal_WMS_GetMap', NULL);
INSERT INTO layer (layer_name, layer_label, service_layer_name, istransparent, default_opacity, isbaselayer, isuntiled, isvector, maxscale, minscale, has_legend, provider_id, activate_type, view_service_name, legend_service_name, print_service_name, detail_service_name, feature_service_name) VALUES ('scan25','Carte topographique','GEOGRAPHICALGRIDSYSTEMS.MAPS.SCAN25TOUR', 0, 50, 0, 0, 0, 25000000, 0, 0, NULL, 'NONE', 'Geoportal_WMTS_GetTile', NULL, 'Geoportal_WMS_GetMap', 'Geoportal_WMS_GetMap', NULL);

-- Define the layers tree
INSERT INTO layer_tree (item_id, parent_id, is_layer, is_checked, is_hidden, is_disabled, is_expended, name, "position", checked_group) VALUES (22, '20', 1, 0, 0, 0, 0, 'departements', 22, NULL);
INSERT INTO layer_tree (item_id, parent_id, is_layer, is_checked, is_hidden, is_disabled, is_expended, name, "position", checked_group) VALUES (23, '20', 1, 0, 0, 0, 0, 'communes', 23, NULL);
INSERT INTO layer_tree (item_id, parent_id, is_layer, is_checked, is_hidden, is_disabled, is_expended, name, "position", checked_group) VALUES (20, '-1', 0, 0, 0, 0, 1, 'boundaries', 20, NULL);
INSERT INTO layer_tree (item_id, parent_id, is_layer, is_checked, is_hidden, is_disabled, is_expended, name, "position", checked_group) VALUES (21, '20', 1, 1, 0, 0, 0, 'countries', 21, NULL);
INSERT INTO layer_tree (item_id, parent_id, is_layer, is_checked, is_hidden, is_disabled, is_expended, name, "position", checked_group) VALUES (1, '-1', 1, 0, 0, 1, 0, 'result_locations', 1, NULL);
INSERT INTO layer_tree (item_id, parent_id, is_layer, is_checked, is_hidden, is_disabled, is_expended, name, "position", checked_group) VALUES (2, '-1', 1, 0, 0, 0, 0, 'all_locations', 2, NULL);
INSERT INTO layer_tree (item_id, parent_id, is_layer, is_checked, is_hidden, is_disabled, is_expended, name, "position", checked_group) VALUES (30, '-1', 0, 0, 0, 0, 1, 'background', 30, NULL);
INSERT INTO layer_tree (item_id, parent_id, is_layer, is_checked, is_hidden, is_disabled, is_expended, name, "position", checked_group) VALUES (31, '30', 1, 0, 0, 0, 0, 'ortho_photos', 31, NULL);
INSERT INTO layer_tree (item_id, parent_id, is_layer, is_checked, is_hidden, is_disabled, is_expended, name, "position", checked_group) VALUES (32, '30', 1, 1, 0, 0, 0, 'scan25', 32, NULL);

-- Configure the bounding box for all data providers
INSERT INTO bounding_box (provider_id, bb_xmin, bb_ymin, bb_xmax, bb_ymax, zoom_level) VALUES ('1', 96670, 6022395, 96670, 6022395, 1); -- France Entière
INSERT INTO bounding_box (provider_id, bb_xmin, bb_ymin, bb_xmax, bb_ymax, zoom_level) VALUES ('2', 260000, 6620000, 260000, 6620000, 6); -- Zoom par défaut sur Dunkerque
