SET SEARCH_PATH = website;

-- TEST DATABASE Parameters
INSERT INTO application_parameters (name, value, description) values ('UploadDirectory','/var/tmp/ogam_upload','Directory where the CSV files are uploaded');
INSERT INTO application_parameters (name, value, description) values ('InterpolationResultDirectory','C:/workspace/OGAM/Mapserv/generated_content/','Directory where the ESRI ASCII files are generated');
INSERT INTO application_parameters (name, value, description) values ('RInstallDirectory','C:/Program Files/R/R-2.10.0/bin/','Directory of installation of R');
INSERT INTO application_parameters (name, value, description) values ('Test','OK','For test purposes');
INSERT INTO application_parameters (name, value, description) values ('fromMail','OGAM@ifn.fr','The application email');
INSERT INTO application_parameters (name, value, description) values ('toMail','benoit.pesty@ifn.fr','The destination email');

-- Create some roles
INSERT INTO role(role_code, role_label, role_def, degradated_coordinate, is_europe_level) VALUES ('ADMIN','Administrator', 'Manages the web site', 0, 1);

-- Create some users
INSERT INTO users(user_login, user_password, user_name, country_code, active, email) VALUES ('admin', 'd033e22ae348aeb5660fc2140aec35850c4da997', 'admin user', '1', '1', null); 

-- Link the users to their roles
INSERT INTO role_to_user(user_login, role_code) VALUES ('admin', 'ADMIN');


-- List the permissions of the web site
INSERT INTO permission(permission_code, permission_label) VALUES ('MANAGE_USERS', 'Manage users');
INSERT INTO permission(permission_code, permission_label) VALUES ('DATA_INTEGRATION', 'Provide data');
INSERT INTO permission(permission_code, permission_label) VALUES ('OVERVIEW', 'See an overview board');
INSERT INTO permission(permission_code, permission_label) VALUES ('DATA_QUERY', 'Visualise raw data');
INSERT INTO permission(permission_code, permission_label) VALUES ('DATA_HARMONIZATION', 'Launch the harmonization process');
INSERT INTO permission(permission_code, permission_label) VALUES ('DATA_QUERY_HARMONIZED', 'Visualise harmonised data');
INSERT INTO permission(permission_code, permission_label) VALUES ('DATA_AGGREGATION', 'Launch the aggregation process');
INSERT INTO permission(permission_code, permission_label) VALUES ('DATA_QUERY_AGGREGATED', 'Visualise aggregated data');
INSERT INTO permission(permission_code, permission_label) VALUES ('DATA_INTERPOLATION', 'Launch the interpolation process');
INSERT INTO permission(permission_code, permission_label) VALUES ('DOCUMENTATION', 'Visualise the project public documentation');
--INSERT INTO permission(permission_code, permission_label) VALUES ('PRIVATE_DOCUMENTATION', 'Visualise the project private documentation');
INSERT INTO permission(permission_code, permission_label) VALUES ('EXPORT_RAW_DATA', 'Export the raw data as a CSV file');
INSERT INTO permission(permission_code, permission_label) VALUES ('EXPORT_HARMONIZED_DATA', 'Export the harmonized data as a CSV file');

-- Add the permissions per role
INSERT INTO permission_per_role(role_code, permission_code) VALUES ('ADMIN', 'MANAGE_USERS');
INSERT INTO permission_per_role(role_code, permission_code) VALUES ('ADMIN', 'DATA_INTEGRATION');
INSERT INTO permission_per_role(role_code, permission_code) VALUES ('ADMIN', 'DATA_QUERY');
INSERT INTO permission_per_role(role_code, permission_code) VALUES ('ADMIN', 'DATA_HARMONIZATION');
INSERT INTO permission_per_role(role_code, permission_code) VALUES ('ADMIN', 'DATA_QUERY_HARMONIZED');
INSERT INTO permission_per_role(role_code, permission_code) VALUES ('ADMIN', 'DATA_AGGREGATION');
INSERT INTO permission_per_role(role_code, permission_code) VALUES ('ADMIN', 'DATA_QUERY_AGGREGATED');
INSERT INTO permission_per_role(role_code, permission_code) VALUES ('ADMIN', 'DATA_INTERPOLATION');
INSERT INTO permission_per_role(role_code, permission_code) VALUES ('ADMIN', 'OVERVIEW');
INSERT INTO permission_per_role(role_code, permission_code) VALUES ('ADMIN', 'DOCUMENTATION');
--INSERT INTO permission_per_role(role_code, permission_code) VALUES ('ADMIN', 'PRIVATE_DOCUMENTATION');
INSERT INTO permission_per_role(role_code, permission_code) VALUES ('ADMIN', 'EXPORT_HARMONIZED_DATA');


