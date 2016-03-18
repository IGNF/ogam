#!/usr/bin/env bash
sudo -n apt-get install -y unzip
export https_proxy=proxy.ign.fr:3128
export http_proxy=proxy.ign.fr:3128
wget http://cdn.sencha.com/cmd/6.0.2.14/no-jre/SenchaCmd-6.0.2.14-linux-amd64.sh.zip
unzip ./SenchaCmd-6.0.2.14-linux-amd64.sh.zip

# See command line options for Install4J :
# http://resources.ej-technologies.com/install4j/help/doc/index.html
sh ./SenchaCmd-6.0.2.14-linux-amd64.sh -q
echo '-Dhttp.proxyHost=proxy.ign.fr' >> /root/bin/Sencha/Cmd/6.0.2.14/sencha.vmoptions
echo '-Dhttp.proxyPort=3128' >> /root/bin/Sencha/Cmd/6.0.2.14/sencha.vmoptions