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
TYPE          		 VARCHAR(36)          not null,
STEP		 		 VARCHAR(36)          null,
STATUS    			 VARCHAR(36)          null,
COUNTRY_CODE         VARCHAR(36)          not null,
_CREATIONDT          DATE                 null DEFAULT current_timestamp,
_VALIDATIONDT        DATE                 null DEFAULT current_timestamp,
constraint PK_SUBMISSION primary key (SUBMISSION_ID)
);



/*==============================================================*/
/* Table : DATA_SUBMISSION                                      */
/*==============================================================*/
create table DATA_SUBMISSION (
SUBMISSION_ID        INT4                 not null,
REQUEST_ID           VARCHAR(36)          not null,
COMMENT              VARCHAR(255)         null,
USER_LOGIN           VARCHAR(50)          null,
constraint PK_DATA_SUBMISSION primary key (SUBMISSION_ID, REQUEST_ID)
);

/*==============================================================*/
/* Table : STRATA_SUBMISSION                               */
/*==============================================================*/
create table STRATA_SUBMISSION (
SUBMISSION_ID        INT4                 not null,
constraint PK_STRATA_SUBMISSION primary key (SUBMISSION_ID)
);

/*==============================================================*/
/* Table : LOCATION_SUBMISSION                                  */
/*==============================================================*/
create table LOCATION_SUBMISSION (
SUBMISSION_ID        INT4                 not null,
constraint PK_LOCATION_SUBMISSION primary key (SUBMISSION_ID)
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
CLUSTER_CODE         VARCHAR(36)          not null,
COUNTRY_CODE         VARCHAR(36)          not null,
LAT                  FLOAT8               null,
LONG                 FLOAT8               null,
IS_PLOT_COORDINATES_DEGRADED   CHAR(1)	  not null,
CELL_ID_NUTS0		 VARCHAR(36)          null,
CELL_ID_100          VARCHAR(36)          null,
CELL_ID_50           VARCHAR(36)          null,
COMMENT              VARCHAR(255)         null,
LINE_NUMBER			 INTEGER			  null,
constraint PK_LOCATION primary key (SUBMISSION_ID, PLOT_CODE),
UNIQUE (COUNTRY_CODE, PLOT_CODE)
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
STRATUM_CODE         VARCHAR(36)          null,
COUNTRY_CODE         VARCHAR(36)          not null,
PLOT_CODE            VARCHAR(36)          not null,
CYCLE	             VARCHAR(36)          not null,
REF_YEAR_BEGIN       INTEGER	          not null,
REF_YEAR_END	     INTEGER	          not null,
INV_DATE             DATE                 null,
STATISTICAL_WEIGHT   FLOAT8               null,
DOMAIN_FOREST        VARCHAR(36)			  null,
DOMAIN_BASAL_AREA    VARCHAR(36)			  null,
IS_FOREST_PLOT		 CHAR(1)	          null,
IS_PARTITIONNING_PLOT  CHAR(1)	          null,
COMMENT              VARCHAR(1000)        null,
LINE_NUMBER			 INTEGER			  null,
constraint PK_PLOT_DATA primary key (SUBMISSION_ID, COUNTRY_CODE, PLOT_CODE, CYCLE)
);



/*==============================================================*/
/* Table : SPECIES_DATA                                         */
/*==============================================================*/
create table SPECIES_DATA (
SUBMISSION_ID        INT4                 not null,
COUNTRY_CODE         VARCHAR(36)          not null,
PLOT_CODE            VARCHAR(36)          not null,
CYCLE	             VARCHAR(36)          not null,
SPECIES_CODE         VARCHAR(36)          not null,
DBH_CLASS            VARCHAR(36)          null,
NATIONAL_SPECIES_CODE         VARCHAR(36)          null,
BASAL_AREA			 FLOAT8	              null,
COMMENT              VARCHAR(255)         null,
LINE_NUMBER			 INTEGER			  null,
constraint PK_SPECIES_DATA primary key (SUBMISSION_ID, COUNTRY_CODE, PLOT_CODE, CYCLE, DBH_CLASS, SPECIES_CODE)
);


/*==============================================================*/
/* Table : STRATA                                          */
/*==============================================================*/
create table STRATA (
SUBMISSION_ID        INT4                 not null,
COUNTRY_CODE         VARCHAR(36)          not null,
STRATUM_CODE         VARCHAR(36)          not null,
TOTAL_STRATUM_AREA   FLOAT8               not null,
COMMENT              VARCHAR(255)         null,
constraint PK_STRATA primary key (COUNTRY_CODE, STRATUM_CODE)
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
COUNTRY_CODE         VARCHAR(36)          null,
PLOT_CODE            VARCHAR(36)          null,
FOUND_VALUE          VARCHAR(255)         null,
EXPECTED_VALUE       VARCHAR(255)         null,
ERROR_MESSAGE        VARCHAR(4000)        null,
_CREATIONDT          DATE                 null  DEFAULT current_timestamp,
constraint PK_CHECK_ERROR primary key (CHECK_ID, SUBMISSION_ID, CHECK_ERROR_ID)
);


/*========================================================================*/
/*	Add a function to fill the CELL_ID columns of the location table       */
/*========================================================================*/
CREATE OR REPLACE FUNCTION raw_data.calculatecellid(submissionId integer) returns void AS
$$	
	-- NUTS 0 (country code)
	UPDATE 	location
	SET    	CELL_ID_NUTS0 = group_mode.dst_code
	FROM 	metadata.group_mode 
	WHERE   group_mode.dst_unit = 'NUTS_COUNTRY_CODE' 
	AND     group_mode.src_code = location.country_code
	AND 	location.submission_id = $1;
		
	-- 100 km x 100 km
	UPDATE 	location
	SET    	CELL_ID_100 = grid_eu25_100k.CELL_ID
	FROM 	mapping.grid_eu25_100k
	WHERE   ST_Transform(location.the_geom,3035) && grid_eu25_100k.the_geom 
	AND 	ST_Intersects(ST_Transform(location.the_geom,3035), grid_eu25_100k.the_geom)
	AND 	location.submission_id = $1;
	
	-- 50 km x 50 km
	UPDATE 	location
	SET    	CELL_ID_50 = grid_eu25_50k.CELL_ID
	FROM 	mapping.grid_eu25_50k
	WHERE   ST_Transform(location.the_geom,3035) && grid_eu25_50k.the_geom 
	AND 	ST_Intersects(ST_Transform(location.the_geom,3035), grid_eu25_50k.the_geom)
	AND 	location.submission_id = $1;
	
	
$$
LANGUAGE SQL;
  
   
/*==============================================================*/
/* Table : CLUSTER                                              */
/*==============================================================*/
CREATE TABLE CLUSTER (
REQUEST_ID 		character varying(36) 	NOT NULL,
COUNTRY_CODE 	character varying(36) 	NOT NULL,
STRATUM_CODE 	character varying(36)	NOT NULL,
CLUSTER_CODE 	character varying(36)	NOT NULL,
STATISTICAL_WEIGHT double precision     NOT NULL,
NO_PLOT_IN_CLUSTER bigint,
constraint PK_CLUSTER primary key (REQUEST_ID, COUNTRY_CODE, STRATUM_CODE, CLUSTER_CODE, STATISTICAL_WEIGHT)
);

COMMENT ON COLUMN CLUSTER.REQUEST_ID IS 'The dataset identifier';
COMMENT ON COLUMN CLUSTER.COUNTRY_CODE IS 'The country code';
COMMENT ON COLUMN CLUSTER.STRATUM_CODE IS 'The stratum code';
COMMENT ON COLUMN CLUSTER.CLUSTER_CODE IS 'The cluster code';
COMMENT ON COLUMN CLUSTER.STATISTICAL_WEIGHT IS 'The value of the statistical weight inside the country';
COMMENT ON COLUMN CLUSTER.NO_PLOT_IN_CLUSTER IS 'The number of plots inside the cluster';


/*==============================================================*/
/* Table : STRATUM_CLUSTER                                      */
/*==============================================================*/
CREATE TABLE STRATUM_CLUSTER (
REQUEST_ID 		character varying(36) 	NOT NULL,
COUNTRY_CODE 	character varying(36) 	NOT NULL,
STRATUM_CODE 	character varying(36)	NOT NULL,
TOTAL_STRATUM_AREA double precision,
AVG_WEIGHT 		double precision,
NB_CLUSTERS		bigint,
constraint PK_STRATUM_CLUSTER primary key (REQUEST_ID, COUNTRY_CODE, STRATUM_CODE)
);

COMMENT ON COLUMN STRATUM_CLUSTER.REQUEST_ID IS 'The dataset identifier';
COMMENT ON COLUMN STRATUM_CLUSTER.COUNTRY_CODE IS 'The country code';
COMMENT ON COLUMN STRATUM_CLUSTER.STRATUM_CODE IS 'The stratum code';
COMMENT ON COLUMN STRATUM_CLUSTER.TOTAL_STRATUM_AREA IS 'The total area of the stratum';
COMMENT ON COLUMN STRATUM_CLUSTER.AVG_WEIGHT IS 'The average weight of the clusters in the stratum';
COMMENT ON COLUMN STRATUM_CLUSTER.NB_CLUSTERS IS 'The number of clusters in the stratum';


/*==============================================================*/
/* Table : STANDARDIZED_CLUSTER                                 */
/*==============================================================*/
CREATE TABLE STANDARDIZED_CLUSTER (
REQUEST_ID 		character varying(36) 	NOT NULL,
COUNTRY_CODE 	character varying(36) 	NOT NULL,
STRATUM_CODE 	character varying(36)	NOT NULL,
CLUSTER_CODE 	character varying(36)	NOT NULL,
STANDARDISED_WEIGHT double precision    NOT NULL,
NO_PLOT_IN_CLUSTER bigint,
constraint PK_STANDARDIZED_CLUSTER primary key (REQUEST_ID, COUNTRY_CODE, STRATUM_CODE, CLUSTER_CODE, STANDARDISED_WEIGHT)
);

COMMENT ON COLUMN STANDARDIZED_CLUSTER.REQUEST_ID IS 'The dataset identifier';
COMMENT ON COLUMN STANDARDIZED_CLUSTER.COUNTRY_CODE IS 'The country code';
COMMENT ON COLUMN STANDARDIZED_CLUSTER.STRATUM_CODE IS 'The stratum code';
COMMENT ON COLUMN STANDARDIZED_CLUSTER.CLUSTER_CODE IS 'The cluster code';
COMMENT ON COLUMN STANDARDIZED_CLUSTER.NO_PLOT_IN_CLUSTER IS 'The number of plots inside the cluster';
COMMENT ON COLUMN STANDARDIZED_CLUSTER.STANDARDISED_WEIGHT IS 'The value of the standardised statistical weight of the cluster';

    

/* Non créé sinon on ne peut plus mettre à jour les checks
alter table CHECK_ERROR
   add constraint FK_CHECK_ER_ASSOCIATI_CHECKS foreign key (CHECK_ID)
      references metadata.CHECKS (CHECK_ID)
      on delete restrict on update restrict;
*/

alter table LOCATION
   add constraint FK_LOCATION_ASSOCIATI_LOCATION foreign key (SUBMISSION_ID)
      references LOCATION_SUBMISSION (SUBMISSION_ID)
      on delete restrict on update restrict;
      
alter table PLOT_DATA
   add constraint FK_PLOT_DATA_ASSOCIATE_LOCATION foreign key (PLOT_CODE, COUNTRY_CODE)
      references LOCATION (PLOT_CODE, COUNTRY_CODE)
      on delete restrict on update restrict;
     
alter table PLOT_DATA
   add constraint FK_PLOT_DATA_ASSOCIATE_STRATA foreign key (STRATUM_CODE, COUNTRY_CODE)
      references STRATA (STRATUM_CODE, COUNTRY_CODE)
      on delete restrict on update restrict;


      /*
alter table DATA_SUBMISSION
   add constraint FK_SUBMISSI_COMPOSED__JRC_REQU foreign key (REQUEST_ID)
      references metadata.JRC_REQUEST (REQUEST_ID)
      on delete restrict on update restrict;
      */

      
alter table SPECIES_DATA
   add constraint FK_SPECIES_ASSOCIATE_PLOT_DAT foreign key (SUBMISSION_ID, COUNTRY_CODE, PLOT_CODE, CYCLE)
      references PLOT_DATA (SUBMISSION_ID, COUNTRY_CODE, PLOT_CODE, CYCLE)
      on delete restrict on update restrict;     
      
      
-- Ajout d'indexes
CREATE INDEX LOCATION_PLOT_CODE_IDX ON location (country_code, plot_code);
CREATE INDEX PLOT_DATA_PLOT_CODE_IDX ON plot_data (country_code, plot_code);
CREATE INDEX SPECIES_DATA_PLOT_CODE_IDX ON species_data (country_code, plot_code);
CREATE INDEX standardized_cluster_IDX ON standardized_cluster (country_code, cluster_code);





GRANT ALL ON SCHEMA raw_data TO eforest;