SET SEARCH_PATH = mapping, public;

--
-- Add the available map zoom_level (see https://depot.ign.fr/geoportail/api/feature/tech-docs-js/fr/webmaster/layers.html)
--
DELETE FROM zoom_level;
INSERT INTO zoom_level (zoom_level, resolution, approx_scale_denom, scale_label, is_map_zoom_level) VALUES (0, 156543.0339280410, 559082264, '1:560M', FALSE);
INSERT INTO zoom_level (zoom_level, resolution, approx_scale_denom, scale_label, is_map_zoom_level) VALUES (1, 78271.5169640205, 279541132, '1:280M', FALSE);
INSERT INTO zoom_level (zoom_level, resolution, approx_scale_denom, scale_label, is_map_zoom_level) VALUES (2, 39135.7584820102, 139770566, '1:140M', FALSE);
INSERT INTO zoom_level (zoom_level, resolution, approx_scale_denom, scale_label, is_map_zoom_level) VALUES (3, 19567.8792410051, 69885283, '1:70M', FALSE);
INSERT INTO zoom_level (zoom_level, resolution, approx_scale_denom, scale_label, is_map_zoom_level) VALUES (4, 9783.9396205026, 34942642, '1:35M', TRUE);
INSERT INTO zoom_level (zoom_level, resolution, approx_scale_denom, scale_label, is_map_zoom_level) VALUES (5, 4891.9698102513, 17471321, '1:17M', TRUE);
INSERT INTO zoom_level (zoom_level, resolution, approx_scale_denom, scale_label, is_map_zoom_level) VALUES (6, 2445.9849051256, 8735660, '1:8,7M', TRUE);
INSERT INTO zoom_level (zoom_level, resolution, approx_scale_denom, scale_label, is_map_zoom_level) VALUES (7, 1222.9924525628, 4367830, '1:4,4M', TRUE);
INSERT INTO zoom_level (zoom_level, resolution, approx_scale_denom, scale_label, is_map_zoom_level) VALUES (8, 611.4962262814, 2183915, '1:2,2M', TRUE);
INSERT INTO zoom_level (zoom_level, resolution, approx_scale_denom, scale_label, is_map_zoom_level) VALUES (9, 305.7481131407, 1091958, '1:1,1M', TRUE);
INSERT INTO zoom_level (zoom_level, resolution, approx_scale_denom, scale_label, is_map_zoom_level) VALUES (10, 152.8740565704, 545979, '1:546K', TRUE);
INSERT INTO zoom_level (zoom_level, resolution, approx_scale_denom, scale_label, is_map_zoom_level) VALUES (11, 76.4370282852, 272989, '1:273K', TRUE);
INSERT INTO zoom_level (zoom_level, resolution, approx_scale_denom, scale_label, is_map_zoom_level) VALUES (12, 38.2185141426, 136495, '1:136K', TRUE);
INSERT INTO zoom_level (zoom_level, resolution, approx_scale_denom, scale_label, is_map_zoom_level) VALUES (13, 19.1092570713, 68247, '1:68K', FALSE);
INSERT INTO zoom_level (zoom_level, resolution, approx_scale_denom, scale_label, is_map_zoom_level) VALUES (14, 9.5546285356, 34124, '1:34K', FALSE);
INSERT INTO zoom_level (zoom_level, resolution, approx_scale_denom, scale_label, is_map_zoom_level) VALUES (15, 4.7773142678, 17062, '1:17K', FALSE);
INSERT INTO zoom_level (zoom_level, resolution, approx_scale_denom, scale_label, is_map_zoom_level) VALUES (16, 2.3886571339, 8531, '1:8,5K', FALSE);
INSERT INTO zoom_level (zoom_level, resolution, approx_scale_denom, scale_label, is_map_zoom_level) VALUES (17, 1.1943285670, 4265, '1:4,3K', FALSE);
INSERT INTO zoom_level (zoom_level, resolution, approx_scale_denom, scale_label, is_map_zoom_level) VALUES (18, 0.5971642835, 2133, '1:2,1K', FALSE);
INSERT INTO zoom_level (zoom_level, resolution, approx_scale_denom, scale_label, is_map_zoom_level) VALUES (19, 0.2985821417, 1066, '1:1,1K', FALSE);
INSERT INTO zoom_level (zoom_level, resolution, approx_scale_denom, scale_label, is_map_zoom_level) VALUES (20, 0.1492910709, 533, '1:533', FALSE);
INSERT INTO zoom_level (zoom_level, resolution, approx_scale_denom, scale_label, is_map_zoom_level) VALUES (21, 0.0746455354, 267, '1:267', FALSE);

--
-- Configure the layers
--
DELETE FROM layer_tree_node;
DELETE FROM layer;
DELETE FROM layer_service;


-- Define the services
INSERT INTO layer_service (name, config) VALUES ('Private_Mapserv_WMS_GetMap', '{"urls":["http://localhost/mapserv-ogam?"],"params":{"SERVICE":"WMS","VERSION":"1.1.1","REQUEST":"GetMap"}}');
INSERT INTO layer_service (name, config) VALUES ('Private_Tilecache_WMS_GetMap', '{"urls":["http://localhost/tilecache-ogam?"],"params":{"SERVICE":"WMS","VERSION":"1.0.0","REQUEST":"GetMap"}}');
INSERT INTO layer_service (name, config) VALUES ('Local_Proxy_WFS_GetFeature', '{"urls":["http://192.168.50.4/proxy/getwfs?"],"params":{"SERVICE":"WFS","VERSION":"1.0.0","REQUEST":"GetFeature"}}');
INSERT INTO layer_service (name, config) VALUES ('Local_MapProxy_WMS_GetLegendGraphic', '{"urls":["http://192.168.50.4/mapserverProxy.php?"],"params":{"SERVICE":"WMS","VERSION":"1.1.1","REQUEST":"GetLegendGraphic"}}');
INSERT INTO layer_service (name, config) VALUES ('Local_MapProxy_Mapserv_WMS_GetMap', '{"urls":["http://192.168.50.4/mapserverProxy.php?"],"params":{"SERVICE":"WMS","VERSION":"1.1.1","REQUEST":"GetMap"}}');
INSERT INTO layer_service (name, config) VALUES ('Local_MapProxy_Tilecache_WMS_GetMap', '{"urls":["http://192.168.50.4/tilecacheProxy.php?"],"params":{"SERVICE":"WMS","VERSION":"1.1.1","REQUEST":"GetMap"}}');
INSERT INTO layer_service (name, config) VALUES ('Local_MapProxy_WFS_GetFeature', '{"urls":["http://192.168.50.4/mapserverProxy.php?"],"params":{"SERVICE":"WFS","VERSION":"1.1.0","REQUEST":"GetFeature"}}');
INSERT INTO layer_service (name, config) VALUES ('Geoportal_WMS_GetMap', '{"urls":["http://wxs-i.ign.fr/7gr31kqe5xttprd2g7zbkqgo/geoportail/r/wms?"],"params":{"SERVICE":"WMS","VERSION":"1.3.0","REQUEST":"GetMap"}}');
INSERT INTO layer_service (name, config) VALUES ('Geoportal_WMTS_GetTile', '{"urls":["http://wxs-i.ign.fr/7gr31kqe5xttprd2g7zbkqgo/geoportail/wmts?"],"params":{"SERVICE":"WMTS","VERSION":"1.0.0","REQUEST":"getTile","style":"normal","matrixSet":"PM","requestEncoding":"KVP","maxExtent":[-20037508, -20037508, 20037508, 20037508],"serverResolutions":[156543.033928,78271.516964,39135.758482,19567.879241,9783.939621,4891.969810,2445.984905,1222.992453,611.496226,305.748113,152.874057,76.437028,38.218514,19.109257,9.554629,4.777302,2.388657,1.194329,0.597164,0.298582,0.149291,0.074646],"tileOrigin":[-20037508,20037508]}}');
-- Integration config
INSERT INTO layer_service (name, config) VALUES ('Integration_Mapserv_WMS_GetMap', '{"urls":["http://ogam-integration.ign.fr/cgi-bin/mapserv.ogam?"],"params":{"SERVICE":"WMS","VERSION":"1.1.1","REQUEST":"GetMap"}}');
INSERT INTO layer_service (name, config) VALUES ('Integration_Mapserv_WMS_GetLegendGraphic', '{"urls":["http://ogam-integration.ign.fr/cgi-bin/mapserv.ogam?"],"params":{"SERVICE":"WMS","VERSION":"1.1.1","REQUEST":"GetLegendGraphic"}}');
INSERT INTO layer_service (name, config) VALUES ('Integration_TileCache_WMS_GetMap', '{"urls":["http://ogam-integration.ign.fr/cgi-bin/tilecache?"],"params":{"SERVICE":"WMS","VERSION":"1.0.0","REQUEST":"GetMap"}}');
INSERT INTO layer_service (name, config) VALUES ('Integration_MapProxy_WMS_GetMap', '{"urls":["http://ogam-integration.ign.fr/mapProxy.php?"],"params":{"SERVICE":"WMS","VERSION":"1.1.1","REQUEST":"GetMap"}}');


-- Define the layers
INSERT INTO layer (name, label, service_layer_name, is_transparent, default_opacity, is_base_layer, is_untiled, max_zoom_level, min_zoom_level, has_legend, provider_id, activate_type, view_service_name, legend_service_name, detail_service_name, feature_service_name) VALUES ('all_locations', 'Localisations', 'all_locations_point', 1, 100, 0, 1, NULL, NULL, 1, NULL, 'NONE', 'Local_MapProxy_Mapserv_WMS_GetMap', 'Local_MapProxy_WMS_GetLegendGraphic', 'Local_MapProxy_Mapserv_WMS_GetMap', 'Local_MapProxy_WFS_GetFeature');
INSERT INTO layer (name, label, service_layer_name, is_transparent, default_opacity, is_base_layer, is_untiled, max_zoom_level, min_zoom_level, has_legend, provider_id, activate_type, view_service_name, legend_service_name, detail_service_name, feature_service_name) VALUES ('countries', 'Pays', 'nuts_0', 1, 100, 0, 0, NULL, 10, 1, NULL, 'NONE', 'Local_MapProxy_Tilecache_WMS_GetMap', 'Local_MapProxy_WMS_GetLegendGraphic', 'Local_MapProxy_Mapserv_WMS_GetMap', 'Local_MapProxy_WFS_GetFeature');
INSERT INTO layer (name, label, service_layer_name, is_transparent, default_opacity, is_base_layer, is_untiled, max_zoom_level, min_zoom_level, has_legend, provider_id, activate_type, view_service_name, legend_service_name, detail_service_name, feature_service_name) VALUES ('departements', 'Départements', 'departements', 1, 100, 0, 0, 7, NULL, 1, NULL, 'NONE', 'Local_MapProxy_Tilecache_WMS_GetMap', 'Local_MapProxy_WMS_GetLegendGraphic', 'Local_MapProxy_Mapserv_WMS_GetMap', 'Local_MapProxy_WFS_GetFeature');
INSERT INTO layer (name, label, service_layer_name, is_transparent, default_opacity, is_base_layer, is_untiled, max_zoom_level, min_zoom_level, has_legend, provider_id, activate_type, view_service_name, legend_service_name, detail_service_name, feature_service_name) VALUES ('communes', 'Communes', 'communes', 1, 100, 0, 0, 10, NULL, 1, NULL, 'NONE', 'Local_MapProxy_Tilecache_WMS_GetMap', 'Local_MapProxy_WMS_GetLegendGraphic', 'Local_MapProxy_Mapserv_WMS_GetMap', 'Local_MapProxy_WFS_GetFeature');
INSERT INTO layer (name, label, service_layer_name, is_transparent, default_opacity, is_base_layer, is_untiled, max_zoom_level, min_zoom_level, has_legend, provider_id, activate_type, view_service_name, legend_service_name, detail_service_name, feature_service_name) VALUES ('ortho_photos', 'Photos aériennes', 'ORTHOIMAGERY.ORTHOPHOTOS', 0, 50, 0, 0, NULL, NULL, 0, NULL, 'NONE', 'Geoportal_WMTS_GetTile', NULL, 'Geoportal_WMS_GetMap', NULL);
INSERT INTO layer (name, label, service_layer_name, is_transparent, default_opacity, is_base_layer, is_untiled, max_zoom_level, min_zoom_level, has_legend, provider_id, activate_type, view_service_name, legend_service_name, detail_service_name, feature_service_name) VALUES ('scan25', 'Carte topographique', 'GEOGRAPHICALGRIDSYSTEMS.MAPS.SCAN25TOUR', 0, 50, 0, 0, 5, NULL, 0, NULL, 'NONE', 'Geoportal_WMTS_GetTile', NULL, 'Geoportal_WMS_GetMap', NULL);
INSERT INTO layer (name, label, service_layer_name, is_transparent, default_opacity, is_base_layer, is_untiled, max_zoom_level, min_zoom_level, has_legend, provider_id, activate_type, view_service_name, legend_service_name, detail_service_name, feature_service_name) VALUES ('result_trees', 'Arbres', 'result_trees', 1, 100, 0, 1, NULL, NULL, 0, NULL, 'REQUEST', 'Local_MapProxy_Mapserv_WMS_GetMap', 'Local_MapProxy_WMS_GetLegendGraphic', 'Local_MapProxy_Mapserv_WMS_GetMap', NULL);
INSERT INTO layer (name, label, service_layer_name, is_transparent, default_opacity, is_base_layer, is_untiled, max_zoom_level, min_zoom_level, has_legend, provider_id, activate_type, view_service_name, legend_service_name, detail_service_name, feature_service_name) VALUES ('all_trees', 'Arbres', 'all_trees', 1, 100, 0, 1, NULL, NULL, 1, NULL, 'NONE', 'Local_MapProxy_Mapserv_WMS_GetMap', 'Local_MapProxy_WMS_GetLegendGraphic', 'Local_MapProxy_Mapserv_WMS_GetMap', 'Local_MapProxy_WFS_GetFeature');
INSERT INTO layer (name, label, service_layer_name, is_transparent, default_opacity, is_base_layer, is_untiled, max_zoom_level, min_zoom_level, has_legend, provider_id, activate_type, view_service_name, legend_service_name, detail_service_name, feature_service_name) VALUES ('result_locations', 'Localisations', 'result_locations', 1, 100, 0, 1, NULL, NULL, 0, NULL, 'REQUEST', 'Local_MapProxy_Mapserv_WMS_GetMap', 'Local_MapProxy_WMS_GetLegendGraphic', 'Local_MapProxy_Mapserv_WMS_GetMap', NULL);
INSERT INTO layer (name, label, service_layer_name, is_transparent, default_opacity, is_base_layer, is_untiled, max_zoom_level, min_zoom_level, has_legend, provider_id, activate_type, view_service_name, legend_service_name, detail_service_name, feature_service_name) VALUES ('tree_detail_zoom_out', 'Détail', 'tree_detail_zoom_out', 1, 100, 0, 0, NULL, NULL, 0, NULL, 'NONE', NULL, NULL, 'Local_MapProxy_Mapserv_WMS_GetMap', NULL);
INSERT INTO layer (name, label, service_layer_name, is_transparent, default_opacity, is_base_layer, is_untiled, max_zoom_level, min_zoom_level, has_legend, provider_id, activate_type, view_service_name, legend_service_name, detail_service_name, feature_service_name) VALUES ('location_detail_zoom_out', 'Détail', 'location_detail_zoom_out', 1, 100, 0, 0, NULL, NULL, 0, NULL, 'NONE', NULL, NULL, 'Local_MapProxy_Mapserv_WMS_GetMap', NULL);
INSERT INTO layer (name, label, service_layer_name, is_transparent, default_opacity, is_base_layer, is_untiled, max_zoom_level, min_zoom_level, has_legend, provider_id, activate_type, view_service_name, legend_service_name, detail_service_name, feature_service_name) VALUES ('tree_detail_zoom_in', 'Détail', 'tree_detail_zoom_in', 1, 100, 0, 0, NULL, NULL, 0, NULL, 'NONE', NULL, NULL, 'Local_MapProxy_Mapserv_WMS_GetMap', NULL);
INSERT INTO layer (name, label, service_layer_name, is_transparent, default_opacity, is_base_layer, is_untiled, max_zoom_level, min_zoom_level, has_legend, provider_id, activate_type, view_service_name, legend_service_name, detail_service_name, feature_service_name) VALUES ('location_detail_zoom_in', 'Détail', 'location_detail_zoom_in', 1, 100, 0, 0, NULL, NULL, 0, NULL, 'NONE', NULL, NULL, 'Local_MapProxy_Mapserv_WMS_GetMap', NULL);

-- Define the layer tree nodes
INSERT INTO layer_tree_node (node_id, parent_node_id, label, definition, is_layer, is_checked, is_hidden, is_disabled, is_expanded, layer_name, "position", checked_group) VALUES (1, '-1', 'Résultats', 'Résultats', 0, 0, 0, 0, 1, NULL, 1, NULL);
INSERT INTO layer_tree_node (node_id, parent_node_id, label, definition, is_layer, is_checked, is_hidden, is_disabled, is_expanded, layer_name, "position", checked_group) VALUES (41, '40', NULL, NULL, 1, 0, 0, 0, 0, 'ortho_photos', 41, NULL);
INSERT INTO layer_tree_node (node_id, parent_node_id, label, definition, is_layer, is_checked, is_hidden, is_disabled, is_expanded, layer_name, "position", checked_group) VALUES (42, '40', NULL, NULL, 1, 1, 0, 0, 0, 'scan25', 42, NULL);
INSERT INTO layer_tree_node (node_id, parent_node_id, label, definition, is_layer, is_checked, is_hidden, is_disabled, is_expanded, layer_name, "position", checked_group) VALUES (40, '-1', 'Fonds', 'Fonds', 0, 0, 0, 0, 1, NULL, 40, NULL);
INSERT INTO layer_tree_node (node_id, parent_node_id, label, definition, is_layer, is_checked, is_hidden, is_disabled, is_expanded, layer_name, "position", checked_group) VALUES (30, '-1', 'Limites administratives', 'Limites administratives', 0, 0, 0, 0, 1, NULL, 30, NULL);
INSERT INTO layer_tree_node (node_id, parent_node_id, label, definition, is_layer, is_checked, is_hidden, is_disabled, is_expanded, layer_name, "position", checked_group) VALUES (31, '30', NULL, NULL, 1, 1, 0, 0, 0, 'countries', 31, NULL);
INSERT INTO layer_tree_node (node_id, parent_node_id, label, definition, is_layer, is_checked, is_hidden, is_disabled, is_expanded, layer_name, "position", checked_group) VALUES (33, '30', NULL, NULL, 1, 0, 0, 0, 0, 'communes', 33, NULL);
INSERT INTO layer_tree_node (node_id, parent_node_id, label, definition, is_layer, is_checked, is_hidden, is_disabled, is_expanded, layer_name, "position", checked_group) VALUES (32, '30', NULL, NULL, 1, 0, 0, 0, 0, 'departements', 32, NULL);
INSERT INTO layer_tree_node (node_id, parent_node_id, label, definition, is_layer, is_checked, is_hidden, is_disabled, is_expanded, layer_name, "position", checked_group) VALUES (2, '-1', 'Tous les tracés', 'Tous les tracés', 0, 0, 0, 0, 1, NULL, 2, NULL);
INSERT INTO layer_tree_node (node_id, parent_node_id, label, definition, is_layer, is_checked, is_hidden, is_disabled, is_expanded, layer_name, "position", checked_group) VALUES (11, '1', NULL, NULL, 1, 0, 0, 1, 0, 'result_trees', 11, NULL);
INSERT INTO layer_tree_node (node_id, parent_node_id, label, definition, is_layer, is_checked, is_hidden, is_disabled, is_expanded, layer_name, "position", checked_group) VALUES (12, '1', NULL, NULL, 1, 0, 0, 1, 0, 'result_locations', 12, NULL);
INSERT INTO layer_tree_node (node_id, parent_node_id, label, definition, is_layer, is_checked, is_hidden, is_disabled, is_expanded, layer_name, "position", checked_group) VALUES (21, '2', NULL, NULL, 1, 0, 0, 0, 0, 'all_trees', 21, NULL);
INSERT INTO layer_tree_node (node_id, parent_node_id, label, definition, is_layer, is_checked, is_hidden, is_disabled, is_expanded, layer_name, "position", checked_group) VALUES (22, '2', NULL, NULL, 1, 0, 0, 0, 0, 'all_locations', 22, NULL);

-- Configure the map parameters for all data providers
INSERT INTO provider_map_params (provider_id, bb_xmin, bb_ymin, bb_xmax, bb_ymax, zoom_level) VALUES ('1', 96670, 6022395, 96670, 6022395, 1); -- France Entière
INSERT INTO provider_map_params (provider_id, bb_xmin, bb_ymin, bb_xmax, bb_ymax, zoom_level) VALUES ('2', 260000, 6620000, 260000, 6620000, 6); -- Zoom par défaut sur Dunkerque