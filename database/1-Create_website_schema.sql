SET client_encoding TO 'UTF8';
SET client_min_messages TO WARNING;

CREATE SCHEMA website;
SET SEARCH_PATH = website, public;


/*==============================================================*/
/* Table : APPLICATION_PARAMETERS                               */
/*==============================================================*/
create table APPLICATION_PARAMETERS (
NAME                 VARCHAR(50)          not null,
VALUE                VARCHAR(500)         null,
DESCRIPTION          VARCHAR(500)         null,
constraint PK_APPLICATION_PARAMETERS primary key (NAME)
);

COMMENT ON TABLE APPLICATION_PARAMETERS IS 'Table used to store parameters for the application';
COMMENT ON COLUMN APPLICATION_PARAMETERS.NAME IS 'Name of the parameter';
COMMENT ON COLUMN APPLICATION_PARAMETERS.VALUE IS 'Value of the parameter';
COMMENT ON COLUMN APPLICATION_PARAMETERS.DESCRIPTION IS 'Description of the parameter';

/*==============================================================*/
/* Table : users                                                */
/*==============================================================*/
create table USERS (
USER_LOGIN           VARCHAR(50)          null,
USER_PASSWORD        VARCHAR(50)          null,
USER_NAME            VARCHAR(50)          null,
PROVIDER_ID          VARCHAR(36)          null,
EMAIL                VARCHAR(250)         null,
ACTIVATION_CODE		 VARCHAR(50)          null,
constraint PK_USERS primary key (USER_LOGIN)
);

COMMENT ON TABLE USERS IS 'The users of the application';
COMMENT ON COLUMN USERS.USER_LOGIN IS 'The login of the user (unique identifier)';
COMMENT ON COLUMN USERS.USER_PASSWORD IS 'The password of the user';
COMMENT ON COLUMN USERS.USER_NAME IS 'The user name';
COMMENT ON COLUMN USERS.PROVIDER_ID IS 'The identifier of the provider (used to group users and manage dataset accessibility)';
COMMENT ON COLUMN USERS.EMAIL IS 'The user email address';
COMMENT ON COLUMN USERS.ACTIVATION_CODE IS 'The activation code for password reset';

/*==============================================================*/
/* Table : ROLE                                                 */
/*==============================================================*/
create table ROLE (
ROLE_CODE            VARCHAR(36)             	not null,
ROLE_LABEL           VARCHAR(100)             	null,
ROLE_DEFINITION      VARCHAR(255)         		null,
constraint PK_ROLE primary key (ROLE_CODE)
);

COMMENT ON TABLE ROLE IS 'A role in the application';
COMMENT ON COLUMN ROLE.ROLE_CODE IS 'Code of the role';
COMMENT ON COLUMN ROLE.ROLE_LABEL IS 'Label';
COMMENT ON COLUMN ROLE.ROLE_DEFINITION IS 'Definition of the role';

/*==============================================================*/
/* Table : ROLE_TO_SCHEMA                                                 */
/*==============================================================*/
create table ROLE_TO_SCHEMA (
ROLE_CODE            VARCHAR(36)             	not null,
SCHEMA_CODE       	 VARCHAR(100)             	not null,
constraint PK_ROLE_TO_SCHEMA  primary key (ROLE_CODE, SCHEMA_CODE)
);

COMMENT ON TABLE ROLE_TO_SCHEMA IS 'A link a role to a list of accessible database schemas';
COMMENT ON COLUMN ROLE_TO_SCHEMA.ROLE_CODE IS 'Code of the role';
COMMENT ON COLUMN ROLE_TO_SCHEMA.SCHEMA_CODE IS 'Code of the schema (as defined in the metadata)';


/*==============================================================*/
/* Table : ROLE_TO_USER                                         */
/*==============================================================*/
create table ROLE_TO_USER (
USER_LOGIN              VARCHAR(50)                 not null,
ROLE_CODE              	VARCHAR(36)                 not null,
constraint PK_ROLE_TO_USER primary key (USER_LOGIN, ROLE_CODE)
);

COMMENT ON TABLE ROLE_TO_USER IS 'Link a user to a role';
COMMENT ON COLUMN ROLE_TO_USER.USER_LOGIN IS 'The user';
COMMENT ON COLUMN ROLE_TO_USER.ROLE_CODE IS 'The role';

/*==============================================================*/
/* Table : PERMISSION                                           */
/*==============================================================*/
create table PERMISSION (
PERMISSION_CODE      	VARCHAR(36)             not null,
PERMISSION_LABEL      	VARCHAR(255)             not null,
constraint PK_PERMISSION primary key (PERMISSION_CODE)
);

COMMENT ON TABLE PERMISSION IS 'Define a permission in the application';
COMMENT ON COLUMN PERMISSION.PERMISSION_CODE IS 'The code of the permission';
COMMENT ON COLUMN PERMISSION.PERMISSION_LABEL IS 'The label';


/*==============================================================*/
/* Table : PERMISSION_PER_ROLE                                  */
/*==============================================================*/
create table PERMISSION_PER_ROLE (
ROLE_CODE              	VARCHAR(36)                 not null,
PERMISSION_CODE      	VARCHAR(36)             not null,
constraint PK_PERMISSION_PER_ROLE primary key (ROLE_CODE, PERMISSION_CODE)
);

COMMENT ON TABLE PERMISSION_PER_ROLE IS 'Link a role to a list of permissions';
COMMENT ON COLUMN PERMISSION_PER_ROLE.ROLE_CODE IS 'The role';
COMMENT ON COLUMN PERMISSION_PER_ROLE.PERMISSION_CODE IS 'A permission';


alter table PERMISSION_PER_ROLE
   add constraint FK_PERMISSI_PERMISSIO_ROLE foreign key (ROLE_CODE)
      references ROLE (ROLE_CODE)
      on delete restrict on update restrict;

alter table PERMISSION_PER_ROLE
   add constraint FK_PERMISSI_PERMISSIO_PERMISSI foreign key (PERMISSION_CODE)
      references PERMISSION (PERMISSION_CODE)
      on delete restrict on update restrict;

alter table ROLE_TO_USER
   add constraint FK_ROLE_TO__ROLE_TO_U_USER foreign key (USER_LOGIN)
      references users (USER_LOGIN)
      on delete restrict on update restrict;

alter table ROLE_TO_USER
   add constraint FK_ROLE_TO__ROLE_TO_U_ROLE foreign key (ROLE_CODE)
      references ROLE (ROLE_CODE)
      on delete restrict on update restrict;
      
      
/*==============================================================*/
/* Table : DATASET_ROLE_RESTRICTION                             */
/*==============================================================*/
create table DATASET_ROLE_RESTRICTION (
DATASET_ID           VARCHAR(36)          NOT NULL,
ROLE_CODE            VARCHAR(36)          NOT NULL,
constraint PK_DATASET_ROLE_RESTRICTION primary key (DATASET_ID, ROLE_CODE)
);

COMMENT ON COLUMN DATASET_ROLE_RESTRICTION.DATASET_ID IS 'The logical name of the dataset';
COMMENT ON COLUMN DATASET_ROLE_RESTRICTION.ROLE_CODE IS 'Code of the role';

ALTER TABLE dataset_role_restriction 
ADD CONSTRAINT fk_dataset_role_restriction_dataset_id 
FOREIGN KEY (dataset_id) REFERENCES metadata.DATASET (dataset_id)
ON UPDATE NO ACTION ON DELETE NO ACTION;

ALTER TABLE dataset_role_restriction 
ADD CONSTRAINT fk_dataset_role_restriction_role_code 
FOREIGN KEY (role_code) REFERENCES website."role" (role_code)
ON UPDATE NO ACTION ON DELETE NO ACTION;


/*==============================================================*/
/* Table: layer_profile_restriction                             */
/* Mark some layers as forbidden for some user profiles         */
/*==============================================================*/
CREATE TABLE layer_role_restriction
(
  layer_name 			VARCHAR(50)    NOT NULL,   -- Logical name of the layer
  role_code				VARCHAR(36)    NOT NULL,   -- Role for whom this layer is forbidden
  PRIMARY KEY  (layer_name, role_code)
) WITHOUT OIDS;

COMMENT ON COLUMN layer_role_restriction.layer_name IS 'Logical name of the layer';
COMMENT ON COLUMN layer_role_restriction.role_code IS 'Role for whom this layer is forbidden';

ALTER TABLE layer_role_restriction 
ADD CONSTRAINT fk_layer_role_restriction_layer_name 
FOREIGN KEY (layer_name) REFERENCES mapping.layer(name)
ON UPDATE NO ACTION ON DELETE NO ACTION;

ALTER TABLE layer_role_restriction 
ADD CONSTRAINT fk_layer_role_restriction_role_code 
FOREIGN KEY (role_code) REFERENCES website."role" (role_code)
ON UPDATE NO ACTION ON DELETE NO ACTION;

/*==============================================================*/
/* Table : PROVIDERS                                            */
/*==============================================================*/
CREATE SEQUENCE provider_id_seq;
CREATE TABLE providers (
id          character varying NOT NULL DEFAULT nextval('website.provider_id_seq'::text),
label       character varying,
definition  character varying,
CONSTRAINT pk_provider PRIMARY KEY (id)
);

/*==============================================================*/
/* Table : PREDEFINED_REQUEST                                   */
/*==============================================================*/
CREATE TABLE website.predefined_request
(
  request_id serial NOT NULL, -- The request identifier
  dataset_id character varying(36) NOT NULL, -- The dataset used by this request
  schema_code character varying(36) NOT NULL, -- The schema used by this request
  user_login character varying(50), -- The user login of the creator of the request
  definition character varying(500), -- The description of the request
  label character varying(50) NOT NULL, -- The label of the request
  date date DEFAULT now(), -- Date of creation of the request
  is_public boolean NOT NULL DEFAULT false, -- True if the request is public
  CONSTRAINT pk_predefined_request PRIMARY KEY (request_id),
  CONSTRAINT fk_predefined_request_dataset FOREIGN KEY (dataset_id)
      REFERENCES metadata.dataset (dataset_id) MATCH SIMPLE
      ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT fk_predefined_request_users FOREIGN KEY (user_login)
      REFERENCES website.users (user_login) MATCH SIMPLE
      ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT uk_predefined_request UNIQUE (label, user_login, dataset_id, is_public)
);

COMMENT ON COLUMN website.predefined_request.request_id IS 'The request identifier';
COMMENT ON COLUMN website.predefined_request.dataset_id IS 'The dataset used by this request';
COMMENT ON COLUMN website.predefined_request.schema_code IS 'The schema used by this request';
COMMENT ON COLUMN website.predefined_request.user_login IS 'The user login of the creator of the request';
COMMENT ON COLUMN website.predefined_request.definition IS 'The description of the request';
COMMENT ON COLUMN website.predefined_request.label IS 'The label of the request';
COMMENT ON COLUMN website.predefined_request.date IS 'Date of creation of the request';
COMMENT ON COLUMN website.predefined_request.is_public IS 'True if the request is public';

CREATE UNIQUE INDEX uk_predefined_request_2 ON website.predefined_request (label, dataset_id) WHERE is_public;

/*==============================================================*/
/* Table : PREDEFINED_REQUEST_CRITERION                          */
/*==============================================================*/
CREATE TABLE website.predefined_request_criterion
(
  request_id integer NOT NULL, -- The request identifier
  format character varying(36) NOT NULL, -- The form format of the criterion
  data character varying(36) NOT NULL, -- The form field of the criterion
  value character varying(500) NOT NULL, -- The field value (multiple values are separated by a semicolon)
  CONSTRAINT pk_predefined_request_criterion PRIMARY KEY (request_id, format, data),
  CONSTRAINT fk_predefined_request_criterion_request_name FOREIGN KEY (request_id)
      REFERENCES website.predefined_request (request_id) MATCH SIMPLE
      ON UPDATE RESTRICT ON DELETE RESTRICT
);

COMMENT ON COLUMN website.predefined_request_criterion.request_id IS 'The request identifier';
COMMENT ON COLUMN website.predefined_request_criterion.format IS 'The form format of the criterion';
COMMENT ON COLUMN website.predefined_request_criterion.data IS 'The form field of the criterion';
COMMENT ON COLUMN website.predefined_request_criterion.value IS 'The field value (multiple values are separated by a semicolon)';

/*==============================================================*/
/* Table : PREDEFINED_REQUEST_COLUMN                  */
/*==============================================================*/
CREATE TABLE website.predefined_request_column
(
  request_id integer NOT NULL, -- The request identifier
  format character varying(36) NOT NULL, -- The form format of the column
  data character varying(36) NOT NULL, -- The form field of the column
  CONSTRAINT pk_predefined_request_column PRIMARY KEY (request_id, format, data),
  CONSTRAINT fk_predefined_request_column_request_name FOREIGN KEY (request_id)
      REFERENCES website.predefined_request (request_id) MATCH SIMPLE
      ON UPDATE RESTRICT ON DELETE RESTRICT
);

COMMENT ON COLUMN website.predefined_request_column.request_id IS 'The request identifier';
COMMENT ON COLUMN website.predefined_request_column.format IS 'The form format of the column';
COMMENT ON COLUMN website.predefined_request_column.data IS 'The form field of the column';


/*==============================================================*/
/* Table : PREDEFINED_REQUEST_GROUP                             */
/*==============================================================*/
CREATE TABLE website.predefined_request_group
(
  group_id serial NOT NULL, -- The group identifier
  label character varying(50) NOT NULL, -- The label of the group
  definition character varying(250), -- The definition of the group
  "position" smallint, -- The position of the group
  CONSTRAINT pk_predefined_request_group PRIMARY KEY (group_id)
);

COMMENT ON COLUMN website.predefined_request_group.group_id IS 'The group identifier';
COMMENT ON COLUMN website.predefined_request_group.label IS 'The label of the group';
COMMENT ON COLUMN website.predefined_request_group.definition IS 'The definition of the group';
COMMENT ON COLUMN website.predefined_request_group."position" IS 'The position of the group';


/*==============================================================*/
/* Table : PREDEFINED_REQUEST_GROUP_ASSO                        */
/*==============================================================*/
CREATE TABLE website.predefined_request_group_asso
(
  group_id integer NOT NULL, -- The group identifier
  request_id integer NOT NULL, -- The request identifier
  "position" smallint, -- The position of the request inside the group
  CONSTRAINT pk_predefined_request_group_asso PRIMARY KEY (group_id, request_id),
  CONSTRAINT fk_predefined_request_group_name FOREIGN KEY (group_id)
      REFERENCES website.predefined_request_group (group_id) MATCH SIMPLE
      ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT fk_predefined_request_request_name FOREIGN KEY (request_id)
      REFERENCES website.predefined_request (request_id) MATCH SIMPLE
      ON UPDATE RESTRICT ON DELETE RESTRICT
);

COMMENT ON COLUMN website.predefined_request_group_asso.group_id IS 'The group identifier';
COMMENT ON COLUMN website.predefined_request_group_asso.request_id IS 'The request identifier';
COMMENT ON COLUMN website.predefined_request_group_asso."position" IS 'The position of the request inside the group';
    
