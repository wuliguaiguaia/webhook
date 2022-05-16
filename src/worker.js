const { comparePass, sign, result2String } = require('./utils')
const path = require('path')
const logger = require('./utils/logger')
logger.create()

process.on('message', async (m) => {
  const { name, action, payload, url, headers } = m
  const isManual = /^\/webhook\/manual\?.+?$/.test(url)
  switch (action) {
    case 'load': 
      // 条件校验与权限判断
      const errorString = await conditionJudge(payload, headers, isManual)
        || await authJudge(payload, headers, isManual, name)
      if (errorString) {
        return process.send({ action: 'end', payload: errorString})
      }
      // 执行脚本
      await executeScript(name)
      const result = await result2String('success', 0, name)
      return process.send({ action: 'end', payload: result })
    case 'exit':
      process.exit()
  }
})

function conditionJudge(payload, headers, isManual) {
  const { repository: { name }, ref: branch } = payload

  if (!isManual && branch !== 'refs/heads/master') { // 这里指定所有项目只有 master 分支时可自动化
    return result2String('仅限 master 分支', 3, name)
  }

  const event = headers['x-github-event']
  if (!isManual && event !== 'push') {  // 这里指定只在push时
    return result2String('仅 push 可用', 4, name)
  }
  return
}

function authJudge(payload, headers, isManual, name) {
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET
  if (isManual) {
    const haveAuth = comparePass(WEBHOOK_SECRET, payload.secret)
    if (haveAuth) return
  } else {
    const signature = headers['x-hub-signature']
    if (signature.slice(5) === sign(payload, WEBHOOK_SECRET)) return
  }
  return result2String('无权限', 5, name)
}

function executeScript(name) {
  return new Promise(resolve => {
    const cp = require('child_process')
    const child = cp.spawn('sh', [path.join(__dirname, `./sh/${name}.sh`)])
    logger.info(name, '开始执行shell')
    const buffers = []
    child.stdout.on('data', buffer => {
      buffers.push(buffer)
    })
    child.stdout.on('end', () => {
      let log = Buffer.concat(buffers).toString()
      const pattern = /(\^\[\[\d+m){2}/g // 删除颜色乱码
      log = log.replace(pattern, '')
      logger.info(name, log.toString())
      resolve()
    })
  })
}
