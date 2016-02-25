set search_path = metadata;
--\! pwd

--
-- Remove integrity contraints
--

alter table FILE_FORMAT drop constraint FK_FILE_FOR_HERITAGE__FORMAT;
alter table FORM_FORMAT drop constraint FK_FORM_FOR_HERITAGE__FORMAT;
alter table TABLE_FORMAT drop constraint FK_TABLE_FO_HERITAGE__FORMAT;
alter table FILE_FIELD drop constraint FK_FILE_FIE_HERITAGE__FIELD;
alter table FORM_FIELD drop constraint FK_FORM_FIE_HERITAGE__FIELD; 
alter table TABLE_FIELD drop constraint FK_TABLE_FI_HERITAGE__FIELD;
alter table DATASET_FIELDS drop constraint FK_DATASET_FIELDS_DATASET;
alter table DATASET_FIELDS drop constraint FK_DATASET_FIELDS_FIELD;
alter table DATASET_FILES drop constraint FK_DATASET_FILES_FORMAT;

--alter table website.predefined_request drop constraint fk_predefined_request_dataset;

ALTER TABLE metadata.translation DROP CONSTRAINT "FK_TABLE_FORMAT_TRANSLATION";

--
-- Remove old data
--
delete from translation;
delete from table_tree;
delete from table_schema;

delete from dataset_files;
delete from dataset_fields;
delete from dataset;

delete from file_field;
delete from table_field;
delete from form_field;
delete from field_mapping;
delete from field;
delete from file_format;
delete from table_format;
delete from form_format;
delete from format;

delete from dynamode;
delete from group_mode;
delete from mode_tree;
delete from mode;
delete from range;

delete from data;

delete from unit;

delete from checks where check_id <= 1200;



--delete from application_parameters;
--delete from checks where check_id < 1200;
COPY unit from 'D:/workspace/ogam_git/Bases SQL/Metadata/unit.csv' with delimiter ';' null '';
COPY data from 'D:/workspace/ogam_git/Bases SQL/Metadata/data.csv' with delimiter ';' null '';
COPY range from 'D:/workspace/ogam_git/Bases SQL/Metadata/range.csv' with delimiter ';' null '';
COPY mode from 'D:/workspace/ogam_git/Bases SQL/Metadata/mode.csv' with delimiter ';' null '';
COPY group_mode from 'D:/workspace/ogam_git/Bases SQL/Metadata/group_mode.csv' with delimiter ';' null '';
COPY mode_tree from 'D:/workspace/ogam_git/Bases SQL/Metadata/mode_tree.csv' with delimiter ';' null '';
COPY dynamode from 'D:/workspace/ogam_git/Bases SQL/Metadata/dynamode.csv' with delimiter ';' null '';

COPY form_format from 'D:/workspace/ogam_git/Bases SQL/Metadata/form_format.csv' with delimiter ';' null '';
COPY table_format from 'D:/workspace/ogam_git/Bases SQL/Metadata/table_format.csv' with delimiter ';' null '';
COPY file_format from 'D:/workspace/ogam_git/Bases SQL/Metadata/file_format.csv' with delimiter ';' null '';

-- Fill the parent table
INSERT INTO format (format, type)
SELECT format, 'FILE'
FROM   file_format;

INSERT INTO format (format, type)
SELECT format, 'TABLE'
FROM   table_format;

INSERT INTO format (format, type)
SELECT format, 'FORM'
FROM   form_format;

COPY form_field from 'D:/workspace/ogam_git/Bases SQL/Metadata/form_field.csv' with delimiter ';' null '';
COPY file_field from 'D:/workspace/ogam_git/Bases SQL/Metadata/file_field.csv' with delimiter ';' null '';
COPY table_field from 'D:/workspace/ogam_git/Bases SQL/Metadata/table_field.csv' with delimiter ';' null '';

-- Fill the parent table
INSERT INTO field (data, format, type)
SELECT data, format, 'FILE'
FROM   file_field;

INSERT INTO field (data, format, type)
SELECT data, format, 'TABLE'
FROM   table_field;

INSERT INTO field (data, format, type)
SELECT data, format, 'FORM'
FROM   form_field;


COPY field_mapping from 'D:/workspace/ogam_git/Bases SQL/Metadata/field_mapping.csv' with delimiter ';' null '';

COPY checks (check_id, step, name, label, description, "statement", importance) from 'D:/workspace/ogam_git/Bases SQL/Metadata/checks.csv' with delimiter ';' null '';


COPY dataset from 'D:/workspace/ogam_git/Bases SQL/Metadata/dataset.csv' with delimiter ';' null '';
COPY dataset_fields from 'D:/workspace/ogam_git/Bases SQL/Metadata/dataset_fields.csv' with delimiter ';' null '';
COPY dataset_files from 'D:/workspace/ogam_git/Bases SQL/Metadata/dataset_files.csv' with delimiter ';' null '';

COPY table_schema from 'D:/workspace/ogam_git/Bases SQL/Metadata/table_schema.csv' with delimiter ';' null '';
COPY table_tree from 'D:/workspace/ogam_git/Bases SQL/Metadata/table_tree.csv' with delimiter ';' null '';

COPY translation from 'D:/workspace/ogam_git/Bases SQL/Metadata/translation.csv' with delimiter ';' null '';


-- Fill the empty label and definition for the need of the tests
UPDATE metadata.translation t
   SET label= 'EN...' || t2.label
   FROM metadata.translation t2
 WHERE t.table_format = t2.table_format and t.row_pk = t2.row_pk and t.lang = 'EN' and t2.lang = 'FR' and t.label is null;

 UPDATE metadata.translation t
   SET definition= 'EN...' || t2.definition
   FROM metadata.translation t2
 WHERE t.table_format = t2.table_format and t.row_pk = t2.row_pk and t.lang = 'EN' and t2.lang = 'FR' and t.definition is null;

--
-- Restore Integrity contraints
--

alter table FILE_FIELD
   add constraint FK_FILE_FIE_HERITAGE__FIELD foreign key (DATA, FORMAT)
      references metadata.FIELD (DATA, FORMAT)
      on delete restrict on update restrict;

alter table FILE_FORMAT
   add constraint FK_FILE_FOR_HERITAGE__FORMAT foreign key (FORMAT)
      references metadata.FORMAT (FORMAT)
      on delete restrict on update restrict;

alter table FORM_FIELD
   add constraint FK_FORM_FIE_HERITAGE__FIELD foreign key (DATA, FORMAT)
      references metadata.FIELD (DATA, FORMAT)
      on delete restrict on update restrict;

alter table FORM_FORMAT
   add constraint FK_FORM_FOR_HERITAGE__FORMAT foreign key (FORMAT)
      references metadata.FORMAT (FORMAT)
      on delete restrict on update restrict;

alter table TABLE_FIELD
   add constraint FK_TABLE_FI_HERITAGE__FIELD foreign key (DATA, FORMAT)
      references FIELD (DATA, FORMAT)
      on delete restrict on update restrict;

alter table TABLE_FORMAT
   add constraint FK_TABLE_FO_HERITAGE__FORMAT foreign key (FORMAT)
      references FORMAT (FORMAT)
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

ALTER TABLE metadata.translation
  ADD CONSTRAINT "FK_TABLE_FORMAT_TRANSLATION" FOREIGN KEY (table_format)
      REFERENCES metadata.table_format (format) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE NO ACTION;

--
-- Consistency checks
--

-- Units of type CODE should have an entry in the CODE table
SELECT UNIT, 'This unit of type CODE is not described in the MODE table'
FROM unit
WHERE (type = 'CODE' OR type = 'ARRAY') 
AND subtype = 'MODE'
AND unit not in (SELECT UNIT FROM MODE WHERE MODE.UNIT=UNIT)
UNION
-- Units of type RANGE should have an entry in the RANGE table
SELECT UNIT, 'This unit of type RANGE is not described in the RANGE table'
FROM unit
WHERE TYPE = 'NUMERIC' AND SUBTYPE = 'RANGE'
AND unit not in (SELECT UNIT FROM RANGE WHERE RANGE.UNIT=UNIT)
UNION
-- File fields should have a FILE mapping
SELECT format||'_'||data, 'This file field has no FILE mapping defined'
FROM file_field
WHERE format||'_'||data NOT IN (
	SELECT (src_format||'_'||src_data )
	FROM field_mapping
	WHERE mapping_type = 'FILE'
	)
UNION
-- Form fields should have a FORM mapping
SELECT format||'_'||data, 'This form field has no FORM mapping defined'
FROM form_field
WHERE format||'_'||data NOT IN (
	SELECT (src_format||'_'||src_data )
	FROM field_mapping
	WHERE mapping_type = 'FORM'
	)
UNION
-- Raw data field should be mapped with harmonized fields
SELECT format||'_'||data, 'This raw_data table field is not mapped with an harmonized field'
FROM table_field
JOIN table_format using (format)
WHERE schema_code = 'RAW_DATA'
AND data <> 'SUBMISSION_ID'
AND data <> 'LINE_NUMBER'
AND format||'_'||data NOT IN (
	SELECT (src_format||'_'||src_data )
	FROM field_mapping
	WHERE mapping_type = 'HARMONIZE'
	)
UNION
-- Raw data field should be mapped with harmonized fields
SELECT format||'_'||data, 'This harmonized_data table field is not used by a mapping'
FROM table_field
JOIN table_format using (format)
WHERE schema_code = 'HARMONIZED_DATA'
AND column_name <> 'REQUEST_ID'  -- request ID added automatically
AND is_calculated <> '1'  -- field is not calculated
AND format||'_'||data NOT IN (
	SELECT (dst_format||'_'||dst_data )
	FROM field_mapping
	WHERE mapping_type = 'HARMONIZE'
	)
UNION
-- the SUBMISSION_ID field is mandatory for raw data tables
SELECT format, 'This raw table format is missing the SUBMISSION_ID field'
FROM table_format 
WHERE schema_code = 'RAW_DATA'
AND NOT EXISTS (SELECT * FROM table_field WHERE table_format.format = table_field.format AND table_field.data='SUBMISSION_ID')
UNION
-- the INPUT_TYPE is not in the list
SELECT format||'_'||data, 'The INPUT_TYPE type is not in the list'
FROM form_field 
WHERE input_type NOT IN ('TEXT', 'SELECT', 'DATE', 'GEOM', 'NUMERIC', 'CHECKBOX', 'MULTIPLE', 'TREE', 'TAXREF', 'IMAGE')
UNION
-- the UNIT type is not in the list
SELECT unit||'_'||type, 'The UNIT type is not in the list'
FROM unit 
WHERE type NOT IN ('BOOLEAN', 'CODE', 'ARRAY', 'DATE', 'INTEGER', 'NUMERIC', 'STRING', 'GEOM', 'IMAGE')
UNION
-- the subtype is not consistent with the type
SELECT unit||'_'||type, 'The UNIT subtype is not consistent with the type'
FROM unit 
WHERE (type = 'CODE' AND subtype NOT IN ('MODE', 'TREE', 'DYNAMIC', 'TAXREF'))
OR    (type = 'ARRAY' AND subtype NOT IN ('MODE', 'TREE', 'DYNAMIC', 'TAXREF'))
OR    (type = 'NUMERIC' AND subtype NOT IN ('RANGE', 'COORDINATE'))
UNION
-- the unit type is not consistent with the form field input type
SELECT form_field.format || '_' || form_field.data, 'The form field input type (' || input_type || ') is not consistent with the unit type (' || type || ')'
FROM form_field 
LEFT JOIN data using (data)
LEFT JOIN unit using (unit)
WHERE (input_type = 'NUMERIC' AND type NOT IN ('NUMERIC', 'INTEGER'))
OR (input_type = 'DATE' AND type <> 'DATE')
OR (input_type = 'SELECT' AND NOT (type = 'ARRAY' or TYPE = 'CODE') AND (subtype = 'CODE' OR subtype = 'DYNAMIC'))
OR (input_type = 'TEXT' AND type <> 'STRING')
OR (input_type = 'CHECKBOX' AND type <> 'BOOLEAN')
OR (input_type = 'RADIO' AND type <> 'BOOLEAN')
OR (input_type = 'GEOM' AND type <> 'GEOM')
OR (input_type = 'IMAGE' AND type <> 'IMAGE')
OR (input_type = 'TREE' AND NOT ((type = 'ARRAY' or TYPE = 'CODE') AND subtype = 'TREE'))
OR (input_type = 'TAXREF' AND NOT ((type = 'ARRAY' or TYPE = 'CODE') AND subtype = 'TAXREF'))
UNION
-- TREE_MODEs should be defined
SELECT unit, 'The unit should have at least one MODE_TREE defined'
FROM unit 
WHERE (type = 'CODE' OR type = 'ARRAY') 
AND subtype = 'TREE' 
AND (SELECT count(*) FROM mode_tree WHERE mode_tree.unit = unit.unit) = 0
UNION
-- DYNAMODEs should be defined
SELECT unit, 'The unit should have at least one DYNAMODE defined'
FROM unit 
WHERE (type = 'CODE' OR type = 'ARRAY') 
AND subtype = 'DYNAMIC' 
AND (SELECT count(*) FROM dynamode WHERE dynamode.unit = unit.unit) = 0
