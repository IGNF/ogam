#!/usr/bin/env bash

# ---------------------------------------------------------------
# This provision is executed as "vagrant"
# ---------------------------------------------------------------

echo "--------------------------------------------------" 
echo " Install Composer Libraries "
echo "--------------------------------------------------"

# Set environment variables
source $PWD/vagrant_config/scripts/setenv.sh

cd /vagrant/ogam/website/htdocs/server

gradle installLibraries
