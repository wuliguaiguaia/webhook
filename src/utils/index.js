const fs = require('fs')
const path = require('path')
const sendMail = require('./sendMail')

function parseName(url) {
  const str = url.split('?')[1]
  const obj = {}
  str.replace(/([^=&]+)=([^=&]+)/g, (_, key, val) => {
    obj[key] = val
  })
  return obj.name
}

async function result2String(str, errNo, name) {
  const res = JSON.stringify({ str, errNo })
  logger.info(name, res)
  await sendMail(name, str)
  return res
}

function sign(payload, secret) {
  const crypto = require('crypto')
  const body = JSON.stringify(payload)
  // 对比的是 x-hub-signature，所以必须是sha1算法
  const hmac = crypto.createHmac('sha1', secret)
  // github 加密的是数据体，这里同样
  const up = hmac.update(body)
  // 使用 digest 方法生成加密内容(必须是hex格式)
  const signature = up.digest('hex')
  return signature
}

function comparePass(originPass, pass) {
  const bcrypt = require('bcryptjs')
  return bcrypt.compareSync(originPass, pass)
}

function projectCheck(req) {
  const name = parseName(req.url)
  const allSh = fs.readdirSync(path.join(__dirname, './../sh')).map(item => {
    return path.basename(item, path.extname(item)) // 获取不带后缀的文件名
  })
  if (!allSh.includes(name)) { // 如果不包含该项目
    return false
  }
  return true
}

module.exports = {
  parseName, 
  projectCheck,
  result2String,
  comparePass,
  sign
}
