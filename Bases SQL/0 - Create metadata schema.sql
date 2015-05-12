CREATE SCHEMA metadata;

SET SEARCH_PATH = metadata, public;


/*==============================================================*/
/* Table : DATA                                                 */
/*==============================================================*/
create table DATA (
DATA                 VARCHAR(36)          not null,
UNIT                 VARCHAR(36)          not null,
LABEL                VARCHAR(60)          null,
DEFINITION           VARCHAR(255)         null,
COMMENT              VARCHAR(255)         null,
constraint PK_DATA primary key (DATA)
);

COMMENT ON COLUMN DATA.DATA IS 'The logical name of the data';
COMMENT ON COLUMN DATA.UNIT IS 'The unit of the data';
COMMENT ON COLUMN DATA.LABEL IS 'The label of the data';
COMMENT ON COLUMN DATA.DEFINITION IS 'The definition of the data (used in tooltips)';
COMMENT ON COLUMN DATA.COMMENT IS 'Any comment on the data';


/*==============================================================*/
/* Table : UNIT                                                 */
/*==============================================================*/
create table UNIT (
UNIT                 VARCHAR(36)          not null,
TYPE                 VARCHAR(36)          null,
SUBTYPE              VARCHAR(36)          null,
LABEL                VARCHAR(60)          null,
DEFINITION           VARCHAR(255)         null,
constraint PK_UNIT primary key (UNIT)
);

COMMENT ON COLUMN UNIT.UNIT IS 'The logical name of the unit';
COMMENT ON COLUMN UNIT.TYPE IS 'The type of the unit (BOOLEAN, CODE, ARRAY (of code), COORDINATE, DATE, INTEGER, NUMERIC or STRING)';
COMMENT ON COLUMN UNIT.SUBTYPE IS 'The sub-type of the unit (MODE, TREE or DYNAMIC for CODE or ARRAY, RANGE for numeric)';
COMMENT ON COLUMN UNIT.LABEL IS 'The label of the unit';
COMMENT ON COLUMN UNIT.DEFINITION IS 'The definition of the unit';


/*==============================================================*/
/* Table : MODE                                                 */
/*==============================================================*/
create table MODE (
UNIT                 VARCHAR(36)             not null,
CODE                 VARCHAR(36)             not null,
POSITION           	 INT4                 null,
LABEL                VARCHAR(255)         null,
DEFINITION           VARCHAR(255)         null,
constraint PK_MODE primary key (UNIT, CODE)
);

COMMENT ON COLUMN MODE.UNIT IS 'The unit';
COMMENT ON COLUMN MODE.CODE IS 'The code';
COMMENT ON COLUMN MODE.POSITION IS 'The position of this mode in the list';
COMMENT ON COLUMN MODE.LABEL IS 'The label';
COMMENT ON COLUMN MODE.DEFINITION IS 'The definition of the mode';

/*==============================================================*/
/* Table : GROUP_MODE                                                 */
/*==============================================================*/
create table GROUP_MODE (
SRC_UNIT                 VARCHAR(36)             not null,
SRC_CODE                 VARCHAR(36)             not null,
DST_UNIT           	     VARCHAR(36)             not null,
DST_CODE                 VARCHAR(36)             not null,
COMMENT                  VARCHAR(255)            null,
constraint PK_GROUP_MODE primary key (SRC_UNIT, SRC_CODE, DST_UNIT, DST_CODE)
);

COMMENT ON COLUMN GROUP_MODE.SRC_UNIT IS 'The source unit';
COMMENT ON COLUMN GROUP_MODE.SRC_CODE IS 'The source code';
COMMENT ON COLUMN GROUP_MODE.DST_UNIT IS 'The destination unit';
COMMENT ON COLUMN GROUP_MODE.DST_CODE IS 'The destination code';
COMMENT ON COLUMN GROUP_MODE.COMMENT IS 'Any comment';



/*==============================================================*/
/* Table : MODE_TREE                                            */
/*==============================================================*/
create table MODE_TREE (
UNIT                 VARCHAR(36)          not null,
CODE                 VARCHAR(36)          not null,
PARENT_CODE          VARCHAR(36)          null,
LABEL                VARCHAR(255)          null,
DEFINITION           VARCHAR(255)         null,
POSITION			 INTEGER              null,
IS_LEAF			     CHAR(1)              null,
constraint PK_MODE_TREE primary key (UNIT, CODE)
);

COMMENT ON COLUMN MODE_TREE.UNIT IS 'The unit';
COMMENT ON COLUMN MODE_TREE.CODE IS 'The code of the mode';
COMMENT ON COLUMN MODE_TREE.PARENT_CODE IS 'The parent code';
COMMENT ON COLUMN MODE_TREE.LABEL IS 'The label';
COMMENT ON COLUMN MODE_TREE.DEFINITION IS 'The definition of the mode';
COMMENT ON COLUMN MODE_TREE.POSITION IS 'The position of the mode';
COMMENT ON COLUMN MODE_TREE.IS_LEAF IS 'Indicate if the node is a leaf (1 for true)';


CREATE INDEX mode_tree_parent_code_idx
  ON metadata.mode_tree
  USING btree
  (parent_code);
  
CREATE INDEX mode_tree_parent_label_idx
  ON metadata.mode_tree USING btree (unaccent_string(label));
  
/*==============================================================*/
/* Table : MODE_TAXREF                                          */
/*==============================================================*/
create table MODE_TAXREF (
UNIT                 VARCHAR(36)          not null,
CODE                 VARCHAR(36)          not null,
PARENT_CODE          VARCHAR(36)          null,
NAME                 VARCHAR(500)         null,
COMPLETE_NAME        VARCHAR(500)         null,
VERNACULAR_NAME      VARCHAR(500)         null,
IS_LEAF			     CHAR(1)              null,
IS_REFERENCE	     CHAR(1)              null,
constraint PK_MODE_TAXREF primary key (UNIT, CODE)
);


COMMENT ON COLUMN MODE_TAXREF.UNIT IS 'The unit';
COMMENT ON COLUMN MODE_TAXREF.CODE IS 'The code of the mode';
COMMENT ON COLUMN MODE_TAXREF.PARENT_CODE IS 'The parent code';
COMMENT ON COLUMN MODE_TAXREF.NAME IS 'The short name of the taxon';
COMMENT ON COLUMN MODE_TAXREF.COMPLETE_NAME IS 'The complete name of the taxon (name and author)';
COMMENT ON COLUMN MODE_TAXREF.VERNACULAR_NAME IS 'The vernacular name';
COMMENT ON COLUMN MODE_TAXREF.IS_LEAF IS 'Indicate if the node is a taxon (1 for true)';
COMMENT ON COLUMN MODE_TAXREF.IS_REFERENCE IS 'Indicate if the taxon is a reference (1) or a synonym (0)';


CREATE INDEX mode_taxref_parent_code_idx
  ON metadata.mode_taxref USING btree (parent_code);
  
CREATE INDEX mode_taxref_NAME_idx
  ON metadata.mode_taxref USING btree (unaccent_string(NAME));
  
CREATE INDEX mode_taxref_COMPLETE_NAME_idx
  ON metadata.mode_taxref USING btree (unaccent_string(COMPLETE_NAME));
  
CREATE INDEX mode_taxref_VERNACULAR_NAME_idx
  ON metadata.mode_taxref USING btree (unaccent_string(VERNACULAR_NAME));


/*==============================================================*/
/* Table : DYNAMODE                                            */
/*==============================================================*/
create table DYNAMODE (
UNIT                 VARCHAR(36)          not null,
SQL                  TEXT          not null,
constraint PK_DYNAMODE primary key (UNIT)
);

COMMENT ON COLUMN DYNAMODE.UNIT IS 'The unit';
COMMENT ON COLUMN DYNAMODE.SQL IS 'The sql query that will generate the list of codes. A sorted list of uniques CODE, LABEL is expected';




/*==============================================================*/
/* Table : RANGE                                                */
/*==============================================================*/
create table RANGE (
UNIT                 VARCHAR(36)             not null,
MIN                  FLOAT8               null,
MAX                  FLOAT8               null,
constraint PK_RANGE primary key (UNIT)
);

COMMENT ON COLUMN RANGE.UNIT IS 'The unit';
COMMENT ON COLUMN RANGE.MIN IS 'The minimal value of the range';
COMMENT ON COLUMN RANGE.MAX IS 'The maximal value of the range';


/*==============================================================*/
/* Table : FORMAT                                               */
/*==============================================================*/
create table FORMAT (
FORMAT               VARCHAR(36)             not null,
TYPE                 VARCHAR(36)             null,
constraint PK_FORMAT primary key (FORMAT)
);

COMMENT ON COLUMN FORMAT.FORMAT IS 'The logical name of the format';
COMMENT ON COLUMN FORMAT.TYPE IS 'The type of the format (FILE, FORM or TABLE)';

/*==============================================================*/
/* Table : FILE_FORMAT                                          */
/*==============================================================*/
create table FILE_FORMAT (
FORMAT               VARCHAR(36)            not null,
FILE_EXTENSION       VARCHAR(36)          	null,
FILE_TYPE            VARCHAR(36)          not null,
POSITION 			 INTEGER	          not null,
LABEL				 VARCHAR(255)	      null,
constraint PK_FILE_FORMAT primary key (FORMAT)
);

COMMENT ON COLUMN FILE_FORMAT.FORMAT IS 'The logical name of the format';
COMMENT ON COLUMN FILE_FORMAT.FILE_EXTENSION IS 'The extension of the file (not used)';
COMMENT ON COLUMN FILE_FORMAT.FILE_TYPE IS 'The identifier of the type of file (used to identify the file during the upload process)';
COMMENT ON COLUMN FILE_FORMAT.POSITION IS 'The position of the file in the upload screen';
COMMENT ON COLUMN FILE_FORMAT.LABEL IS 'The label associed with the file in the upload screen';

/*==============================================================*/
/* Table : FORM_FORMAT                                          */
/*==============================================================*/
create table FORM_FORMAT (
FORMAT               VARCHAR(36)          not null,
LABEL                VARCHAR(60)          null,
DEFINITION           VARCHAR(255)         null,
POSITION 			 INTEGER	          not null,
IS_OPENED 			 CHAR(1)	          null,
constraint PK_FORM_FORMAT primary key (FORMAT)
);

COMMENT ON COLUMN FORM_FORMAT.FORMAT IS 'The logical name of the format';
COMMENT ON COLUMN FORM_FORMAT.LABEL IS 'The label of the form displayed in the query screen';
COMMENT ON COLUMN FORM_FORMAT.DEFINITION IS 'The definition of the form';
COMMENT ON COLUMN FORM_FORMAT.POSITION IS 'The position of the form in the query screen';
COMMENT ON COLUMN FORM_FORMAT.IS_OPENED IS 'Indicate if the form is displayed as opened by default';

/*==============================================================*/
/* Table : TABLE_FORMAT                                         */
/*==============================================================*/
create table TABLE_FORMAT (
FORMAT               VARCHAR(36)          not null,
TABLE_NAME           VARCHAR(36)          null,
SCHEMA_CODE          VARCHAR(36)          null,
PRIMARY_KEY          VARCHAR(255)         null,
LABEL				 VARCHAR(255)         null,
constraint PK_TABLE_FORMAT primary key (FORMAT)
);

COMMENT ON COLUMN TABLE_FORMAT.FORMAT IS 'The logical name of the format';
COMMENT ON COLUMN TABLE_FORMAT.TABLE_NAME IS 'The real name of the table';
COMMENT ON COLUMN TABLE_FORMAT.SCHEMA_CODE IS 'The code of the schema (not used)';
COMMENT ON COLUMN TABLE_FORMAT.PRIMARY_KEY IS 'The list of table fields used to identify one line of this table (separated by commas)';
COMMENT ON COLUMN TABLE_FORMAT.LABEL IS 'A label for the table (displayed on the detail panel)';



/*==============================================================*/
/* Table : FIELD                                                */
/*==============================================================*/
create table FIELD (
DATA                 VARCHAR(36)             not null,
FORMAT               VARCHAR(36)             not null,
TYPE                 VARCHAR(36)             null,
constraint PK_FIELD primary key (DATA, FORMAT)
);

COMMENT ON COLUMN FIELD.DATA IS 'The logical name of the field';
COMMENT ON COLUMN FIELD.FORMAT IS 'The name of the format containing this field';
COMMENT ON COLUMN FIELD.TYPE IS 'The type of the field (FILE, FORM or TABLE)';

/*==============================================================*/
/* Table : FILE_FIELD                                           */
/*==============================================================*/
create table FILE_FIELD (
DATA                 VARCHAR(36)          not null,
FORMAT               VARCHAR(36)          not null,
IS_MANDATORY         CHAR(1)          	  null,
MASK                 VARCHAR(100)         null,
POSITION             INT4                 null,
constraint PK_FILE_FIELD primary key (DATA, FORMAT)
);

COMMENT ON COLUMN FILE_FIELD.DATA IS 'The logical name of the field';
COMMENT ON COLUMN FILE_FIELD.FORMAT IS 'The name of the file format containing this field';
COMMENT ON COLUMN FILE_FIELD.IS_MANDATORY IS 'Is the field mandatory?';
COMMENT ON COLUMN FILE_FIELD.MASK IS 'A mask used to validate the data';
COMMENT ON COLUMN FILE_FIELD.POSITION IS 'The position of this field in the file';

/*==============================================================*/
/* Table : FORM_FIELD                                           */
/*==============================================================*/
create table FORM_FIELD (
DATA                 VARCHAR(36)          not null,
FORMAT               VARCHAR(36)          not null,
IS_CRITERIA          CHAR(1)              null,
IS_RESULT            CHAR(1)              null,
INPUT_TYPE           VARCHAR(128)         null,
POSITION             INT4                 null,
IS_DEFAULT_CRITERIA  CHAR(1)              null,
IS_DEFAULT_RESULT    CHAR(1)              null,
DEFAULT_VALUE        VARCHAR(255)         null,
DECIMALS       		 INT		          null,
MASK                 VARCHAR(100)         null,
constraint PK_FORM_FIELD primary key (DATA, FORMAT)
);

COMMENT ON COLUMN FORM_FIELD.DATA IS 'The logical name of the field';
COMMENT ON COLUMN FORM_FIELD.FORMAT IS 'The name of the form format containing this field';
COMMENT ON COLUMN FORM_FIELD.IS_CRITERIA IS 'Can this field be used as a criteria?';
COMMENT ON COLUMN FORM_FIELD.IS_RESULT IS 'Can this field be displayed as a result?';
COMMENT ON COLUMN FORM_FIELD.INPUT_TYPE IS 'The input type associed with this field (TEXT, DATE, GEOM, NUMERIC, SELECT, CHECKBOX, MULTIPLE, TREE)';
COMMENT ON COLUMN FORM_FIELD.POSITION IS 'The position of this field in the form';
COMMENT ON COLUMN FORM_FIELD.IS_DEFAULT_CRITERIA IS 'Is this field selected by default as a criteria?';
COMMENT ON COLUMN FORM_FIELD.IS_DEFAULT_RESULT IS 'Is this field selected by default as a result?';
COMMENT ON COLUMN FORM_FIELD.DEFAULT_VALUE IS 'The default value for the criteria (multiple values are separated by a semicolon)';
COMMENT ON COLUMN FORM_FIELD.DECIMALS IS 'The number of decimals to be displayed for numeric values';
COMMENT ON COLUMN FORM_FIELD.MASK IS 'A mask used to validate the data (the format for date values)';

/*==============================================================*/
/* Table : TABLE_FIELD                                          */
/*==============================================================*/
create table TABLE_FIELD (
DATA                 VARCHAR(36)          not null,
FORMAT               VARCHAR(36)          not null,
COLUMN_NAME          VARCHAR(36)          null,
IS_CALCULATED        CHAR(1)		      null,
IS_EDITABLE          CHAR(1)		      null,
IS_INSERTABLE        CHAR(1)		      null,
IS_MANDATORY         CHAR(1)		      null,
POSITION             INT4                 null,
COMMENT		         VARCHAR(255)         null,
constraint PK_TABLE_FIELD primary key (DATA, FORMAT)
);

COMMENT ON COLUMN TABLE_FIELD.DATA IS 'The logical name of the field';
COMMENT ON COLUMN TABLE_FIELD.FORMAT IS 'The name of the table format containing this field';
COMMENT ON COLUMN TABLE_FIELD.COLUMN_NAME IS 'The real name of the column';
COMMENT ON COLUMN TABLE_FIELD.IS_CALCULATED IS 'Indicate if the field should be provided for insertion (value = 0) or if it is calculated by a trigger function (value = 1)';
COMMENT ON COLUMN TABLE_FIELD.IS_EDITABLE IS 'Indicate if the field can be edited in the edition module (value = 1)';
COMMENT ON COLUMN TABLE_FIELD.IS_INSERTABLE IS 'Indicate if the field can be inserted/added in the edition module (value = 1)';
COMMENT ON COLUMN TABLE_FIELD.IS_MANDATORY IS 'Indicate if the field is mandatory in the edition module. PKs are always mandatory.';
COMMENT ON COLUMN TABLE_FIELD.POSITION IS 'The position of this field in the table (for the detail panel and the edition module)';
COMMENT ON COLUMN TABLE_FIELD.COMMENT IS 'Any comment';

/*==============================================================*/
/* Table : FIELD_MAPPING                                        */
/*==============================================================*/
create table FIELD_MAPPING (
SRC_DATA             VARCHAR(36)             not null,
SRC_FORMAT           VARCHAR(36)             not null,
DST_DATA             VARCHAR(36)             not null,
DST_FORMAT           VARCHAR(36)             not null,
MAPPING_TYPE         VARCHAR(36)             not null,
constraint PK_FIELD_MAPPING primary key (SRC_DATA, SRC_FORMAT, DST_DATA, DST_FORMAT)
);

COMMENT ON COLUMN FIELD_MAPPING.SRC_DATA IS 'The source data';
COMMENT ON COLUMN FIELD_MAPPING.SRC_FORMAT IS 'The source format';
COMMENT ON COLUMN FIELD_MAPPING.DST_DATA IS 'The destination data';
COMMENT ON COLUMN FIELD_MAPPING.DST_FORMAT IS 'The destination format';
COMMENT ON COLUMN FIELD_MAPPING.MAPPING_TYPE IS 'The type of mapping (FORM, FIELD)';


/*==============================================================*/
/* Table : DATASET                                              */
/*==============================================================*/
create table DATASET (
DATASET_ID           VARCHAR(36)          not null,
LABEL                VARCHAR(255)         null,
IS_DEFAULT           CHAR(1)              null,
DEFINITION           VARCHAR(512)         null,
constraint PK_DATASET primary key (DATASET_ID)
);

COMMENT ON COLUMN DATASET.DATASET_ID IS 'The logical name of the dataset';
COMMENT ON COLUMN DATASET.LABEL IS 'The label of the dataset';
COMMENT ON COLUMN DATASET.IS_DEFAULT IS 'Indicate if the dataset is selected by default (only 1 possible)';
COMMENT ON COLUMN DATASET.DEFINITION IS 'The definition of the dataset (used in tooltips)';

/*==============================================================*/
/* Table : DATASET_FILES                                        */
/*==============================================================*/
create table DATASET_FILES (
DATASET_ID           VARCHAR(36)          not null,
FORMAT               VARCHAR(36)          not null,
constraint PK_DATASET_FILES primary key (DATASET_ID, FORMAT)
);

COMMENT ON COLUMN DATASET_FILES.DATASET_ID IS 'The logical name of the dataset';
COMMENT ON COLUMN DATASET_FILES.FORMAT IS 'The file format associed with the dataset (used when importing data)';



/*==============================================================*/
/* Table : DATASET_FIELDS                                       */
/*==============================================================*/
create table DATASET_FIELDS (
DATASET_ID           VARCHAR(36)          not null,
SCHEMA_CODE          VARCHAR(36)          not null,
FORMAT               VARCHAR(36)          not null,
DATA                 VARCHAR(36)          not null,
constraint PK_DATASET_FIELDS primary key (DATASET_ID, SCHEMA_CODE, FORMAT, DATA)
);

COMMENT ON COLUMN DATASET_FIELDS.DATASET_ID IS 'The logical name of the dataset';
COMMENT ON COLUMN DATASET_FIELDS.SCHEMA_CODE IS 'The code of the schema';
COMMENT ON COLUMN DATASET_FIELDS.FORMAT IS 'The table format associed with the dataset';
COMMENT ON COLUMN DATASET_FIELDS.DATA IS 'The table field associed with the dataset (used when querying data)';


/*==============================================================*/
/* Table : TABLE_SCHEMA                                         */
/*==============================================================*/
create table TABLE_SCHEMA (
SCHEMA_CODE          VARCHAR(36)             not null,
SCHEMA_NAME          VARCHAR(36)             not null,
LABEL                VARCHAR(36)             null,
DESCRIPTION          VARCHAR(255)            null,
constraint PK_TABLE_SCHEMA primary key (SCHEMA_CODE)
);

COMMENT ON COLUMN TABLE_SCHEMA.SCHEMA_CODE IS 'The code of the schema';
COMMENT ON COLUMN TABLE_SCHEMA.SCHEMA_CODE IS 'The name of the schema (name in the database)';
COMMENT ON COLUMN TABLE_SCHEMA.LABEL IS 'The label of the schema';
COMMENT ON COLUMN TABLE_SCHEMA.DESCRIPTION IS 'The description of the schema';


/*==============================================================*/
/* Table : TABLE_TREE                                           */
/*==============================================================*/
create table TABLE_TREE (
SCHEMA_CODE          VARCHAR(36)             not null,
CHILD_TABLE          VARCHAR(36)             not null,
PARENT_TABLE         VARCHAR(36)             not null,
JOIN_KEY             VARCHAR(255)            null,
COMMENT              VARCHAR(255)            null,
constraint PK_TABLE_TREE primary key (SCHEMA_CODE, CHILD_TABLE)
);

COMMENT ON COLUMN TABLE_TREE.SCHEMA_CODE IS 'The code of the schema';
COMMENT ON COLUMN TABLE_TREE.CHILD_TABLE IS 'The name of the child table (should correspond to a table format)';
COMMENT ON COLUMN TABLE_TREE.PARENT_TABLE IS 'The name of the parent table (should correspond to a table format, * when this is a root table)';
COMMENT ON COLUMN TABLE_TREE.JOIN_KEY IS 'The list of table fields used to make the join between the table (separated by commas)';
COMMENT ON COLUMN TABLE_TREE.COMMENT IS 'Any comment';




/*==============================================================*/
/* Table : CHECKS                                               */
/*==============================================================*/
create table CHECKS (
CHECK_ID             INT4                 not null,
STEP                 VARCHAR(50)          null,
NAME                 VARCHAR(50)          null,
LABEL                VARCHAR(60)          null,
DESCRIPTION          VARCHAR(500)         null,
STATEMENT            VARCHAR(4000)        null,
IMPORTANCE           VARCHAR(36)          null,
_CREATIONDT          timestamp without time zone DEFAULT now(),
constraint PK_CHECKS primary key (CHECK_ID)
);

COMMENT ON COLUMN CHECKS.CHECK_ID IS 'The identifier of the check';
COMMENT ON COLUMN CHECKS.STEP IS 'The step of the check (COMPLIANCE or CONFORMITY)';
COMMENT ON COLUMN CHECKS.NAME IS 'The name the check';
COMMENT ON COLUMN CHECKS.LABEL IS 'The label of the check';
COMMENT ON COLUMN CHECKS.DESCRIPTION IS 'The description the check';
COMMENT ON COLUMN CHECKS.STATEMENT IS 'The SQL statement corresponding to the check';
COMMENT ON COLUMN CHECKS.IMPORTANCE IS 'The importance of the check (WARNING or ERROR)';
COMMENT ON COLUMN CHECKS._CREATIONDT IS 'The creation date';


/*==============================================================*/
/* Table : CHECKS_PER_PROVIDER                                  */
/* A '*' provider code means that the check is always done      */
/*==============================================================*/
create table CHECKS_PER_PROVIDER (
CHECK_ID             INT4                 not null,
DATASET_ID           VARCHAR(36)          not null,
PROVIDER_ID          VARCHAR(36)          null,
constraint PK_CHECKS_PER_PROVIDER primary key (CHECK_ID, DATASET_ID, PROVIDER_ID)
);

COMMENT ON COLUMN CHECKS_PER_PROVIDER.CHECK_ID IS 'The identifier of the check';
COMMENT ON COLUMN CHECKS_PER_PROVIDER.DATASET_ID IS 'The identifier of the dataset';
COMMENT ON COLUMN CHECKS_PER_PROVIDER.PROVIDER_ID IS 'The identifier of the provider (* for all providers)';






/*==============================================================*/
/* Table : PROCESS                                              */
/*==============================================================*/
CREATE TABLE metadata.process
(
  process_id character varying(50) NOT NULL, -- The name/identifier of the post-processing treatment
  step character varying(50), -- The step of the process (INTEGRATION or HARMONIZATION)
  label character varying(60), -- The label of the process
  description character varying(500), -- The description the process
  "statement" character varying(4000), -- The SQL statement corresponding to the process
  _creationdt timestamp without time zone DEFAULT now(), -- The creation date
  CONSTRAINT pk_process PRIMARY KEY (process_id)
)
WITH (
  OIDS=FALSE
);


COMMENT ON COLUMN metadata.process.process_id IS 'The name/identifier of the post-processing treatment';
COMMENT ON COLUMN metadata.process.step IS 'The step of the process (INTEGRATION or HARMONIZATION)';
COMMENT ON COLUMN metadata.process.label IS 'The label of the process';
COMMENT ON COLUMN metadata.process.description IS 'The description the process';
COMMENT ON COLUMN metadata.process."statement" IS 'The SQL statement corresponding to the process';
COMMENT ON COLUMN metadata.process._creationdt IS 'The creation date';


SET SEARCH_PATH = metadata, public;

/*==============================================================*/
/* Table : TRANSLATION                                          */
/*==============================================================*/
create table TRANSLATION (
TABLE_FORMAT            VARCHAR(36)             not null,
ROW_PK                  VARCHAR(255)            not null,
LANG                    VARCHAR(36)             not null,
LABEL                   VARCHAR(255)            null,
DEFINITION              VARCHAR(255)            null,
constraint PK_TRANSLATION primary key (TABLE_FORMAT, ROW_PK, LANG)
);

COMMENT ON COLUMN TRANSLATION.TABLE_FORMAT IS 'The table_format code';
COMMENT ON COLUMN TRANSLATION.ROW_PK IS 'The row pk in the primary_key order defined in the table_format (separated by commas)';
COMMENT ON COLUMN TRANSLATION.LANG IS 'The translation language';
COMMENT ON COLUMN TRANSLATION.LABEL IS 'The translated label';
COMMENT ON COLUMN TRANSLATION.DEFINITION IS 'The translated definition';

ALTER TABLE metadata.translation 
   ADD CONSTRAINT "FK_TABLE_FORMAT_TRANSLATION" FOREIGN KEY (table_format) 
       REFERENCES metadata.table_format (format)
       ON UPDATE RESTRICT ON DELETE RESTRICT;







alter table DATA
   add constraint FK_DATA_ASSOCIATI_UNIT foreign key (UNIT)
      references UNIT (UNIT)
      on delete restrict on update restrict;


alter table FIELD
   add constraint FK_FIELD_ASSOCIATI_DATA foreign key (DATA)
      references DATA (DATA)
      on delete restrict on update restrict;

alter table FIELD
   add constraint FK_FIELD_ASSOCIATI_FORMAT foreign key (FORMAT)
      references FORMAT (FORMAT)
      on delete restrict on update restrict;

alter table FIELD_MAPPING
   add constraint FK_FIELD_MA_FIELD_MAP_FIELD2 foreign key (DST_DATA, DST_FORMAT)
      references FIELD (DATA, FORMAT)
      on delete restrict on update restrict;
      
alter table FIELD_MAPPING
   add constraint FK_FIELD_MA_FIELD_MAP_FIELD foreign key (SRC_DATA, SRC_FORMAT)
      references FIELD (DATA, FORMAT)
      on delete restrict on update restrict;

alter table FILE_FIELD
   add constraint FK_FILE_FIE_HERITAGE__FIELD foreign key (DATA, FORMAT)
      references FIELD (DATA, FORMAT)
      on delete restrict on update restrict;
      

alter table FILE_FORMAT
   add constraint FK_FILE_FOR_HERITAGE__FORMAT foreign key (FORMAT)
      references FORMAT (FORMAT)
      on delete restrict on update restrict;

alter table FORM_FIELD
   add constraint FK_FORM_FIE_HERITAGE__FIELD foreign key (DATA, FORMAT)
      references FIELD (DATA, FORMAT)
      on delete restrict on update restrict;
      
            
alter table FORM_FORMAT
   add constraint FK_FORM_FOR_HERITAGE__FORMAT foreign key (FORMAT)
      references FORMAT (FORMAT)
      on delete restrict on update restrict;

alter table TABLE_FIELD
   add constraint FK_TABLE_FI_HERITAGE__FIELD foreign key (DATA, FORMAT)
      references FIELD (DATA, FORMAT)
      on delete restrict on update restrict;
      

alter table TABLE_FORMAT
   add constraint FK_TABLE_FO_HERITAGE__FORMAT foreign key (FORMAT)
      references FORMAT (FORMAT)
      on delete restrict on update restrict;
         
alter table MODE
   add constraint FK_MODE_ASSOCIATI_UNIT foreign key (UNIT)
      references UNIT (UNIT)
      on delete restrict on update restrict;
      
alter table GROUP_MODE
   add constraint FK_GROUP_MODE_ASSOCIATI_SRC_MODE foreign key (SRC_UNIT, SRC_CODE)
      references MODE (UNIT, CODE)
      on delete restrict on update restrict;
      
alter table GROUP_MODE
   add constraint FK_GROUP_MODE_ASSOCIATI_DST_MODE foreign key (DST_UNIT, DST_CODE)
      references MODE (UNIT, CODE)
      on delete restrict on update restrict;
      
alter table RANGE
   add constraint FK_RANGE_ASSOCIATI_UNIT foreign key (UNIT)
      references UNIT (UNIT)
      on delete restrict on update restrict;
            
alter table TABLE_TREE
   add constraint FK_TABLE_TREE_SCHEMA foreign key (SCHEMA_CODE)
      references TABLE_SCHEMA (SCHEMA_CODE)
      on delete restrict on update restrict;
      
alter table TABLE_TREE
   add constraint FK_TABLE_TREE_CHILD_TABLE foreign key (CHILD_TABLE)
      references TABLE_FORMAT (FORMAT)
      on delete restrict on update restrict;
      
alter table DATASET_FIELDS
   add constraint FK_DATASET_FIELDS_DATASET foreign key (DATASET_ID)
      references DATASET (DATASET_ID)
      on delete restrict on update restrict;
      
alter table DATASET_FIELDS
   add constraint FK_DATASET_FIELDS_FIELD foreign key (FORMAT, DATA)
      references FIELD (FORMAT, DATA)
      on delete restrict on update restrict;
    
alter table DATASET_FILES
   add constraint FK_DATASET_FILES_FORMAT foreign key (FORMAT)
      references FILE_FORMAT (FORMAT)
      on delete restrict on update restrict;
            
alter table FILE_FIELD
   add constraint FK_FILE_FIELD_FILE_FORMAT foreign key (FORMAT)
      references FILE_FORMAT (FORMAT)
      on delete restrict on update restrict;
      
      
-- Droits
GRANT ALL ON SCHEMA metadata TO ogam;
GRANT ALL ON ALL TABLES IN SCHEMA metadata TO ogam;
GRANT ALL ON ALL SEQUENCES IN SCHEMA metadata TO ogam;

ALTER TABLE metadata.DATA OWNER TO ogam;
ALTER TABLE metadata.UNIT OWNER TO ogam;
ALTER TABLE metadata.MODE OWNER TO ogam;
ALTER TABLE metadata.GROUP_MODE OWNER TO ogam;
ALTER TABLE metadata.MODE_TREE OWNER TO ogam;
ALTER TABLE metadata.MODE_TAXREF OWNER TO ogam;
ALTER TABLE metadata.DYNAMODE OWNER TO ogam;
ALTER TABLE metadata.RANGE OWNER TO ogam;
ALTER TABLE metadata.FORMAT OWNER TO ogam;
ALTER TABLE metadata.FILE_FORMAT OWNER TO ogam;
ALTER TABLE metadata.FORM_FORMAT OWNER TO ogam;
ALTER TABLE metadata.TABLE_FORMAT OWNER TO ogam;
ALTER TABLE metadata.FIELD OWNER TO ogam;
ALTER TABLE metadata.TABLE_FIELD OWNER TO ogam;
ALTER TABLE metadata.FILE_FIELD OWNER TO ogam;
ALTER TABLE metadata.FORM_FIELD OWNER TO ogam;
ALTER TABLE metadata.FIELD_MAPPING OWNER TO ogam;
ALTER TABLE metadata.DATASET OWNER TO ogam;
ALTER TABLE metadata.DATASET_FILES OWNER TO ogam;
ALTER TABLE metadata.DATASET_FIELDS OWNER TO ogam;
ALTER TABLE metadata.TABLE_SCHEMA OWNER TO ogam;
ALTER TABLE metadata.TABLE_TREE OWNER TO ogam;
ALTER TABLE metadata.CHECKS OWNER TO ogam;
ALTER TABLE metadata.CHECKS_PER_PROVIDER OWNER TO ogam;
ALTER TABLE metadata.process OWNER TO ogam;
ALTER TABLE metadata.translation OWNER TO ogam;