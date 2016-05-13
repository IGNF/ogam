#!/usr/bin/env bash

# ---------------------------------------------------------------
# This provision is executed as "vagrant"
# ---------------------------------------------------------------

# Set environment variables
source $PWD/vagrant_config/scripts/setenv.sh

echo "--------------------------------------------------" 
echo " Build OGAM Desktop "
echo "--------------------------------------------------"

#----------------------------------------------------------------
# Launch Sencha Cmd to compile the JS and CSS
#----------------------------------------------------------------
cd /vagrant/ogam/website/htdocs/client/ogamDesktop
sencha app build
