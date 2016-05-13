#!/usr/bin/env bash

# ---------------------------------------------------------------
# This provision is executed as "vagrant"
# ---------------------------------------------------------------

echo "--------------------------------------------------" 
echo " Run PHPCheckstyle "
echo "--------------------------------------------------"

# Set environment variables
source $PWD/vagrant_config/scripts/setenv.sh

#----------------------------------------------------------------
# Launch PHPCheckstyle
#----------------------------------------------------------------
cd /vagrant/ogam/website/htdocs/server/

gradle phpcheckstyle
