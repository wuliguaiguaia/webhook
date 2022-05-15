#!/bin/bash

WORK_PATH="/home/homework/nodeapp"

echo "------ 进入项目目录 ------"

cd $WORK_PATH

pwd

rm -rf blog-server

echo "------ git clone ------"

git clone git@github.com:wuliguaiguaia/blog-server.git 2>&1

cd blog-server

pwd

git checkout master

echo "------ npm install ------"

npm install  2>&1

mkdir config

cp ../blog-server-config/*  config

echo "------ build ------"

npm run build

# pm2 start dist/main.js --name="blog_server"

pm2 start process.json

echo "------ blog-server 持续集成完毕 ------"


