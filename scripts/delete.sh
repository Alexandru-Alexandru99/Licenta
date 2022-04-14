#!/bin/bash

timer=5

while true; do
    echo "---Start delete---"
    cd ../server/repos
    sudo rm -rf *
    cd ..
    echo "---End delete---"
    sleep $timer;
done