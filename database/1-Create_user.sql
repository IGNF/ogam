
-- Crée un user de connexion ogam / ogam
CREATE ROLE ogam LOGIN
  ENCRYPTED PASSWORD 'md518c5a22167aa536fd924eafa7aca34dc'
  NOSUPERUSER NOINHERIT NOCREATEDB NOCREATEROLE;
  
ALTER ROLE ogam SET search_path=public, website, metadata, mapping, raw_data, harmonized_data;

GRANT ALL ON ALL TABLES IN SCHEMA harmonized_data TO ogam;
GRANT ALL ON ALL TABLES IN SCHEMA mapping TO ogam;
-- GRANT ALL ON SCHEMA metadata TO ogam;  -- pas certain que ce soit utile
GRANT ALL ON ALL TABLES IN SCHEMA metadata TO ogam;
GRANT ALL ON ALL TABLES IN SCHEMA raw_data TO ogam;
GRANT ALL ON ALL TABLES IN SCHEMA website TO ogam;
