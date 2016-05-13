#!/usr/bin/env bash

# Get environment-specific variables from config.

if [[ -f "/vagrant/ogam/vagrant_config/local_config.sh" ]]; then
    source "/vagrant/ogam/vagrant_config/local_config.sh"   
    echo " Local Environment loaded"
    
else 
	if [[ -f "/vagrant/ogam/vagrant_config/default_config.sh" ]]; then
	    source "/vagrant/ogam/vagrant_config/default_config.sh"   
	    echo " Default Environment loaded"
	else
	    echo "--------------------------------------------------" 1>&2
	    echo "ERROR: Missing required environment-specific config file vagrant_config/default_config.sh." 1>&2
	    echo "--------------------------------------------------" 1>&2
	    exit 1
	fi
fi