#!/usr/bin/env bash

# ---------------------------------------------------------------
# This provision is executed as "vagrant"
# ---------------------------------------------------------------

# Set environment variables
source $PWD/vagrant_config/scripts/setenv.sh

echo "--------------------------------------------------" 
echo " Build PHPDoc "
echo "--------------------------------------------------"

#----------------------------------------------------------------
# Launch PHP Documentor
#----------------------------------------------------------------
cd /vagrant/ogam/website/htdocs/server/

gradle phpdoc
