CREATE SCHEMA mapping;

SET SEARCH_PATH = mapping, public;


/*==============================================================*/
/* Table : RESULT_LOCATION                                      */
/*==============================================================*/
create table RESULT_LOCATION (
SESSION_ID           VARCHAR(50)           not null,
PLOT_CODE            VARCHAR(36)          not null,
_CREATIONDT          DATE                 null DEFAULT current_timestamp,
constraint PK_RESULT_LOCATION primary key (SESSION_ID, PLOT_CODE)
) 
WITH OIDS; -- Important : Needed by mapserv

-- Ajout de la colonne point PostGIS
SELECT AddGeometryColumn('mapping','result_location','the_geom',3035,'POINT',2);

-- Spatial Index on the_geom 
CREATE INDEX IX_RESULT_LOCATION_SPATIAL_INDEX ON mapping.RESULT_LOCATION USING GIST
            ( the_geom GIST_GEOMETRY_OPS );
            
CREATE INDEX RESULT_LOCATION_SESSION_IDX ON mapping.RESULT_LOCATION USING btree (SESSION_ID);

            

COMMENT ON COLUMN RESULT_LOCATION.SESSION_ID IS 'Identifier of the user session';
COMMENT ON COLUMN RESULT_LOCATION.PLOT_CODE IS 'The plot code';
COMMENT ON COLUMN RESULT_LOCATION._CREATIONDT IS 'Creation date (used to know when to purge the base)';
        

/*==============================================================*/
/* Table : AGGREGATED_RESULT                                    */
/*==============================================================*/
create table AGGREGATED_RESULT (
SESSION_ID           VARCHAR(50)          not null,
CELL_ID              VARCHAR(36)          not null,
AVERAGE_VALUE        FLOAT8               null,
VALUE_COUNT          INTEGER              null,
_CREATIONDT          DATE                 null DEFAULT current_timestamp,
constraint PK_AGGREGATED_RESULT primary key (SESSION_ID, CELL_ID)
) 
WITH OIDS; -- Important : Needed by mapserv
           

COMMENT ON COLUMN AGGREGATED_RESULT.SESSION_ID IS 'Identifier of the user session';
COMMENT ON COLUMN AGGREGATED_RESULT.CELL_ID IS 'Identifier of the cell or country';
COMMENT ON COLUMN AGGREGATED_RESULT.AVERAGE_VALUE IS 'The value of the cell';
COMMENT ON COLUMN AGGREGATED_RESULT.VALUE_COUNT IS 'The number of averaged items';
COMMENT ON COLUMN AGGREGATED_RESULT._CREATIONDT IS 'Creation date (used to know when to purge the base)';
            
             
            
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
  opacity			    VARCHAR(3),	   -- Opacity (between 0 and 100), null if no transparency
  country_code 		    VARCHAR(36),   -- If empty, the layer can be seen by any country, if not it is limited to one country
  has_sld               INT,           -- If value = 1 we add a SLD information
  activate_type          VARCHAR(36),   -- Group of event that will activate this layer (NONE, REQUEST, AGGREGATION or HARMONIZATION)
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
COMMENT ON COLUMN layer_definition.opacity IS 'Opacity (between 0 and 100), null if no transparency';
COMMENT ON COLUMN layer_definition.country_code IS 'If empty, the layer can be seen by any country, if not it is limited to one country';
COMMENT ON COLUMN layer_definition.has_sld IS 'If value = 1 we add a SLD information';
COMMENT ON COLUMN layer_definition.activate_type IS 'Group of event that will activate this layer (NONE, REQUEST, AGGREGATION or INTERPOLATION)';

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



/*==============================================================*/
/*  Table: Bounding Box                                         */
/*==============================================================*/
CREATE TABLE bounding_box
(
  code_country character varying NOT NULL, -- code_country get in the metadata code table
  country_name character varying, -- the name of the country
  nuts_code character varying, -- the NUTS_0 code
  bb_xmin numeric, -- min longitude coordinate
  bb_ymin numeric, -- min latitude coordinate
  bb_xmax numeric, -- max longitude coordinate
  bb_ymax numeric, -- max latitude coordinate
  zoom_level int, -- default zoom level for the country
  CONSTRAINT bounding_box_pk PRIMARY KEY (code_country)
) WITHOUT OIDS;

COMMENT ON COLUMN bounding_box.code_country IS 'The code of the country (as found in the metadata code table)';
COMMENT ON COLUMN bounding_box.country_name IS 'The name of the country';
COMMENT ON COLUMN bounding_box.nuts_code IS 'The NUTS_0 code';
COMMENT ON COLUMN bounding_box.bb_xmin IS 'Min longitude coordinate';
COMMENT ON COLUMN bounding_box.bb_ymin IS 'Min latitude coordinate';
COMMENT ON COLUMN bounding_box.bb_xmax IS 'Max longitude coordinate';
COMMENT ON COLUMN bounding_box.bb_ymax IS 'Max latitude coordinate';
COMMENT ON COLUMN bounding_box.zoom_level IS 'Default zoom level for the country';


/*==============================================================*/
/* Table: grid_definition                                       */
/* List the available grids for agregation                      */
/*==============================================================*/
CREATE TABLE grid_definition
(
  grid_name 			VARCHAR(50)    NOT NULL,   -- Logical name of the grid
  grid_label 			VARCHAR(100),  -- Label of the grid
  grid_table    		VARCHAR(50),  -- Name of PostGIS table containing the geometry
  location_column  		VARCHAR(50),  -- Name of the column of the location table containing the cell id
  aggregation_layer_name VARCHAR(50),  -- Logical name of the mapserver layer corresponding to the aggregation
  position				INTEGER,
  PRIMARY KEY  (grid_name)
) WITHOUT OIDS;

COMMENT ON COLUMN grid_definition.grid_name IS 'Logical name of the grid';
COMMENT ON COLUMN grid_definition.grid_label IS 'Label of the grid';
COMMENT ON COLUMN grid_definition.grid_table IS 'Name of PostGIS table containing the geometry';
COMMENT ON COLUMN grid_definition.location_column IS 'Name of the column of the location table containing the cell id';
COMMENT ON COLUMN grid_definition.position IS 'The position of this grid when listed on the web site';
COMMENT ON COLUMN grid_definition.aggregation_layer_name IS 'Logical name of the mapserver layer corresponding to the aggregation';


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

/*==============================================================*/
/* Table: RASTER_CLASS_DEFINITION                               */
/* Define the style of a DATA to be displayed as a raster       */
/*==============================================================*/

CREATE TABLE RASTER_CLASS_DEFINITION
(
  DATA 			VARCHAR(36)    NOT NULL,   -- Logical name of the data
  VALUE			VARCHAR(36)    NOT NULL,   -- The value of the raster
  COLOR			VARCHAR(10)    NULL,   -- Color
  LABEL			VARCHAR(100)    NULL,   -- Label
  PRIMARY KEY  (DATA, VALUE)
) WITHOUT OIDS;


/*==============================================================*/
/* Table: CLASS_DEFINITION                                      */
/* Define the style of a DATA to be displayed as a vector       */
/*==============================================================*/

CREATE TABLE CLASS_DEFINITION
(
  DATA 			VARCHAR(36)    	NOT NULL,   -- Logical name of the data
  MIN_VALUE		NUMERIC    	NOT NULL,   -- The min value of the data
  MAX_VALUE		NUMERIC    	NOT NULL,   -- The max value of the data
  COLOR			VARCHAR(10)     NULL,   -- Color
  LABEL			VARCHAR(100)    NULL,   -- Label
  PRIMARY KEY  (DATA, MIN_VALUE, MAX_VALUE)
) WITHOUT OIDS;


        