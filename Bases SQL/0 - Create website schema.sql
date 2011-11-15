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
ACTIVE               INT4                 null,
EMAIL                VARCHAR(250)         null,
constraint PK_USERS primary key (USER_LOGIN)
);

COMMENT ON TABLE USERS IS 'The users of the application';
COMMENT ON COLUMN USERS.USER_LOGIN IS 'The login of the user (unique identifier)';
COMMENT ON COLUMN USERS.USER_PASSWORD IS 'The password of the user';
COMMENT ON COLUMN USERS.USER_NAME IS 'The user name';
COMMENT ON COLUMN USERS.PROVIDER_ID IS 'The identifier of the provider (used to group users and manage dataset accessibility)';
COMMENT ON COLUMN USERS.ACTIVE IS 'Is the user active ?';
COMMENT ON COLUMN USERS.EMAIL IS 'The user email address';

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

      
      
