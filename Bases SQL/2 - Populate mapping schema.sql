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


DELETE FROM layer_tree;
DELETE FROM layer;
DELETE FROM layer_service;


-- Define the services
INSERT INTO layer_service(service_name, config, print_pdf_base_url, detail_base_url) VALUES ('local_mapserver', '{"urls":["http://localhost/cgi-bin/mapserv.exe?map=C:/workspace/OGAM/Mapserv/ogam.map"],"params":{"SERVICE":"WMS"}}', 'http://localhost/cgi-bin/mapserv.exe?map=C:/workspace/OGAM/Mapserv/ogam.map', 'http://localhost/cgi-bin/mapserv.exe?map=C:/workspace/OGAM/Mapserv/ogam.map');
INSERT INTO layer_service(service_name, config, print_pdf_base_url, detail_base_url) VALUES ('local_tilecache', '{"urls":["http://test-efdac.ifn.fr/cgi-bin/tilecache/tilecache.cgi?"],"params":{"SERVICE":"WMS"}}', '', '');

--INSERT INTO layer_service VALUES ('geoportal_wms', '{"urls":["http://wxs-i.ign.fr/7gr31kqe5xttprd2g7zbkqgo/geoportail/r/wms?"],"params":{"SERVICE":"WMS","VERSION":"1.3.0","REQUEST":"GetMap","CRS":"EPSG:2154"}}', 'http://wxs-i.ign.fr/7gr31kqe5xttprd2g7zbkqgo/geoportail/r/wms?');
--INSERT INTO layer_service VALUES ('geoportal_wmts', '{"urls": ["http://wxs-i.ign.fr/zclt8ghffbmi87pn5m67zftf/geoportail/wmts?"], "params": {"SERVICE":"WMTS","VERSION":"1.0.0","style":"normal","request":"GetTile","matrixSet":"PM","tileMatrix":5}}', 'http://wxs-i.ign.fr/7gr31kqe5xttprd2g7zbkqgo/geoportail/wmts?');
--INSERT INTO layer_service VALUES ('mapserver', '{"urls":["http://www.carhab.fr//mapProxy.php?","http://www-1.carhab.fr//mapProxy.php?","http://www-2.carhab.fr//mapProxy.php?","http://www-3.carhab.fr//mapProxy.php?","http://www-4.carhab.fr//mapProxy.php?","http://www-5.carhab.fr//mapProxy.php?","http://www-6.carhab.fr//mapProxy.php?","http://www-7.carhab.fr//mapProxy.php?","http://www-8.carhab.fr//mapProxy.php?","http://www-9.carhab.fr//mapProxy.php?"],"params":{"SERVICE":"WMS"}}', 'http://www.carhab.fr/cgi-bin/mapserv.peg-carhab?');



-- Define the layers
INSERT INTO layer (layer_name, layer_label, service_layer_name, isTransparent, isBaseLayer, isUntiled, service_name, maxscale, minscale, transitionEffect, imageFormat, has_legend, provider_id, has_sld, activate_type, isVector) VALUES ('nuts_0', 'Country Boundaries', 'nuts_0', 1, 0, 0, 'local_tilecache', 60000000, 50000, 'resize', 'PNG',  1, null, 0, 'NONE', 0);
INSERT INTO layer (layer_name, layer_label, service_layer_name, isTransparent, isBaseLayer, isUntiled, service_name, maxscale, minscale, transitionEffect, imageFormat, has_legend, provider_id, has_sld, activate_type, isVector) VALUES ('result_locations', 'Results', 'result_locations', 1, 0, 1, 'local_mapserver', null, null, null, 'PNG',  0, null, 0, 'REQUEST', 0);
INSERT INTO layer (layer_name, layer_label, service_layer_name, isTransparent, isBaseLayer, isUntiled, service_name, maxscale, minscale, transitionEffect, imageFormat, has_legend, provider_id, has_sld, activate_type, isVector) VALUES ('all_locations', 'Plot Locations', 'all_locations', 1, 0, 1, 'local_mapserver', null, null, null, 'PNG', 1, null, 0, 'NONE', 0);
INSERT INTO layer (layer_name, layer_label, service_layer_name, isTransparent, isBaseLayer, isUntiled, service_name, maxscale, minscale, transitionEffect, imageFormat, has_legend, provider_id, has_sld, activate_type, isVector) VALUES ('all_harmonized_locations', 'Plot Locations', 'all_harmonized_locations', 1, 0, 1, 'local_mapserver', null, null, null, 'PNG', 1, null, 0, 'NONE', 0);
--INSERT INTO layer (layer_name, layer_label, service_layer_name, isTransparent, isBaseLayer, isUntiled, service_name, maxscale, minscale, transitionEffect, imageFormat, has_legend, provider_id, has_sld, activate_type, isVector) VALUES ('all_locations_country', 'Plot Locations', 'all_locations_country', 1, 0, 1, 0, null, null, null, 'PNG', 1, null, 0, 'NONE', 0);
--INSERT INTO layer (layer_name, layer_label, service_layer_name, isTransparent, isBaseLayer, isUntiled, service_name, maxscale, minscale, transitionEffect, imageFormat, has_legend, provider_id, has_sld, activate_type, isVector) VALUES ('all_harmonized_locations_country', 'Plot Locations', 'all_harmonized_locations_country', 1, 0, 1, 0, null, null, null, 'PNG', 1, null,  0, 'NONE', 0);
/*
INSERT INTO layer (layer_name, layer_label, service_layer_name, isTransparent, isBaseLayer, isUntiled, service_name, maxscale, minscale, transitionEffect, imageFormat, has_legend, provider_id, has_sld, activate_type, isVector) VALUES ('limites', 'Limites administratives', NULL, 1, 0, 0, NULL, NULL, NULL, 0, NULL, NULL, NULL, 0, 'NONE', 0);
INSERT INTO layer (layer_name, layer_label, service_layer_name, isTransparent, isBaseLayer, isUntiled, service_name, maxscale, minscale, transitionEffect, imageFormat, has_legend, provider_id, has_sld, activate_type, isVector) VALUES ('fonds', 'Localisation', NULL, 1, 0, 0, NULL, NULL, NULL, 0, NULL, NULL, NULL, 0, 'NONE', 0);
INSERT INTO layer (layer_name, layer_label, service_layer_name, isTransparent, isBaseLayer, isUntiled, service_name, maxscale, minscale, transitionEffect, imageFormat, has_legend, provider_id, has_sld, activate_type, isVector) VALUES ('environnement', 'Zonages environnementaux', NULL, 1, 0, 0, NULL, NULL, NULL, 0, NULL, NULL, NULL, 0, 'NONE', 0);
INSERT INTO layer (layer_name, layer_label, service_layer_name, isTransparent, isBaseLayer, isUntiled, service_name, maxscale, minscale, transitionEffect, imageFormat, has_legend, provider_id, has_sld, activate_type, isVector) VALUES ('regions', 'Régions', 'regions', 1, 0, 0, 'mapserver', 10000000, 1000000, 1, NULL, 'png', NULL, 0, 'NONE', 1);
INSERT INTO layer (layer_name, layer_label, service_layer_name, isTransparent, isBaseLayer, isUntiled, service_name, maxscale, minscale, transitionEffect, imageFormat, has_legend, provider_id, has_sld, activate_type, isVector) VALUES ('apb', 'Arrêté de protection de biotope', 'apb', 1, 0, 0, 'mapserver', NULL, NULL, 1, NULL, 'png', NULL, 0, 'NONE', 1);
INSERT INTO layer (layer_name, layer_label, service_layer_name, isTransparent, isBaseLayer, isUntiled, service_name, maxscale, minscale, transitionEffect, imageFormat, has_legend, provider_id, has_sld, activate_type, isVector) VALUES ('communes', 'Communes', 'communes', 1, 0, 0, 'mapserver', 250000, 5000, 1, NULL, 'png', NULL, 0, 'NONE', 1);
INSERT INTO layer (layer_name, layer_label, service_layer_name, isTransparent, isBaseLayer, isUntiled, service_name, maxscale, minscale, transitionEffect, imageFormat, has_legend, provider_id, has_sld, activate_type, isVector) VALUES ('contexte_piscicole', 'Contexte piscicole', 'contexte_piscicole', 1, 0, 0, 'mapserver', NULL, NULL, 1, NULL, 'png', NULL, 0, 'NONE', 1);
INSERT INTO layer (layer_name, layer_label, service_layer_name, isTransparent, isBaseLayer, isUntiled, service_name, maxscale, minscale, transitionEffect, imageFormat, has_legend, provider_id, has_sld, activate_type, isVector) VALUES ('departements', 'Départements', 'departements', 1, 0, 0, 'mapserver', 2000000, 5000, 1, NULL, 'png', NULL, 0, 'NONE', 1);
INSERT INTO layer (layer_name, layer_label, service_layer_name, isTransparent, isBaseLayer, isUntiled, service_name, maxscale, minscale, transitionEffect, imageFormat, has_legend, provider_id, has_sld, activate_type, isVector) VALUES ('sic', 'Site d''importance communautaire', 'sic', 1, 0, 0, 'mapserver', NULL, NULL, 1, NULL, 'png', NULL, 0, 'NONE', 1);
INSERT INTO layer (layer_name, layer_label, service_layer_name, isTransparent, isBaseLayer, isUntiled, service_name, maxscale, minscale, transitionEffect, imageFormat, has_legend, provider_id, has_sld, activate_type, isVector) VALUES ('znieff2', 'ZNIEFF 2', 'znieff2', 1, 0, 0, 'mapserver', NULL, NULL, 1, NULL, 'png', NULL, 0, 'NONE', 1);
INSERT INTO layer (layer_name, layer_label, service_layer_name, isTransparent, isBaseLayer, isUntiled, service_name, maxscale, minscale, transitionEffect, imageFormat, has_legend, provider_id, has_sld, activate_type, isVector) VALUES ('zone_hydrographique', 'Zone hydrographique', 'zone_hydrographique', 1, 0, 0, 'mapserver', NULL, NULL, 1, NULL, 'png', NULL, 0, 'NONE', 1);
INSERT INTO layer (layer_name, layer_label, service_layer_name, isTransparent, isBaseLayer, isUntiled, service_name, maxscale, minscale, transitionEffect, imageFormat, has_legend, provider_id, has_sld, activate_type, isVector) VALUES ('phytoeco_niv4', 'Région phytoécologique de niveau 4', 'phytoeco_niv4', 1, 0, 0, 'mapserver', NULL, NULL, 1, NULL, 'png', '1', 0, 'NONE', 1);
INSERT INTO layer (layer_name, layer_label, service_layer_name, isTransparent, isBaseLayer, isUntiled, service_name, maxscale, minscale, transitionEffect, imageFormat, has_legend, provider_id, has_sld, activate_type, isVector) VALUES ('phytoeco_niv2', 'Région phytoécologique de niveau 2', 'phytoeco_niv2', 1, 0, 0, 'mapserver', NULL, NULL, 1, NULL, 'png', '1', 0, 'NONE', 1);
INSERT INTO layer (layer_name, layer_label, service_layer_name, isTransparent, isBaseLayer, isUntiled, service_name, maxscale, minscale, transitionEffect, imageFormat, has_legend, provider_id, has_sld, activate_type, isVector) VALUES ('hydrographie', 'Hydrographie', 'hydrographie', 1, 0, 0, 'geoportal_wms', 25000, NULL, 1, 'resize', 'png', NULL, 0, 'NONE', 0);
INSERT INTO layer (layer_name, layer_label, service_layer_name, isTransparent, isBaseLayer, isUntiled, service_name, maxscale, minscale, transitionEffect, imageFormat, has_legend, provider_id, has_sld, activate_type, isVector) VALUES ('phytoeco_niv3', 'Région phytoécologique de niveau 3', 'phytoeco_niv3', 1, 0, 0, 'mapserver', NULL, NULL, 1, NULL, 'png', '1', 0, 'NONE', 1);
INSERT INTO layer (layer_name, layer_label, service_layer_name, isTransparent, isBaseLayer, isUntiled, service_name, maxscale, minscale, transitionEffect, imageFormat, has_legend, provider_id, has_sld, activate_type, isVector) VALUES ('ser_ar_l93', 'Sylvo-écorégion alluvions', 'ser_ar_l93', 1, 0, 0, 'mapserver', NULL, NULL, 1, NULL, 'png', '1', 0, 'NONE', 1);
INSERT INTO layer (layer_name, layer_label, service_layer_name, isTransparent, isBaseLayer, isUntiled, service_name, maxscale, minscale, transitionEffect, imageFormat, has_legend, provider_id, has_sld, activate_type, isVector) VALUES ('ser_l93', 'Sylvo-écorégions', 'ser_l93', 1, 0, 0, 'mapserver', NULL, NULL, 1, NULL, 'png', '1', 0, 'NONE', 1);
INSERT INTO layer (layer_name, layer_label, service_layer_name, isTransparent, isBaseLayer, isUntiled, service_name, maxscale, minscale, transitionEffect, imageFormat, has_legend, provider_id, has_sld, activate_type, isVector) VALUES ('her1', 'Hydro-écorégion zonage 1', 'her1', 1, 0, 0, 'mapserver', NULL, NULL, 1, NULL, 'png', '1', 0, 'NONE', 1);
INSERT INTO layer (layer_name, layer_label, service_layer_name, isTransparent, isBaseLayer, isUntiled, service_name, maxscale, minscale, transitionEffect, imageFormat, has_legend, provider_id, has_sld, activate_type, isVector) VALUES ('her2', 'Hydro-écorégion zonage 2', 'her2', 1, 0, 0, 'mapserver', NULL, NULL, 1, NULL, 'png', '1', 0, 'NONE', 1);
INSERT INTO layer (layer_name, layer_label, service_layer_name, isTransparent, isBaseLayer, isUntiled, service_name, maxscale, minscale, transitionEffect, imageFormat, has_legend, provider_id, has_sld, activate_type, isVector) VALUES ('phytoeco_niv1', 'Région phytoécologique de niveau 1', 'phytoeco_niv1', 1, 0, 0, 'mapserver', NULL, NULL, 1, NULL, 'png', '1', 0, 'NONE', 1);
INSERT INTO layer (layer_name, layer_label, service_layer_name, isTransparent, isBaseLayer, isUntiled, service_name, maxscale, minscale, transitionEffect, imageFormat, has_legend, provider_id, has_sld, activate_type, isVector) VALUES ('znieff1', 'ZNIEFF 1', 'znieff1', 1, 0, 0, 'mapserver', NULL, NULL, 0, NULL, 'png', NULL, 0, 'NONE', 1);
INSERT INTO layer (layer_name, layer_label, service_layer_name, isTransparent, isBaseLayer, isUntiled, service_name, maxscale, minscale, transitionEffect, imageFormat, has_legend, provider_id, has_sld, activate_type, isVector) VALUES ('all_locations', 'Emplacements existants', 'all_locations', 1, 0, 1, 'mapserver', NULL, NULL, 1, NULL, 'png', '1', 0, 'NONE', 0);
INSERT INTO layer (layer_name, layer_label, service_layer_name, isTransparent, isBaseLayer, isUntiled, service_name, maxscale, minscale, transitionEffect, imageFormat, has_legend, provider_id, has_sld, activate_type, isVector) VALUES ('result_locations', 'Resultats', 'result_locations', 1, 0, 1, 'mapserver', NULL, NULL, 1, NULL, 'png', NULL, 0, 'REQUEST', 0);
INSERT INTO layer (layer_name, layer_label, service_layer_name, isTransparent, isBaseLayer, isUntiled, service_name, maxscale, minscale, transitionEffect, imageFormat, has_legend, provider_id, has_sld, activate_type, isVector) VALUES ('zps', 'Zone de protection spéciale', 'zps', 1, 0, 0, 'mapserver', NULL, NULL, 1, NULL, 'png', NULL, 0, 'NONE', 1);
INSERT INTO layer (layer_name, layer_label, service_layer_name, isTransparent, isBaseLayer, isUntiled, service_name, maxscale, minscale, transitionEffect, imageFormat, has_legend, provider_id, has_sld, activate_type, isVector) VALUES ('ortho', 'BD Ortho', 'ORTHOIMAGERY.ORTHOPHOTOS', 1, 0, 0, 'geoportal_wms', 9000, NULL, 0, 'resize', 'png', NULL, 0, 'NONE', 0);
INSERT INTO layer (layer_name, layer_label, service_layer_name, isTransparent, isBaseLayer, isUntiled, service_name, maxscale, minscale, transitionEffect, imageFormat, has_legend, provider_id, has_sld, activate_type, isVector) VALUES ('scans', 'Référentiel IGN', 'GEOGRAPHICALGRIDSYSTEMS.MAPS', 1, 0, 0, 'geoportal_wms', 9000000, 17000, 0, 'resize', 'png', NULL, 0, 'NONE', 0);

*/

--
-- Define the layers legend
--
INSERT INTO layer_tree(item_id, parent_id, is_layer, is_checked, is_hidden, is_disabled, is_expended, name, checked_group, position) VALUES (1, -1, 1, 1, 0, 1, 0, 'result_locations', null, 1);
INSERT INTO layer_tree(item_id, parent_id, is_layer, is_checked, is_hidden, is_disabled, is_expended, name, checked_group, position) VALUES (2, -1, 1, 0, 1, 0, 0, 'all_locations', null, 2);
--INSERT INTO layer_tree(item_id, parent_id, is_layer, is_checked, is_hidden, is_disabled, is_expended, name, checked_group, position) VALUES (3, -1, 1, 0, 1, 0, 0, 'all_locations_country', null, 3);
INSERT INTO layer_tree(item_id, parent_id, is_layer, is_checked, is_hidden, is_disabled, is_expended, name, checked_group, position) VALUES (4, -1, 1, 0, 1, 0, 0, 'all_harmonized_locations', null, 4);
--INSERT INTO layer_tree(item_id, parent_id, is_layer, is_checked, is_hidden, is_disabled, is_expended, name, checked_group, position) VALUES (5, -1, 1, 0, 1, 0, 0, 'all_harmonized_locations_country', null, 5);


INSERT INTO layer_tree(item_id, parent_id, is_layer, is_checked, is_hidden, is_disabled, is_expended, name, checked_group, position) VALUES (20, -1, 1, 1, 0, 0, 0, 'nuts_0', null, 20);


/*

INSERT INTO layer_tree VALUES (1, '-1', 1, 0, 0, 1, 0, 'result_locations', 1, NULL);
INSERT INTO layer_tree VALUES (4, '3', 1, 0, 0, 0, 0, 'apb', 1, NULL);
INSERT INTO layer_tree VALUES (5, '3', 1, 0, 0, 0, 0, 'contexte_piscicole', 2, NULL);
INSERT INTO layer_tree VALUES (6, '3', 1, 0, 0, 0, 0, 'sic', 3, NULL);
INSERT INTO layer_tree VALUES (7, '3', 1, 0, 0, 0, 0, 'znieff1', 4, NULL);
INSERT INTO layer_tree VALUES (8, '3', 1, 0, 0, 0, 0, 'znieff2', 5, NULL);
INSERT INTO layer_tree VALUES (9, '3', 1, 0, 0, 0, 0, 'zone_hydrographique', 6, NULL);
INSERT INTO layer_tree VALUES (10, '3', 1, 0, 0, 0, 0, 'zps', 7, NULL);
INSERT INTO layer_tree VALUES (12, '11', 1, 0, 0, 0, 0, 'regions', 1, NULL);
INSERT INTO layer_tree VALUES (13, '11', 1, 0, 0, 0, 0, 'departements', 2, NULL);
INSERT INTO layer_tree VALUES (14, '11', 1, 0, 0, 0, 0, 'communes', 3, NULL);
INSERT INTO layer_tree VALUES (16, '15', 1, 0, 0, 0, 0, 'hydrographie', 1, NULL);
INSERT INTO layer_tree VALUES (18, '15', 1, 0, 0, 0, 0, 'ortho', 3, NULL);
INSERT INTO layer_tree VALUES (19, '3', 1, 0, 0, 0, 0, 'her1', 8, NULL);
INSERT INTO layer_tree VALUES (20, '3', 1, 0, 0, 0, 0, 'her2', 9, NULL);
INSERT INTO layer_tree VALUES (21, '3', 1, 0, 0, 0, 0, 'ser_l93', 10, NULL);
INSERT INTO layer_tree VALUES (22, '3', 1, 0, 0, 0, 0, 'ser_ar_l93', 11, NULL);
INSERT INTO layer_tree VALUES (23, '3', 1, 0, 0, 0, 0, 'phytoeco_niv1', 12, NULL);
INSERT INTO layer_tree VALUES (24, '3', 1, 0, 0, 0, 0, 'phytoeco_niv2', 13, NULL);
INSERT INTO layer_tree VALUES (25, '3', 1, 0, 0, 0, 0, 'phytoeco_niv3', 14, NULL);
INSERT INTO layer_tree VALUES (26, '3', 1, 0, 0, 0, 0, 'phytoeco_niv4', 15, NULL);
INSERT INTO layer_tree VALUES (2, '-1', 1, 0, 0, 0, 0, 'all_locations', 2, NULL);
INSERT INTO layer_tree VALUES (3, '-1', 0, 0, 0, 0, 1, 'environnement', 3, NULL);
INSERT INTO layer_tree VALUES (11, '-1', 0, 0, 0, 0, 1, 'limites', 3, NULL);
INSERT INTO layer_tree VALUES (15, '-1', 0, 0, 0, 0, 1, 'fonds', 4, NULL);
INSERT INTO layer_tree VALUES (17, '15', 1, 0, 0, 0, 0, 'scans', 2, NULL);


 */


--
-- Forbid some layers for some profiles
--


--
-- Configure the bounding box for all data providers
INSERT INTO bounding_box (provider_id, zoom_level, bb_xmin, bb_ymin, bb_xmax, bb_ymax) values ('1', 1, '3200000', '2060000', '4220000', '3160000');
