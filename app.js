
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const serviceAccount=require("./service.json")
const dotenv = require('dotenv').config()
const admin = require("firebase-admin");

const sgMail = require('@sendgrid/mail')
var key =process.env.API_KEY
console.log(key,"kkk")
sgMail.setApiKey(key)

const dbRoutes= require('./routes/index');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),

});


const stripe = require('stripe')('sk_test_51OyumeP6P3n7dzJdRvb0Xeb6Jdfwmsjz2r5BnSzjRGJKXPXm7SBFmU19hfOtORqKOA9JL2b237zARbUvY6VSnZOe008eCdLtfg');

const endpointSecret = "whsec_d78c84e276a53f09fc210cf3cfae605bea230dd3b5f2006951ef05bb76012937"

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controller/errorController');


const app = express();


app.use(cookieParser());
app.use(cors({
  origin: '*'
}));
// app.options('*', cors());
app.use(express.static('./public'));


console.log(endpointSecret,"secret")


// app.use(bodyParser.raw({ type: 'application/json' }));


app.post(
  '/webhook',
  // Stripe requires the raw body to construct the event
  express.raw({type: 'application/json'}),
  (req, res) => {
    const sig = req.headers['stripe-signature'];

    let event
     console.log(req.body,"body")
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      // On error, log and return the error message
      console.log(`❌ Error message: ${err.message}`);
      res.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    // Successfully constructed event
    console.log('✅ Success:', event.id);
    const db=admin.firestore();
   

    if (event.type === "checkout.session.completed") {
       const session = event.data.object;
       try{
           console.log(session,"sss");
            ( db.collection("orders").doc(session?.metadata?.order_id)).update({
                paid:true,
                status:"completed"

             })
             

        
           const result= sendEmail({
            receiver:session?.customer_details?.email,
            subject:`Your payment for order ${session?.metadata?.order_id} has been confirmed!`,
            message:` Hello ${session?.customer_details?.name} ,We thought you'd like to know that your Item(s) from your order ${session?.metadata?.order_id}  has been payment has been confirmed.`
            })

           console.log(result,"rr")

       }catch(e){
        console.log(e)
       }

    }


    res.json({received: true});
  }
);



app.use(express.json({ limit: '10kb' }));
app.use('/api/v1/stripe', dbRoutes);


app.all('*', (req, res, next) => {
    const err = new AppError(`Can't find ${req.originalUrl} on this server`, 404);
    next(err);
  });
  
  app.use(globalErrorHandler);


function sendEmail(body){
    
      const msg = {
          to: body.receiver, // Change to your recipient
          from:"kennelbreeders@usa.com", // Change to your verified sender
          subject:body.subject,
          text:body.message,
        }
          
          sgMail
            .send(msg)
            .then((res_) => {
              console.log(res_)
              console.log('Email sent successfully');

              return true
            })
          .catch((error) => {
            console.error('Error sending email:', error);
            
       });
}


module.exports = app;









