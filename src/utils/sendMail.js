const nodemailer = require('nodemailer')
const prefix = '[orange部署]'


const options = {
  from: `${prefix}<${process.env.EMAIL}>`,
  to: process.env.EMAIL,
}

const mailTransport = nodemailer.createTransport({
  service: 'qq',
  secure: true,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_TOKEN
  }
})


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
