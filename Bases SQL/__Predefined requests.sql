
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
      
COMMENT ON COLUMN PREDEFINED_REQUEST.REQUEST_NAME IS 'The request name';
COMMENT ON COLUMN PREDEFINED_REQUEST.SCHEMA_CODE IS 'The schema used by this request';
COMMENT ON COLUMN PREDEFINED_REQUEST.DATASET_ID IS 'The dataset used by this request';
COMMENT ON COLUMN PREDEFINED_REQUEST.DESCRIPTION IS 'The description of the request';

/*==============================================================*/
/* Table : PREDEFINED_REQUEST_CRITERIA_PARAMETER                */
/*==============================================================*/
create table PREDEFINED_REQUEST_CRITERIA_PARAMETER (
REQUEST_NAME           VARCHAR(50)          not null,
FORMAT         		   VARCHAR(36)          not null,
DATA                   VARCHAR(36)          not null,
VALUE        		   VARCHAR(500)          not null,
constraint PK_PREDEFINED_REQUEST_CRITERIA_PARAMETER primary key (REQUEST_NAME, FORMAT, DATA)
);

COMMENT ON COLUMN PREDEFINED_REQUEST_CRITERIA_PARAMETER.REQUEST_NAME IS 'The request name';
COMMENT ON COLUMN PREDEFINED_REQUEST_CRITERIA_PARAMETER.FORMAT IS 'The form format of the criteria';
COMMENT ON COLUMN PREDEFINED_REQUEST_CRITERIA_PARAMETER.DATA IS 'The form field of the criteria';
COMMENT ON COLUMN PREDEFINED_REQUEST_CRITERIA_PARAMETER.VALUE IS 'The field value (multiple values are separated by a semicolon)';

/*==============================================================*/
/* Table : PREDEFINED_REQUEST_RESULT_PARAMETER                  */
/*==============================================================*/
create table PREDEFINED_REQUEST_RESULT_PARAMETER (
REQUEST_NAME           VARCHAR(50)          not null,
FORMAT         		   VARCHAR(36)          not null,
DATA                   VARCHAR(36)          not null,
constraint PK_PREDEFINED_REQUEST_RESULT_PARAMETER primary key (REQUEST_NAME, FORMAT, DATA)
);

COMMENT ON COLUMN PK_PREDEFINED_REQUEST_RESULT_PARAMETER.REQUEST_NAME IS 'The request name';
COMMENT ON COLUMN PK_PREDEFINED_REQUEST_RESULT_PARAMETER.FORMAT IS 'The form format of the result column';
COMMENT ON COLUMN PK_PREDEFINED_REQUEST_RESULT_PARAMETER.DATA IS 'The form field of the result column';

      
