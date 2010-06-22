
SET SEARCH_PATH = website, public, raw_data, metadata;

/*==============================================================*/
/* Table : PREDEFINED_REQUEST                                   */
/*==============================================================*/
create table PREDEFINED_REQUEST (
REQUEST_NAME             VARCHAR(50)          not null,
SCHEMA_CODE          	 VARCHAR(36)          not null,
DATASET_ID               VARCHAR(36)          not null,
DESCRIPTION              VARCHAR(500)         null,
constraint PK_PREDEFINED_REQUEST primary key (REQUEST_NAME)
);

alter table PREDEFINED_REQUEST
   add constraint FK_PREDEFINED_REQUEST_DATASET foreign key (DATASET_ID)
      references DATASET (DATASET_ID)
      on delete restrict on update restrict;

/*==============================================================*/
/* Table : PREDEFINED_REQUEST_CRITERIA_PARAMETER                */
/*==============================================================*/
create table PREDEFINED_REQUEST_CRITERIA_PARAMETER (
REQUEST_NAME           VARCHAR(50)          not null,
FORMAT         		   VARCHAR(36)          not null,
DATA                   VARCHAR(36)          not null,
PARAMETER_VALUE        VARCHAR(50)          not null,
constraint PK_PREDEFINED_REQUEST_CRITERIA_PARAMETER primary key (REQUEST_NAME, FORMAT, DATA, PARAMETER_VALUE)
);

/*==============================================================*/
/* Table : PREDEFINED_REQUEST_RESULT_PARAMETER                  */
/*==============================================================*/
create table PREDEFINED_REQUEST_RESULT_PARAMETER (
REQUEST_NAME           VARCHAR(50)          not null,
FORMAT         		   VARCHAR(36)          not null,
DATA                   VARCHAR(36)          not null,
constraint PK_PREDEFINED_REQUEST_RESULT_PARAMETER primary key (REQUEST_NAME, FORMAT, DATA)
);

      
