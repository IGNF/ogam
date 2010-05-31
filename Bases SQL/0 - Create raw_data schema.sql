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


alter table LOCATION
   add constraint FK_LOCATION_ASSOCIATI_LOCATION foreign key (SUBMISSION_ID)
      references LOCATION_SUBMISSION (SUBMISSION_ID)
      on delete restrict on update restrict;
      
alter table PLOT_DATA
   add constraint FK_PLOT_DATA_ASSOCIATE_LOCATION foreign key (PLOT_CODE, COUNTRY_CODE)
      references LOCATION (PLOT_CODE, COUNTRY_CODE)
      on delete restrict on update restrict;
           
alter table SPECIES_DATA
   add constraint FK_SPECIES_ASSOCIATE_PLOT_DAT foreign key (SUBMISSION_ID, COUNTRY_CODE, PLOT_CODE, CYCLE)
      references PLOT_DATA (SUBMISSION_ID, COUNTRY_CODE, PLOT_CODE, CYCLE)
      on delete restrict on update restrict;     
      
      
-- Ajout d'indexes
CREATE INDEX LOCATION_PLOT_CODE_IDX ON location (country_code, plot_code);
CREATE INDEX PLOT_DATA_PLOT_CODE_IDX ON plot_data (country_code, plot_code);
CREATE INDEX SPECIES_DATA_PLOT_CODE_IDX ON species_data (country_code, plot_code);

