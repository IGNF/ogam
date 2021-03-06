SET client_encoding TO 'UTF8';
SET client_min_messages TO WARNING;

CREATE SCHEMA harmonized_data;
SET SEARCH_PATH = harmonized_data, public;

SET client_min_messages TO WARNING;

 
/*==============================================================*/
/* Table : HARMONIZATION_PROCESS                                */
/*==============================================================*/
create table HARMONIZATION_PROCESS (
HARMONIZATION_PROCESS_ID         serial,
DATASET_ID           			 VARCHAR(36)          not null,
PROVIDER_ID		          		 VARCHAR(36)          not null,
HARMONIZATION_STATUS   			 VARCHAR(36)          null,
_CREATIONDT          DATE                 null DEFAULT current_timestamp,
constraint PK_HARMONIZATION_PROCESS primary key (HARMONIZATION_PROCESS_ID)
);

COMMENT ON COLUMN HARMONIZATION_PROCESS.HARMONIZATION_PROCESS_ID IS 'The identifier of the harmonization process';
COMMENT ON COLUMN HARMONIZATION_PROCESS.DATASET_ID IS 'The identifier of the dataset';
COMMENT ON COLUMN HARMONIZATION_PROCESS.PROVIDER_ID IS 'The identifier of the data provider';
COMMENT ON COLUMN HARMONIZATION_PROCESS.HARMONIZATION_STATUS IS 'The status of the harmonization process';
COMMENT ON COLUMN HARMONIZATION_PROCESS._CREATIONDT IS 'The date of launch of the process';


/*==============================================================*/
/* Table : HARMONIZATION_PROCESS_SUBMISSIONS                    */
/*==============================================================*/
create table HARMONIZATION_PROCESS_SUBMISSIONS (
HARMONIZATION_PROCESS_ID         INTEGER,
RAW_DATA_SUBMISSION_ID 			 INTEGER,
constraint PK_HARMONIZATION_PROCESS_SUBMISSIONS primary key (HARMONIZATION_PROCESS_ID, RAW_DATA_SUBMISSION_ID)
);

COMMENT ON COLUMN HARMONIZATION_PROCESS_SUBMISSIONS.HARMONIZATION_PROCESS_ID IS 'The identifier of the harmonization process';
COMMENT ON COLUMN HARMONIZATION_PROCESS_SUBMISSIONS.RAW_DATA_SUBMISSION_ID IS 'The identifier of the submission of raw data corresponding';

alter table HARMONIZATION_PROCESS_SUBMISSIONS
   add constraint FK_HARMONIZATION_PROCESS_SUBMISSIONS_ASSOCIATE_PROCESS foreign key (HARMONIZATION_PROCESS_ID)
      references HARMONIZATION_PROCESS (HARMONIZATION_PROCESS_ID)
      on delete restrict on update restrict;

/*==============================================================*/
/* Table : HARMONIZED_LOCATION                                  */
/*==============================================================*/
create table HARMONIZED_LOCATION (
PROVIDER_ID          VARCHAR(36)          not null,
PLOT_CODE            VARCHAR(36)          not null,
LAT                  FLOAT8               null,
LONG                 FLOAT8               null,
COMMENT              VARCHAR(255)         null,
constraint PK_HARMONIZED_LOCATION primary key (PROVIDER_ID, PLOT_CODE)
);

-- Ajout de la colonne point PostGIS
SELECT AddGeometryColumn('harmonized_data','harmonized_location','the_geom',3857,'POINT',2);

COMMENT ON COLUMN HARMONIZED_LOCATION.PROVIDER_ID IS 'The identifier of the data provider';
COMMENT ON COLUMN HARMONIZED_LOCATION.PLOT_CODE IS 'The identifier of the plot';
COMMENT ON COLUMN HARMONIZED_LOCATION.LAT IS 'The latitude (in decimal degrees)';
COMMENT ON COLUMN HARMONIZED_LOCATION.LONG IS 'The longitude (in decimal degrees)';
COMMENT ON COLUMN HARMONIZED_LOCATION.COMMENT IS 'A comment about the plot location';
COMMENT ON COLUMN HARMONIZED_LOCATION.THE_GEOM IS 'The geometry of the location';
		
-- Spatial Index on the_geom 
CREATE INDEX IX_HARMONIZED_LOCATION_SPATIAL_INDEX ON harmonized_data.harmonized_location USING GIST ( the_geom  );

/*========================================================================*/
/*	Add a trigger to fill the the_geom column of the location table       */
/*========================================================================*/
CREATE OR REPLACE FUNCTION harmonized_data.geomfromcoordinate() RETURNS "trigger" AS
$BODY$
BEGIN
    NEW.the_geom = public.st_transform(public.st_geometryFromText('POINT(' || NEW.LONG || ' ' || NEW.LAT || ')', 4326), 3857);
    RETURN NEW;
END;
$BODY$
  LANGUAGE 'plpgsql' VOLATILE;

CREATE TRIGGER geom_trigger
  BEFORE INSERT 
  ON harmonized_data.HARMONIZED_LOCATION
  FOR EACH ROW
  EXECUTE PROCEDURE harmonized_data.geomfromcoordinate();
    
  
  
  
/*==============================================================*/
/* Table : HARMONIZED_PLOT_DATA                                 */
/*==============================================================*/
create table HARMONIZED_PLOT_DATA (
PROVIDER_ID          VARCHAR(36)          not null,
PLOT_CODE            VARCHAR(36)          not null,
CYCLE	             VARCHAR(36)          not null,
INV_DATE             DATE                 null,
IS_FOREST_PLOT		 CHAR(1)	          null,
COMMENT              VARCHAR(1000)         null,
constraint PK_HARMONIZED_PLOT_DATA primary key (PROVIDER_ID, PLOT_CODE, CYCLE),
constraint FK_HARMONIZED_PLOT_DATA_ASSOCIATE_LOCATION foreign key (PROVIDER_ID, PLOT_CODE) references HARMONIZED_LOCATION (PROVIDER_ID, PLOT_CODE)
);
   
      
COMMENT ON COLUMN HARMONIZED_PLOT_DATA.PROVIDER_ID IS 'The identifier of the data provider';
COMMENT ON COLUMN HARMONIZED_PLOT_DATA.PLOT_CODE IS 'The identifier of the plot';
COMMENT ON COLUMN HARMONIZED_PLOT_DATA.CYCLE IS 'The cycle of inventory';
COMMENT ON COLUMN HARMONIZED_PLOT_DATA.INV_DATE IS 'The date of inventory';
COMMENT ON COLUMN HARMONIZED_PLOT_DATA.IS_FOREST_PLOT IS 'Is the plot a forest plot ?';
COMMENT ON COLUMN HARMONIZED_PLOT_DATA.COMMENT IS 'A comment about the plot';
      
      

/*==============================================================*/
/* Table : HARMONIZED_SPECIES_DATA                              */
/*==============================================================*/
create table HARMONIZED_SPECIES_DATA (
PROVIDER_ID          VARCHAR(36)          not null,
PLOT_CODE            VARCHAR(36)          not null,
CYCLE	             VARCHAR(36)          not null,
ID_TAXON             VARCHAR(36)          not null,
BASAL_AREA			 FLOAT8	              null,
COMMENT              VARCHAR(255)         null,
constraint PK_HARMONIZED_SPECIES_DATA primary key (PROVIDER_ID, PLOT_CODE, CYCLE, ID_TAXON),
constraint FK_HARMONIZED_SPECIES_ASSOCIATE_PLOT_DAT foreign key (PROVIDER_ID, PLOT_CODE, CYCLE) references HARMONIZED_PLOT_DATA (PROVIDER_ID, PLOT_CODE, CYCLE)
);

COMMENT ON COLUMN HARMONIZED_SPECIES_DATA.PROVIDER_ID IS 'The identifier of the data provider';
COMMENT ON COLUMN HARMONIZED_SPECIES_DATA.PLOT_CODE IS 'The identifier of the plot';
COMMENT ON COLUMN HARMONIZED_SPECIES_DATA.CYCLE IS 'The cycle of inventory';
COMMENT ON COLUMN HARMONIZED_SPECIES_DATA.ID_TAXON IS 'The identifiant of the taxon';
COMMENT ON COLUMN HARMONIZED_SPECIES_DATA.BASAL_AREA IS 'The proportion of surface covered by this specie on the plot (in m2/ha)';
COMMENT ON COLUMN HARMONIZED_SPECIES_DATA.COMMENT IS 'A comment about the species';







/*==============================================================*/
/* Table : HARMONIZED_TREE_DATA                                 */
/*==============================================================*/
create table HARMONIZED_TREE_DATA (
PROVIDER_ID          VARCHAR(36)          not null,
PLOT_CODE            VARCHAR(36)          not null,
CYCLE	             VARCHAR(36)          not null,
TREE_ID              INTEGER              not null,
SPECIES_CODE		 VARCHAR(36)          null,
DBH					 FLOAT8	              null,
HEIGHT	 			 FLOAT8	              null,
PHOTO	 			 VARCHAR(255)         null,
COMMENT              VARCHAR(255)         null,
constraint PK_HARMONIZED_TREE_DATA primary key (PROVIDER_ID, PLOT_CODE, CYCLE, TREE_ID),
constraint FK_HARMONIZED_TREE_ASSOCIATE_PLOT_DAT foreign key (PROVIDER_ID, PLOT_CODE, CYCLE) references HARMONIZED_PLOT_DATA (PROVIDER_ID, PLOT_CODE, CYCLE) on delete restrict on update restrict,
unique (PROVIDER_ID, PLOT_CODE, CYCLE, TREE_ID)   
);
-- Ajout de la colonne point PostGIS
SELECT AddGeometryColumn('harmonized_data','harmonized_tree_data','the_geom',3857,'POINT',2);

COMMENT ON COLUMN HARMONIZED_TREE_DATA.PROVIDER_ID IS 'The identifier of the data provider';
COMMENT ON COLUMN HARMONIZED_TREE_DATA.PLOT_CODE IS 'The identifier of the plot';
COMMENT ON COLUMN HARMONIZED_TREE_DATA.CYCLE IS 'The cycle of inventory';
COMMENT ON COLUMN HARMONIZED_TREE_DATA.TREE_ID IS 'The identifier of the tree';
COMMENT ON COLUMN HARMONIZED_TREE_DATA.SPECIES_CODE IS 'The code of the specie of the tree';
COMMENT ON COLUMN HARMONIZED_TREE_DATA.DBH IS 'The diameter at breast height (in m)';
COMMENT ON COLUMN HARMONIZED_TREE_DATA.HEIGHT IS 'The tree height (in m)';
COMMENT ON COLUMN HARMONIZED_TREE_DATA.PHOTO IS 'A picture of the tree';
COMMENT ON COLUMN HARMONIZED_TREE_DATA.COMMENT IS 'A comment about the species';
COMMENT ON COLUMN HARMONIZED_TREE_DATA.the_geom IS 'geometry of the tree location';

-- Spatial Index on the_geom 
CREATE INDEX IX_HARMONIZED_TREE_DATA_SPATIAL_INDEX ON harmonized_data.harmonized_tree_data USING GIST ( the_geom );






/*****************************************************************/
/*/!\/!\/!\/!\/!\/!\/!\/!\/!\/!\/!\/!\/!\/!\/!\/!\/!\/!\/!\/!\/!\*/
/**             TESTS TABLES                                     */
/*/!\/!\/!\/!\/!\/!\/!\/!\/!\/!\/!\/!\/!\/!\/!\/!\/!\/!\/!\/!\/!\*/
/*****************************************************************/
/**=====================================================*/
/*  TABLE : HARMONIZED_TEST_1                           */
/**====================================================*/
CREATE TABLE HARMONIZED_TEST_1(
ID integer not null,
TEXT_STRING_STRING TEXT,
TEXT_STRING_LINK varchar(255),
TEXT_NUMERIC_INTEGER integer,
TEXT_NUMERIC_NUMERIC real,
TEXT_NUMERIC_RANGE real,
NUMERIC_NUMERIC_NUMERIC real,
NUMERIC_NUMERIC_RANGE real,
NUMERIC_NUMERIC_INTEGER integer,
NUMERIC_NUMERIC_COORDINATE double precision,
DATE_DATE date,
TIME_TIME time,
DATETIME_DATETIME timestamp,
GEOM_GEOM_POLYGON Geometry(POLYGON, 4326),
SUBMISSION_ID int,
CONSTRAINT pk_HARMONIZED_TEST_1 PRIMARY KEY(ID)
);


/**=====================================================*/
/*  TABLE : HARMONIZED_TEST_2                           */
/**====================================================*/
CREATE TABLE HARMONIZED_TEST_2(
ID int,
PARENT_ID int,
SELECT_CODE_CODE_3 varchar(36),
SELECT_CODE_CODE_10 varchar(36),
SELECT_CODE_CODE_100 varchar(36),
SELECT_CODE_DYNAMIC_3 varchar(36),
SELECT_CODE_DYNAMIC_10 varchar(36),
SELECT_CODE_DYNAMIC_100 varchar(36),
SELECT_ARRAY_CODE_3 varchar(36)[],
SELECT_ARRAY_CODE_10 varchar(36)[],
SELECT_ARRAY_CODE_100 varchar(36)[],
SELECT_ARRAY_DYNAMIC_3 varchar(36)[],
SELECT_ARRAY_DYNAMIC_10 varchar(36)[],
SELECT_ARRAY_DYNAMIC_100 varchar(36)[],
GEOM_GEOM_LINESTRING geometry(LINESTRING, 4326),
CONSTRAINT pk_HARMONIZED_TEST_2 PRIMARY KEY(ID),
CONSTRAINT fk_HARMONIZED_TEST_2_PARENT_ID FOREIGN KEY (PARENT_ID)
REFERENCES HARMONIZED_TEST_1 (ID)MATCH SIMPLE
      ON UPDATE RESTRICT ON DELETE RESTRICT
);


/**=====================================================*/
/*  TABLE : HARMONIZED_TEST_3                           */
/**====================================================*/
CREATE TABLE HARMONIZED_DATA.HARMONIZED_TEST_3(
ID int not null,
PARENT_ID int,
CHECKBOX_BOOLEAN char(1),
RADIO_BOOLEAN char(1),
RADIO_CODE_CODE_3 varchar(36),
RADIO_CODE_CODE_10 varchar(36),
RADIO_CODE_CODE_100 varchar(36),
RADIO_CODE_DYNAMIC_3 varchar(36),
RADIO_CODE_DYNAMIC_10 varchar(36),
RADIO_CODE_DYNAMIC_100 varchar(36),
TREE_CODE_TREE varchar(36),
TREE_ARRAY_TREE varchar(36)[],
TAXREF_CODE_TAXREF varchar(36),
TAXREF_ARRAY_TAXREF varchar(36)[],
IMAGE_IMAGE TEXT,
GEOM_GEOM_POINT Geometry(Point, 4326),
CONSTRAINT pk_HARMONIZED_TEST_3 PRIMARY KEY(ID),
CONSTRAINT fk_HARMONIZED_TEST_3_PARENT_ID FOREIGN KEY (PARENT_ID)
REFERENCES HARMONIZED_TEST_2 (ID)MATCH SIMPLE
      ON UPDATE RESTRICT ON DELETE RESTRICT
);