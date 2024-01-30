#!/bin/sh

export NODE_ENV=development;

cd ./API/;

npm install;

node index.js;

echo "called";