#!/usr/bin/env bash

localpath=$1
umask 000 ; mkdir -m 0777 -p $localpath && chown www-data:www-data $localpath

#fix local access
setfacl -R -m u:www-data:rwX -m u:vagrant:rwX $localpath
setfacl -dR -m u:www-data:rwX -m u:vagrant:rwX $localpath