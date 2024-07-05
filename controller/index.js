const dotenv = require('dotenv').config()
const {BetaAnalyticsDataClient} = require('@google-analytics/data');
var email =process.env.CLIENT_EMAIL
var privatekey =process.env.PRIVATE_KEY
const analyticsDataClient = new BetaAnalyticsDataClient({credentials:{
  client_email:email,
  private_key:privatekey
                   }});
const sgMail = require('@sendgrid/mail')
var key =process.env.API_KEY
var stripekey =process.env.STRIPE_KEY
console.log(key)
sgMail.setApiKey(key)
const stripe = require('stripe')(stripekey);

const endpointSecret =process.env.STRIPE_SIGNING_SECRET ;
console.log(endpointSecret)
exports.getLink= async (req, res, next) => {
    try{
        
   
        const account = await stripe.accounts.create({
            type: 'express',
            
          });

          console.log(account,"ii")
          const accountLink = await stripe.accountLinks.create({
            account:account?.id,
            
            refresh_url: 'https://kernel-theta.vercel.app/payment',
            return_url: 'https://kernel-theta.vercel.app/payment',
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
          
          refresh_url: 'https://kernel-theta.vercel.app/payment',
          return_url: 'https://kernel-theta.vercel.app/payment',
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
      success_url: 'https://kernel-theta.vercel.app/orders',
      cancel_url: 'https://kernel-theta.vercel.app/orders',
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
      console.log(req.body)
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



exports.runReport= async (req, res, next) => {
    try{
      const [response] = await analyticsDataClient.runReport({
        property: `properties/${"328383418"}`,
        dateRanges: [
          {
            startDate: '2024-06-25',
            endDate: 'today',
          },
        ],
        dimensions: [
           {
            name:"itemBrand"
            },
            {
            name:"itemCategory"
            },
            {
            name:"itemCategory2"
            },
            {
            name:"itemId"
            },
            {
            name:"itemName"
            }
            
        ],
        metrics: [
            {
            "name":"itemRevenue"
            },
            {
            "name":"itemsAddedToCart"
            },
            {
            "name":"itemsCheckedOut"
            },
            {
            "name":"itemsPurchased"
            },
            {
            "name":"itemsViewed"
            }
        ],
      });
  
      console.log('Report result:',response);
      response.rows.forEach((row) => {
        console.log(row.dimensionValues[0], row.metricValues[0]);
      });

      res.json({data:response.rows})
    }catch(e){
      console.log(e)
    }
}