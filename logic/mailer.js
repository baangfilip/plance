var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var premailer = require('premailer-api');
var fs = require('fs');

function getTemplate(template, callback){
  var template = fs.readFileSync('./templates/'+template+'.html', 'utf8');
  premailer.prepare(
    {
      html: template 
    }, 
    function(err, email) {  
      callback(email.html.replace(/\t/g,'').replace(/\n/g,''), email.text);
    }
  );
}

var transporter = nodemailer.createTransport(smtpTransport({
    host: 'mail......se',
    port: 587,
    auth: {
        user: 'no.reply@.....se',
        pass: 'password'
    },
    tls: {rejectUnauthorized: false},
    secure: false
}));

var mailOptions = {
  from: 'Plance <no.reply@....se>', // sender address 
  to: '', // list of receivers comma-separated
  subject: 'Plance mail', // Subject line 
  text: 'Something went wrong please contact a administrator', // plaintext body 
  html: '<b>Something went wrong please contact a administrator</b>' // html body 
};



exports.sendEmail = function(template, subject, recipients, username, link, lang, callback){
  mailOptions.to = recipients;
  mailOptions.subject = subject; //replace more subject for other emails
  
  getTemplate(template, function(html, text){
    mailOptions.text = text.replace("replace.link", link)
      .replace("lang.ResetPassword.Help", lang.ResetPassword.Help)
      .replace("lang.ResetPassword.Information", lang.ResetPassword.Information);
    mailOptions.html = html.replace("replace.link", link)
      .replace("lang.ResetPassword.LinkText", lang.ResetPassword.LinkText)
      .replace("lang.Mail.FollowText", lang.Mail.FollowText)
      .replace("lang.Mail.FollowLink", lang.Mail.FollowLink)
      .replace("lang.resetpassword.resetpassword", lang.ResetPassword.ResetPassword)
      .replace("lang.ResetPassword.Help", lang.ResetPassword.Help)
      .replace("lang.ResetPassword.Information", lang.ResetPassword.Information)
      .replace("lang.Mail.Sender", lang.Mail.Sender);

    transporter.sendMail(mailOptions, function(error, info){
      if(error){
        require('logger').logg("Couldnt send email to "+recipients+": " + error);
        callback(error);
        return;
      }
      callback(true);
    });
  });
  
};