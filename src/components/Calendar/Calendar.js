import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import styles from './Calendar.module.css';
import { queryOwnListings, getOwnListingsById } from '../../containers/ManageListingsPage/ManageListingsPage.duck';
import AttendanceForm from '../AttendaceForm/AttendaceForm';

const localizer = momentLocalizer(moment);
const dayOfWeekMap = {
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6,
  sun: 0 
};

const transformListingsToEvents = (ownListings) => {
  let events = [];
  ownListings.forEach(listing => {
    const monthStart = moment('2024-02-01');
    const monthEnd = moment('2024-02-29');

    while (monthStart.isBefore(monthEnd)) {
      listing.attributes.availabilityPlan.entries.forEach(entry => {
        // Step 2: Use the map to get the day of week number
        const dayOfWeekNumber = dayOfWeekMap[entry.dayOfWeek.toLowerCase()];
        const currentDayOfWeekNumber = monthStart.day();

        if (currentDayOfWeekNumber === dayOfWeekNumber) {
          const startDateTime = monthStart.clone().hour(parseInt(entry.startTime.split(':')[0])).minute(parseInt(entry.startTime.split(':')[1]));
          const endDateTime = monthStart.clone().hour(parseInt(entry.endTime.split(':')[0])).minute(parseInt(entry.endTime.split(':')[1]));

          events.push({
            id: `${listing.id.uuid}-${monthStart.format('YYYY-MM-DD')}`,
            title: listing.attributes.title,
            start: startDateTime.toDate(),
            end: endDateTime.toDate(),
            allDay: false,
            resource: listing,
          });
        }
      });
      monthStart.add(1, 'days'); // Move to the next day
    }
  });

  return events;
};


const MyCalendar = ({ ownListings, fetchOwnListings }) => {
  useEffect(() => {
    console.log("Fetching own listings...");
    fetchOwnListings(); // Fetch listings when component mounts
  }, [fetchOwnListings]);

  const [selectedListing, setSelectedListing] = useState(null);
  const [selectedEventDate, setSelectedEventDate] = useState(null);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const events = transformListingsToEvents(ownListings);

  const handleSelectEvent = (event) => {
    setSelectedListing(event.resource);
    setSelectedEventDate(event.start);
  };

  const handleSelectActivity = (activity) => {
    setSelectedActivity(activity);
    setShowForm(true); // Show the form and hide the calendar
  };

  const getDayOfWeekNumberFromDate = (date) => {
    return moment(date).day();
  };

  const dayPropGetter = (date) => {
    const hasEvents = events.some(event => 
      moment(date).isSame(event.start, 'day') || moment(date).isSame(event.end, 'day')
    );
    
    return {
      style: {
        backgroundColor: hasEvents ? '#f0f0f0' : 'inherit', // Change '#f0f0f0' to your highlight color
      },
    };
  };

  return (
    <div>
      {!showForm ? ( // Conditional rendering based on showForm state
        <>
          <Calendar
            localizer={localizer}
            events={events}
            onSelectEvent={handleSelectEvent}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 500, margin: '50px' }}
            dayPropGetter={dayPropGetter}
          />
          {selectedListing && selectedEventDate && (
            <div style={{ marginTop: '20px' }}>
              <h3>Selected Activity:</h3>
              {selectedListing.attributes.availabilityPlan.entries
                .filter(activity => {
                  const dayOfWeekNumberForEvent = getDayOfWeekNumberFromDate(selectedEventDate);
                  const dayOfWeekNumberForActivity = dayOfWeekMap[activity.dayOfWeek.toLowerCase()];
                  return dayOfWeekNumberForEvent === dayOfWeekNumberForActivity;
                })
                .map((activity) => (
                  <li key={activity.id} onClick={() => handleSelectActivity(activity)}>
                    {activity.startTime} {selectedListing.attributes.title} Seats: {activity.seats}
                  </li>
                ))}
            </div>
          )}
        </>
      ) : (
        <AttendanceForm activity={selectedActivity} />
      )}
    </div>
  );
};



const mapStateToProps = state => {
  const listingIds = state.ManageListingsPage.currentPageResultIds;
  const ownListings = getOwnListingsById(state, listingIds);
  console.log("Mapped listings from state:", ownListings); // Corrected variable name
  return {
    ownListings,
  };
};



const mapDispatchToProps = dispatch => ({
  fetchOwnListings: () => dispatch(queryOwnListings({})), // Dispatch the action to fetch listings
});

export default connect(mapStateToProps, mapDispatchToProps)(MyCalendar);
