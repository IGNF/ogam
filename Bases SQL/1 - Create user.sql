
-- Crée un user de connexion ogam / ogam
CREATE ROLE ogam LOGIN
  ENCRYPTED PASSWORD 'md518c5a22167aa536fd924eafa7aca34dc'
  NOSUPERUSER NOINHERIT NOCREATEDB NOCREATEROLE;
  
ALTER ROLE ogam SET search_path=public, website, metadata, mapping, raw_data, harmonized_data;

-- website
GRANT ALL ON SCHEMA website TO ogam WITH GRANT OPTION;
GRANT SELECT ON TABLE website.permission TO ogam;
GRANT SELECT ON TABLE website.application_parameters TO ogam;
GRANT SELECT, UPDATE, INSERT, DELETE ON TABLE website.users TO ogam;
GRANT SELECT, UPDATE, INSERT, DELETE ON TABLE website.role_to_user TO ogam;
GRANT SELECT, UPDATE, INSERT, DELETE ON TABLE website.role_to_schema TO ogam;
GRANT SELECT, UPDATE, INSERT, DELETE ON TABLE website."role" TO ogam;
GRANT SELECT, UPDATE, INSERT, DELETE ON TABLE website.permission_per_role TO ogam;
GRANT SELECT, UPDATE, INSERT, DELETE ON TABLE website.predefined_request TO ogam;
GRANT SELECT, UPDATE, INSERT, DELETE ON TABLE website.predefined_request_criteria TO ogam;
GRANT SELECT, UPDATE, INSERT, DELETE ON TABLE website.predefined_request_group TO ogam;
GRANT SELECT, UPDATE, INSERT, DELETE ON TABLE website.predefined_request_group_asso TO ogam;
GRANT SELECT, UPDATE, INSERT, DELETE ON TABLE website.predefined_request_result TO ogam;
GRANT SELECT ON TABLE website.dataset_role_restriction TO ogam;
GRANT SELECT ON TABLE website.layer_role_restriction TO ogam;

-- raw-data
GRANT ALL ON SCHEMA raw_data TO ogam;
GRANT ALL ON TABLE raw_data.check_error_check_error_id_seq TO ogam;
GRANT ALL ON TABLE raw_data.submission_id_seq TO ogam;
GRANT SELECT, INSERT ON TABLE raw_data.check_error TO ogam;
GRANT SELECT, INSERT, DELETE ON TABLE raw_data.location TO ogam;
GRANT SELECT, INSERT, DELETE ON TABLE raw_data.cat_ra TO ogam;
GRANT SELECT, INSERT, DELETE ON TABLE raw_data.cat_rp TO ogam;
GRANT SELECT, INSERT, DELETE ON TABLE raw_data.cat_rh TO ogam;
GRANT ALL ON TABLE raw_data.submission TO ogam;
GRANT ALL ON TABLE raw_data.submission_file TO ogam;
GRANT EXECUTE ON FUNCTION raw_data.geomfromcoordinate() TO ogam;

-- harmonized-data
GRANT ALL ON SCHEMA harmonized_data TO ogam;
GRANT SELECT, INSERT, DELETE ON TABLE harmonized_data.harmonization_process TO ogam;
GRANT SELECT, INSERT, DELETE ON TABLE harmonized_data.harmonization_process_submissions TO ogam;
GRANT SELECT, INSERT, DELETE ON TABLE harmonized_data.harmonized_evenement TO ogam;
GRANT SELECT, INSERT, DELETE ON TABLE harmonized_data.harmonized_location TO ogam;
GRANT SELECT, INSERT, DELETE ON TABLE harmonized_data.harmonized_location_compl TO ogam;
GRANT SELECT, INSERT, DELETE ON TABLE harmonized_data.harmonized_point_noir TO ogam;
GRANT SELECT, INSERT, DELETE ON TABLE harmonized_data.harmonized_ouvrage TO ogam;
GRANT SELECT, INSERT, DELETE ON TABLE harmonized_data.harmonized_travaux TO ogam;
GRANT EXECUTE ON FUNCTION harmonized_data.geomfromcoordinate() TO ogam;
GRANT SELECT, USAGE ON TABLE harmonized_data.harmonization_process_harmonization_process_id_seq TO ogam;


-- metadata
GRANT ALL ON SCHEMA metadata TO ogam;
GRANT SELECT ON TABLE metadata.checks TO ogam;
GRANT SELECT ON TABLE metadata.checks_per_provider TO ogam;
GRANT SELECT ON TABLE metadata.data TO ogam;
GRANT SELECT ON TABLE metadata.dataset TO ogam;
GRANT SELECT ON TABLE metadata.dataset_fields TO ogam;
GRANT SELECT ON TABLE metadata.dataset_files TO ogam;
GRANT SELECT ON TABLE metadata.dynamode TO ogam;
GRANT SELECT ON TABLE metadata.field TO ogam;
GRANT SELECT ON TABLE metadata.field_mapping TO ogam;
GRANT SELECT ON TABLE metadata.file_field TO ogam;
GRANT SELECT ON TABLE metadata.file_format TO ogam;
GRANT SELECT ON TABLE metadata.form_field TO ogam;
GRANT SELECT ON TABLE metadata.form_format TO ogam;
GRANT SELECT ON TABLE metadata.format TO ogam;
GRANT SELECT ON TABLE metadata.group_mode TO ogam;
GRANT SELECT ON TABLE metadata."mode" TO ogam;
GRANT SELECT ON TABLE metadata.mode_tree TO ogam;
GRANT SELECT ON TABLE metadata.process TO ogam;
GRANT SELECT ON TABLE metadata.range TO ogam;
GRANT SELECT ON TABLE metadata.table_field TO ogam;
GRANT SELECT ON TABLE metadata.table_format TO ogam;
GRANT SELECT ON TABLE metadata.table_schema TO ogam;
GRANT SELECT ON TABLE metadata.table_tree TO ogam;
GRANT SELECT ON TABLE metadata.unit TO ogam;

-- mapping
GRANT ALL ON SCHEMA "mapping" TO ogam;
GRANT SELECT ON TABLE "mapping".bounding_box TO ogam;
GRANT SELECT ON TABLE "mapping".layer_definition TO ogam;
GRANT SELECT ON TABLE "mapping".legend TO ogam;
GRANT ALL ON TABLE "mapping".result_location TO ogam;
GRANT SELECT ON TABLE "mapping".scales TO ogam;

-- public
GRANT SELECT ON TABLE public.geometry_columns TO public;
GRANT SELECT ON TABLE public.spatial_ref_sys TO public;
