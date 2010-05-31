
-- Crée un user de connexion eforest / eforest
CREATE ROLE ogam LOGIN
  ENCRYPTED PASSWORD 'md518c5a22167aa536fd924eafa7aca34dc'
  NOSUPERUSER NOINHERIT NOCREATEDB NOCREATEROLE;
  
ALTER ROLE ogam SET search_path=public, website, metadata, mapping, raw_data, harmonized_data, aggregated_data;


GRANT ALL ON SCHEMA website TO "ogam";
GRANT ALL ON SCHEMA metadata TO "ogam";
GRANT ALL ON SCHEMA raw_data TO "ogam";
GRANT ALL ON SCHEMA harmonized_data TO "ogam";
GRANT ALL ON SCHEMA aggregated_data TO "ogam";
