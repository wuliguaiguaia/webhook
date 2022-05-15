const { comparePass, sign, result2String } = require('./utils')
const path = require('path')
const logger = require('./utils/logger')
logger.create()

process.on('message', async (m) => {
  const { name, action, payload, t, url, headers } = m
  const isManual = /^\/webhook\/manual\?.+?$/.test(url)
  switch (action) {
    case 'load': 
      // 条件校验与权限判断
      const errorString = conditionJudge(payload, headers, isManual) || authJudge(payload, headers, isManual, name)
      if (errorString) {
        return process.send({ action: 'end', payload: errorString})
      }
      // 执行脚本
      await executeScript(name)
      return process.send({ action: 'end' })
    case 'exit':
      process.exit()
      return;
    default:
      setTimeout(() => {
        process.send({ n: name, payload, t })
      }, 5000)
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
  return
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
    // worker.child_process = child
    const buffers = []
    child.stdout.on('data', buffer => {
      buffers.push(buffer)
    })
    child.stdout.on('end', () => {
      const log = Buffer.concat(buffers)
      logger.info(name, log.toString())
      resolve()
    })
  })
}
