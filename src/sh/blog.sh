#!/bin/bash

WORK_PATH="/home/homework/webroot/static"

echo "------ 进入项目目录 ------"

npm install -g pnpm

cd $WORK_PATH

pwd

rm -rf blog

echo "------ git clone ------"

git clone git@github.com:wuliguaiguaia/blog.git 2>&1

cd blog

pwd

git checkout master

echo "------ pnpm install ------"

pnpm install  2>&1

echo "------ build ------"

pnpm run build

# 创建新版本
mkdir /usr/share/nginx/html/blog2
cp -r * /usr/share/nginx/html/blog2

#删除新版本并改名
rm -rf /usr/share/nginx/html/blog
mv /usr/share/nginx/html/blog2 /usr/share/nginx/html/blog

# first start
# pm2 start pnpm --name blog -- run server

pm2 restart blog

echo "------ blog 持续集成完毕 ------"


