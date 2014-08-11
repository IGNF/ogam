CREATE SCHEMA harmonized_data;

SET SEARCH_PATH = harmonized_data, public;

 
  
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
SELECT AddGeometryColumn('harmonized_data','harmonized_location','the_geom',3035,'POINT',2);

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
    NEW.the_geom = public.ST_Transform(public.GeometryFromText('POINT(' || NEW.LONG || ' ' || NEW.LAT || ')', 4326), 3035);
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
SPECIES_CODE         VARCHAR(36)          not null,
BASAL_AREA			 FLOAT8	              null,
COMMENT              VARCHAR(255)         null,
constraint PK_HARMONIZED_SPECIES_DATA primary key (PROVIDER_ID, PLOT_CODE, CYCLE, SPECIES_CODE),
constraint FK_HARMONIZED_SPECIES_ASSOCIATE_PLOT_DAT foreign key (PROVIDER_ID, PLOT_CODE, CYCLE) references HARMONIZED_PLOT_DATA (PROVIDER_ID, PLOT_CODE, CYCLE)
);

COMMENT ON COLUMN HARMONIZED_SPECIES_DATA.PROVIDER_ID IS 'The identifier of the data provider';
COMMENT ON COLUMN HARMONIZED_SPECIES_DATA.PLOT_CODE IS 'The identifier of the plot';
COMMENT ON COLUMN HARMONIZED_SPECIES_DATA.CYCLE IS 'The cycle of inventory';
COMMENT ON COLUMN HARMONIZED_SPECIES_DATA.SPECIES_CODE IS 'The code of the specie';
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

COMMENT ON COLUMN HARMONIZED_TREE_DATA.PROVIDER_ID IS 'The identifier of the data provider';
COMMENT ON COLUMN HARMONIZED_TREE_DATA.PLOT_CODE IS 'The identifier of the plot';
COMMENT ON COLUMN HARMONIZED_TREE_DATA.CYCLE IS 'The cycle of inventory';
COMMENT ON COLUMN HARMONIZED_TREE_DATA.TREE_ID IS 'The identifier of the tree';
COMMENT ON COLUMN HARMONIZED_TREE_DATA.SPECIES_CODE IS 'The code of the specie of the tree';
COMMENT ON COLUMN HARMONIZED_TREE_DATA.DBH IS 'The diameter at breast height (in m)';
COMMENT ON COLUMN HARMONIZED_TREE_DATA.HEIGHT IS 'The tree height (in m)';
COMMENT ON COLUMN HARMONIZED_TREE_DATA.PHOTO IS 'A picture of the tree';
COMMENT ON COLUMN HARMONIZED_TREE_DATA.COMMENT IS 'A comment about the species';




GRANT ALL ON ALL TABLES IN SCHEMA harmonized_data TO ogam;