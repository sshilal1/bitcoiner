var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'hearth.bitcoiner.bot@gmail.com',
    pass: 'ilovehearthstone'
  }
});

var mailOptions = {
  from: 'hearth.bitcoiner.bot@gmail.com',
  to: 'shilale45@gmail.com,jbraines20@gmail.com,jonathanpstudwell@gmail.com',
  subject: '**Bought: Jack Shit! Time: Never!**',
  text: 'Testing...1.2.3'
};

transporter.sendMail(mailOptions, function(error, info){
  if (error) {
    console.log(error);
  } else {
    console.log('Email sent: ' + info.response);
  }
});