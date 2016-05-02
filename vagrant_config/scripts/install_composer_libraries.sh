#!/usr/bin/env bash

# ---------------------------------------------------------------
# This provision should be executed as "vagrant"
# ---------------------------------------------------------------

cd /vagrant/ogam/website/htdocs/server

gradle installLibraries
