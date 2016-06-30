SET client_encoding TO 'UTF8';
SET client_min_messages TO WARNING;

CREATE SCHEMA mapping;
SET SEARCH_PATH = mapping, public;

/*==============================================================*/
/* Table : RESULT_LOCATION                                      */
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
        

            
/*==============================================================*/
-- table SCALES : List the available map scales
-- Warning : The map scales should match the tilecache configuration
/*==============================================================*/
CREATE TABLE scales
(
  scale 			INT    NOT NULL,   -- valeur d'échelle disponible
  PRIMARY KEY  (scale)
) WITHOUT OIDS;

COMMENT ON COLUMN scales.scale IS 'The denominator of the scale, used to calculate the resolutions';



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
  provider_id 		    VARCHAR(36),   -- If empty, the layer can be seen by any country, if not it is limited to one country
  activate_type         VARCHAR(36),   -- Group of event that will activate this layer (NONE, REQUEST)
  view_service_name	    VARCHAR(50),   -- Indicates the service for the map visualisation
  legend_service_name	VARCHAR(50),   -- Indicates the service for the legend
  detail_service_name	VARCHAR(50),   -- Indicates the service for the detail panel display 
  feature_service_name	VARCHAR(50),   -- Indicates the service for the wfs
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
COMMENT ON COLUMN layer.provider_id IS 'If empty, the layer can be seen by any provider if not it is limited to one provider';
COMMENT ON COLUMN layer.activate_type IS 'Group of event that will activate this layer (NONE, REQUEST, AGGREGATION or INTERPOLATION)';
COMMENT ON COLUMN layer.view_service_name IS 'Indicates the service for the map visualisation';
COMMENT ON COLUMN layer.legend_service_name IS 'Indicates the service for the legend';
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



/*==============================================================*/
/*  Table: Bounding Box                                         */
/*==============================================================*/
CREATE TABLE bounding_box
(
  provider_id character varying NOT NULL, -- code_country get in the metadata code table
  bb_xmin numeric, -- min longitude coordinate
  bb_ymin numeric, -- min latitude coordinate
  bb_xmax numeric, -- max longitude coordinate
  bb_ymax numeric, -- max latitude coordinate
  zoom_level int, -- default zoom level for the country
  CONSTRAINT bounding_box_pk PRIMARY KEY (provider_id)
) WITHOUT OIDS;

COMMENT ON COLUMN bounding_box.provider_id IS 'The provider id (as found in the metadata code table)';
COMMENT ON COLUMN bounding_box.bb_xmin IS 'Min longitude coordinate';
COMMENT ON COLUMN bounding_box.bb_ymin IS 'Min latitude coordinate';
COMMENT ON COLUMN bounding_box.bb_xmax IS 'Max longitude coordinate';
COMMENT ON COLUMN bounding_box.bb_ymax IS 'Max latitude coordinate';
COMMENT ON COLUMN bounding_box.zoom_level IS 'Default zoom level for the data provider';
