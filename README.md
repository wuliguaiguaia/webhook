## todo

shell 运行出错处理！！



# webhook

## 步骤

预校验：路由、仓库名
重复部署校验
创建子进程
  仓库校验：分支、触发事件
  权限校验：
    - 手动：bcryptjs 比较
    - 自动：x-hub-signature
  执行相应 shell

[子进程](https://zhuanlan.zhihu.com/p/36678971)
