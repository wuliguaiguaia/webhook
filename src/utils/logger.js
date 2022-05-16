const fs = require('fs')
const path = require('path')
// const dirPath = path.join(process.cwd(), 'logs')
const dirPath = path.join(process.cwd(), '../logs/webhook')
const filePaths = {}

const logger = {
  dirPath,
  create
}
global.logger = logger

function create() {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath)
  }
  const repos = fs.readdirSync(path.join(__dirname, './../sh')).map(item => item.slice(0, -3))
  repos.forEach(item => {
    const filePath = path.join(dirPath, `${item}.log`)
    filePaths[item] = filePath
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, '')
    }
  })

  const levels = ['info', 'error', 'warn']
  levels.forEach(level => {
    logger[level] = write.bind(logger, level)
  })
}

function formatData(level, content) {
  const date = new Date()
  const convertDate = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date.toTimeString().slice(0, 8)}.${date.getMilliseconds()}`
  return `[${convertDate}] [${level}] - ${content.toString()} \n`

}

function write(level, name, content) {
  const filePath = filePaths[name]
  const data = formatData(level, content)
  console.log(data)
  fs.writeFileSync(filePath, data, { flag: 'a+' })
}


module.exports = logger