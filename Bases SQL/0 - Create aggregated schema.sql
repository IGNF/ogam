CREATE SCHEMA aggregated_data;

SET SEARCH_PATH = aggregated_data, public;


/*==============================================================*/
/* Table : BASAL_AREA_BY_SPECIES_50                             */
/*==============================================================*/
create table BASAL_AREA_BY_SPECIES_50 (
CELL_ID              VARCHAR(50)          not null, -- The identifier of the 50x50 cell
SPECIES_CODE         VARCHAR(36)          not null, -- The identifier of species
BASAL_AREA           FLOAT8		          not null, -- The average value of the basal area
PLOT_NUMBER			 INTEGER			  not null, -- The number of plots in the cell
constraint PK_BASAL_AREA_BY_SPECIES_50 primary key (CELL_ID, SPECIES_CODE)
) 
WITH OIDS; -- Important : Needed by mapserv


COMMENT ON COLUMN BASAL_AREA_BY_SPECIES_50.CELL_ID IS 'The identifier of the 50x50 cell';
COMMENT ON COLUMN BASAL_AREA_BY_SPECIES_50.SPECIES_CODE IS 'The identifier of species';
COMMENT ON COLUMN BASAL_AREA_BY_SPECIES_50.BASAL_AREA IS 'The average value of the basal area';
COMMENT ON COLUMN BASAL_AREA_BY_SPECIES_50.PLOT_NUMBER IS 'The number of plots in the cell';

-- Ajout de la colonne point PostGIS
SELECT AddGeometryColumn('aggregated_data','basal_area_by_species_50','the_geom',3035,'MULTIPOLYGON',2);
		
-- Spatial Index on the_geom 
CREATE INDEX IX_BASAL_AREA__SPATIAL_INDEX ON aggregated_data.basal_area_by_species_50 USING GIST ( the_geom GIST_GEOMETRY_OPS );



GRANT ALL ON SCHEMA aggregated_data TO eforest;