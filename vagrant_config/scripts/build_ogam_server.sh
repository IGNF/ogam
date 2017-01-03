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
gradle deployAll
