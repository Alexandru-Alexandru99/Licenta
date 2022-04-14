#!/bin/bash

#*  install docker

sudo apt-get update
sudo apt-get install \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update
sudo apt-get install docker-ce docker-ce-cli containerd.io

#*  check docker installation

sudo docker run hello-world

#*  install run image

sudo docker pull glot/docker-run:latest

#*  language images

sudo docker pull glot/python:latest
sudo docker pull glot/php:latest
sudo docker pull glot/clang:latest
sudo docker pull glot/javascript:latest
sudo docker pull glot/csharp:latest

#* create container

sudo docker run --detach --restart=always --publish 8088:8088 --volume /var/run/docker.sock:/var/run/docker.sock --env "API_ACCESS_TOKEN=my-token" glot/docker-run:latest