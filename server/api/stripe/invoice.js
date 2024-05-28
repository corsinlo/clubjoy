const axios = require('axios');
/*
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  console.log(req.body);
  try {
    const transactionId = req.body.transactionId;
    const customerId = req.body.customerObj.cid;

    let paymentIntents = await stripe.paymentIntents.list({
      limit: 100, // Adjust limit as necessary
    });

    // Filter the PaymentIntents by metadata
    let matchingPaymentIntent = paymentIntents.data.find(pi =>
      pi.metadata['sharetribe-transaction-id'] === transactionId &&
      pi.metadata['sharetribe-customer-id'] === customerId
    );

    // If there's no matching PaymentIntent, try to fetch more (pagination)
    while (!matchingPaymentIntent && paymentIntents.has_more) {
      paymentIntents = await stripe.paymentIntents.list({
        limit: 100,
        starting_after: paymentIntents.data[paymentIntents.data.length - 1].id,
      });

      matchingPaymentIntent = paymentIntents.data.find(pi =>
        pi.metadata['sharetribe-transaction-id'] === transactionId &&
        pi.metadata['sharetribe-customer-id'] === customerId
      );
    }

    if (!matchingPaymentIntent) {
      throw new Error('No PaymentIntent found with the specified metadata');
    }

    console.log('Matching PaymentIntent:', matchingPaymentIntent);

    // Ensure the customer email is set
    await stripe.customers.update(matchingPaymentIntent.customer, {
      email: req.body.customerObj.email,
    });

    // Create an invoice item
    await stripe.invoiceItems.create({
      customer: matchingPaymentIntent.customer,
      amount: matchingPaymentIntent.amount,
      currency: matchingPaymentIntent.currency,
      description: matchingPaymentIntent.description,
      metadata: matchingPaymentIntent.metadata,
    });

    // Create the invoice
    const invoice = await stripe.invoices.create({
      customer: matchingPaymentIntent.customer,
      auto_advance: true, // Auto-finalize the invoice
      collection_method: 'send_invoice', // Use send_invoice collection method
      days_until_due: 0, // Invoice due immediately
      metadata: {
        transaction_id: transactionId,
        booking_id: req.body.customerObj.bookingid,
        customer_name: req.body.customerObj.name,
        customer_email: req.body.customerObj.email,
        event_name: req.body.customerObj.eventname,
        seats: String(req.body.customerObj.seats), // Convert to string
        seat_names: JSON.stringify(req.body.customerObj.seatnames), // Convert array to JSON string
        start_date: req.body.customerObj.startdate.toISOString(), // Convert to ISO string
        end_date: req.body.customerObj.enddate.toISOString(), // Convert to ISO string
        event_location: req.body.customerObj.eventlocation,
        event_geo_location: JSON.stringify(req.body.customerObj.eventgeoLocation), // Convert to JSON string
        provider_name: req.body.customerObj.providername,
      },
    });

    // Finalize the invoice
    const finalizedInvoice = await stripe.invoices.finalizeInvoice(invoice.id);

    res.status(200).json(finalizedInvoice);
  } catch (error) {
    console.error('Error finding PaymentIntent or creating invoice:', error);
    res.status(500).json({ error: error.message });
  }
};
*/