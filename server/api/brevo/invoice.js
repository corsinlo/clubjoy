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
    const formattedDate = (dateString => new Date(dateString).toLocaleDateString('it-IT').replace(/\//g, '-'))(bookingRecord.startdate);
    if (bookingRecord) {
      sendSmtpEmail.sender = { name: 'Club Joy Team', email: 'noreply@clubjoy.it' };
      sendSmtpEmail.to = [{ email: 'corsini.ludovico@gmail.com', name: bookingRecord.providername }]; //bookingRecord.providerEmail
      sendSmtpEmail.templateId = 28;
      sendSmtpEmail.params = {
        providername: bookingRecord.providername,
        userName: bookingRecord.name,
        startDate: formattedDate,
      };

      try {
        const emailResponse = await brevoClient.sendTransacEmail(sendSmtpEmail);
        try {
          sendSmtpEmail.sender = { name: 'Club Joy Team', email: 'noreply@clubjoy.it' };
          sendSmtpEmail.to = [{ email: 'corsini.ludovico@gmail.com', name: bookingRecord.providername }]; //bookingRecord.providerEmail
          sendSmtpEmail.templateId = 29;
          sendSmtpEmail.params = {
            providerName: bookingRecord.providername,
            userName: bookingRecord.name,
            startDate: formattedDate,
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
};


/*
let defaultClient = SibApiV3.ApiClient.instance;
  let apiKey = defaultClient.authentications['api-key'];
  apiKey.apiKey = process.env.BREVO_API_KEY;
  let apiInstance = new SibApiV3.TransactionalEmailsApi();
  let sendSmtpEmail = new SibApiV3.SendSmtpEmail();
  sendSmtpEmail.sender = { name: 'Club Joy Team', email: 'hello@clubjoy.it' };
  sendSmtpEmail.to = [{ email: email, name: firstName }];
  sendSmtpEmail.templateId = 3;

  sendSmtpEmail.params = {
    name: name,
    startDate: displayStartDate,
    startTime: displayStartTime,
    endDate: displayEndDate,
    endTime: displayEndTime,
    seats: seats,
    seatNames: seatNames.join(', <br>'),
    eventName: eventName,
    location: eventLocation,
    googleMapsLink: googleMapsLink, // Add Google Maps link here
    yahooCalendarLink: `https://calendar.yahoo.com/?v=60&view=d&type=20&title=${encodeURIComponent(
      eventName
    )}&st=${formattedStartDateForYahoo}&et=${formattedEndDateForYahoo}&desc=${encodeURIComponent(
      seatNames.join(', ')
    )}&in_loc=${encodeURIComponent(eventLocation.address)}`,
    googleCalendarLink: `https://www.google.com/calendar/render?action=TEMPLATE&text=${eventName}&dates=${formattedStartDate}/${formattedEndDate}&details=For+details,+link+here:+http://www.clubjoy.it`,
  };
*/