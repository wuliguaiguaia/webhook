#!/bin/bash

WORK_PATH="/Users/alias/code/pratice/react-blog/webhook"

echo "------ 进入项目目录 ------"

cd $WORK_PATH

pwd

rm -rf blog

echo "------ git clone ------"

git clone git@github.com:wuliguaiguaia/blog.git 2>&1

cd blog

pwd

git checkout master

echo "------ npm install ------"

npm install  2>&1

echo "------ build ------"

npm run build

rm -rf /usr/share/nginx/html/blog

mkdir /usr/share/nginx/html/blog

cp -r * /usr/share/nginx/html/blog

# first start
# pm2 start npm --name blog -- run server

pm2 restart blog

echo "------ blog 持续集成完毕 ------"


