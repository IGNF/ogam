#!/usr/bin/env bash

# ---------------------------------------------------------------
# This provision should be executed as "vagrant"
# ---------------------------------------------------------------

#----------------------------------------------------------------
# Launch PHPCheckstyle
#----------------------------------------------------------------
cd /vagrant/ogam/website/htdocs/server/

gradle phpcheckstyle
