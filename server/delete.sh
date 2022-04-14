#!/bin/bash

echo "Start delete..."
timestamp=`date +%Y-%m-%d_%H:%M:%S`
echo "delete $timestamp" > ./logs/delete.log
rm -rf ./server/repos/*
rm -rf ./server/code/*
echo "Delete finished..."
