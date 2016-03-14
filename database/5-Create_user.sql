
-- Crée un user de connexion ogam / ogam
CREATE ROLE ogam LOGIN
  ENCRYPTED PASSWORD 'md518c5a22167aa536fd924eafa7aca34dc'
  NOSUPERUSER NOINHERIT NOCREATEDB NOCREATEROLE;
  
ALTER ROLE ogam SET search_path=public, website, metadata, mapping, raw_data, harmonized_data;

