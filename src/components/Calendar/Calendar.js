import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import css from './Calendar.module.css';
// import 'react-big-calendar/lib/css/react-big-calendar.css';
import { v4 as uuidv4 } from 'uuid';
import {
  queryOwnListings,
  getOwnListingsById,
} from '../../containers/ManageListingsPage/ManageListingsPage.duck';
import { loadData2 } from '../../containers/InboxPage/InboxPage.duck';
import AttendanceForm from '../AttendaceForm/AttendaceForm';
import { useIntl } from 'react-intl';
const randomId = () => uuidv4();
const localizer = momentLocalizer(moment);
const dayOfWeekMap = {
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6,
  sun: 0,
};
function mergeTransactionsAndBookings(response) {
  const { data: transactions, included: bookingsAndOthers } = response;
  const bookings = bookingsAndOthers.filter(item => item.type === 'booking');
  const mergedData = transactions.map(transaction => {
    const bookingId = transaction.relationships.booking.data.id.uuid;
    const transactionBooking = bookings.find(booking => booking.id.uuid === bookingId);

    return {
      id: transaction.id.uuid,
      bookingId: bookingId,
      seats: transactionBooking?.attributes?.seats,
      start: transactionBooking?.attributes?.start,
      end: transactionBooking?.attributes?.end,
      protectedData: transaction?.attributes?.protectedData,
    };
  });

  const groupedByStart = mergedData.reduce((acc, curr) => {
    const key = curr.start;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(curr);
    return acc;
  }, {});

  const mergedByStart = Object.values(groupedByStart).map(group => {
    if (group.length === 1) {
      const { protectedData, ...rest } = group[0];
      const { unitType, ...namesData } = protectedData;
      const names = Object.values(namesData);

      return {
        ...rest,
        protectedData: {
          names,
        },
      };
    } else {
      return group.reduce((merged, booking, index) => {
        const totalSeats = (merged.seats || 0) + booking.seats;

        let names = [];
        if (index === 1) {
          names = merged.protectedData.seatNames || [];
        }
        const newNames = booking.protectedData.seatNames || [];

        names = [...new Set([...names, ...newNames])];

        return {
          id: index === 1 ? booking.id : `${merged.id},${booking.id}`,
          bookingId: index === 1 ? booking.bookingId : merged.bookingId,
          seats: totalSeats,
          start: booking.start,
          end: booking.end,
          protectedData: {
            names: [...new Set(names)],
          },
        };
      });
    }
  });

  //console.log('Merged by start date:', mergedByStart);
  return mergedByStart;
}

const transformListingsToEvents = (
  ownListings,
  year = moment().year(),
  month = moment().month() + 1
) => {
  let events = [];

  ownListings.forEach(listing => {
    const monthStart = moment([year, month - 1]);
    const monthEnd = moment(monthStart).endOf('month');

    while (monthStart.isBefore(monthEnd)) {
      listing.attributes.availabilityPlan.entries.forEach(entry => {
        const dayOfWeekNumber = dayOfWeekMap[entry.dayOfWeek.toLowerCase()];
        const currentDayOfWeekNumber = monthStart.day();

        if (currentDayOfWeekNumber === dayOfWeekNumber) {
          const startDateTime = monthStart
            .clone()
            .hour(parseInt(entry.startTime.split(':')[0]))
            .minute(parseInt(entry.startTime.split(':')[1]));
          const endDateTime = monthStart
            .clone()
            .hour(parseInt(entry.endTime.split(':')[0]))
            .minute(parseInt(entry.endTime.split(':')[1]));

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
      monthStart.add(1, 'days');
    }
  });

  return events;
};
const MyCalendar = ({ ownListings, fetchOwnListings, fetchOrdersOrSales }) => {
  const [mergedBookings, setMergedBookings] = useState([]);
  const [selectedListing, setSelectedListing] = useState(null);
  const [selectedEventDate, setSelectedEventDate] = useState(null);
  const [selectedActivity, setSelectedActivity] = useState({ resource: null, bookingData: null });
  const [showForm, setShowForm] = useState(false);
  const intl = useIntl();

  useEffect(() => {
    fetchOwnListings();
    const params = { tab: 'sales' };
    const search = '';
    fetchOrdersOrSales(params, search)
      .then(response => {
        const mergedData = mergeTransactionsAndBookings(response.data);
        setMergedBookings(mergedData);
      })
      .catch(error => {
        console.error('Error fetching orders or sales:', error);
      });
  }, [fetchOwnListings, fetchOrdersOrSales]);

  const events = transformListingsToEvents(ownListings);

  const handleSelectEvent = calendarEvent => {
    setSelectedListing(calendarEvent.resource);
    setSelectedEventDate(calendarEvent.start);

    const matchedBooking = mergedBookings.find(booking => {
      const isSameDay = moment(booking.start).isSame(moment(calendarEvent.start), 'day');

      return isSameDay;
    });

    if (matchedBooking) {
      setSelectedActivity({
        resource: calendarEvent.resource,
        bookingData: {
          ...matchedBooking.protectedData,
          bookingId: matchedBooking.bookingId,
        },
      });
    } else {
      setSelectedActivity({ resource: calendarEvent.resource, bookingData: null });
    }
  };

  const handleBack = () => {
    setShowForm(false);
  };

  const handleSelectActivity = activity => {
    if (selectedActivity.bookingData) {
      setSelectedActivity({
        resource: {
          ...activity,
          bookingData: selectedActivity.bookingData,
        },
      });
    } else {
      setSelectedActivity({ resource: activity });
    }
    setShowForm(true);
  };

  const getDayOfWeekNumberFromDate = date => {
    return moment(date).day();
  };

  return (
    <div>
      {!showForm ? (
        <>
          <Calendar
            localizer={localizer}
            events={events}
            onSelectEvent={handleSelectEvent}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 500, margin: '100px' }}
          />
          {selectedListing && selectedEventDate && (
            <div
              style={{
                alignItems: 'center',
                textAlign: 'center',
                marginBottom: '40px',
              }}
            >
              <h4>
                {intl.formatMessage({
                  id: 'Calendar.activity',
                })}
              </h4>
              {selectedListing.attributes.availabilityPlan.entries
                .filter(activity => {
                  const dayOfWeekNumberForEvent = getDayOfWeekNumberFromDate(selectedEventDate);
                  const dayOfWeekNumberForActivity = dayOfWeekMap[activity.dayOfWeek.toLowerCase()];
                  return dayOfWeekNumberForEvent === dayOfWeekNumberForActivity;
                })
                .map(activity => {
                  const eventDate = moment(selectedEventDate).format('YYYY-MM-DD');
                  const activityTime = activity.startTime;
                  const activityDateTime = moment(`${eventDate}T${activityTime}`);

                  const matchedBooking = mergedBookings.find(booking =>
                    activityDateTime.isSame(moment(booking.start), 'minute')
                  );
                  let namesCount = 0;
                  if (
                    matchedBooking &&
                    matchedBooking.protectedData &&
                    Array.isArray(matchedBooking.protectedData.names)
                  ) {
                    namesCount = matchedBooking.protectedData.names.flat().length;
                  }
                  return (
                    <li
                      key={randomId()}
                      onClick={() => handleSelectActivity(activity)}
                      className={css.listItem}
                    >
                      {activity.startTime} {selectedListing.attributes.title} Seats: {namesCount}/
                      {activity.seats}
                    </li>
                  );
                })}
            </div>
          )}
        </>
      ) : (
        <AttendanceForm activity={selectedActivity} onBack={handleBack} />
      )}
    </div>
  );
};

const mapStateToProps = state => ({
  transactionRefs: state.InboxPage.transactionRefs,
  transactions: state.InboxPage.transactions,
  booking: state.InboxPage.booking,
  ownListings: getOwnListingsById(state, state.ManageListingsPage.currentPageResultIds),
});

const mapDispatchToProps = dispatch => ({
  fetchOwnListings: () => dispatch(queryOwnListings({})),
  fetchOrdersOrSales: (params, search) => dispatch(loadData2(params, search)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MyCalendar);
