#!/bin/sh

export NODE_ENV=production;

npm install --only=production;

npm install -g pm2;

pm2-runtime start index.js;