#!/usr/bin/env bash

# ---------------------------------------------------------------
# This provision is executed as "vagrant"
# ---------------------------------------------------------------

# Set environment variables
source $PWD/vagrant_config/scripts/setenv.sh

echo "--------------------------------------------------" 
echo " Build JSDoc "
echo "--------------------------------------------------"


#----------------------------------------------------------------
# Launch PHP Documentor
#----------------------------------------------------------------
cd /vagrant/ogam/website/htdocs/client/

gradle jsduck
