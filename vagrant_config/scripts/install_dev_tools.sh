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
echo " Install Dev Tools "
echo "--------------------------------------------------"

#----------------------------------------------------------------
# Install JSDuck in order to generate Javascript documentation
#----------------------------------------------------------------
sudo apt-get install -y ruby ruby-dev

sudo gem install jsduck

#-----------------------------------------------------------------
# install subversion in order to check PHP source (required for checkstyle)
#-----------------------------------------------------------------
sudo apt-get install -y subversion