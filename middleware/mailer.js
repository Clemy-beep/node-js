const nodemailer = require("nodemailer");

const mail = async (receiverMail, subject, text) => {
  let transporter = nodemailer.createTransport({
    host: "smtp-pawolanmwen.alwaysdata.net",
    port: 465,
    secure: true,
    auth: {
      user: "alajitest1@pawolanmwen.com",
      pass: "vabkew-jAdmyg-0hyfty",
    },
  });

  let info = await transporter.sendMail({
    from: '"Fred Foo 👻" <clementine.digny@gmail.com',
    to: receiverMail,
    subject: subject,
    text: text,
    html: `<p>${text}</p>`,
  });

  console.log("Message sent: %s", info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  // Preview only available when sending through an Ethereal account
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
};

module.exports = mail;
