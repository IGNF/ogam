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
COMMENT ON COLUMN HARMONIZATION_PROCESS.REQUEST_ID IS 'The identifier of the dataset';
COMMENT ON COLUMN HARMONIZATION_PROCESS.COUNTRY_CODE IS 'The identifier of the country';
COMMENT ON COLUMN HARMONIZATION_PROCESS.HARMONIZATION_STATUS IS 'The status of the harmonization process';
COMMENT ON COLUMN HARMONIZATION_PROCESS._CREATIONDT IS 'The date of launch of the process';


/*==============================================================*/
/* Table : HARMONIZATION_PROCESS_SUBMISSIONS                                */
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
REQUEST_ID           			 VARCHAR(36)          not null,
COUNTRY_CODE         VARCHAR(36)          not null,
PLOT_CODE            VARCHAR(36)          not null,
CLUSTER_CODE         VARCHAR(36)          not null,
LAT                  FLOAT8               null,
LONG                 FLOAT8               null,
IS_PLOT_COORDINATES_DEGRADED   CHAR(1)	  null,
COMMENT              VARCHAR(255)         null,
constraint PK_HARMONIZED_LOCATION primary key (REQUEST_ID, COUNTRY_CODE, PLOT_CODE)
);

-- Ajout de la colonne point PostGIS
SELECT AddGeometryColumn('harmonized_data','harmonized_location','the_geom',3035,'POINT',2);
		
-- Spatial Index on the_geom 
CREATE INDEX IX_HARMONIZED_LOCATION_SPATIAL_INDEX ON harmonized_data.harmonized_location USING GIST ( the_geom GIST_GEOMETRY_OPS );

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
REQUEST_ID           VARCHAR(36)          not null,
COUNTRY_CODE         VARCHAR(36)          not null,
STRATUM_CODE         VARCHAR(36)          null,
PLOT_CODE            VARCHAR(36)          not null,
CYCLE	             VARCHAR(36)          not null,
REF_YEAR_BEGIN       INTEGER	          not null,
REF_YEAR_END	     INTEGER	          not null,
INV_DATE             DATE                 null,
IS_FOREST_PLOT		 CHAR(1)	          null,
IS_PARTITIONNING_PLOT  CHAR(1)	          null,
COMMENT              VARCHAR(1000)         null,
constraint PK_HARMONIZED_PLOT_DATA primary key (REQUEST_ID, COUNTRY_CODE, PLOT_CODE, CYCLE)
);


alter table HARMONIZED_PLOT_DATA
   add constraint FK_HARMONIZED_PLOT_DATA_ASSOCIATE_LOCATION foreign key (REQUEST_ID, PLOT_CODE, COUNTRY_CODE)
      references HARMONIZED_LOCATION (REQUEST_ID, PLOT_CODE, COUNTRY_CODE)
      on delete restrict on update restrict;
      
      
CREATE INDEX HARMONIZED_PLOT_DATA_COUNTRY_IDX ON HARMONIZED_PLOT_DATA (COUNTRY_CODE);
      

/*==============================================================*/
/* Table : HARMONIZED_SPECIES_DATA                              */
/*==============================================================*/
create table HARMONIZED_SPECIES_DATA (
REQUEST_ID        	 VARCHAR(36)          not null,
COUNTRY_CODE         VARCHAR(36)          not null,
PLOT_CODE            VARCHAR(36)          not null,
CYCLE	             VARCHAR(36)          not null,
SPECIES_CODE         VARCHAR(36)          not null,
DBH_CLASS            VARCHAR(36)          null,
NATIONAL_SPECIES_CODE         VARCHAR(36)          null,
COMMENT              VARCHAR(255)         null,
constraint PK_HARMONIZED_SPECIES_DATA primary key (REQUEST_ID, COUNTRY_CODE, PLOT_CODE, CYCLE, DBH_CLASS, SPECIES_CODE)
);


      
alter table HARMONIZED_SPECIES_DATA
   add constraint FK_HARMONIZED_SPECIES_ASSOCIATE_PLOT_DAT foreign key (REQUEST_ID, COUNTRY_CODE, PLOT_CODE, CYCLE)
      references HARMONIZED_PLOT_DATA (REQUEST_ID, COUNTRY_CODE, PLOT_CODE, CYCLE)
      on delete restrict on update restrict;     
      
      




-- Indexes
CREATE INDEX HARMONIZED_LOCATION_PLOT_CODE_IDX ON harmonized_location (request_id, country_code, plot_code);
CREATE INDEX HARMONIZED_PLOT_DATA_PLOT_CODE_IDX ON harmonized_plot_data (request_id, country_code, plot_code);
CREATE INDEX HARMONIZED_SPECIES_DATA_PLOT_CODE_IDX ON harmonized_species_data (request_id, country_code, plot_code);

      