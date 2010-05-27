
set search_path = aggregated_data, public, raw_data, mapping;

delete from basal_area_by_species_50;

-- Calculate the basal area by species
INSERT INTO basal_area_by_species_50 (cell_id, species_code, basal_area, plot_number, the_geom)
SELECT cell_id_50, species_code, avg(basal_area), count(*) as plot_number, grid_eu25_50k.the_geom
FROM location
JOIN plot_data on (location.country_code = plot_data.country_code AND location.plot_code = plot_data.plot_code)
LEFT JOIN species_data on (plot_data.country_code = species_data.country_code AND plot_data.plot_code = species_data.plot_code AND dbh_class = '2')
JOIN grid_eu25_50k on (location.cell_id_50 = grid_eu25_50k.cell_id)
WHERE domain_forest = '1'
AND is_forest_plot = '1'
AND domain_basal_area ='1'
AND species_code IS NOT NULL
GROUP BY cell_id_50, species_code, grid_eu25_50k.the_geom;


