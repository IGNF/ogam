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
echo " Build OGAM Desktop "
echo "--------------------------------------------------"

#----------------------------------------------------------------
# Launch Sencha Cmd to compile the JS and CSS
#----------------------------------------------------------------
cd /vagrant/ogam/website/htdocs/client/ogamDesktop
sencha app build -e development
