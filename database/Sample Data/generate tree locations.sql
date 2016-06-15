-- Use plot location to generate tree location with random values
UPDATE raw_data.tree_data
SET    the_geom = foo.new_geom
FROM (
       SELECT plot_code, cycle, tree_id, species_code, ST_Translate(location.the_geom, random() - 0.5, random() - 0.5) as new_geom
       FROM   raw_data.tree_data
       LEFT JOIN raw_data.location USING (plot_code)
       WHERE tree_data.the_geom is null
) foo
WHERE tree_data.plot_code = foo.plot_code
AND tree_data.cycle = foo.cycle
AND tree_data.tree_id = foo.tree_id
AND tree_data.species_code = foo.species_code

-- Extract data
select plot_code, cycle, tree_id, species_code, dbh, height, st_astext(the_geom) as geom, comment
from raw_data.tree_data
where the_geom is null
limit 50
