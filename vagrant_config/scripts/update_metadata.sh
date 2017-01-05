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
echo " Update metadata                                  "
echo "--------------------------------------------------"

echo "Mise à jour de la base de donnée par défaut d'OGAM avec la configuration suivante :"
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

echo "****** Populate metadata schema ******"
sudo -n -u $USERNAME psql -f 2-Import_Metadata.sql -d $DATABASE 2>> $logfileError >> $logfile

if [ -s $logfileError  ];
then
    echo "Mise à jour terminée avec des erreurs voir le fichier $logfileError !" 1>&2
else
    echo "Mise à jour réussie !"
fi
exit