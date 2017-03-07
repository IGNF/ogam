#!/usr/bin/env bash

# ---------------------------------------------------------------
# This provision is executed as "vagrant"
# ---------------------------------------------------------------

#
# Set environment variables
#
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
source $DIR/setenv.sh


echo "--------------------------------------------------" 
echo " Build OGAM Server "
echo "--------------------------------------------------"

#----------------------------------------------------------------
# Launch Gradle build
#----------------------------------------------------------------
cd /vagrant/ogam/website/htdocs/server
gradle buildAll



# Mise a jour du serveur STMP de dév pour l'IGN
sed -i 's/mailer_host\: 127\.0\.0\.1/mailer_host: 192\.134\.133\.226 # smtp1\.ign\.fr/g' /vagrant/ogam/website/htdocs/server/ogamServer/app/config/parameters.yml