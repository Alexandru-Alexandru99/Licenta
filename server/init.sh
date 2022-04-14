#!/bin/bash

function create_dir() {
    if [ ! -d "$1" ]; then
        timestamp=`date +%Y-%m-%d_%H:%M:%S`
        deployDir=$1/$timestamp
        echo "making dir $deployDir"
        mkdir -p "$1"
        if [ "$1" = "./logs" ]; then
            touch ./server/logs/delete.log
        fi
    fi
}

create_dir ./server/repos
create_dir ./server/code
create_dir ./server/logs