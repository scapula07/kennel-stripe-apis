const dotenv = require('dotenv').config()


const sgMail = require('@sendgrid/mail')
var key =process.env.API_KEY
console.log(key)
sgMail.setApiKey("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")
const stripe = require('stripe')('sk_test_51OyumeP6P3n7dzJdRvb0Xeb6Jdfwmsjz2r5BnSzjRGJKXPXm7SBFmU19hfOtORqKOA9JL2b237zARbUvY6VSnZOe008eCdLtfg');

const endpointSecret = 'whsec_d78c84e276a53f09fc210cf3cfae605bea230dd3b5f2006951ef05bb76012937';
exports.getLink= async (req, res, next) => {
    try{
        
   
        const account = await stripe.accounts.create({
            type: 'express',
            
          });

          console.log(account,"ii")
          const accountLink = await stripe.accountLinks.create({
            account:account?.id,
            
            refresh_url: 'http://localhost:5173/payment',
            return_url: 'http://localhost:5173/payment',
            type: 'account_onboarding',
          });
          
          console.log(accountLink,"link")
        res.status(200).json({
            status: 'success',
            data:{
             link: accountLink?.url,
             account_id:account?.id
            }
        });

        }catch(e){
            console.log(e)
        }
}


exports.getOnboardLink= async (req, res, next) => {
  try{
    const {accountId}=req.body
        const accountLink = await stripe.accountLinks.create({
          account:accountId,
          
          refresh_url: 'http://localhost:5173/payment',
          return_url: 'http://localhost:5173/payment',
          type: 'account_onboarding',
        });
        
        console.log(accountLink,"link")
      res.status(200).json({
          status: 'success',
          data:{
           link: accountLink?.url,
          }
      });

      }catch(e){
          console.log(e)
      }
}





exports.getPaymentLink= async (req, res, next) => {
  try{
    const {product,accountId,qty,orderId}=req.body
  
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: product?.name,
              image:product?.img
            },
            unit_amount:Number(product?.price)*100,
          },
          quantity: qty,
        },
      ],
      metadata:{
        order_id:orderId
      },

       payment_intent_data: {
          application_fee_amount: 1,
        },

      mode: 'payment',
      success_url: 'http://localhost:5173/orders',
      cancel_url: 'http://localhost:5173/orders',
    },
    {
      stripeAccount: accountId,
     },
    );
  
    console.log(session?.url,"seee")
      res.status(200).json({
          status: 'success',
          url:session?.url
      });

      }catch(e){
          console.log(e)
      }
}

exports.retrieveAccount= async (req, res, next) => {
  try{
    const {accountId}=req.body
    const account = await stripe.accounts.retrieve(accountId);

    console.log(account,"aaaa")
      res.status(200).json({
          status: 'success',
          data:account
      });

      }catch(e){
          console.log(e)
      }
}

exports.webhook= async (req, res, next) => {
        console.log("called")
        try{
          const sig = request.headers['stripe-signature'];

          let event;
        
          try {
            event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
            console.log(event,"eeee")
          }
          catch (err) {
            response.status(400).send(`Webhook Error: ${err.message}`);
          }

         }catch(e){
          console.log(e)
         }

}




exports.sendEmail= async (req, res, next) => {
      const msg = {
        to: req.body.receiver, // Change to your recipient
        from: "kennelbreeders@usa.com", // Change to your verified sender
        subject:req.body.subject,
        text:req.body.message,
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