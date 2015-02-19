SET client_encoding TO 'UTF8';
set search_path = metadata;


--
--  Clean all the checks except default ones (id > 1200) 
-- 
-- select * from biosoil.checks
delete from checks_per_provider;
delete from checks where check_id > 1200;


-----------------------
-- COMPLIANCE CHECKS --
-----------------------

-- Automatic checks here (cf metadata)
-- 1000; Empty file 
-- 1001; Incorrect number of fields
-- 1002; Data integration error (this can be the consequence of a previous error)
-- 1003; Invalid code plot 
-- 1004; Duplicate line
-- 1101; Mandatory field is missing, please enter a value
-- 1102; The field's format does not respect the awaited format, please check the format
-- 1103; The field's type does not correspond to the awaited type, please check the relevance of the field
-- 1104; The date is not a valid date
-- 1105; The field's type does not correspond to the awaited code, please check the relevance of the field
-- 1106; The field's type does not correspond to the awaited range values (min and max), please check the relevance of the field
-- 1107; String too long
-- 1108; NA

-----------------------
-- CONFORMITY CHECKS --
-----------------------


----------------------------------
-- CHECK 2001
-- TEST_REQUEST : Plot location is inside country borders 
----------------------------------
INSERT INTO checks (check_id, step, name, label, description, statement, importance) 
VALUES (2001, 'CONFORMITY', 'PLOT_INSIDE_COUNTRY', 'The plot is not inside the country', 'According to the nuts 0 boundaries, the plot is not inside the country',
'INSERT INTO check_error (check_id, submission_id, line_number, src_format, src_data, country_code, plot_code, found_value, expected_value) 
SELECT 2001, submission_id, line_number, ''LOCATION_DATA'' as format, ''GEOM'' as data, country_code, plot_code, ''Plot Code ''||plot_code, null
FROM location l
WHERE submission_id = ?submissionid?
AND NOT ST_Intersects(l.the_geom, (
		SELECT ST_SetSRID(the_geom,4326)
		FROM nuts_rg
		LEFT JOIN group_mode on (nuts_rg.nuts_id = dst_code and dst_unit= ''NUTS_COUNTRY_CODE'' and src_unit = ''COUNTRY_CODE'')
		WHERE stat_levl_ = 0 -- NUTS CODE 0
		AND src_code = l.country_code
	)
)'
, 'WARNING');



--
-- Plot location tests
--
INSERT INTO checks_per_provider(check_id, DATASET_ID, provider_id) VALUES (2001, 'LOCATION', '*'); -- * for the provider code means all
