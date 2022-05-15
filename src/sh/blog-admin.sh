#!/bin/bash

WORK_PATH="/home/homework/webroot/static"

echo "------ 进入项目目录 ------"

cd $WORK_PATH

pwd

rm -rf blog-admin

echo "------ clone ------"

git clone git@github.com:wuliguaiguaia/blog-admin.git 2>&1

cd blog-admin

pwd

git checkout master

echo "------ install ------"

npm install  2>&1

echo "------ build ------"

npm run build

rm -rf /usr/share/nginx/html/blog-admin/*

cp -r dist/* /usr/share/nginx/html/blog-admin

echo "------ blog-admin 部署完成 ------"


