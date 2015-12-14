# -*- mode: ruby -*-
# vi: set ft=ruby :


# Vagrantfile API/syntax version.
VAGRANTFILE_API_VERSION = "2"

Vagrant.configure(VAGRANTFILE_API_VERSION) do |config|

  config.vm.box = "debian/wheezy64"
 
   #Dev config 
   config.vm.provider "virtualbox" do |v|
      v.memory = 2048
      v.cpus = 3
   end

  config.vm.network "private_network", ip: "192.168.50.4"
  config.vm.hostname = "ogam.ign.fr"
  config.vm.network :forwarded_port, host: 4080, guest: 8080,auto_correct: true
  config.vm.network :forwarded_port, host: 5433, guest: 5432,auto_correct: true
  config.vm.network :forwarded_port, host: 8000, guest: 80,auto_correct: true
  config.vm.network :forwarded_port, host: 1842, guest: 1841
   

  #disabled le default root
  config.vm.synced_folder ".", "/vagrant", disabled: true
  #connfig with ogam name
  config.vm.synced_folder ".", "/vagrant/ogam", disabled: false, create:true
  #some rightsfix to website , TODO move into provider ?
  config.vm.synced_folder "website/htdocs",'/vagrant/ogam/website/htdocs', owner:"www-data",group: "www-data"

  #FIXME
  #config.ssh.private_key_path = ['~/.vagrant.d/insecure_private_key', '~/.ssh/id_rsa']
  #config.ssh.forward_agent = true

  # Configure provisionners on the machine to automatically install softwares etc.
  

  config.vm.provision "bootstrap", type: "shell" do |s|
    s.path = "vagrant_config/scripts/bootstrap.sh"
  end 

  config.vm.provision "install_java_tomcat", type: "shell" do |s|
    s.path = "vagrant_config/scripts/install_java_tomcat.sh"
  end

  config.vm.provision "install_ogam_services", type: "shell" do |s|
    s.path = "vagrant_config/scripts/install_ogam_services.sh"
  end

  config.vm.provision "install_webserver", type: "shell" do |s|
    s.path = "vagrant_config/scripts/install_apache.sh"
  end

  config.vm.provision "install_postgres", type: "shell" do |s|
    s.path = "vagrant_config/scripts/install_postgres.sh"
  end

 config.vm.provision "install_db", type: "shell" do |s|
    s.path = "vagrant_config/scripts/GENERATE_DB.sh"
  end
  
 config.vm.provision "install_sencha_6", type: "shell" do |s|
    s.path = "vagrant_config/scripts/install_sencha_cmd_6.sh"
  end

   config.vm.provision "shell", inline: "service apache2 restart", run: "always"
end
