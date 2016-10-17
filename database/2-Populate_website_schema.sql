

--
-- Application parameters
--

SET SEARCH_PATH = website;

DELETE FROM application_parameters;

-- TEST DATABASE Parameters
INSERT INTO application_parameters (name, value, description) VALUES ('Test', 'OK', 'For test purposes');
INSERT INTO application_parameters (name, value, description) VALUES ('fromMail', 'OGAM@ign.fr', 'The application email');
INSERT INTO application_parameters (name, value, description) VALUES ('toMail', 'benoit.pesty@ign.fr', 'The destination email');
INSERT INTO application_parameters (name, value, description) VALUES ('autoLogin', '0', 'DEFAULT LOGIN AND PAGE FOR PUBLIC ACCESS');
INSERT INTO application_parameters (name, value, description) VALUES ('defaultUser', 'visitor', 'DEFAULT LOGIN AND PAGE FOR PUBLIC ACCESS');
INSERT INTO application_parameters (name, value, description) VALUES ('fileMaxSize', '100', 'UPLOAD');
INSERT INTO application_parameters (name, value, description) VALUES ('integrationService_url', 'http://localhost:8080/OGAMIntegrationService/', 'INTEGRATION SERVICE');
INSERT INTO application_parameters (name, value, description) VALUES ('harmonizationService_url', 'http://localhost:8080/OGAMHarmonizationService/', 'HARMONIZATION SERVICE');
INSERT INTO application_parameters (name, value, description) VALUES ('reportGenerationService_url', 'http://localhost:8080/OGAMRG/', 'REPORT GENERATION SERVICE');
INSERT INTO application_parameters (name, value, description) VALUES ('errorReport', 'ErrorReport.rptdesign', 'REPORT GENERATION SERVICE');
INSERT INTO application_parameters (name, value, description) VALUES ('plotErrorReport', 'PlotErrorReport.rptdesign', 'REPORT GENERATION SERVICE');
INSERT INTO application_parameters (name, value, description) VALUES ('simplifiedReport', 'SimplifiedReport.rptdesign', 'REPORT GENERATION SERVICE');
INSERT INTO application_parameters (name, value, description) VALUES ('max_report_generation_time', '480', 'REPORT GENERATION SERVICE');
INSERT INTO application_parameters (name, value, description) VALUES ('useCache', 'false', 'Cache');
INSERT INTO application_parameters (name, value, description) VALUES ('max_execution_time', '480', 'Timeout , 0 : no limit');
INSERT INTO application_parameters (name, value, description) VALUES ('memory_limit', '1024M', 'memory limit');
INSERT INTO application_parameters (name, value, description) VALUES ('post_max_size', '100M', 'Note : "post_max_size" and "upload_max_filesize" are under the PHP_INI_PERDIR mode (php.ini, .htaccess or httpd.conf).The parameter must be set into the php.ini file because it s not possible in the other files when php is running under the CGI mode. So we can only check if it s done.');
INSERT INTO application_parameters (name, value, description) VALUES ('upload_max_filesize', '100M', 'Note : "post_max_size" and "upload_max_filesize" are under the PHP_INI_PERDIR mode (php.ini, .htaccess or httpd.conf).The parameter must be set into the php.ini file because it s not possible in the other files when php is running under the CGI mode. So we can only check if it s done.');
INSERT INTO application_parameters (name, value, description) VALUES ('image_dir_rights', '0662', 'File Upload');
INSERT INTO application_parameters (name, value, description) VALUES ('image_extensions', 'jpg,png,jpeg,gif', 'File Upload');
INSERT INTO application_parameters (name, value, description) VALUES ('image_max_size', '1000000', 'image max size in bytes');
INSERT INTO application_parameters (name, value, description) VALUES ('tilesize', '256', 'WEB MAPPING ');
INSERT INTO application_parameters (name, value, description) VALUES ('mapserver_private_url', 'http://localhost/mapserv-ogam?', 'The private URL used by mapserverProxy to request a map server.');
INSERT INTO application_parameters (name, value, description) VALUES ('tilecache_private_url', 'http://localhost/tilecache-ogam?', 'The private URL used by tilecacheProxy to request a tile cache.');
INSERT INTO application_parameters (name, value, description) VALUES ('srs_visualisation', '3857', 'Projection system for the visualisation');
INSERT INTO application_parameters (name, value, description) VALUES ('srs_raw_data', '4326', 'Projection system for the raw data database');
INSERT INTO application_parameters (name, value, description) VALUES ('srs_harmonized_data', '3857', 'Projection system for the harmonized database');
INSERT INTO application_parameters (name, value, description) VALUES ('usePerProviderCenter', 'true', 'if true the system will look in the "bounding_box" table for centering info for each provider');
INSERT INTO application_parameters (name, value, description) VALUES ('bbox_x_min', '-2893330', 'X min coordinate of the bounding box (in the projection of visualisation : 3857)');
INSERT INTO application_parameters (name, value, description) VALUES ('bbox_y_min', '3852395', 'Y min coordinate of the bounding box (in the projection of visualisation : 3857)');
INSERT INTO application_parameters (name, value, description) VALUES ('bbox_x_max', '3086670', 'X max coordinate of the bounding box (in the projection of visualisation : 3857)');
INSERT INTO application_parameters (name, value, description) VALUES ('bbox_y_max', '8192395', 'Y max coordinate of the bounding box (in the projection of visualisation : 3857)');
INSERT INTO application_parameters (name, value, description) VALUES ('zoom_level', '1', 'WEB MAPPING ');
INSERT INTO application_parameters (name, value, description) VALUES ('mapserver_dpi', '72', 'Default number of dots per inch in mapserv');
INSERT INTO application_parameters (name, value, description) VALUES ('mapserver_inch_per_kilometer', '39370.1', 'Inch to meter conversion factor');
INSERT INTO application_parameters (name, value, description) VALUES ('featureinfo_margin', '1000', 'bounding box margin around the user click (in the unit of the map)');
INSERT INTO application_parameters (name, value, description) VALUES ('featureinfo_typename', 'result_locations', 'Layer that is queried');
INSERT INTO application_parameters (name, value, description) VALUES ('featureinfo_maxfeatures', '20', 'Max number of features returned by a click on the map. If 0 then there is no limit; If 1 the direct access to the detail');
INSERT INTO application_parameters (name, value, description) VALUES ('featureinfo_selectmode', 'buffer', 'Method to return closest features : "distance" or "buffer"');
INSERT INTO application_parameters (name, value, description) VALUES ('contactEmailPrefix', 'ogam', 'Email');
INSERT INTO application_parameters (name, value, description) VALUES ('contactEmailSufix', 'ign.fr', 'Email');
INSERT INTO application_parameters (name, value, description) VALUES ('csvExportCharset', 'UTF-8', 'Csv Export');
INSERT INTO application_parameters (name, value, description) VALUES ('language_flags1', 'fr', 'Language');
INSERT INTO application_parameters (name, value, description) VALUES ('language_flags2', 'en', 'Language');
INSERT INTO application_parameters (name, value, description) VALUES ('showUploadFileDetail', '1', 'Display on the upload screen the columns for each file (0 for false, 1 for true)');
INSERT INTO application_parameters (name, value, description) VALUES ('showUploadFileModel', '1', 'Display on the upload screen a link to a sample CSV file (0 for false, 1 for true)');
INSERT INTO application_parameters (name, value, description) VALUES ('UploadDirectory', '/var/tmp/ogam_upload', 'Directory where the CSV files are uploaded');
INSERT INTO application_parameters (name, value, description) VALUES ('uploadDir', '/vagrant/ogam/website/htdocs/server/ogamServer/upload', 'Directory where the PHP server depose the files for the INTEGRATION SERVICE');
INSERT INTO application_parameters (name, value, description) VALUES ('image_upload_dir', '/vagrant/ogam/website/htdocs/server/ogamServer/upload/images/', 'Images Upload');
INSERT INTO application_parameters (name, value, description) VALUES ('query_details_layers1', 'ortho_photos,countries,departements,communes,location_detail_zoom_in,tree_detail_zoom_in', 'The layers used for the details zoom in map image. Note: order is important');
INSERT INTO application_parameters (name, value, description) VALUES ('query_details_layers2', 'ortho_photos,countries,departements,location_detail_zoom_out,tree_detail_zoom_out', 'The layers used for the details zoom out map image. Note: order is important');

--
-- Users
--


SET SEARCH_PATH = website;

DELETE FROM dataset_role_restriction;
DELETE FROM layer_role_restriction;
DELETE FROM role_to_schema;
DELETE FROM role_to_user;
DELETE FROM permission_per_role;
DELETE FROM permission;
DELETE FROM users;
DELETE FROM role;
DELETE FROM providers;

-- Create a provider
INSERT INTO providers(id, label, definition) VALUES ('1', 'Defaut', 'Organisme par défaut');
INSERT INTO providers(id, label, definition) VALUES ('2', 'Dunkerque SA', 'Organisme de Dunkerque');
ALTER sequence website.provider_id_seq restart with 3;

-- Create some roles
INSERT INTO role(role_code, role_label, role_definition) VALUES ('ADMIN','Administrator', 'Manages the web site');
INSERT INTO role(role_code, role_label, role_definition) VALUES ('VISITOR','Visitor', 'Visites the website');

-- Create some users
INSERT INTO users(user_login, user_password, user_name, provider_id, email) VALUES ('admin', 'd033e22ae348aeb5660fc2140aec35850c4da997', 'admin user', '1', null); 
INSERT INTO users(user_login, user_password, user_name, provider_id, email) VALUES ('visitor', '4ed0428505b0b89fe7bc1a01928ef1bd4c77c1be', 'Visitor', '2', null); 

-- Link the users to their roles
INSERT INTO role_to_user(user_login, role_code) VALUES ('admin', 'ADMIN');
INSERT INTO role_to_user(user_login, role_code) VALUES ('visitor', 'VISITOR');

-- Link the schemas to their roles
INSERT INTO role_to_schema(ROLE_CODE, SCHEMA_CODE) VALUES ('ADMIN', 'RAW_DATA');
INSERT INTO role_to_schema(ROLE_CODE, SCHEMA_CODE) VALUES ('ADMIN', 'HARMONIZED_DATA');
INSERT INTO role_to_schema(ROLE_CODE, SCHEMA_CODE) VALUES ('VISITOR', 'RAW_DATA');

-- List the permissions of the web site
INSERT INTO permission(permission_code, permission_label) VALUES ('MANAGE_USERS', 'Manage users');
INSERT INTO permission(permission_code, permission_label) VALUES ('DATA_INTEGRATION', 'Provide data');
INSERT INTO permission(permission_code, permission_label) VALUES ('DATA_QUERY', 'Visualise data');
INSERT INTO permission(permission_code, permission_label) VALUES ('DATA_QUERY_OTHER_PROVIDER', 'Visualise data from other provider');
INSERT INTO permission(permission_code, permission_label) VALUES ('DATA_HARMONIZATION', 'Launch the harmonization process');
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
INSERT INTO permission_per_role(role_code, permission_code) VALUES ('ADMIN', 'EXPORT_RAW_DATA');
INSERT INTO permission_per_role(role_code, permission_code) VALUES ('ADMIN', 'DATA_EDITION');
INSERT INTO permission_per_role(role_code, permission_code) VALUES ('ADMIN', 'DATA_EDITION_OTHER_PROVIDER');
INSERT INTO permission_per_role(role_code, permission_code) VALUES ('ADMIN', 'CHECK_CONF');
INSERT INTO permission_per_role(role_code, permission_code) VALUES ('ADMIN', 'CANCEL_VALIDATED_SUBMISSION');
INSERT INTO permission_per_role(role_code, permission_code) VALUES ('ADMIN', 'CANCEL_OTHER_PROVIDER_SUBMISSION');
INSERT INTO permission_per_role(role_code, permission_code) VALUES ('VISITOR', 'DATA_QUERY');
INSERT INTO permission_per_role(role_code, permission_code) VALUES ('VISITOR', 'DATA_QUERY_OTHER_PROVIDER');


--
-- Restriction d'accès aux dataset
--
--INSERT INTO dataset_role_restriction (ROLE_CODE, DATASET_ID) VALUES ('ADMIN', 'SPECIES');

--INSERT INTO layer_role_restriction (layer_name, role_code) VALUES ('all_harmonized_locations', 'ADMIN');



--
-- Predefined requests
--

set search_path = website;

DELETE FROM predefined_request_group_asso;
DELETE FROM predefined_request_group;
DELETE FROM predefined_request_criterion;
DELETE FROM predefined_request_column;
DELETE FROM predefined_request;

-- Création d'un thème (groupe de requêtes)
INSERT INTO predefined_request_group(name, label, definition, position) VALUES ('SPECIES', 'Distribution par espèce', 'Distribution par espèce', 1);

-- Création d'une requête prédéfinie
INSERT INTO predefined_request (name, schema_code, dataset_id, label, definition, date) VALUES ('SPECIES', 'RAW_DATA', 'TREES', 'Distribution par espèce', 'Distribution par espèce en forêt', now());
INSERT INTO predefined_request (name, schema_code, dataset_id, label, definition, date) VALUES ('TAXREF', 'RAW_DATA', 'SPECIES', 'Recherche par taxon', 'Recherche par taxon', now());
INSERT INTO predefined_request (name, schema_code, dataset_id, label, definition, date) VALUES ('DEP', 'RAW_DATA', 'SPECIES', 'Espèces par département', 'Espèces par département', now());


-- Configuration des requêtes prédéfinies
INSERT INTO predefined_request_criterion (request_name, format, data, value, fixed) VALUES ('SPECIES', 'TREE_FORM', 'SPECIES_CODE', '026.001.006', TRUE);
INSERT INTO predefined_request_column (request_name, format, data) VALUES ('SPECIES', 'PLOT_FORM', 'PLOT_CODE');
INSERT INTO predefined_request_column (request_name, format, data) VALUES ('SPECIES', 'PLOT_FORM', 'CYCLE');
INSERT INTO predefined_request_column (request_name, format, data) VALUES ('SPECIES', 'PLOT_FORM', 'INV_DATE');
INSERT INTO predefined_request_column (request_name, format, data) VALUES ('SPECIES', 'PLOT_FORM', 'IS_FOREST_PLOT');
INSERT INTO predefined_request_column (request_name, format, data) VALUES ('SPECIES', 'SPECIES_FORM', 'SPECIES_CODE');
INSERT INTO predefined_request_column (request_name, format, data) VALUES ('SPECIES', 'SPECIES_FORM', 'BASAL_AREA');

INSERT INTO predefined_request_criterion (request_name, format, data, value, fixed) VALUES ('DEP', 'LOCATION_FORM', 'DEPARTEMENT', '45', FALSE);
INSERT INTO predefined_request_column (request_name, format, data) VALUES ('DEP', 'PLOT_FORM', 'PLOT_CODE');
INSERT INTO predefined_request_column (request_name, format, data) VALUES ('DEP', 'PLOT_FORM', 'CYCLE');
INSERT INTO predefined_request_column (request_name, format, data) VALUES ('DEP', 'PLOT_FORM', 'INV_DATE');
INSERT INTO predefined_request_column (request_name, format, data) VALUES ('DEP', 'PLOT_FORM', 'IS_FOREST_PLOT');
INSERT INTO predefined_request_column (request_name, format, data) VALUES ('DEP', 'SPECIES_FORM', 'SPECIES_CODE');
INSERT INTO predefined_request_column (request_name, format, data) VALUES ('DEP', 'SPECIES_FORM', 'BASAL_AREA');

INSERT INTO predefined_request_criterion (request_name, format, data, value, fixed) VALUES ('TAXREF', 'SPECIES_FORM', 'ID_TAXON', '196709', FALSE);
INSERT INTO predefined_request_column (request_name, format, data) VALUES ('TAXREF', 'PLOT_FORM', 'PLOT_CODE');
INSERT INTO predefined_request_column (request_name, format, data) VALUES ('TAXREF', 'PLOT_FORM', 'CYCLE');
INSERT INTO predefined_request_column (request_name, format, data) VALUES ('TAXREF', 'PLOT_FORM', 'INV_DATE');
INSERT INTO predefined_request_column (request_name, format, data) VALUES ('TAXREF', 'PLOT_FORM', 'IS_FOREST_PLOT');
INSERT INTO predefined_request_column (request_name, format, data) VALUES ('TAXREF', 'SPECIES_FORM', 'SPECIES_CODE');
INSERT INTO predefined_request_column (request_name, format, data) VALUES ('TAXREF', 'SPECIES_FORM', 'ID_TAXON');
INSERT INTO predefined_request_column (request_name, format, data) VALUES ('TAXREF', 'SPECIES_FORM', 'BASAL_AREA');


-- Rattachement de la requête prédéfinies au thème
INSERT INTO website.predefined_request_group_asso(group_name, request_name, position) VALUES ('SPECIES', 'SPECIES', 1);
INSERT INTO website.predefined_request_group_asso(group_name, request_name, position) VALUES ('SPECIES', 'DEP', 2);
INSERT INTO website.predefined_request_group_asso(group_name, request_name, position) VALUES ('SPECIES', 'TAXREF', 3);
