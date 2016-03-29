#!/usr/bin/env bash

#----------------------------------------------------------------
# Install JSDuck in order to generate Javascript documentation
#----------------------------------------------------------------
sudo apt-get install -y ruby ruby-dev

sudo gem install jsduck

#-----------------------------------------------------------------
# install subversion in order to check PHP source (required for checkstyle)
#-----------------------------------------------------------------
sudo apt-get install -y subversion