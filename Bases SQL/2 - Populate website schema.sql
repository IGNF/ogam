SET SEARCH_PATH = website;

-- TEST DATABASE Parameters
INSERT INTO application_parameters (name, value, description) values ('UploadDirectory','/var/tmp/efdac_upload','Directory where the CSV files are uploaded');
INSERT INTO application_parameters (name, value, description) values ('InterpolationResultDirectory','C:/workspace/Eforest/Mapserv/generated_content/','Directory where the ESRI ASCII files are generated');
INSERT INTO application_parameters (name, value, description) values ('RInstallDirectory','C:/Program Files/R/R-2.10.0/bin/','Directory of installation of R');
INSERT INTO application_parameters (name, value, description) values ('Test','OK','For test purposes');
INSERT INTO application_parameters (name, value, description) values ('fromMail','EFDAC@ifn.fr','The application email');
INSERT INTO application_parameters (name, value, description) values ('toMail','benoit.pesty@ifn.fr','The destination email');

-- Create some roles
INSERT INTO role(role_code, role_label, role_def, degradated_coordinate, is_europe_level) VALUES ('ADMIN','Administrator', 'Manages the web site', 0, 1);
INSERT INTO role(role_code, role_label, role_def, degradated_coordinate, is_europe_level) VALUES ('DATA_PROVIDER', 'Data provider', 'Submit data', 0, 0);
INSERT INTO role(role_code, role_label, role_def, degradated_coordinate, is_europe_level) VALUES ('FRAMEWORK_MEMBER', 'Framework member', 'Access Data', 0, 1);
INSERT INTO role(role_code, role_label, role_def, degradated_coordinate, is_europe_level) VALUES ('JRC', 'JRC', 'Access Data', 1, 1);
INSERT INTO role(role_code, role_label, role_def, degradated_coordinate, is_europe_level) VALUES ('VISITOR', 'VISITOR', 'Access Documentation', 0, 0);


-- Create some users
INSERT INTO users(user_login, user_password, user_name, country_code, active, email) VALUES ('test', 'a94a8fe5ccb19ba61c4c0873d391e987982fbbd3', 'test user', '1', '1', 'benoit.pesty@ifn.fr');  
INSERT INTO users(user_login, user_password, user_name, country_code, active, email) VALUES ('admin', 'd033e22ae348aeb5660fc2140aec35850c4da997', 'admin user', '1', '1', null); 
INSERT INTO users(user_login, user_password, user_name, country_code, active, email) VALUES ('france', '23e591e8c36dda987970603ad0fdd031b7dff9f9', 'French NFI', '1', '1', null); 
INSERT INTO users(user_login, user_password, user_name, country_code, active, email) VALUES ('spain', '51288d140528c2d5c0565891be70300a9b0e365f', 'Spanish NFI', '11', '1', null);  
INSERT INTO users(user_login, user_password, user_name, country_code, active, email) VALUES ('netherlands', '6ace185eedb813fe84c2eca7641f9fa0aa3bfdc3', 'Netherlands NFI', '3', '1', null);  
INSERT INTO users(user_login, user_password, user_name, country_code, active, email) VALUES ('jrc', 'ad49f0c06d5739f392cf5e3201d3197bf2a8978e', 'jrc user', '1', '1', null);  -- Password is JRC
INSERT INTO users(user_login, user_password, user_name, country_code, active, email) VALUES ('visitor', '4ed0428505b0b89fe7bc1a01928ef1bd4c77c1be', 'visitor', '1', '1', null);  -- Password is visitor

-- Link the users to their roles
INSERT INTO role_to_user(user_login, role_code) VALUES ('test', 'FRAMEWORK_MEMBER');
INSERT INTO role_to_user(user_login, role_code) VALUES ('admin', 'ADMIN');
INSERT INTO role_to_user(user_login, role_code) VALUES ('france', 'DATA_PROVIDER');
INSERT INTO role_to_user(user_login, role_code) VALUES ('spain', 'DATA_PROVIDER');
INSERT INTO role_to_user(user_login, role_code) VALUES ('netherlands', 'FRAMEWORK_MEMBER');
INSERT INTO role_to_user(user_login, role_code) VALUES ('jrc', 'JRC');
INSERT INTO role_to_user(user_login, role_code) VALUES ('visitor', 'VISITOR');

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
INSERT INTO permission(permission_code, permission_label) VALUES ('PRIVATE_DOCUMENTATION', 'Visualise the project private documentation');
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
INSERT INTO permission_per_role(role_code, permission_code) VALUES ('ADMIN', 'PRIVATE_DOCUMENTATION');
INSERT INTO permission_per_role(role_code, permission_code) VALUES ('ADMIN', 'EXPORT_HARMONIZED_DATA');



INSERT INTO permission_per_role(role_code, permission_code) VALUES ('DATA_PROVIDER', 'DATA_INTEGRATION');
INSERT INTO permission_per_role(role_code, permission_code) VALUES ('DATA_PROVIDER', 'DATA_QUERY');
INSERT INTO permission_per_role(role_code, permission_code) VALUES ('DATA_PROVIDER', 'DOCUMENTATION');
INSERT INTO permission_per_role(role_code, permission_code) VALUES ('DATA_PROVIDER', 'DATA_QUERY_HARMONIZED');
INSERT INTO permission_per_role(role_code, permission_code) VALUES ('DATA_PROVIDER', 'EXPORT_HARMONIZED_DATA');
INSERT INTO permission_per_role(role_code, permission_code) VALUES ('DATA_PROVIDER', 'PRIVATE_DOCUMENTATION');

INSERT INTO permission_per_role(role_code, permission_code) VALUES ('FRAMEWORK_MEMBER', 'DATA_QUERY');
INSERT INTO permission_per_role(role_code, permission_code) VALUES ('FRAMEWORK_MEMBER', 'DATA_HARMONIZATION');
INSERT INTO permission_per_role(role_code, permission_code) VALUES ('FRAMEWORK_MEMBER', 'DATA_QUERY_HARMONIZED');
INSERT INTO permission_per_role(role_code, permission_code) VALUES ('FRAMEWORK_MEMBER', 'DATA_AGGREGATION');
INSERT INTO permission_per_role(role_code, permission_code) VALUES ('FRAMEWORK_MEMBER', 'DATA_QUERY_AGGREGATED');
INSERT INTO permission_per_role(role_code, permission_code) VALUES ('FRAMEWORK_MEMBER', 'DOCUMENTATION');
INSERT INTO permission_per_role(role_code, permission_code) VALUES ('FRAMEWORK_MEMBER', 'PRIVATE_DOCUMENTATION');

INSERT INTO permission_per_role(role_code, permission_code) VALUES ('JRC', 'DATA_QUERY_HARMONIZED');
-- INSERT INTO permission_per_role(role_code, permission_code) VALUES ('JRC', 'DATA_QUERY_AGGREGATED');
INSERT INTO permission_per_role(role_code, permission_code) VALUES ('JRC', 'OVERVIEW');
INSERT INTO permission_per_role(role_code, permission_code) VALUES ('JRC', 'DOCUMENTATION');

INSERT INTO permission_per_role(role_code, permission_code) VALUES ('VISITOR', 'DOCUMENTATION');




INSERT INTO permission_per_role(role_code, permission_code) VALUES ('ADMIN', 'EXPORT_RAW_DATA');
INSERT INTO permission_per_role(role_code, permission_code) VALUES ('DATA_PROVIDER', 'EXPORT_RAW_DATA');



