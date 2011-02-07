CREATE SCHEMA raw_data;

SET SEARCH_PATH = raw_data, public;



/*==============================================================*/
/* Sequence : SUBMISSION_ID                                     */
/*==============================================================*/
CREATE SEQUENCE submission_id_seq
  INCREMENT 1
  MINVALUE 1
  MAXVALUE 9223372036854775807
  START 1
  CACHE 1;
  
  
/*==============================================================*/
/* Table : SUBMISSION                                           */
/*==============================================================*/
create table SUBMISSION (
SUBMISSION_ID        INT4                 not null default nextval('submission_id_seq'),
STEP		 		 VARCHAR(36)          null,
STATUS    			 VARCHAR(36)          null,
PROVIDER_ID          VARCHAR(36)          not null,
DATASET_ID           VARCHAR(36)          not null,
USER_LOGIN           VARCHAR(50)          not null,
_CREATIONDT          DATE                 null DEFAULT current_timestamp,
_VALIDATIONDT        DATE                 null DEFAULT current_timestamp,
constraint PK_SUBMISSION primary key (SUBMISSION_ID)
);




/*==============================================================*/
/* Table : SUBMISSION_FILE                                      */
/*==============================================================*/
create table SUBMISSION_FILE (
SUBMISSION_ID        INT4                 not null,
FILE_TYPE            VARCHAR(36)          not null,
FILE_NAME            VARCHAR(4000)         not null,
NB_LINE              INT4                 null,
constraint PK_SUBMISSION_FILE primary key (SUBMISSION_ID, FILE_TYPE)
);



/*==============================================================*/
/* Table : LOCATION                                             */
/*==============================================================*/
create table LOCATION (
SUBMISSION_ID        INT4                 not null,
PLOT_CODE            VARCHAR(36)          not null,
LAT                  FLOAT8               null,
LONG                 FLOAT8               null,
COMMENT              VARCHAR(255)         null,
LINE_NUMBER			 INTEGER			  null,
constraint PK_LOCATION primary key (SUBMISSION_ID, PLOT_CODE),
unique (PLOT_CODE)
);

-- Ajout de la colonne point PostGIS
SELECT AddGeometryColumn('raw_data','location','the_geom',4326,'POINT',2);
		
-- Spatial Index on the_geom 
CREATE INDEX IX_LOCATION_SPATIAL_INDEX ON raw_data.location USING GIST
            ( the_geom GIST_GEOMETRY_OPS );
            
/*========================================================================*/
/*	Add a trigger to fill the the_geom column of the location table       */
/*========================================================================*/
CREATE OR REPLACE FUNCTION raw_data.geomfromcoordinate() RETURNS "trigger" AS
$BODY$
BEGIN
    NEW.the_geom = public.GeometryFromText('POINT(' || NEW.LONG || ' ' || NEW.LAT || ')', 4326);
    RETURN NEW;
END;
$BODY$
  LANGUAGE 'plpgsql' VOLATILE;

CREATE TRIGGER geom_trigger
  BEFORE INSERT OR UPDATE
  ON raw_data.LOCATION
  FOR EACH ROW
  EXECUTE PROCEDURE raw_data.geomfromcoordinate();
            
            

/*==============================================================*/
/* Table : PLOT_DATA                                            */
/*==============================================================*/
create table PLOT_DATA (
SUBMISSION_ID        INT4                 not null,
PLOT_CODE            VARCHAR(36)          not null,
CYCLE	             VARCHAR(36)          not null,
INV_DATE             DATE                 null,
IS_FOREST_PLOT		 CHAR(1)	          null,
COMMENT              VARCHAR(1000)        null,
LINE_NUMBER			 INTEGER			  null,
constraint PK_PLOT_DATA primary key (SUBMISSION_ID, PLOT_CODE, CYCLE)
);



/*==============================================================*/
/* Table : SPECIES_DATA                                         */
/*==============================================================*/
create table SPECIES_DATA (
SUBMISSION_ID        INT4                 not null,
PLOT_CODE            VARCHAR(36)          not null,
CYCLE	             VARCHAR(36)          not null,
SPECIES_CODE         VARCHAR(36)          not null,
BASAL_AREA			 FLOAT8	              null,
COMMENT              VARCHAR(255)         null,
LINE_NUMBER			 INTEGER			  null,
constraint PK_SPECIES_DATA primary key (SUBMISSION_ID, PLOT_CODE, CYCLE, SPECIES_CODE)
);



/*==============================================================*/
/* Table : CHECK_ERROR                                          */
/*==============================================================*/
create table CHECK_ERROR (
CHECK_ERROR_ID       serial               not null,
CHECK_ID             INT4                 not null,
SUBMISSION_ID        INT4                 not null,
LINE_NUMBER          INT4                 not null,
SRC_FORMAT           VARCHAR(36)          null,
SRC_DATA             VARCHAR(36)          null,
PLOT_CODE            VARCHAR(36)          null,
FOUND_VALUE          VARCHAR(255)         null,
EXPECTED_VALUE       VARCHAR(255)         null,
ERROR_MESSAGE        VARCHAR(4000)        null,
_CREATIONDT          DATE                 null  DEFAULT current_timestamp,
constraint PK_CHECK_ERROR primary key (CHECK_ID, SUBMISSION_ID, CHECK_ERROR_ID)
);


     
alter table PLOT_DATA
   add constraint FK_PLOT_DATA_ASSOCIATE_LOCATION foreign key (PLOT_CODE)
      references LOCATION (PLOT_CODE)
      on delete restrict on update restrict;
           
alter table SPECIES_DATA
   add constraint FK_SPECIES_ASSOCIATE_PLOT_DAT foreign key (SUBMISSION_ID, PLOT_CODE, CYCLE)
      references PLOT_DATA (SUBMISSION_ID, PLOT_CODE, CYCLE)
      on delete restrict on update restrict;     
      
      
-- Ajout d'indexes
CREATE INDEX LOCATION_PLOT_CODE_IDX ON location ( plot_code);
CREATE INDEX PLOT_DATA_PLOT_CODE_IDX ON plot_data ( plot_code);
CREATE INDEX SPECIES_DATA_PLOT_CODE_IDX ON species_data ( plot_code);



GRANT ALL ON SCHEMA raw_data TO ogam;
GRANT ALL ON TABLE raw_data.check_error_check_error_id_seq TO ogam;
GRANT ALL ON TABLE raw_data.submission_id_seq TO ogam;
GRANT ALL ON TABLE raw_data.check_error TO ogam;
GRANT ALL ON TABLE raw_data."location" TO ogam;
GRANT ALL ON TABLE raw_data.plot_data TO ogam;
GRANT ALL ON TABLE raw_data.species_data TO ogam;
GRANT ALL ON TABLE raw_data.submission TO ogam;
GRANT ALL ON TABLE raw_data.submission_file TO ogam;
GRANT EXECUTE ON FUNCTION raw_data.geomfromcoordinate() TO ogam;
