INSERT INTO metadata.mode_taxref(
            unit, code, parent_code, label, definition, complete_name, vernacular_name, 
            is_leaf, is_reference, "position")
 VALUES
('CODE_TAXREF','1' , '*', 'NODE 1', 'NODE1 TAXREF DEF', 'CODE_TAXREF_1', 'NODE1 TAXREF', 
            'f', null, 1),
('CODE_TAXREF','11' , '1', 'NODE 11', 'NODE11 TAXREF DEF', 'CODE_TAXREF_11', 'NODE11 TAXREF', 
            'f', null, 1),
('CODE_TAXREF','12' , '1', 'NODE 12', 'NODE12 TAXREF DEF', 'CODE_TAXREF_12', 'NODE12 TAXREF', 
            'f', null, 1),
('CODE_TAXREF','11.1' , '11', 'NODE 11.1', 'NODE11.1 TAXREF DEF', 'CODE_TAXREF_11.1', 'NODE11.1 TAXREF', 
            't', null, 1),
('CODE_TAXREF','2' , '*', 'NODE 2', 'NODE2 TAXREF DEF', 'CODE_TAXREF_2', 'NODE2 TAXREF', 
            'f', null, 1),
('CODE_TAXREF','21' , '2', 'NODE 21', 'NODE21 TAXREF DEF', 'CODE_TAXREF_21', 'NODE21 TAXREF', 
            't', null, 1),
('CODE_TAXREF','22' , '2', 'NODE 22', 'NODE22 TAXREF DEF', 'CODE_TAXREF_22', 'NODE22 TAXREF', 
            'f', null, 1),
('CODE_TAXREF','22.1' , '22', 'NODE 22.1', 'NODE22.1 TAXREF DEF', 'CODE_TAXREF_22.1', 'NODE22.1 TAXREF', 
            't', null, 1);


INSERT INTO metadata.mode_taxref(
            unit, code, parent_code, label, definition, complete_name, vernacular_name, 
            is_leaf, is_reference, "position")
 VALUES
('ARRAY_TAXREF','1' , '*', 'NODE 1', 'NODE1 TAXREF DEF', 'ARRAY_TAXREF_1', 'NODE1 TAXREF', 
            'f', null, 1),
('ARRAY_TAXREF','11' , '1', 'NODE 11', 'NODE11 TAXREF DEF', 'ARRAY_TAXREF_11', 'NODE11 TAXREF', 
            'f', null, 1),
('ARRAY_TAXREF','12' , '1', 'NODE 12', 'NODE12 TAXREF DEF', 'ARRAY_TAXREF_12', 'NODE12 TAXREF', 
            'f', null, 1),
('ARRAY_TAXREF','11.1' , '11', 'NODE 11.1', 'NODE11.1 TAXREF DEF', 'ARRAY_TAXREF_11.1', 'NODE11.1 TAXREF', 
            't', null, 1),
('ARRAY_TAXREF','2' , '*', 'NODE 2', 'NODE2 TAXREF DEF', 'ARRAY_TAXREF_2', 'NODE2 TAXREF', 
            'f', null, 1),
('ARRAY_TAXREF','21' , '2', 'NODE 21', 'NODE21 TAXREF DEF', 'ARRAY_TAXREF_21', 'NODE21 TAXREF', 
            't', null, 1),
('ARRAY_TAXREF','22' , '2', 'NODE 22', 'NODE22 TAXREF DEF', 'ARRAY_TAXREF_22', 'NODE22 TAXREF', 
            'f', null, 1),
('ARRAY_TAXREF','22.1' , '22', 'NODE 22.1', 'NODE22.1 TAXREF DEF', 'ARRAY_TAXREF_22.1', 'NODE22.1 TAXREF', 
            't', null, 1);