#!/usr/bin/env bash

# the file tilecache/Layer.py revision2.11 have a buggus in getCell function (since 2.1 ?). this failed get tile in some corner situation.
# the file correct is the revision 2.11 (debian depot + fix/rollback on the ligne x:= int(x0) => x:=int(round(x0))) and the same for the line y /y0

tilecacheDir='/usr/share/pyshared/TileCache'
tilecacheLayer="${tilecacheDir}/Layer.py"
vagrantFixDir=/vagrant/ogam/vagrant_config/conf/tilecache

if [ -f $tilecacheLayer ] ; then
   cp -b "${vagrantFixDir}/Layer.py" $tilecacheLayer 
else
   echo "tilecache Layer.py not found, fix manualy..."
fi