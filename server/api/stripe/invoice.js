const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const supabaseUrl = 'https://tivsrbykzsmbrkmqqwwd.supabase.co';
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY; // Ensure this is correctly set in your .env file
const supabase = createClient(supabaseUrl, supabaseKey);
const SibApiV3Sdk = require('@getbrevo/brevo');
const brevoClient = new SibApiV3Sdk.TransactionalEmailsApi();
const apiKey = brevoClient.authentications['apiKey'];
apiKey.apiKey = process.env.BREVO_API_KEY;

let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

module.exports = async (req, res) => {
  try {
    console.log(req.body);
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
      sendSmtpEmail.subject = 'Richiesta Fattura Fiscale Booking Cliente';
      sendSmtpEmail.sender = { name: 'Club Joy Booking Service', email: 'noreply@clubjoy.it' };
      sendSmtpEmail.to = [{ email: 'corsini.ludovico@gmail.com', name: 'Club Joy Team' }]; //bookingRecord.providerEmail
      sendSmtpEmail.htmlContent = `<html><body><p>Il Customer: ${bookingRecord.name} </p><br/>
      <p>con prenotazione: ${bookingRecord.bookingid} </p><br/>
      <p>evento ${bookingRecord.eventname}</p><br/>
      <p>data ${bookingRecord.startdate}-${bookingRecord.enddate}<p><br/>
      <p>ha richiesto la fattura fiscale.</p> 
      </body></html>`;
    }

    try {
      const data = await brevoClient.sendTransacEmail(sendSmtpEmail);
      res.json({ message: 'Email sent successfully', data });
    } catch (error) {
      console.error('Error sending email:', error);
      res.status(500).json({ error: 'Failed to send email' });
    }

  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};