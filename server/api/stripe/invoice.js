const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const supabaseUrl = 'https://tivsrbykzsmbrkmqqwwd.supabase.co';
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY; // Ensure this is correctly set in your .env file
const supabase = createClient(supabaseUrl, supabaseKey);

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

    // Proceed with further processing using bookingRecord and customerObj if needed
    // For example, creating a transaction record in Supabase

    // Respond with success
    res.status(200).json({ message: 'Booking found', booking: bookingRecord });

  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

/*
app.post('/send-reminder', async (req, res) => {
  const {
    name,
    email,
    startDate,
    endDate,
    seats,
    seatNames,
    eventName,
    eventLocation,
    eventGeoLocation,
  } = req.body;
  const formatDate = 'YYYY-MM-DD';
  const formatTime = 'HH:mm:ss';
  const displayStartDate = moment(startDate).format(formatDate);
  const displayStartTime = moment(startDate).format(formatTime);
  const displayEndDate = moment(endDate).format(formatDate);
  const displayEndTime = moment(endDate).format(formatTime);
  const formatForGoogle = 'YYYYMMDDTHHmmss[Z]';
  const formattedStartDate = moment(startDate)
    .utc()
    .format(formatForGoogle);
  const formattedEndDate = moment(endDate)
    .utc()
    .format(formatForGoogle);
  const hasGeoLocation =
    eventGeoLocation &&
    typeof eventGeoLocation.lat === 'number' &&
    typeof eventGeoLocation.lng === 'number';
  const googleMapsLink = hasGeoLocation
    ? `https://www.google.com/maps/?q=${eventGeoLocation.lat},${eventGeoLocation.lng}`
    : '';

  const formatForYahoo = 'YYYYMMDDTHHmmss'; // Adjust format if needed
  const formattedStartDateForYahoo = moment(startDate).format(formatForYahoo);
  const formattedEndDateForYahoo = moment(endDate).format(formatForYahoo);

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
  apiInstance.sendTransacEmail(sendSmtpEmail).then(
    function(data) {
      res.json({ message: 'Email sent successfully', data }); // Send response back to client
    },
    function(error) {
      console.error(error);
      res.status(500).send({ message: 'Failed to send email', error }); // Send error response back to client
    }
  );
});
*/