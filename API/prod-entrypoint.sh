#!/bin/sh

export NODE_ENV=production;

npm install --only=production;

forever start index.js;