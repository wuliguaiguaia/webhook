const http = require('http')
const cp = require('child_process')
const sendMail = require('./src/utils/sendMail')
const status = {}
const path = require('path')
const logger = require('./src/utils/logger')
const { parseName, result2String, projectCheck} = require('./src/utils')

logger.create()
const server = http.createServer(async (req, res) => {
  const name = parseName(req.url)
  let result = ''
  logger.info(name, 'starting...')
  sendMail(name, '启动部署')
  res.setHeader('content-type', 'application/json')
  if (req.method !== 'POST' || !/^\/webhook(\/manual)?\?.+$/.test(req.url)) {
    result = await result2String('请求未命中', 1, name)
    return res.end(result)
  }
  if (!projectCheck(req)) {
    result = await result2String('该项目不支持自动化', 2, name)
    return res.end(result)
  }

  let worker = status[name]?.worker
  if (worker) {
    result = await result2String('请求重复，正在取消本次部署', -1, name)
    status[name].res.end(result)
    killWorker(name) 
  }
  worker = createWorker(name, res)
  worker.on('message', ({ action, payload }) => {
    switch (action) {
      case 'end':
        res.end(payload)
        killWorker(name)
        break
    }
  })

  const chunks = []
  req.on('data', chunk => {
    chunks.push(chunk)
  })
  req.on('end', async () => {
    try {
      const buffers = Buffer.concat(chunks)
      const payload = JSON.parse(buffers)
      const { repository: { name }} = payload
      worker.send({
        name,
        url: req.url,
        headers: req.headers,
        action: 'load',
        payload
      })
    } catch (e) {
      logger.error(name, e)
    }
  })
})
server.listen('9999')

process.on('uncaughtException', (e) => { // 可以捕获到整个进程包含异步中的错误信息，从而保证应用没有奔溃。
  console.error('process error is:', e)
  process.exit(1)
})


function createWorker(name, res) {
  const n = cp.fork(path.join(__dirname, './src/worker.js'))
  status[name] = {
    worker: n,
    res: res
  }
  return n
}

function killWorker(name) {
  process.kill(status[name].worker.pid)
  status[name] = null
}