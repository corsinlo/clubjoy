const axios = require('axios');
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_API_URL = 'https://api.stripe.com/v1';

module.exports = async (req, res) => {
  try {
    // Retrieve the Payment Intent details from Stripe
    const paymentIntentId = req.body.paymentIntent.id;
    console.log('Payment Intent ID:', paymentIntentId);

    const paymentIntentResponse = await axios.get(`${STRIPE_API_URL}/payment_intents/${paymentIntentId}`, {
      headers: {
        Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
      },
    });

    const paymentIntent = paymentIntentResponse.data;


    // Extract necessary details from the payment intent
    const amount = paymentIntent.amount;
    const currency = paymentIntent.currency;
    const customer = paymentIntent.customer;
    console.log('Customer:', customer)
    const description = paymentIntent.description;

    // Create the invoice
    const invoiceResponse = await axios.post(`${STRIPE_API_URL}/invoices/create_preview`, {
      customer: customer,
    }, {
      headers: {
        Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
      },
    });

    const invoice = invoiceResponse.data;
    console.log('Invoice:', invoice);

    res.status(200);
  } catch (error) {
    console.error('Error creating invoice:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
