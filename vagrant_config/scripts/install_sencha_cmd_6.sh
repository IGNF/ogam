#!/usr/bin/env bash
sudo -n apt-get install -y unzip
wget http://cdn.sencha.com/cmd/6.0.2.14/no-jre/SenchaCmd-6.0.2.14-linux-amd64.sh.zip
unzip ./SenchaCmd-6.0.2.14-linux-amd64.sh.zip

# See command line options for Install4J :
# http://resources.ej-technologies.com/install4j/help/doc/index.html
sh ./SenchaCmd-6.0.2.14-linux-amd64.sh -q