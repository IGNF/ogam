SET SEARCH_PATH = website;

DELETE FROM application_parameters;

-- TEST DATABASE Parameters
INSERT INTO application_parameters (name, value, description) values ('UploadDirectory','/var/tmp/ogam_upload','Directory where the CSV files are uploaded');
INSERT INTO application_parameters (name, value, description) values ('Test','OK','For test purposes');
INSERT INTO application_parameters (name, value, description) values ('fromMail','OGAM@ifn.fr','The application email');
INSERT INTO application_parameters (name, value, description) values ('toMail','benoit.pesty@ifn.fr','The destination email');

insert into application_parameters (name, value, description) values ( 'autoLogin' , 0 , 'DEFAULT LOGIN AND PAGE FOR PUBLIC ACCESS');
insert into application_parameters (name, value, description) values ( 'defaultUser' , 'visitor' , 'DEFAULT LOGIN AND PAGE FOR PUBLIC ACCESS');
insert into application_parameters (name, value, description) values ( 'fileMaxSize' , 100 , 'UPLOAD');
insert into application_parameters (name, value, description) values ( 'integrationService_url' , 'http://localhost:8080/OGAMIntegrationService/' , 'INTEGRATION SERVICE');
insert into application_parameters (name, value, description) values ( 'uploadDir' , '/var/www/html/upload/' , 'INTEGRATION SERVICE');
insert into application_parameters (name, value, description) values ( 'harmonizationService_url' , 'http://localhost:8080/OGAMHarmonizationService/' , 'HARMONIZATION SERVICE');
insert into application_parameters (name, value, description) values ( 'reportGenerationService_url' , 'http://localhost:8080/OGAMRG/' , 'REPORT GENERATION SERVICE');
insert into application_parameters (name, value, description) values ( 'errorReport' , 'ErrorReport.rptdesign' , 'REPORT GENERATION SERVICE');
insert into application_parameters (name, value, description) values ( 'plotErrorReport' , 'PlotErrorReport.rptdesign' , 'REPORT GENERATION SERVICE');
insert into application_parameters (name, value, description) values ( 'simplifiedReport' , 'SimplifiedReport.rptdesign' , 'REPORT GENERATION SERVICE');
insert into application_parameters (name, value, description) values ( 'max_report_generation_time' , 480 , 'REPORT GENERATION SERVICE');
insert into application_parameters (name, value, description) values ( 'mapReportGenerationService_url' , 'http://localhost:8080/print%2Dservlet%2D2.0%2DSNAPSHOT/pdf' , 'MAPFISH REPORT GENERATION SERVICE');
insert into application_parameters (name, value, description) values ( 'useCache' , false , 'Cache');
insert into application_parameters (name, value, description) values ( 'max_execution_time' , 480 , 'Timeout , 0 : no limit');
insert into application_parameters (name, value, description) values ( 'memory_limit' , '1024M' , 'memory limit');
insert into application_parameters (name, value, description) values ( 'post_max_size' , '100M' , 'Note : "post_max_size" and "upload_max_filesize" are under the PHP_INI_PERDIR mode (php.ini, .htaccess or httpd.conf).The parameter must be set into the php.ini file because it s not possible in the other files when php is running under the CGI mode. So we can only check if it s done.');
insert into application_parameters (name, value, description) values ( 'upload_max_filesize' , '100M' , 'Note : "post_max_size" and "upload_max_filesize" are under the PHP_INI_PERDIR mode (php.ini, .htaccess or httpd.conf).The parameter must be set into the php.ini file because it s not possible in the other files when php is running under the CGI mode. So we can only check if it s done.');
insert into application_parameters (name, value, description) values ( 'image_upload_dir' , '/var/www/html/upload/images' , 'Images Upload');
insert into application_parameters (name, value, description) values ( 'image_dir_rights' , 0666 , 'File Upload');
insert into application_parameters (name, value, description) values ( 'image_extensions' , 'jpg,png,jpeg,gif' , 'File Upload');
insert into application_parameters (name, value, description) values ( 'image_max_size' , 1000000, 'image max size in bytes');
insert into application_parameters (name, value, description) values ( 'tilesize' , 500 , 'WEB MAPPING ');
insert into application_parameters (name, value, description) values ( 'query_details_layers1' , 'result_locations,nuts_0' , 'WEB MAPPING ');
insert into application_parameters (name, value, description) values ( 'query_details_layers2' , 'result_locations,nuts_0' , 'WEB MAPPING ');
insert into application_parameters (name, value, description) values ( 'proxy_service_name' , 'local_mapserver' , 'WEB MAPPING ');
insert into application_parameters (name, value, description) values ( 'srs_visualisation' , 3035 , 'WEB MAPPING ');
insert into application_parameters (name, value, description) values ( 'srs_raw_data' , 4326 , 'WEB MAPPING ');
insert into application_parameters (name, value, description) values ( 'srs_harmonized_data' , 3035 , 'WEB MAPPING ');
insert into application_parameters (name, value, description) values ( 'usePerProviderCenter' , false , 'if true the system will look in the "bounding_box" table for centering info for each provider');
insert into application_parameters (name, value, description) values ( 'bbox_x_min' , '1690000' , 'WEB MAPPING ');
insert into application_parameters (name, value, description) values ( 'bbox_y_min' , '1000000' , 'WEB MAPPING ');
insert into application_parameters (name, value, description) values ( 'bbox_x_max' , '7670000' , 'WEB MAPPING ');
insert into application_parameters (name, value, description) values ( 'bbox_y_max' , '5340000' , 'WEB MAPPING ');
insert into application_parameters (name, value, description) values ( 'zoom_level' , '0' , 'WEB MAPPING ');
insert into application_parameters (name, value, description) values ( 'mapserver_dpi' , 72 , 'Default number of dots per inch in mapserv');
insert into application_parameters (name, value, description) values ( 'mapserver_inch_per_kilometer' , 39370.1 , 'Inch to meter conversion factor');
insert into application_parameters (name, value, description) values ( 'featureinfo_margin' , 1000 , 'bounding box margin around the user click (in the unit of the map)');
insert into application_parameters (name, value, description) values ( 'featureinfo_typename' , 'result_locations' , 'Layer that is queried');
insert into application_parameters (name, value, description) values ( 'featureinfo_maxfeatures' , 20 , 'Max number of features returned by a click on the map. If 0 then there is no limit; If 1 the direct access to the detail');
insert into application_parameters (name, value, description) values ( 'contactEmailPrefix' , 'ogam' , 'Email');
insert into application_parameters (name, value, description) values ( 'contactEmailSufix' , 'ign.fr' , 'Email');
insert into application_parameters (name, value, description) values ( 'csvExportCharset' , 'UTF-8' , 'Csv Export');
insert into application_parameters (name, value, description) values ( 'language_flags1' , 'fr' , 'Language');
insert into application_parameters (name, value, description) values ( 'language_flags2' , 'en' , 'Language');


-- Create a provider
INSERT INTO providers('id','label','definition') VALUES ('1', 'Defaut', 'Organisme par défaut');
ALTER sequence website.provider_id_seq restart with 2;

-- Create some roles
INSERT INTO role(role_code, role_label, role_definition) VALUES ('ADMIN','Administrator', 'Manages the web site');


-- Create some users
INSERT INTO users(user_login, user_password, user_name, provider_id, active, email) VALUES ('admin', 'd033e22ae348aeb5660fc2140aec35850c4da997', 'admin user', '1', '1', null); 


-- Link the users to their roles
INSERT INTO role_to_user(user_login, role_code) VALUES ('admin', 'ADMIN');


-- Link the schemas to their roles
INSERT INTO ROLE_TO_SCHEMA(ROLE_CODE, SCHEMA_CODE) VALUES ('ADMIN', 'RAW_DATA');
INSERT INTO ROLE_TO_SCHEMA(ROLE_CODE, SCHEMA_CODE) VALUES ('ADMIN', 'HARMONIZED_DATA');


-- List the permissions of the web site
INSERT INTO permission(permission_code, permission_label) VALUES ('MANAGE_USERS', 'Manage users');
INSERT INTO permission(permission_code, permission_label) VALUES ('DATA_INTEGRATION', 'Provide data');
--INSERT INTO permission(permission_code, permission_label) VALUES ('OVERVIEW', 'See an overview board');
INSERT INTO permission(permission_code, permission_label) VALUES ('DATA_QUERY', 'Visualise data');
INSERT INTO permission(permission_code, permission_label) VALUES ('DATA_QUERY_OTHER_PROVIDER', 'Visualise data from other provider');
INSERT INTO permission(permission_code, permission_label) VALUES ('DATA_HARMONIZATION', 'Launch the harmonization process');
--INSERT INTO permission(permission_code, permission_label) VALUES ('DATA_AGGREGATION', 'Launch the aggregation process');
--INSERT INTO permission(permission_code, permission_label) VALUES ('DATA_QUERY_AGGREGATED', 'Visualise aggregated data');
--INSERT INTO permission(permission_code, permission_label) VALUES ('DATA_INTERPOLATION', 'Launch the interpolation process');
--INSERT INTO permission(permission_code, permission_label) VALUES ('DOCUMENTATION', 'Visualise the project public documentation');
--INSERT INTO permission(permission_code, permission_label) VALUES ('PRIVATE_DOCUMENTATION', 'Visualise the project private documentation');
INSERT INTO permission(permission_code, permission_label) VALUES ('EXPORT_RAW_DATA', 'Export the raw data as a CSV file');
INSERT INTO permission(permission_code, permission_label) VALUES ('DATA_EDITION', 'Add / Update / Delete data');
INSERT INTO permission(permission_code, permission_label) VALUES ('DATA_EDITION_OTHER_PROVIDER', 'Add / Update / Delete data from another provider');
INSERT INTO permission(permission_code, permission_label) VALUES ('CHECK_CONF', 'Check the configuration');
INSERT INTO permission(permission_code, permission_label) VALUES ('CANCEL_VALIDATED_SUBMISSION', 'Cancel validated submission');
INSERT INTO permission(permission_code, permission_label) VALUES ('CANCEL_OTHER_PROVIDER_SUBMISSION', 'Cancel other provider submission');

-- Add the permissions per role
INSERT INTO permission_per_role(role_code, permission_code) VALUES ('ADMIN', 'MANAGE_USERS');
INSERT INTO permission_per_role(role_code, permission_code) VALUES ('ADMIN', 'DATA_INTEGRATION');
INSERT INTO permission_per_role(role_code, permission_code) VALUES ('ADMIN', 'DATA_QUERY');
INSERT INTO permission_per_role(role_code, permission_code) VALUES ('ADMIN', 'DATA_QUERY_OTHER_PROVIDER');
INSERT INTO permission_per_role(role_code, permission_code) VALUES ('ADMIN', 'DATA_HARMONIZATION');
--INSERT INTO permission_per_role(role_code, permission_code) VALUES ('ADMIN', 'DATA_QUERY_HARMONIZED');
--INSERT INTO permission_per_role(role_code, permission_code) VALUES ('ADMIN', 'DATA_AGGREGATION');
--INSERT INTO permission_per_role(role_code, permission_code) VALUES ('ADMIN', 'DATA_QUERY_AGGREGATED');
--INSERT INTO permission_per_role(role_code, permission_code) VALUES ('ADMIN', 'DATA_INTERPOLATION');
--INSERT INTO permission_per_role(role_code, permission_code) VALUES ('ADMIN', 'OVERVIEW');
--INSERT INTO permission_per_role(role_code, permission_code) VALUES ('ADMIN', 'DOCUMENTATION');
--INSERT INTO permission_per_role(role_code, permission_code) VALUES ('ADMIN', 'PRIVATE_DOCUMENTATION');
INSERT INTO permission_per_role(role_code, permission_code) VALUES ('ADMIN', 'EXPORT_RAW_DATA');
INSERT INTO permission_per_role(role_code, permission_code) VALUES ('ADMIN', 'DATA_EDITION');
INSERT INTO permission_per_role(role_code, permission_code) VALUES ('ADMIN', 'DATA_EDITION_OTHER_PROVIDER');
INSERT INTO permission_per_role(role_code, permission_code) VALUES ('ADMIN', 'CHECK_CONF');
INSERT INTO permission_per_role(role_code, permission_code) VALUES ('ADMIN', 'CANCEL_VALIDATED_SUBMISSION');
INSERT INTO permission_per_role(role_code, permission_code) VALUES ('ADMIN', 'CANCEL_OTHER_PROVIDER_SUBMISSION');


--
-- Restriction d'accès aux dataset
--
--INSERT INTO DATASET_ROLE_RESTRICTION (ROLE_CODE, DATASET_ID) VALUES ('ADMIN', 'SPECIES');

INSERT INTO layer_role_restriction (layer_name, role_code) VALUES ('all_harmonized_locations', 'ADMIN');



--
-- Définition des requêtes prédéfinies
--

set search_path = website;

DELETE FROM predefined_request_group_asso;
DELETE FROM predefined_request_group;
DELETE FROM predefined_request_criteria;
DELETE FROM predefined_request_result;
DELETE FROM predefined_request;

-- Création d'un thème (groupe de requêtes)
INSERT INTO predefined_request_group(group_name, label, definition, position) VALUES ('SPECIES', 'Distribution par espèce', 'Distribution par espèce', 1);

-- Création d'une requête prédéfinie
INSERT INTO predefined_request (request_name, schema_code, dataset_id, label, definition, date) VALUES ('SPECIES', 'RAW_DATA', 'SPECIES', 'Distribution par espèce', 'Distribution par espèce en forêt', now());
INSERT INTO predefined_request (request_name, schema_code, dataset_id, label, definition, date) VALUES ('DEP', 'RAW_DATA', 'SPECIES', 'Espèces par département', 'Espèces par département', now());


-- Configuration des requêtes prédéfinies
INSERT INTO predefined_request_criteria (request_name, format, data, value, fixed) VALUES ('SPECIES', 'SPECIES_FORM', 'SPECIES_CODE', '026.001.006', NULL);
INSERT INTO predefined_request_result (request_name, format, data) VALUES ('SPECIES', 'PLOT_FORM', 'PLOT_CODE');
INSERT INTO predefined_request_result (request_name, format, data) VALUES ('SPECIES', 'PLOT_FORM', 'CYCLE');
INSERT INTO predefined_request_result (request_name, format, data) VALUES ('SPECIES', 'PLOT_FORM', 'INV_DATE');
INSERT INTO predefined_request_result (request_name, format, data) VALUES ('SPECIES', 'PLOT_FORM', 'IS_FOREST_PLOT');
INSERT INTO predefined_request_result (request_name, format, data) VALUES ('SPECIES', 'SPECIES_FORM', 'SPECIES_CODE');
INSERT INTO predefined_request_result (request_name, format, data) VALUES ('SPECIES', 'SPECIES_FORM', 'BASAL_AREA');

INSERT INTO predefined_request_criteria (request_name, format, data, value, fixed) VALUES ('DEP', 'LOCATION_FORM', 'DEPARTEMENT', '45', NULL);
INSERT INTO predefined_request_result (request_name, format, data) VALUES ('DEP', 'PLOT_FORM', 'PLOT_CODE');
INSERT INTO predefined_request_result (request_name, format, data) VALUES ('DEP', 'PLOT_FORM', 'CYCLE');
INSERT INTO predefined_request_result (request_name, format, data) VALUES ('DEP', 'PLOT_FORM', 'INV_DATE');
INSERT INTO predefined_request_result (request_name, format, data) VALUES ('DEP', 'PLOT_FORM', 'IS_FOREST_PLOT');
INSERT INTO predefined_request_result (request_name, format, data) VALUES ('DEP', 'SPECIES_FORM', 'SPECIES_CODE');
INSERT INTO predefined_request_result (request_name, format, data) VALUES ('DEP', 'SPECIES_FORM', 'BASAL_AREA');


-- Rattachement de la requête prédéfinies au thème
INSERT INTO website.predefined_request_group_asso(group_name, request_name, position) VALUES ('SPECIES', 'SPECIES', 1);
INSERT INTO website.predefined_request_group_asso(group_name, request_name, position) VALUES ('SPECIES', 'DEP', 2);

