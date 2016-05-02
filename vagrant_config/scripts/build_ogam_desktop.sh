#!/usr/bin/env bash

# ---------------------------------------------------------------
# This provision should be executed as "vagrant"
# ---------------------------------------------------------------

#----------------------------------------------------------------
# Launch Sencha Cmd to compile the JS and CSS
#----------------------------------------------------------------
cd /vagrant/ogam/website/htdocs/client/ogamDesktop
sencha app build
