
const dotenv = require('dotenv').config()


const sgMail = require('@sendgrid/mail')
var key =process.env.API_KEY
console.log(key)
sgMail.setApiKey(key)

async function sendEmail(body){
    
    const msg = {
        to: body.receiver, // Change to your recipient
        from: body.sender, // Change to your verified sender
        subject:body.subject,
        text:body.message,
      }
      
      sgMail
        .send(msg)
        .then((res_) => {
          console.log(res_)
          console.log('Email sent successfully');

          return res.json({msg:'sent'})
        })
        .catch((error) => {
          console.error('Error sending email:', error);
          return res.json({error})
        });
}



module.exports ={
    sendEmail
}