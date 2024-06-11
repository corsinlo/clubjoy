const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const supabaseUrl = 'https://tivsrbykzsmbrkmqqwwd.supabase.co';
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY; // Ensure this is correctly set in your .env file
const supabase = createClient(supabaseUrl, supabaseKey);
const SibApiV3Sdk = require('@getbrevo/brevo');
const sdkUtils = require('../../api-util/sdk')
const SibApiV3 = require('sib-api-v3-sdk');

const brevoClient = new SibApiV3.TransactionalEmailsApi();

let defaultClient = SibApiV3.ApiClient.instance;
let apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;
let sendSmtpEmail = new SibApiV3.SendSmtpEmail();

module.exports = async (req, res) => {
    console.log('herre', req.body);
    /*
  try {
    // Query Supabase to find the record by bookingid


    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('bookingid', req.body.customerObj.bookingid);

    if (error) {
      console.error('Error fetching booking:', error);
      return res.status(500).json({ error: 'Error fetching booking' });
    }

    if (data.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const bookingRecord = data[0];
    console.log('Booking record:', bookingRecord);

    if (bookingRecord) {
      sendSmtpEmail.sender = { name: 'Club Joy Team', email: 'noreply@clubjoy.it' };
      sendSmtpEmail.to = [{ email: 'corsini.ludovico@gmail.com', name: bookingRecord.providername }]; //bookingRecord.providerEmail
      sendSmtpEmail.templateId = 28;
      sendSmtpEmail.params = {
        providerName: bookingRecord.providername,
        userName: bookingRecord.name,
        startDate: bookingRecord.startdate,
      };

      try {
        const emailResponse = await brevoClient.sendTransacEmail(sendSmtpEmail);
        console.log('Email sent successfully to provider', emailResponse);
        try {
          sendSmtpEmail.sender = { name: 'Club Joy Team', email: 'noreply@clubjoy.it' };
          sendSmtpEmail.to = [{ email: 'corsini.ludovico@gmail.com', name: bookingRecord.providername }]; //bookingRecord.providerEmail
          sendSmtpEmail.templateId = 29;
          sendSmtpEmail.params = {
            providerName: bookingRecord.providername,
            userName: bookingRecord.name,
            startDate: bookingRecord.startdate,
          };
          const emailResponse = await brevoClient.sendTransacEmail(sendSmtpEmail);
          res.json({ message: 'Email sent successfully to customer', data: emailResponse });
        } catch {
          console.error('Failed to send customer email', emailError);
        }
      } catch (emailError) {
        console.error('Error sending email:', emailError);
        res.status(500).json({ error: 'Failed to send provider email', emailError });
      }
    }
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
  */
};