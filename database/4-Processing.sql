SET client_encoding TO 'UTF8';
set search_path = metadata;


--
--  Clean previous process
-- 
delete from metadata.process;

----------------------------------
-- Update the  tree_id sequence after an insert
----------------------------------
--INSERT INTO metadata.process (process_id, step, label, description, statement) 
--VALUES ('UPDATE_TREE_ID_SEQUENCE', 'INTEGRATION', 'Update the tree_id sequence after an insert', 'pdate the tree_id sequence after an insert',
--'SELECT setval(''raw_data.tree_id_seq'', max(tree_id) + 1) FROM raw_data.tree_data');


