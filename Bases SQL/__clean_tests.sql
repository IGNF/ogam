set search_path = raw_data, public, harmonized_data;

delete
from data_submission
where submission_id in (
	select submission_id
	from submission
	where country_code = '66'
);

delete
from submission
where country_code = '66';


delete from species_data
where country_code = '66';

delete from plot_data
where country_code = '66';

delete from strata
where country_code = '66';

delete from location
where country_code = '66';

delete from harmonization_process_submissions
where harmonization_process_id in (
	select harmonization_process_id
	from harmonization_process
	where country_code = '66'
);

delete from harmonization_process
where country_code = '66';

delete from harmonized_species_data
where country_code = '66';

delete from harmonized_plot_data
where country_code = '66';

delete from harmonized_location
where country_code = '66';