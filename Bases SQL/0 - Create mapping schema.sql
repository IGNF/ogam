CREATE SCHEMA mapping;

SET SEARCH_PATH = mapping, public;


/*==============================================================*/
/* Table : RESULT_LOCATION                                      */
/*==============================================================*/
create table RESULT_LOCATION (
SESSION_ID           VARCHAR(50)           not null,
PROVIDER_ID          VARCHAR(36)           not null,
PLOT_CODE            VARCHAR(36)          not null,
_CREATIONDT          DATE                 null DEFAULT current_timestamp,
constraint PK_RESULT_LOCATION primary key (SESSION_ID, PROVIDER_ID, PLOT_CODE)
) 
WITH OIDS; -- Important : Needed by mapserv

-- Ajout de la colonne point PostGIS
SELECT AddGeometryColumn('mapping','result_location','the_geom',2154,'GEOMETRY',2);

-- Spatial Index on the_geom 
CREATE INDEX IX_RESULT_LOCATION_SPATIAL_INDEX ON mapping.RESULT_LOCATION USING GIST
            ( the_geom GIST_GEOMETRY_OPS );
            
CREATE INDEX RESULT_LOCATION_SESSION_IDX ON mapping.RESULT_LOCATION USING btree (SESSION_ID);

            

COMMENT ON COLUMN RESULT_LOCATION.SESSION_ID IS 'Identifier of the user session';
COMMENT ON COLUMN RESULT_LOCATION.PROVIDER_ID IS 'The provider id';
COMMENT ON COLUMN RESULT_LOCATION.PLOT_CODE IS 'The plot code';
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
/* Table: layer_definition                                      */
/*==============================================================*/
CREATE TABLE layer_definition
(
  layer_name 			VARCHAR(50)    NOT NULL,   -- Logical name of the layer
  layer_label 			VARCHAR(100),  -- Label of the layer
  mapserv_layers 		VARCHAR(500),  -- Name of the corresponding layer(s)
  isTransparent 		INT,           -- Indicate if the layer is transparent
  isBaseLayer	 		INT,		   -- Indicate if the layer is a base layer (or an overlay)
  isUntiled			 	INT,           -- Force OpenLayer to request one image each time
  isCached			 	INT,           -- Use Tilecache
  maxscale				INT,           -- Max scale of apparation
  minscale				INT,           -- Min scale of apparition
  has_legend    		INT, 	   	   -- If value = 1 is the layer has a legend that should be displayed
  transitionEffect		VARCHAR(50),   -- Transition effect (resize or null)
  imageFormat			VARCHAR(10),   -- Image format (PNG or JPEG)
  provider_id 		    VARCHAR(36),   -- If empty, the layer can be seen by any country, if not it is limited to one country
  has_sld               INT,           -- If value = 1 we add a SLD information
  activate_type         VARCHAR(36),   -- Group of event that will activate this layer (NONE, REQUEST, AGGREGATION or HARMONIZATION)
  isVector              INT,           -- Indicate if the layer is vector-based (1 for an layer with geometry, 0 for a raster) 
  PRIMARY KEY  (layer_name)
) WITHOUT OIDS;

COMMENT ON COLUMN layer_definition.layer_name IS 'Logical name of the layer';
COMMENT ON COLUMN layer_definition.layer_label IS 'Label of the layer';
COMMENT ON COLUMN layer_definition.mapserv_layers IS 'Name of the corresponding layer(s) in mapserver';
COMMENT ON COLUMN layer_definition.isTransparent IS 'Indicate if the layer is transparent';
COMMENT ON COLUMN layer_definition.isBaseLayer IS 'Indicate if the layer is a base layer (or an overlay)';
COMMENT ON COLUMN layer_definition.isUntiled IS 'Force OpenLayer to request one image each time';
COMMENT ON COLUMN layer_definition.isCached IS 'Use Tilecache';
COMMENT ON COLUMN layer_definition.maxscale IS 'Max scale of apparation';
COMMENT ON COLUMN layer_definition.minscale IS 'Min scale of apparition';
COMMENT ON COLUMN layer_definition.has_legend IS 'If value = 1 is the layer has a legend that should be displayed';
COMMENT ON COLUMN layer_definition.transitionEffect IS 'Transition effect (resize or null)';
COMMENT ON COLUMN layer_definition.imageFormat IS 'Image format (PNG or JPEG)';
COMMENT ON COLUMN layer_definition.provider_id IS 'If empty, the layer can be seen by any provider if not it is limited to one provider';
COMMENT ON COLUMN layer_definition.has_sld IS 'If value = 1 we add a SLD information';
COMMENT ON COLUMN layer_definition.activate_type IS 'Group of event that will activate this layer (NONE, REQUEST, AGGREGATION or INTERPOLATION)';
COMMENT ON COLUMN layer_definition.isVector IS 'Indicate if the layer is vector-based (1 for an layer with geometry, 0 for a raster) ';

/*==============================================================*/
/*  Table: Legend                                               */
/*==============================================================*/
CREATE TABLE legend
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

COMMENT ON COLUMN legend.item_id IS 'Identify the legend item';
COMMENT ON COLUMN legend.parent_id IS 'Identify the parent of the item (-1 = root)';
COMMENT ON COLUMN legend.is_layer IS 'If value = 1 then this is a layer, else it is only a node';
COMMENT ON COLUMN legend.is_checked IS 'If value = 1 then the item is checked by default';
COMMENT ON COLUMN legend.is_hidden IS 'If value = 1 then the item is hidden by default';
COMMENT ON COLUMN legend.is_disabled IS 'If value = 1 then the item is displayed but grayed';
COMMENT ON COLUMN legend.is_expended IS 'If value = 1 then the node is expended by default';
COMMENT ON COLUMN legend.name IS 'Logical name of the layer or label of the node';
COMMENT ON COLUMN legend.position IS 'Position of the layer in its group';
COMMENT ON COLUMN legend.checked_group IS 'Group of layers';



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

SET SEARCH_PATH = mapping, public;


/*==============================================================*/
/* Table: layer_profile_restriction                             */
/* Mark some layers as forbidden for some user profiles         */
/*==============================================================*/
CREATE TABLE layer_profile_restriction
(
  layer_name 			VARCHAR(50)    NOT NULL,   -- Logical name of the layer
  role_code				VARCHAR(36)    NOT NULL,   -- Role for whom this layer is forbidden
  PRIMARY KEY  (layer_name, role_code)
) WITHOUT OIDS;

COMMENT ON COLUMN layer_profile_restriction.layer_name IS 'Logical name of the layer';
COMMENT ON COLUMN layer_profile_restriction.role_code IS 'Role for whom this layer is forbidden';


        