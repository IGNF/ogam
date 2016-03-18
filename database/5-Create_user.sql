SET client_encoding TO 'UTF8';

DO
$body$
BEGIN
   IF NOT EXISTS (
      SELECT *
      FROM   pg_catalog.pg_user
      WHERE  usename = 'ogam') THEN

		-- Crée un user de connexion ogam / ogam
		CREATE ROLE ogam LOGIN
		  ENCRYPTED PASSWORD 'md518c5a22167aa536fd924eafa7aca34dc'
		  NOSUPERUSER NOINHERIT NOCREATEDB NOCREATEROLE;
   END IF;
END
$body$;
  
ALTER ROLE ogam SET search_path=public, website, metadata, mapping, raw_data, harmonized_data;

-- website
GRANT ALL ON SCHEMA website TO ogam;
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
GRANT ALL ON TABLE raw_data.tree_id_seq TO ogam;
GRANT SELECT, INSERT ON TABLE raw_data.check_error TO ogam;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE raw_data.location TO ogam;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE raw_data.plot_data TO ogam;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE raw_data.species_data TO ogam;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE raw_data.tree_data TO ogam;
GRANT ALL ON TABLE raw_data.submission TO ogam;
GRANT ALL ON TABLE raw_data.submission_file TO ogam;
GRANT EXECUTE ON FUNCTION raw_data.geomfromcoordinate() TO ogam;

GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA raw_data TO ogam;


-- harmonized-data

GRANT ALL ON SCHEMA harmonized_data TO ogam;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE harmonized_data.harmonization_process TO ogam;
GRANT SELECT, INSERT, DELETE ON TABLE harmonized_data.harmonization_process_submissions TO ogam;
GRANT SELECT, INSERT, DELETE ON TABLE harmonized_data.harmonized_location TO ogam;
GRANT SELECT, INSERT, DELETE ON TABLE harmonized_data.harmonized_plot_data TO ogam;
GRANT SELECT, INSERT, DELETE ON TABLE harmonized_data.harmonized_species_data TO ogam;
GRANT SELECT, INSERT, DELETE ON TABLE harmonized_data.harmonized_tree_data TO ogam;
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
GRANT SELECT ON TABLE metadata.mode_taxref TO ogam;
GRANT SELECT ON TABLE metadata.mode_tree TO ogam;
GRANT SELECT ON TABLE metadata.process TO ogam;
GRANT SELECT ON TABLE metadata.range TO ogam;
GRANT SELECT ON TABLE metadata.table_field TO ogam;
GRANT SELECT ON TABLE metadata.table_format TO ogam;
GRANT SELECT ON TABLE metadata.table_schema TO ogam;
GRANT SELECT ON TABLE metadata.table_tree TO ogam;
GRANT SELECT ON TABLE metadata.unit TO ogam;
GRANT SELECT ON TABLE metadata.translation TO ogam;

-- mapping
GRANT ALL ON SCHEMA "mapping" TO ogam;
GRANT SELECT ON TABLE "mapping".bounding_box TO ogam;
GRANT SELECT ON TABLE "mapping".layer TO ogam;
GRANT SELECT ON TABLE "mapping".layer_service TO ogam;
GRANT SELECT ON TABLE "mapping".layer_tree TO ogam;
GRANT ALL ON TABLE "mapping".result_location TO ogam;

GRANT SELECT ON TABLE "mapping".scales TO ogam;
GRANT ALL ON TABLE "mapping".nuts_0 TO ogam;
GRANT ALL ON TABLE "mapping".departements TO ogam;
GRANT ALL ON TABLE "mapping".communes TO ogam;

-- referentiels
GRANT ALL ON SCHEMA referentiels TO ogam;
GRANT ALL ON TABLE referentiels.taxref TO ogam;
GRANT ALL ON TABLE referentiels.taxref_rang TO ogam;
GRANT ALL ON TABLE referentiels.taxref_statut TO ogam;

-- public
GRANT SELECT ON TABLE public.geometry_columns TO public;
GRANT SELECT ON TABLE public.spatial_ref_sys TO public;
