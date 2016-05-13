#!/usr/bin/env bash

# ---------------------------------------------------------------
# This provision is executed as "vagrant"
# ---------------------------------------------------------------

echo "--------------------------------------------------" 
echo " Run PHPUnit "
echo "--------------------------------------------------"

# Set environment variables
source $PWD/vagrant_config/scripts/setenv.sh

#----------------------------------------------------------------
# Launch PHPUnit
#----------------------------------------------------------------
cd /vagrant/ogam/website/htdocs/server/

gradle phpunit
