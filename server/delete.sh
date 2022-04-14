#!/bin/bash

echo "Start delete..."
timestamp=`date +%Y-%m-%d_%H:%M:%S`
echo "delete $timestamp" > ./logs/delete.log
rm -rf ./repos/*
rm -rf ./code/*
echo "Delete finished..."
