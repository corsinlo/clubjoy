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
  const formattedDate = (dateString => new Date(dateString).toLocaleDateString('it-IT', { timeZone: 'UTC' }).replace(/\//g, '-'))(req.body.customerObj.startdate);  
  try {
      sendSmtpEmail.sender = { name: 'Club Joy Team', email: 'hello@clubjoy.it' };
      sendSmtpEmail.to = [{ email: `${bookingRecord.email}`,  name: `${bookingRecord.name}` }]; //bookingRecord.providerEmail
      sendSmtpEmail.templateId = 31;
      sendSmtpEmail.params = {
        providerName: req.body.customerObj.providername,
        username: req.body.customerObj.name,
        startDate: formattedDate,
      };
        const emailResponse = await brevoClient.sendTransacEmail(sendSmtpEmail);
        console.log('Email sent successfully to provider', emailResponse);
      } catch (emailError) {
        console.error('Error sending email:', emailError);
        res.status(500).json({ error: 'Failed to send provider email', emailError });
      }
};