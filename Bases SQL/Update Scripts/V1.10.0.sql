--
-- Update the storage of the layers definition
--

SET SEARCH_PATH = mapping, public;


--
-- Delete old tables
-- WARNING : Make sure you're saved the config
--
DROP TABLE mapping.layer_definition;
DROP TABLE mapping.legend;

--
-- Create new tables
--


/*==============================================================*/
/* Table: layer_service                                      */
/*==============================================================*/
CREATE TABLE layer_service
(
 service_name 			VARCHAR(50)    NOT NULL,
 config 				VARCHAR(1000),     -- Si version postgresql >= 9.2, utiliser un type json
 PRIMARY KEY  (service_name)
)WITHOUT OIDS;

COMMENT ON TABLE layer_service IS 'Liste des fournisseurs de services (Mapservers, Géoportail, ...)';
COMMENT ON COLUMN layer_service.service_name IS 'Logical name of the service';
COMMENT ON COLUMN layer_service.config IS 'OpenLayers config for the service';

/*==============================================================*/
/* Table: layer                                      */
/*==============================================================*/
CREATE TABLE layer
(
  layer_name 			VARCHAR(50)    NOT NULL,   -- Logical name of the layer
  layer_label 			VARCHAR(100),  -- Label of the layer
  service_layer_name 	VARCHAR(500),  -- Name of the corresponding layer(s)
  isTransparent 		INT,           -- Indicate if the layer is transparent
  default_opacity       INT,           -- Default value of the layer opacity : 0 to 100
  isBaseLayer	 		INT,		   -- Indicate if the layer is a base layer (or an overlay)
  isUntiled			 	INT,           -- Force OpenLayer to request one image each time
  maxscale				INT,           -- Max scale of apparation
  minscale				INT,           -- Min scale of apparition
  has_legend    		INT, 	   	   -- If value = 1 is the layer has a legend that should be displayed
  transitionEffect		VARCHAR(50),   -- Transition effect (resize or null)
  imageFormat			VARCHAR(10),   -- Image format (PNG or JPEG)
  provider_id 		    VARCHAR(36),   -- If empty, the layer can be seen by any country, if not it is limited to one country
  has_sld               INT,           -- If value = 1 we add a SLD information
  activate_type         VARCHAR(36),   -- Group of event that will activate this layer (NONE, REQUEST)
  view_service_name	    VARCHAR(50),   -- Indicates the service for the map visualisation
  legend_service_name	VARCHAR(50),   -- Indicates the service for the legend
  print_service_name	VARCHAR(50),   -- Indicates the service for the print function
  detail_service_name	VARCHAR(50),   -- Indicates the service for the detail panel display 
  feature_service_name		VARCHAR(50),   -- Indicates the service for the wfs
  PRIMARY KEY  (layer_name)
) WITHOUT OIDS;

COMMENT ON TABLE layer IS 'Liste des layers';
COMMENT ON COLUMN layer.layer_name IS 'Logical name of the layer';
COMMENT ON COLUMN layer.layer_label IS 'Label of the layer';
COMMENT ON COLUMN layer.service_layer_name IS 'Name of the corresponding layer(s) in the service';
COMMENT ON COLUMN layer.default_opacity IS 'Default value of the layer opacity : 0 to 100';
COMMENT ON COLUMN layer.isTransparent IS 'Indicate if the layer is transparent';
COMMENT ON COLUMN layer.isBaseLayer IS 'Indicate if the layer is a base layer (or an overlay)';
COMMENT ON COLUMN layer.isUntiled IS 'Force OpenLayer to request one image each time';
COMMENT ON COLUMN layer.maxscale IS 'Max scale of apparation';
COMMENT ON COLUMN layer.minscale IS 'Min scale of apparition';
COMMENT ON COLUMN layer.has_legend IS 'If value = 1 is the layer has a legend that should be displayed';
COMMENT ON COLUMN layer.transitionEffect IS 'Transition effect (resize or null)';
COMMENT ON COLUMN layer.imageFormat IS 'Image format (PNG or JPEG)';
COMMENT ON COLUMN layer.provider_id IS 'If empty, the layer can be seen by any provider if not it is limited to one provider';
COMMENT ON COLUMN layer.has_sld IS 'If value = 1 we add a SLD information';
COMMENT ON COLUMN layer.activate_type IS 'Group of event that will activate this layer (NONE, REQUEST, AGGREGATION or INTERPOLATION)';
COMMENT ON COLUMN layer.view_service_name IS 'Indicates the service for the map visualisation';
COMMENT ON COLUMN layer.legend_service_name IS 'Indicates the service for the legend';
COMMENT ON COLUMN layer.print_service_name IS 'Indicates the service for the print function';
COMMENT ON COLUMN layer.detail_service_name IS 'Indicates the service for the detail panel display';
COMMENT ON COLUMN layer.feature_service_name IS 'Indicates the service for the wfs';

/*==============================================================*/
/*  Table: Layer_tree                                               */
/*==============================================================*/
CREATE TABLE layer_tree
(
	item_id INT,						-- identify the item
	parent_id  VARCHAR(50)    NOT NULL, -- identify the parent of the item (-1 = root)
	is_layer INT, 						-- if value = 1 then this is a layer, else it is only a node
	is_checked INT, 					-- if value = 1 then the item is checked by default
	is_hidden INT, 						-- if value = 1 then the item is hidden by default
	is_disabled INT, 					-- if value = 1 then the item is displayed but grayed
	is_expended INT, 					-- if value = 1 then the node is expended by default
	name VARCHAR(50)    NOT NULL, 		-- logical name of the layer or label of the node
	position INT, 						-- position of the layer in its group 
	checked_group 		VARCHAR(36),    -- Allow to regroup layers. If two layers are in the same group, they will appear with a radio button in the layer tree
  	PRIMARY KEY  (item_id)
) WITHOUT OIDS;

COMMENT ON COLUMN layer_tree.item_id IS 'Identify the layer_tree item';
COMMENT ON COLUMN layer_tree.parent_id IS 'Identify the parent of the item (-1 = root)';
COMMENT ON COLUMN layer_tree.is_layer IS 'If value = 1 then this is a layer, else it is only a node';
COMMENT ON COLUMN layer_tree.is_checked IS 'If value = 1 then the item is checked by default';
COMMENT ON COLUMN layer_tree.is_hidden IS 'If value = 1 then the item is hidden by default';
COMMENT ON COLUMN layer_tree.is_disabled IS 'If value = 1 then the item is displayed but grayed';
COMMENT ON COLUMN layer_tree.is_expended IS 'If value = 1 then the node is expended by default';
COMMENT ON COLUMN layer_tree.name IS 'Logical name of the layer or label of the node';
COMMENT ON COLUMN layer_tree.position IS 'Position of the layer in its group';
COMMENT ON COLUMN layer_tree.checked_group IS 'Group of layers';







--
-- Configure the layers
--


DELETE FROM layer_tree;
DELETE FROM layer;
DELETE FROM layer_service;


-- Define the services
-- Liste des fournisseurs de services (Mapservers, Géoportail, ...)
INSERT INTO layer_service(service_name, config) VALUES ('local_mapserver', '{"urls":["http://localhost/cgi-bin/mapserv.exe?map=D:/workspace/DonneesBrutesIFN/Mapserv/edb_l93.map&"],"params":{"SERVICE":"WMS"}}');
INSERT INTO layer_service(service_name, config) VALUES ('local_tilecache', '{"urls":["http://test-mapserv.ifn.fr/cgi-bin/tilecache_l93?"],"params":{"SERVICE":"WMS","VERSION":"1.0.0","REQUEST":"GetMap"}}');
INSERT INTO layer_service(service_name, config) VALUES ('local_mapProxy', '{"urls":["http://localhost/ogam/mapProxy.php?"],"params":{"SERVICE":"WMS","VERSION":"1.1.1","REQUEST":"GetMap"}}');


-- Define the layers
-- Liste des couches carto disponibles
INSERT INTO layer (layer_name, layer_label, service_layer_name, isTransparent, isBaseLayer, isUntiled, maxscale, minscale, transitionEffect, imageFormat, has_legend, provider_id, has_sld, activate_type, view_service_name, legend_service_name, print_service_name, detail_service_name, feature_service_name) VALUES ('result_locations', 'Résultats', 'result_locations', 1, 0, 1, null, null, null, 'PNG',  0, null, 0, 'REQUEST', 'local_mapserver', 'local_mapserver','local_mapserver','local_mapserver', 'local_mapserver');
INSERT INTO layer (layer_name, layer_label, service_layer_name, isTransparent, isBaseLayer, isUntiled, maxscale, minscale, transitionEffect, imageFormat, has_legend, provider_id, has_sld, activate_type, view_service_name, legend_service_name, print_service_name, detail_service_name, feature_service_name) VALUES ('all_locations', 'Localisation des points', 'all_locations', 1, 0, 1, null, null, null, 'PNG', 1, null, 0, 'NONE', 'local_mapserver', 'local_mapserver','local_mapserver','local_mapserver', 'local_mapserver');

INSERT INTO layer (layer_name, layer_label, service_layer_name, isTransparent, isBaseLayer, isUntiled, maxscale, minscale, transitionEffect, imageFormat, has_legend, provider_id, has_sld, activate_type, view_service_name, legend_service_name, print_service_name, detail_service_name, feature_service_name) VALUES ('franceraster', 'France raster', 'francerasterV4', 1, 0, 0, null, null, 'resize', 'PNG',  1, null, 0, 'NONE', 'local_tilecache', 'local_mapserver','local_mapserver','local_mapserver', 'local_mapserver');
INSERT INTO layer (layer_name, layer_label, service_layer_name, isTransparent, isBaseLayer, isUntiled, maxscale, minscale, transitionEffect, imageFormat, has_legend, provider_id, has_sld, activate_type, view_service_name, legend_service_name, print_service_name, detail_service_name, feature_service_name) VALUES ('departement', 'Départements', 'departement', 1, 0, 0, null, null, 'resize', 'PNG',  1, null, 0, 'NONE', 'local_tilecache', 'local_mapserver','local_mapserver','local_mapserver', 'local_mapserver');
INSERT INTO layer (layer_name, layer_label, service_layer_name, isTransparent, isBaseLayer, isUntiled, maxscale, minscale, transitionEffect, imageFormat, has_legend, provider_id, has_sld, activate_type, view_service_name, legend_service_name, print_service_name, detail_service_name, feature_service_name) VALUES ('region', 'Régions', 'region', 1, 0, 0, null, null, 'resize', 'PNG',  1, null, 0, 'NONE', 'local_tilecache', 'local_mapserver','local_mapserver','local_mapserver', 'local_mapserver');
INSERT INTO layer (layer_name, layer_label, service_layer_name, isTransparent, isBaseLayer, isUntiled, maxscale, minscale, transitionEffect, imageFormat, has_legend, provider_id, has_sld, activate_type, view_service_name, legend_service_name, print_service_name, detail_service_name, feature_service_name) VALUES ('vfranceforet', 'Forêt / non forêt ', 'vfranceforet', 1, 0, 0, null, null, 'resize', 'PNG',  1, null, 0, 'NONE', 'local_tilecache', 'local_mapserver','local_mapserver','local_mapserver', 'local_mapserver');
INSERT INTO layer (layer_name, layer_label, service_layer_name, isTransparent, isBaseLayer, isUntiled, maxscale, minscale, transitionEffect, imageFormat, has_legend, provider_id, has_sld, activate_type, view_service_name, legend_service_name, print_service_name, detail_service_name, feature_service_name) VALUES ('ser', 'Sylvoécorégion (SER) ', 'ser', 1, 0, 0, null, null, 'resize', 'PNG',  1, null, 0, 'NONE', 'local_tilecache', 'local_mapserver','local_mapserver','local_mapserver', 'local_mapserver');
INSERT INTO layer (layer_name, layer_label, service_layer_name, isTransparent, isBaseLayer, isUntiled, maxscale, minscale, transitionEffect, imageFormat, has_legend, provider_id, has_sld, activate_type, view_service_name, legend_service_name, print_service_name, detail_service_name, feature_service_name) VALUES ('greco', 'Grande région écologique (GRECO) ', 'greco', 1, 0, 0, null, null, 'resize', 'PNG',  1, null, 0, 'NONE', 'local_tilecache', 'local_mapserver','local_mapserver','local_mapserver', 'local_mapserver');

-- Les groupes
INSERT INTO layer (layer_name, layer_label, service_layer_name, isTransparent, isBaseLayer, isUntiled, maxscale, minscale, transitionEffect, imageFormat, has_legend, provider_id, has_sld, activate_type, view_service_name, legend_service_name, print_service_name, detail_service_name, feature_service_name) VALUES ('Limites administratives', 'Limites administratives', null, null, null, null, null, null, null, null, null, null, null, null, 'local_mapserver', 'local_mapserver','local_mapserver','local_mapserver', 'local_mapserver');
INSERT INTO layer (layer_name, layer_label, service_layer_name, isTransparent, isBaseLayer, isUntiled, maxscale, minscale, transitionEffect, imageFormat, has_legend, provider_id, has_sld, activate_type, view_service_name, legend_service_name, print_service_name, detail_service_name, feature_service_name) VALUES ('Limites forestières', 'Limites forestières', null, null, null, null, null, null, null, null, null, null, null, null, 'local_mapserver', 'local_mapserver','local_mapserver','local_mapserver', 'local_mapserver');
INSERT INTO layer (layer_name, layer_label, service_layer_name, isTransparent, isBaseLayer, isUntiled, maxscale, minscale, transitionEffect, imageFormat, has_legend, provider_id, has_sld, activate_type, view_service_name, legend_service_name, print_service_name, detail_service_name, feature_service_name) VALUES ('Fond', 'Fond de carte', null, null, null, null, null, null, null, null, null, null, null, null, 'local_mapserver', 'local_mapserver','local_mapserver','local_mapserver', 'local_mapserver');


-- Define the layers legend
-- Définition de l'arbre des couches, avec leur hiérarchie
INSERT INTO layer_tree(item_id, parent_id, is_layer, is_checked, is_hidden, is_disabled, is_expended, name, checked_group, position) VALUES (1, -1, 1, 0, 0, 1, 0, 'result_locations', null, 1);
INSERT INTO layer_tree(item_id, parent_id, is_layer, is_checked, is_hidden, is_disabled, is_expended, name, checked_group, position) VALUES (2, -1, 1, 0, 1, 0, 0, 'all_locations', null, 2);
--INSERT INTO layer_tree(item_id, parent_id, is_layer, is_checked, is_hidden, is_disabled, is_expended, name, checked_group, position) VALUES (4, -1, 1, 0, 1, 0, 0, 'all_harmonized_locations', null, 4);

INSERT INTO layer_tree(item_id, parent_id, is_layer, is_checked, is_hidden, is_disabled, is_expended, name, checked_group, position) VALUES (5, -1, 0, 0, 0, 0, 1, 'Limites administratives', null, 5);
INSERT INTO layer_tree(item_id, parent_id, is_layer, is_checked, is_hidden, is_disabled, is_expended, name, checked_group, position) VALUES (6, 5, 1, 0, 0, 0, 1, 'region', null, 6);
INSERT INTO layer_tree(item_id, parent_id, is_layer, is_checked, is_hidden, is_disabled, is_expended, name, checked_group, position) VALUES (7, 5, 1, 1, 0, 0, 1, 'departement', null, 7);

INSERT INTO layer_tree(item_id, parent_id, is_layer, is_checked, is_hidden, is_disabled, is_expended, name, checked_group, position) VALUES (8, -1, 0, 0, 0, 0, 1, 'Limites forestières', null, 8);
INSERT INTO layer_tree(item_id, parent_id, is_layer, is_checked, is_hidden, is_disabled, is_expended, name, checked_group, position) VALUES (9, 8, 1, 0, 0, 0, 1, 'greco', null, 9);
INSERT INTO layer_tree(item_id, parent_id, is_layer, is_checked, is_hidden, is_disabled, is_expended, name, checked_group, position) VALUES (10, 8, 1, 0, 0, 0, 1, 'ser', null, 10);
INSERT INTO layer_tree(item_id, parent_id, is_layer, is_checked, is_hidden, is_disabled, is_expended, name, checked_group, position) VALUES (11, 8, 1, 0, 0, 0, 1, 'vfranceforet', null, 11);

INSERT INTO layer_tree(item_id, parent_id, is_layer, is_checked, is_hidden, is_disabled, is_expended, name, checked_group, position) VALUES (20, -1, 0, 1, 0, 0, 1, 'Fond', null, 20);
INSERT INTO layer_tree(item_id, parent_id, is_layer, is_checked, is_hidden, is_disabled, is_expended, name, checked_group, position) VALUES (21, 20, 1, 1, 0, 0, 1, 'franceraster', null, 21);



--
-- Update the rights
--

GRANT ALL ON SCHEMA mapping TO ogam;
GRANT ALL ON ALL TABLES IN SCHEMA mapping TO ogam;
GRANT ALL ON ALL SEQUENCES IN SCHEMA mapping TO ogam;