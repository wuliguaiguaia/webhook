const nodemailer = require('nodemailer')

const mailTransport = nodemailer.createTransport({
  service: 'qq',
  secure: true,
  auth: {
    user: '1944063509@qq.com',
    pass: process.env.EMAIL_TOKEN
  }
})

const options = {
  from: '1944063509@qq.com',
  to: '1944063509@qq.com',
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
  mailTransport.sendMail(message, function (err, msg) {
    if (err) {
      console.log(err);
      res.send(err);
    } else {
      res.send('success');
    }
  })
}

module.exports = sendMail
