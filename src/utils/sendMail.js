const nodemailer = require('nodemailer')



const options = {
  from: 'orange 部署<1944063509@qq.com>',
  to: process.env.EMAIL,
}

const prefix = '[orange部署]'

const sendMail = (name, str) => {
  const message = {
    ...options,
    subject: `${prefix}: ${name} - ${str}`,
    text: JSON.stringify({
      name,
      str,
      t: Date.now()
    }, null, 2)
  }
  const mailTransport = nodemailer.createTransport({
    service: 'qq',
    secure: true,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_TOKEN
    }
  })
  mailTransport.sendMail(message, function (err, msg) {
    if (err) {
      console.log(err, msg);
      logger.error(name, '邮件发送失败');
    } else {
      logger.info(name, '邮件发送成功');
    }
  })
}

module.exports = sendMail
