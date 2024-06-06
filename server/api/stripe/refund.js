const axios = require('axios');
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

module.exports = async (req, res) => {
  console.log(req.body);

  const transactionId = req.body.transactionId;
  const customerId = req.body.customerObj.cid;

  try {
    // List all payment intents with the specified metadata
    const paymentIntentsResponse = await axios.get('https://api.stripe.com/v1/payment_intents', {
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`
      },
      params: {
        limit: 100
      }
    });

    const paymentIntents = paymentIntentsResponse.data.data;

    // Filter the payment intents to find the one with matching metadata
    const foundPaymentIntent = paymentIntents.find(paymentIntent => 
      paymentIntent.metadata &&
      paymentIntent.metadata['sharetribe-transaction-id'] === transactionId &&
      paymentIntent.metadata['sharetribe-customer-id'] === customerId
    );
    console.log('Found payment intent:', foundPaymentIntent);

    if (foundPaymentIntent) {
      // Create a refund for the payment intent
      try {
        const refundResponse = await axios.post('https://api.stripe.com/v1/refunds', null, {
          headers: {
            'Authorization': `Bearer ${STRIPE_SECRET_KEY}`
          },
          params: {
            payment_intent: foundPaymentIntent.id
          }
        });
        const refund = refundResponse.data;
        console.log('Created refund:', refund);

        res.status(200).json({
          message: 'Payment Intent found and refund created',
          paymentIntent: foundPaymentIntent,
          refund: refund,
        });
      } catch (refundError) {
        if (refundError.response && refundError.response.data.error.code === 'charge_already_refunded') {
          console.log('Refund already exists for this payment intent.');
          res.status(400).json({
            message: 'Refund already exists for this payment intent',
            error: refundError.response.data.error,
          });
        } else {
          throw refundError;
        }
      }
    } else {
      res.status(404).json({
        message: 'Payment Intent not found',
      });
    }
  } catch (error) {
    console.error('Error finding payment intent:', error);
    res.status(500).json({
      message: 'Internal Server Error',
      error: error.message,
    });
  }
};


