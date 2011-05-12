CREATE SCHEMA raw_data;

SET SEARCH_PATH = raw_data, public;

--
-- WARNING: The DATASET_ID, PROVIDER_ID and PLOT_CODE columns are used by the system and should keep their names.
--



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


COMMENT ON COLUMN SUBMISSION.SUBMISSION_ID IS 'The identifier of the submission';
COMMENT ON COLUMN SUBMISSION.STEP IS 'The submission step (INIT, INSERTED, CHECKED, VALIDATED, CANCELLED)';
COMMENT ON COLUMN SUBMISSION.STATUS IS 'The submission status (OK, WARNING, ERROR, CRASH)';
COMMENT ON COLUMN SUBMISSION.PROVIDER_ID IS 'The data provider identifier (country code or organisation name)';
COMMENT ON COLUMN SUBMISSION.DATASET_ID IS 'The dataset identifier';
COMMENT ON COLUMN SUBMISSION.USER_LOGIN IS 'The login of the user doing the submission';
COMMENT ON COLUMN SUBMISSION._CREATIONDT IS 'The date of submission';
COMMENT ON COLUMN SUBMISSION._VALIDATIONDT IS 'The date of validation';



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

COMMENT ON COLUMN SUBMISSION_FILE.SUBMISSION_ID IS 'The identifier of the submission';
COMMENT ON COLUMN SUBMISSION_FILE.FILE_TYPE IS 'The type of file (reference a DATASET_FILES.FORMAT)';
COMMENT ON COLUMN SUBMISSION_FILE.FILE_NAME IS 'The name of the file';
COMMENT ON COLUMN SUBMISSION_FILE.NB_LINE IS 'The number of lines of data in the file (exluding comment and empty lines)';



/*==============================================================*/
/* Table : LOCATION                                             */
/*==============================================================*/
create table LOCATION (
SUBMISSION_ID        INT4                 not null,
PROVIDER_ID          VARCHAR(36)          not null,
PLOT_CODE            VARCHAR(36)          not null,
LAT                  FLOAT8               null,
LONG                 FLOAT8               null,
COMMUNES			 TEXT[] 			  null,
DEPARTEMENT			 VARCHAR(36)      	  null,
COMMENT              VARCHAR(255)         null,
LINE_NUMBER			 INTEGER			  null,
constraint PK_LOCATION primary key (PROVIDER_ID, PLOT_CODE),
unique (PROVIDER_ID, PLOT_CODE)
);

-- Ajout de la colonne point PostGIS
SELECT AddGeometryColumn('raw_data','location','the_geom',4326,'POINT',2);


COMMENT ON COLUMN LOCATION.SUBMISSION_ID IS 'The identifier of the submission';
COMMENT ON COLUMN LOCATION.PROVIDER_ID IS 'The identifier of the data provider';
COMMENT ON COLUMN LOCATION.PLOT_CODE IS 'The identifier of the plot';
COMMENT ON COLUMN LOCATION.LAT IS 'The latitude (in decimal degrees)';
COMMENT ON COLUMN LOCATION.LONG IS 'The longitude (in decimal degrees)';
COMMENT ON COLUMN LOCATION.COMMUNES IS 'Communes concerned by the location';
COMMENT ON COLUMN LOCATION.DEPARTEMENT IS 'Département';
COMMENT ON COLUMN LOCATION.COMMENT IS 'A comment about the plot location';
COMMENT ON COLUMN LOCATION.LINE_NUMBER IS 'The position of the line of data in the original CSV file';
COMMENT ON COLUMN LOCATION.THE_GEOM IS 'The geometry of the location';


		
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
PROVIDER_ID          VARCHAR(36)          not null,
PLOT_CODE            VARCHAR(36)          not null,
CYCLE	             VARCHAR(36)          not null,
INV_DATE             DATE                 null,
IS_FOREST_PLOT		 CHAR(1)	          null,
COMMENT              VARCHAR(1000)        null,
LINE_NUMBER			 INTEGER			  null,
constraint PK_PLOT_DATA primary key (PROVIDER_ID, PLOT_CODE, CYCLE),
constraint FK_PLOT_DATA_ASSOCIATE_LOCATION foreign key (PROVIDER_ID, PLOT_CODE) references LOCATION (PROVIDER_ID, PLOT_CODE) on delete restrict on update restrict,
unique (PROVIDER_ID, PLOT_CODE, CYCLE)
);

COMMENT ON COLUMN PLOT_DATA.SUBMISSION_ID IS 'The identifier of the submission';
COMMENT ON COLUMN PLOT_DATA.PROVIDER_ID IS 'The identifier of the data provider';
COMMENT ON COLUMN PLOT_DATA.PLOT_CODE IS 'The identifier of the plot';
COMMENT ON COLUMN PLOT_DATA.CYCLE IS 'The cycle of inventory';
COMMENT ON COLUMN PLOT_DATA.INV_DATE IS 'The date of inventory';
COMMENT ON COLUMN PLOT_DATA.IS_FOREST_PLOT IS 'Is the plot a forest plot ?';
COMMENT ON COLUMN PLOT_DATA.COMMENT IS 'A comment about the plot';
COMMENT ON COLUMN PLOT_DATA.LINE_NUMBER IS 'The position of the line of data in the original CSV file';


/*==============================================================*/
/* Table : SPECIES_DATA                                         */
/*==============================================================*/
create table SPECIES_DATA (
SUBMISSION_ID        INT4                 not null,
PROVIDER_ID          VARCHAR(36)          not null,
PLOT_CODE            VARCHAR(36)          not null,
CYCLE	             VARCHAR(36)          not null,
SPECIES_CODE         VARCHAR(36)          not null,
ID_TAXON             VARCHAR(36)          not null,
BASAL_AREA			 FLOAT8	              null,
COMMENT              VARCHAR(255)         null,
LINE_NUMBER			 INTEGER			  null,
constraint PK_SPECIES_DATA primary key (PROVIDER_ID, PLOT_CODE, CYCLE, SPECIES_CODE),
constraint FK_SPECIES_ASSOCIATE_PLOT_DAT foreign key (PROVIDER_ID, PLOT_CODE, CYCLE) references PLOT_DATA (PROVIDER_ID, PLOT_CODE, CYCLE) on delete restrict on update restrict,
unique (PROVIDER_ID, PLOT_CODE, CYCLE, SPECIES_CODE)   
);

COMMENT ON COLUMN SPECIES_DATA.SUBMISSION_ID IS 'The identifier of the submission';
COMMENT ON COLUMN SPECIES_DATA.PROVIDER_ID IS 'The identifier of the data provider';
COMMENT ON COLUMN SPECIES_DATA.PLOT_CODE IS 'The identifier of the plot';
COMMENT ON COLUMN SPECIES_DATA.CYCLE IS 'The cycle of inventory';
COMMENT ON COLUMN SPECIES_DATA.SPECIES_CODE IS 'The code of the specie';
COMMENT ON COLUMN SPECIES_DATA.ID_TAXON IS 'Identifiant de taxon';
COMMENT ON COLUMN SPECIES_DATA.BASAL_AREA IS 'The proportion of surface covered by this specie on the plot (in m2/ha)';
COMMENT ON COLUMN SPECIES_DATA.COMMENT IS 'A comment about the species';
COMMENT ON COLUMN SPECIES_DATA.LINE_NUMBER IS 'The position of the line of data in the original CSV file';


  
/*==============================================================*/
/* Sequence : TREE_ID                                           */
/*==============================================================*/
CREATE SEQUENCE tree_id_seq
  INCREMENT 1
  MINVALUE 1
  MAXVALUE 9223372036854775807
  START 1
  CACHE 1;
  

/*==============================================================*/
/* Table : TREE_DATA                                         */
/*==============================================================*/
create table TREE_DATA (
SUBMISSION_ID        INT4                 not null,
PROVIDER_ID          VARCHAR(36)          not null,
PLOT_CODE            VARCHAR(36)          not null,
CYCLE	             VARCHAR(36)          not null,
TREE_ID              INT4                 not null default nextval('tree_id_seq'),
SPECIES_CODE		 VARCHAR(36)          null,
DBH					 FLOAT8	              null,
HEIGHT	 			 FLOAT8	              null,
COMMENT              VARCHAR(255)         null,
LINE_NUMBER			 INTEGER			  null,
constraint PK_TREE_DATA primary key (PROVIDER_ID, PLOT_CODE, CYCLE, TREE_ID),
constraint FK_TREE_ASSOCIATE_PLOT_DAT foreign key (PROVIDER_ID, PLOT_CODE, CYCLE) references PLOT_DATA (PROVIDER_ID, PLOT_CODE, CYCLE) on delete restrict on update restrict,
unique (PROVIDER_ID, PLOT_CODE, CYCLE, TREE_ID)   
);

COMMENT ON COLUMN TREE_DATA.SUBMISSION_ID IS 'The identifier of the submission';
COMMENT ON COLUMN TREE_DATA.PROVIDER_ID IS 'The identifier of the data provider';
COMMENT ON COLUMN TREE_DATA.PLOT_CODE IS 'The identifier of the plot';
COMMENT ON COLUMN TREE_DATA.CYCLE IS 'The cycle of inventory';
COMMENT ON COLUMN TREE_DATA.TREE_ID IS 'The identifier of the tree';
COMMENT ON COLUMN TREE_DATA.SPECIES_CODE IS 'The code of the specie of the tree';
COMMENT ON COLUMN TREE_DATA.DBH IS 'The diameter at breast height (in m)';
COMMENT ON COLUMN TREE_DATA.HEIGHT IS 'The tree height (in m)';
COMMENT ON COLUMN TREE_DATA.COMMENT IS 'A comment about the species';
COMMENT ON COLUMN TREE_DATA.LINE_NUMBER IS 'The position of the line of data in the original CSV file';







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
PROVIDER_ID          VARCHAR(36)          null,
PLOT_CODE            VARCHAR(36)          null,
FOUND_VALUE          VARCHAR(255)         null,
EXPECTED_VALUE       VARCHAR(255)         null,
ERROR_MESSAGE        VARCHAR(4000)        null,
_CREATIONDT          DATE                 null  DEFAULT current_timestamp,
constraint PK_CHECK_ERROR primary key (CHECK_ID, SUBMISSION_ID, CHECK_ERROR_ID)
);

COMMENT ON COLUMN CHECK_ERROR.CHECK_ERROR_ID IS 'The identifier of the error (autoincrement)';
COMMENT ON COLUMN CHECK_ERROR.CHECK_ID IS 'The identifier of the check';
COMMENT ON COLUMN CHECK_ERROR.SUBMISSION_ID IS 'The identifier of the submission checked';
COMMENT ON COLUMN CHECK_ERROR.LINE_NUMBER IS 'The line number of the data in the original CSV file';
COMMENT ON COLUMN CHECK_ERROR.SRC_FORMAT IS 'The logical name the data source (CSV file or table name)';
COMMENT ON COLUMN CHECK_ERROR.SRC_DATA IS 'The logical name of the data (column)';
COMMENT ON COLUMN CHECK_ERROR.PROVIDER_ID IS 'The identifier of the data provider';
COMMENT ON COLUMN CHECK_ERROR.PLOT_CODE IS 'The identifier of the plot';
COMMENT ON COLUMN CHECK_ERROR.FOUND_VALUE IS 'The erroreous value (if available)';
COMMENT ON COLUMN CHECK_ERROR.EXPECTED_VALUE IS 'The expected value (if available)';
COMMENT ON COLUMN CHECK_ERROR.ERROR_MESSAGE IS 'The error message';
COMMENT ON COLUMN CHECK_ERROR._CREATIONDT IS 'The creation date';

       
   




GRANT ALL ON SCHEMA raw_data TO ogam;
GRANT ALL ON TABLE raw_data.check_error_check_error_id_seq TO ogam;
GRANT ALL ON TABLE raw_data.submission_id_seq TO ogam;
GRANT ALL ON TABLE raw_data.tree_id_seq TO ogam;
GRANT ALL ON TABLE raw_data.check_error TO ogam;
GRANT ALL ON TABLE raw_data."location" TO ogam;
GRANT ALL ON TABLE raw_data.plot_data TO ogam;
GRANT ALL ON TABLE raw_data.species_data TO ogam;
GRANT ALL ON TABLE raw_data.tree_data TO ogam;
GRANT ALL ON TABLE raw_data.submission TO ogam;
GRANT ALL ON TABLE raw_data.submission_file TO ogam;
GRANT EXECUTE ON FUNCTION raw_data.geomfromcoordinate() TO ogam;
