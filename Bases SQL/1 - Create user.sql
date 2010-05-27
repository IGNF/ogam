
-- Crée un user de connexion eforest / eforest
CREATE ROLE eforest LOGIN
  ENCRYPTED PASSWORD 'md50c9861e20d394c9b183b1c45c5c9098c'
  NOSUPERUSER NOINHERIT NOCREATEDB NOCREATEROLE;
  
ALTER ROLE eforest SET search_path=public, website, metadata, mapping, raw_data, harmonized_data, aggregated_data;


GRANT ALL ON SCHEMA website TO "eforest";
GRANT ALL ON SCHEMA metadata TO "eforest";
GRANT ALL ON SCHEMA raw_data TO "eforest";
GRANT ALL ON SCHEMA harmonized_data TO "eforest";
GRANT ALL ON SCHEMA aggregated_data TO "eforest";
