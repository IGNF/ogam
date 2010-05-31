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

/*==============================================================*/
/* Table : users                                                */
/*==============================================================*/
create table users (
USER_LOGIN           VARCHAR(50)          null,
USER_PASSWORD        VARCHAR(50)          null,
USER_NAME            VARCHAR(50)          null,
COUNTRY_CODE         VARCHAR(36)          null,
ACTIVE               INT4                 null,
EMAIL                VARCHAR(250)         null,
constraint PK_USERS primary key (USER_LOGIN)
);

/*==============================================================*/
/* Table : ROLE                                                 */
/*==============================================================*/
create table ROLE (
ROLE_CODE            VARCHAR(36)             	not null,
ROLE_LABEL           VARCHAR(100)             	null,
ROLE_DEF             VARCHAR(255)         		null,
DEGRADATED_COORDINATE CHAR(1)                 	null,
IS_EUROPE_LEVEL      CHAR(1)                 	null,
constraint PK_ROLE primary key (ROLE_CODE)
);


/*==============================================================*/
/* Table : ROLE_TO_USER                                         */
/*==============================================================*/
create table ROLE_TO_USER (
USER_LOGIN              VARCHAR(50)                 not null,
ROLE_CODE              	VARCHAR(36)                 not null,
constraint PK_ROLE_TO_USER primary key (USER_LOGIN, ROLE_CODE)
);

/*==============================================================*/
/* Table : PERMISSION                                           */
/*==============================================================*/
create table PERMISSION (
PERMISSION_CODE      	VARCHAR(36)             not null,
PERMISSION_LABEL      	VARCHAR(255)             not null,
constraint PK_PERMISSION primary key (PERMISSION_CODE)
);



/*==============================================================*/
/* Table : PERMISSION_PER_ROLE                                  */
/*==============================================================*/
create table PERMISSION_PER_ROLE (
ROLE_CODE              	VARCHAR(36)                 not null,
PERMISSION_CODE      	VARCHAR(36)             not null,
constraint PK_PERMISSION_PER_ROLE primary key (ROLE_CODE, PERMISSION_CODE)
);

            
            
            

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

      
      
