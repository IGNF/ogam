#!/usr/bin/env bash

# ---------------------------------------------------------------
# This provision is executed as "root"
# ---------------------------------------------------------------


#
# Set environment variables
#
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
source $DIR/setenv.sh


echo "--------------------------------------------------" 
echo " Install DB "
echo "--------------------------------------------------"

echo "Création de la base de donnée par défaut d'OGAM avec la configuration suivante :"
echo "User name : $USERNAME"
echo "Database : $DATABASE"
database_path="/vagrant/ogam/database"

cd "${database_path}"

logfile=GENERATE_DB.log
if [ -f $logfile  ]; then
   rm $logfile
fi
logfileError=GENERATE_DB_err.log
if [ -f $logfileError  ]; then
   rm $logfileError
fi

echo "****** Drop the old database if exist after an user validation ******"
# Kills the connections for dropdb
service postgresql restart 
sudo -n -u postgres dropdb --if-exists $DATABASE

echo "****** UTF8 Database creation ******"
sudo -n -u postgres createdb -O $USERNAME -E UTF8 $DATABASE

echo "****** Addition of postgis ******"
sudo -n -u $USERNAME psql -c "CREATE EXTENSION postgis;" -d $DATABASE 2>> $logfileError >> $logfile
#sudo -n -u $USERNAME psql -f Legacy/legacy_gist_v2.1.sql -d $DATABASE 2>> $logfileError >> $logfile
#sudo -n -u $USERNAME psql -f Legacy/legacy_minimal_v2.1.sql -d $DATABASE 2>> $logfileError >> $logfile

echo "****** Create harmonized data schema ******"
sudo -n -u $USERNAME psql -f 1-Create_harmonized_data_schema.sql -d $DATABASE 2>> $logfileError >> $logfile

echo "****** Create mapping schema ******"
sudo -n -u $USERNAME psql -f 1-Create_mapping_schema.sql -d $DATABASE 2>> $logfileError >> $logfile

echo "****** Create metadata schema ******"
sudo -n -u $USERNAME psql -f 1-Create_metadata_schema.sql -d $DATABASE 2>> $logfileError >> $logfile

echo "****** Create raw data schema ******"
sudo -n -u $USERNAME psql -f 1-Create_raw_data_schema.sql -d $DATABASE 2>> $logfileError >> $logfile

echo "****** Create referentiels schema ******"
sudo -n -u $USERNAME psql -f 1-Create_referentiels_schema.sql -d $DATABASE 2>> $logfileError >> $logfile

echo "****** Create website schema ******"
sudo -n -u $USERNAME psql -f 1-Create_website_schema.sql -d $DATABASE 2>> $logfileError >> $logfile

echo "****** Import ModTaxRef v8.0 ******"
sudo -n -u $USERNAME psql -f 2-Import_ModTaxRef-v8.0.sql -d $DATABASE 2>> $logfileError >> $logfile

#echo "****** Populate mapping schema ******"
sudo -n -u $USERNAME psql -f 2-Populate_mapping_schema.sql  -d $DATABASE 2>> $logfileError >> $logfile

echo "****** Populate mapping schema (communes) ******"
sudo -n -u $USERNAME psql -f Referentiels/communes.sql -d $DATABASE 2>> $logfileError >> $logfile

echo "****** Populate mapping schema (departements) ******"
sudo -n -u $USERNAME psql -f Referentiels/departements.sql -d $DATABASE 2>> $logfileError >> $logfile

echo "****** Populate mapping schema (pays) ******"
sudo -n -u $USERNAME psql -f Referentiels/nuts_0.sql -d $DATABASE 2>> $logfileError >> $logfile

echo "****** Populate metadata schema ******"
sudo -n -u $USERNAME psql -f 2-Import_Metadata.sql -d $DATABASE 2>> $logfileError >> $logfile


echo "****** Populate website schema ******"
sudo -n -u $USERNAME psql -f 2-Populate_website_schema.sql -d $DATABASE 2>> $logfileError >> $logfile

echo "****** Checks ******"
sudo -n -u $USERNAME psql -f 3-Checks.sql -d $DATABASE 2>> $logfileError >> $logfile

echo "****** Processing ******"
sudo -n -u $USERNAME psql -f 4-Processing.sql -d $DATABASE 2>> $logfileError >> $logfile


echo "****** Create user ******"
sudo -n -u $USERNAME psql -f 5-Create_user.sql -d $DATABASE 2>> $logfileError >> $logfile

echo "****** Overriding defaut config values ******"
sudo -n -u $USERNAME psql -d $DATABASE -c "UPDATE website.application_parameters SET value = '/var/tmp/ogam_upload' WHERE name = 'UploadDirectory';" 2>> $logfileError >> $logfile
sudo -n -u $USERNAME psql -d $DATABASE -c "UPDATE website.application_parameters SET value = '/vagrant/ogam/website/htdocs/server/ogamServer/upload' WHERE name = 'uploadDir';" 2>> $logfileError >> $logfile
sudo -n -u $USERNAME psql -d $DATABASE -c "UPDATE website.application_parameters SET value = '/vagrant/ogam/website/htdocs/server/ogamServer/upload/images/' WHERE name = 'image_upload_dir';" 2>> $logfileError >> $logfile

#sudo -n -u $USERNAME psql -d $DATABASE -c $"UPDATE mapping.layer_service SET config = '{\"urls\":[\"http://localhost:8000/mapProxy.php?\"],\"params\":{\"SERVICE\":\"WMS\",\"VERSION\":\"1.1.1\",\"REQUEST\":\"GetMap\"}}' WHERE service_name = 'local_mapProxy';" 2>> $logfileError >> $logfile
sudo -n -u $USERNAME psql -d $DATABASE -c $"UPDATE mapping.layer_service SET config = '{\"urls\":[\"http://localhost/mapserv-ogam?\"],\"params\":{\"SERVICE\":\"WMS\",\"VERSION\":\"1.1.1\",\"REQUEST\":\"GetMap\"}}' WHERE service_name = 'local_mapserver';" 2>> $logfileError >> $logfile
#sudo -n -u $USERNAME psql -d $DATABASE -c $"UPDATE mapping.layer_service SET config = '{\"urls\":[\"http://localhost:8000/cgi-bin/tilecache.fcgi?\"],\"params\":{\"SERVICE\":\"WMS\",\"VERSION\":\"1.0.0\",\"REQUEST\":\"GetMap\"}}' WHERE service_name = 'local_tilecache';" 2>> $logfileError >> $logfile

if [ -s $logfileError  ];
then
    echo "Création terminée avec des erreurs voir le fichier $logfileError !" 1>&2
else
    echo "Création réussie !"
fi
exit