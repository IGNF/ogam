SET client_encoding TO 'UTF8';
SET client_min_messages TO WARNING;

CREATE SCHEMA mapping;
SET SEARCH_PATH = mapping, public;

/*==============================================================*/
/* Table : result_location                                      */
/*==============================================================*/

-- Before postgresql 9.1, use : create table RESULT_LOCATION (
create UNLOGGED table RESULT_LOCATION (
SESSION_ID           VARCHAR(50)          not null,
FORMAT 			 VARCHAR(36)		  not null,
PK 			 VARCHAR(100)		  not null,
_CREATIONDT          DATE                 null DEFAULT current_timestamp,
constraint PK_RESULT_LOCATION primary key (SESSION_ID, PK)
) 
WITH OIDS; -- Important : Needed by mapserv

-- Ajout de la colonne point PostGIS
SELECT AddGeometryColumn('mapping','result_location','the_geom',3857,'GEOMETRY',2);

-- Spatial Index on the_geom 
CREATE INDEX IX_RESULT_LOCATION_SPATIAL_INDEX ON mapping.RESULT_LOCATION USING GIST
            ( the_geom  );
            
CREATE INDEX RESULT_LOCATION_SESSION_IDX ON mapping.RESULT_LOCATION USING btree (SESSION_ID);

COMMENT ON COLUMN RESULT_LOCATION.SESSION_ID IS 'Identifier of the user session';
COMMENT ON COLUMN RESULT_LOCATION.FORMAT IS 'The identifier of the table containing the geometry';
COMMENT ON COLUMN RESULT_LOCATION.PK IS 'The primary key of the line containing the geometry';
COMMENT ON COLUMN RESULT_LOCATION._CREATIONDT IS 'Creation date (used to know when to purge the base)';

/*=========================================================================*/
/* Table: zoom_level                                                      */
/* List the available map zoom levels                                      */
/* Warning : The map zoom levels should match the tilecache configuration  */
/*=========================================================================*/
CREATE TABLE zoom_level
(
  zoom_level           INT    NOT NULL,            -- The level of zoom
  resolution           DOUBLE PRECISION NOT NULL,  -- The resolution value
  approx_scale_denom   INT    NOT NULL,            -- The approximate scale denominator value corresponding to the resolution
  scale_label          VARCHAR(10),                -- Label used for the zoom level
  is_map_zoom_level    BOOLEAN,                    -- Indicates if that zoom level must be used for the map
  PRIMARY KEY  (zoom_level)
) WITHOUT OIDS;

COMMENT ON COLUMN zoom_level.zoom_level IS 'The level of zoom';
COMMENT ON COLUMN zoom_level.resolution IS 'The resolution value';
COMMENT ON COLUMN zoom_level.approx_scale_denom IS 'The approximate scale denominator value corresponding to the resolution';
COMMENT ON COLUMN zoom_level.scale_label IS 'Label used for the zoom level';
COMMENT ON COLUMN zoom_level.is_map_zoom_level IS 'Indicates if that zoom level must be used for the map';

/*==============================================================*/
/* Table: layer_service                                         */
/*==============================================================*/
CREATE TABLE layer_service
(
 name 			        VARCHAR(50)    NOT NULL,
 config 				VARCHAR(1000),     -- Si version postgresql >= 9.2, utiliser un type json
 PRIMARY KEY  (name)
)WITHOUT OIDS;

COMMENT ON TABLE layer_service IS 'Liste des fournisseurs de services (Mapservers, Géoportail, ...)';
COMMENT ON COLUMN layer_service.name IS 'Logical name of the service';
COMMENT ON COLUMN layer_service.config IS 'OpenLayers config for the service';

/*==============================================================*/
/* Table: layer                                                 */
/*==============================================================*/
CREATE TABLE layer
(
  name 			        VARCHAR(50)    NOT NULL,   -- Logical name of the layer
  label 			    VARCHAR(100),  -- Label of the layer
  service_layer_name 	VARCHAR(500),  -- Name of the corresponding layer(s)
  is_transparent 		INT,           -- Indicate if the layer is transparent
  is_base_layer	 		INT,		   -- Indicate if the layer is a base layer (or an overlay)
  is_untiled			INT,           -- Force OpenLayer to request one image each time
  has_legend    		INT, 	   	   -- If value = 1 is the layer has a legend that should be displayed
  default_opacity       INT,           -- Default value of the layer opacity : 0 to 100
  max_zoom_level        INT,           -- Max zoom level of apparation
  min_zoom_level        INT,           -- Min zoom level of apparition
  provider_id 		    VARCHAR(36),   -- If empty, the layer can be seen by any country, if not it is limited to one country
  activate_type         VARCHAR(36),   -- Group of event that will activate this layer (NONE, REQUEST)
  view_service_name	    VARCHAR(50),   -- Indicates the service for the map visualisation
  legend_service_name	VARCHAR(50),   -- Indicates the service for the legend
  detail_service_name	VARCHAR(50),   -- Indicates the service for the detail panel display 
  feature_service_name	VARCHAR(50),   -- Indicates the service for the wfs
  PRIMARY KEY  (name),
  FOREIGN KEY (max_zoom_level)
      REFERENCES mapping.zoom_level (zoom_level) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE NO ACTION,
  FOREIGN KEY (min_zoom_level)
      REFERENCES mapping.zoom_level (zoom_level) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE NO ACTION,
  FOREIGN KEY (view_service_name)
      REFERENCES mapping.layer_service (name) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE NO ACTION,
  FOREIGN KEY (legend_service_name)
      REFERENCES mapping.layer_service (name) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE NO ACTION,
  FOREIGN KEY (detail_service_name)
      REFERENCES mapping.layer_service (name) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE NO ACTION,
  FOREIGN KEY (feature_service_name)
      REFERENCES mapping.layer_service (name) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE NO ACTION
) WITHOUT OIDS;

COMMENT ON TABLE layer IS 'Liste des layers';
COMMENT ON COLUMN layer.name IS 'Logical name of the layer';
COMMENT ON COLUMN layer.label IS 'Label of the layer';
COMMENT ON COLUMN layer.service_layer_name IS 'Name of the corresponding layer(s) in the service';
COMMENT ON COLUMN layer.default_opacity IS 'Default value of the layer opacity : 0 to 100';
COMMENT ON COLUMN layer.is_transparent IS 'Indicate if the layer is transparent';
COMMENT ON COLUMN layer.is_base_layer IS 'Indicate if the layer is a base layer (or an overlay)';
COMMENT ON COLUMN layer.is_untiled IS 'Force OpenLayer to request one image each time';
COMMENT ON COLUMN layer.max_zoom_level IS 'Max zoom level of apparation';
COMMENT ON COLUMN layer.min_zoom_level IS 'Min zoom level of apparition';
COMMENT ON COLUMN layer.has_legend IS 'If value = 1 is the layer has a legend that should be displayed';
COMMENT ON COLUMN layer.provider_id IS 'If empty, the layer can be seen by any provider if not it is limited to one provider';
COMMENT ON COLUMN layer.activate_type IS 'Group of event that will activate this layer (NONE, REQUEST, AGGREGATION or INTERPOLATION)';
COMMENT ON COLUMN layer.view_service_name IS 'Indicates the service for the map visualisation';
COMMENT ON COLUMN layer.legend_service_name IS 'Indicates the service for the legend';
COMMENT ON COLUMN layer.detail_service_name IS 'Indicates the service for the detail panel display';
COMMENT ON COLUMN layer.feature_service_name IS 'Indicates the service for the wfs';

/*==============================================================*/
/*  Table: layer_tree_node                                      */
/*==============================================================*/
CREATE TABLE layer_tree_node
(
	node_id INT,						     -- identify the node
	parent_node_id  VARCHAR(50)    NOT NULL, -- identify the parent of the node (-1 = root)
	label VARCHAR(30),                       -- label of the node into the tree
	definition VARCHAR(100),                 -- definition of the node into the tree
	is_layer INT, 						     -- if value = 1 then this is a layer, else it is only a node
	is_checked INT, 					     -- if value = 1 then the node is checked by default
	is_hidden INT, 						     -- if value = 1 then the node is hidden by default
	is_disabled INT, 					     -- if value = 1 then the node is displayed but grayed
	is_expanded INT, 					     -- if value = 1 then the node is expanded by default
	layer_name VARCHAR(50), 	             -- logical name of the layer or label of the node
	position INT, 						     -- position of the layer in its group 
	checked_group 		VARCHAR(36),         -- Allow to regroup layers. If two layers are in the same group, they will appear with a radio button in the layer tree
  	PRIMARY KEY  (node_id),
    FOREIGN KEY (layer_name)
      REFERENCES mapping.layer (name) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE NO ACTION
) WITHOUT OIDS;

COMMENT ON COLUMN layer_tree_node.node_id IS 'Identify the layer_tree node';
COMMENT ON COLUMN layer_tree_node.parent_node_id IS 'Identify the parent of the node (-1 = root)';
COMMENT ON COLUMN layer_tree_node.label IS 'label of the node into the tree';
COMMENT ON COLUMN layer_tree_node.definition IS 'definition of the node into the tree';
COMMENT ON COLUMN layer_tree_node.is_layer IS 'If value = 1 then this is a layer, else it is only a node';
COMMENT ON COLUMN layer_tree_node.is_checked IS 'If value = 1 then the node is checked by default';
COMMENT ON COLUMN layer_tree_node.is_hidden IS 'If value = 1 then the node is hidden by default';
COMMENT ON COLUMN layer_tree_node.is_disabled IS 'If value = 1 then the node is displayed but grayed';
COMMENT ON COLUMN layer_tree_node.is_expanded IS 'If value = 1 then the node is expanded by default';
COMMENT ON COLUMN layer_tree_node.layer_name IS 'Logical name of the layer or label of the node';
COMMENT ON COLUMN layer_tree_node.position IS 'Position of the layer in its group';
COMMENT ON COLUMN layer_tree_node.checked_group IS 'Group of layers';

/*==============================================================*/
/*  Table: provider_map_params                                  */
/*==============================================================*/
CREATE TABLE provider_map_params
(
  provider_id character varying NOT NULL, -- code_country get in the metadata code table
  bb_xmin numeric, -- min longitude coordinate
  bb_ymin numeric, -- min latitude coordinate
  bb_xmax numeric, -- max longitude coordinate
  bb_ymax numeric, -- max latitude coordinate
  zoom_level int, -- default zoom level for the country
  PRIMARY KEY (provider_id),
  FOREIGN KEY (zoom_level)
    REFERENCES mapping.zoom_level (zoom_level) MATCH SIMPLE
    ON UPDATE NO ACTION ON DELETE NO ACTION
) WITHOUT OIDS;

COMMENT ON COLUMN provider_map_params.provider_id IS 'The provider id (as found in the metadata code table)';
COMMENT ON COLUMN provider_map_params.bb_xmin IS 'Min longitude coordinate';
COMMENT ON COLUMN provider_map_params.bb_ymin IS 'Min latitude coordinate';
COMMENT ON COLUMN provider_map_params.bb_xmax IS 'Max longitude coordinate';
COMMENT ON COLUMN provider_map_params.bb_ymax IS 'Max latitude coordinate';
COMMENT ON COLUMN provider_map_params.zoom_level IS 'Default zoom level for the data provider';
