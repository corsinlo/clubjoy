import React, { useState, useEffect } from 'react';
import { array, bool, func, number, object, string } from 'prop-types';
import { compose } from 'redux';
import { Form as FinalForm, FormSpy, Field } from 'react-final-form';
import classNames from 'classnames';
import moment from 'moment/moment';
import { FormattedMessage, intlShape, injectIntl } from '../../../util/reactIntl';
import { required, bookingDatesRequired, composeValidators } from '../../../util/validators';
import {
  START_DATE,
  END_DATE,
  getStartOf,
  addTime,
  isSameDay,
  isDateSameOrAfter,
  isInRange,
  timeOfDayFromLocalToTimeZone,
  timeOfDayFromTimeZoneToLocal,
  monthIdString,
  initialVisibleMonth,
} from '../../../util/dates';
import { LINE_ITEM_DAY, LINE_ITEM_NIGHT, TIME_SLOT_TIME, propTypes } from '../../../util/types';
import { BOOKING_PROCESS_NAME } from '../../../transactions/transaction';
import { generateMonths } from '../../../util/generators';
import {
  Form,
  IconArrowHead,
  PrimaryButton,
  FieldDateRangeInput,
  FieldDateInput,
  H6,
} from '../../../components';

import EstimatedCustomerBreakdownMaybe from '../EstimatedCustomerBreakdownMaybe';

import css from './BookingDatesForm.module.css';

const TODAY = new Date();

const nextMonthFn = (currentMoment, timeZone, offset = 1) =>
  getStartOf(currentMoment, 'month', timeZone, offset, 'months');
const prevMonthFn = (currentMoment, timeZone, offset = 1) =>
  getStartOf(currentMoment, 'month', timeZone, -1 * offset, 'months');
const endOfRange = (date, dayCountAvailableForBooking, timeZone) =>
  getStartOf(date, 'day', timeZone, dayCountAvailableForBooking - 1, 'days');

/**
 * Return a boolean indicating if given date can be found in an array
 * of tile slots (start dates).
 */
const timeSlotsContain = (timeSlots, date, timeZone) => {
  const foundIndex = timeSlots.findIndex(slot =>
    isInRange(date, slot.attributes.start, slot.attributes.end, 'hour', timeZone)
  );
  return foundIndex > -1;
};

const pickMonthlyTimeSlots = (monthlyTimeSlots, date, timeZone) => {
  const monthId = monthIdString(date, timeZone);
  return monthlyTimeSlots?.[monthId]?.timeSlots || [];
};

/**
 * Find first blocked date between two dates, inclusively.
 * If none is found, null is returned.
 *
 * @param {Object} monthlyTimeSlots propTypes.timeSlot objects
 * @param {Moment} startDate start date, inclusive
 * @param {Moment} endDate end date, inclusive
 * @param {String} timeZone time zone id
 */
const firstBlockedBetween = (monthlyTimeSlots, startDate, endDate, timeZone) => {
  // Adjusted to include the start date in the search.
  const firstDate = getStartOf(startDate, 'day', timeZone);

  // Check if firstDate is after endDate, taking inclusivity into account.
  if (firstDate > getEndOf(endDate, 'day', timeZone)) {
    return null;
  }

  const timeSlots = pickMonthlyTimeSlots(monthlyTimeSlots, firstDate, timeZone);
  const contains = timeSlotsContain(timeSlots, firstDate, timeZone);

  // If contains is false, it means the current day is not blocked, we check the next day unless it's the end date.
  if (!contains) {
    // Adjust to prevent an infinite loop and ensure we move to the next day
    const nextDate = firstDate.clone().add(1, 'days');
    // Check if we've reached the endDate, if so, return null since no blocked found on last day
    if (isSameDay(firstDate, endDate, timeZone)) {
      return null;
    }
    return firstBlockedBetween(monthlyTimeSlots, nextDate, endDate, timeZone);
  } else {
    // If contains is true, it means the current day is blocked.
    return firstDate;
  }
};

/**
 * Find last blocked date between two dates, inclusively.
 * If none is found, null is returned.
 *
 * @param {Array} monthlyTimeSlots propTypes.timeSlot objects
 * @param {Moment} startDate start date, inclusive
 * @param {Moment} endDate end date, inclusive
 * @param {String} timeZone time zone id
 */
const lastBlockedBetween = (monthlyTimeSlots, startDate, endDate, timeZone) => {
  const lastDate = getEndOf(endDate, 'day', timeZone);

  // Early return if lastDate is before startDate.
  if (lastDate < getStartOf(startDate, 'day', timeZone)) {
    return null;
  }

  const timeSlots = pickMonthlyTimeSlots(monthlyTimeSlots, lastDate, timeZone);
  const contains = timeSlotsContain(timeSlots, lastDate, timeZone);

  if (contains) {
    return lastDate;
  } else {
    const prevDate = lastDate.clone().subtract(1, 'days');
    // Adjusted logic to correctly handle case where startDate and endDate are the same
    if (!prevDate.isBefore(startDate, 'day')) {
      return lastBlockedBetween(monthlyTimeSlots, startDate, prevDate, timeZone);
    } else {
      // If prevDate is before startDate, it means we've checked the startDate (inclusive) and found no blocked slots.
      return null;
    }
  }
};

/**
 * Check if a blocked date can be found between two dates.
 *
 * @param {Object} timeSlots propTypes.timeSlot objects
 * @param {String} timeZone time zone id
 * @param {Moment} startDate start date, exclusive
 * @param {Moment} endDate end date, exclusive
 */
const isBlockedBetween = (monthlyTimeSlots, timeZone) => (startDate, endDate) => {
  const startInListingTZ = getStartOf(
    timeOfDayFromLocalToTimeZone(startDate, timeZone),
    'day',
    timeZone
  );
  const endInListingTZ = getStartOf(
    timeOfDayFromLocalToTimeZone(endDate, timeZone),
    'day',
    timeZone
  );
  return !!firstBlockedBetween(monthlyTimeSlots, startInListingTZ, endInListingTZ, timeZone);
};

/**
 * Return an array of timeslots for the months between start date and end date
 * @param {*} monthlyTimeSlots
 * @param {*} startDate
 * @param {*} endDate
 * @param {*} timeZone
 * @returns
 */
const pickBookingMonthTimeSlots = (monthlyTimeSlots, startDate, endDate, timeZone) => {
  // The generateMonths generator returns the first day of each month that is spanned
  // by the time range between start date and end date.
  const monthsInRange = generateMonths(startDate, endDate, timeZone);

  return monthsInRange.reduce((timeSlots, firstOfMonth) => {
    return [...timeSlots, ...pickMonthlyTimeSlots(monthlyTimeSlots, firstOfMonth, timeZone)];
  }, []);
};

// Get the time slot for a booking duration that has the least seats
const getMinSeatsTimeSlot = (monthlyTimeSlots, timeZone, startDate, endDate) => {
  const timeSlots = pickBookingMonthTimeSlots(monthlyTimeSlots, startDate, endDate, timeZone);

  // Determine the timeslots that fall between start date and end date
  const bookingTimeslots = timeSlots.filter(ts => {
    const { start, end } = ts.attributes;
    return (
      // booking start date falls within time slot
      (start < startDate && end > startDate) ||
      // whole time slot is within booking period
      (start >= startDate && end <= endDate) ||
      // booking end date falls within time slot
      (start < endDate && end > endDate)
    );
  });

  // Return the timeslot with the least seats in the booking period
  return bookingTimeslots.reduce((minSeats, ts) => {
    if (!minSeats?.seats) {
      return ts.attributes;
    }

    return ts.attributes.seats < minSeats.seats ? ts.attributes : minSeats;
  }, {});
};

const isStartDateSelected = (timeSlots, startDate, endDate, focusedInput) => {
  const isSelected =
    timeSlots &&
    startDate &&
    (!endDate || focusedInput === END_DATE) &&
    focusedInput !== START_DATE;
  console.log('isStartDateSelected called with:', {
    timeSlots,
    startDate,
    endDate,
    focusedInput,
    isSelected,
  });
  return isSelected;
};

const endDateToPickerDate = (unitType, endDate, timeZone) => {
  const isValid = endDate instanceof Date;
  const isDaily = unitType === LINE_ITEM_DAY;

  if (!isValid) {
    return null;
  } else if (isDaily) {
    // API end dates are exlusive, so we need to shift them with daily
    // booking.
    return getStartOf(endDate, 'day', timeZone, -1, 'days');
  } else {
    return endDate;
  }
};

/**
 * Returns an isOutsideRange function that can be passed to
 * a react-dates DateRangePicker component.
 */
const isOutsideRangeFn = (
  monthlyTimeSlots,
  startDate,
  endDate,
  lineItemUnitType,
  dayCountAvailableForBooking,
  timeZone
) => focusedInput => {
  const endOfAvailableRange = dayCountAvailableForBooking - 1;
  const endOfAvailableRangeDate = getStartOf(TODAY, 'day', timeZone, endOfAvailableRange, 'days');
  const outOfBookableDate = getStartOf(TODAY, 'day', timeZone, endOfAvailableRange + 1, 'days');
  const startOfStartDay = getStartOf(startDate, 'day', timeZone);

  // start date selected, end date missing
  const startDateSelected = isStartDateSelected(monthlyTimeSlots, startDate, endDate, focusedInput);
  const endOfBookableRange = startDateSelected
    ? firstBlockedBetween(monthlyTimeSlots, startDate, outOfBookableDate, timeZone)
    : null;

  if (endOfBookableRange) {
    // end the range so that the booking can end at latest on
    // nightly booking: the day the next booking starts
    // daily booking: the day before the next booking starts
    return day => {
      const timeOfDay = timeOfDayFromLocalToTimeZone(day, timeZone);
      const dayInListingTZ = getStartOf(timeOfDay, 'day', timeZone);
      const lastDayToEndBooking = endDateToPickerDate(
        lineItemUnitType,
        endOfBookableRange,
        timeZone
      );
      return (
        !isDateSameOrAfter(dayInListingTZ, startOfStartDay) ||
        !isDateSameOrAfter(lastDayToEndBooking, dayInListingTZ)
      );
    };
  }

  // end date selected, start date missing
  // -> limit the earliest start date for the booking so that it
  // needs to be after the previous booked date
  const endDateSelected = monthlyTimeSlots && endDate && !startDate && focusedInput !== END_DATE;
  const previousBookedDate = endDateSelected
    ? lastBlockedBetween(monthlyTimeSlots, TODAY, endDate, timeZone)
    : null;

  if (previousBookedDate) {
    return day => {
      const timeOfDay = timeOfDayFromLocalToTimeZone(day, timeZone);
      const dayInListingTZ = getStartOf(timeOfDay, 'day', timeZone);
      const firstDayToStartBooking = getStartOf(previousBookedDate, 'day', timeZone, 1, 'days');
      return (
        !isDateSameOrAfter(dayInListingTZ, firstDayToStartBooking) ||
        !isDateSameOrAfter(endOfAvailableRangeDate, dayInListingTZ)
      );
    };
  }

  // standard isOutsideRange function
  return day => {
    const timeOfDay = timeOfDayFromLocalToTimeZone(day, timeZone);
    const dayInListingTZ = getStartOf(timeOfDay, 'day', timeZone);
    return (
      !isDateSameOrAfter(dayInListingTZ, TODAY) ||
      !isDateSameOrAfter(endOfAvailableRangeDate, dayInListingTZ)
    );
  };
};

// Checks if time slot (propTypes.timeSlot) start time equals a day (moment)
const timeSlotEqualsDay = (timeSlot, day, timeZone) => {
  const isTimeBased = timeSlot?.attributes?.type === TIME_SLOT_TIME;
  return isTimeBased
    ? isInRange(day, timeSlot.attributes.start, timeSlot.attributes.end, undefined, timeZone)
    : false;
};

/**
 * Returns an isDayBlocked function that can be passed to
 * a react-dates DateRangePicker component.
 */
const isDayBlockedFn = (monthlyTimeSlots, timeZone) => day => {
  // Format the day into YYYY-MM format to match the keys in monthlyTimeSlots

  const monthKey = day.format('YYYY-MM');
  const dayKey = day.format('YYYY-MM-DD');

  //console.log(`Checking availability for: ${dayKey} in month: ${monthKey}`);

  // Get the time slots for the given month, if available
  const monthData = monthlyTimeSlots[monthKey];
  if (!monthData) {
    //console.log(`No data available for month: ${monthKey}`);
    return true; // Consider the day as blocked if no data is available
  }

  if (monthData.fetchTimeSlotsInProgress) {
    //console.log(`Fetching time slots in progress for month: ${monthKey}`);
    return true; // Consider the day as blocked if fetching is in progress
  }

  if (monthData.fetchTimeSlotsError) {
    //console.log(`Error fetching time slots for month: ${monthKey}`);
    return true; // Consider the day as blocked if an error occurred
  }

  // Filter time slots available for the specific day
  const availableTimeSlots = monthData.timeSlots.filter(timeSlot => {
    const startTime = moment(timeSlot.attributes.start);
    const endTime = moment(timeSlot.attributes.end);
    return (
      startTime.format('YYYY-MM-DD') === dayKey &&
      endTime.format('YYYY-MM-DD') === dayKey &&
      timeSlot.attributes.seats > 0
    );
  });

  const isBlocked = availableTimeSlots.length === 0;
  /*
  console.log(
    `Day: ${dayKey}, Blocked: ${isBlocked}, Available Time Slots: ${availableTimeSlots.length}`
  );
*/
  // If there are no available time slots for the day, block the day
  return isBlocked;
};

const fetchMonthData = (
  date,
  listingId,
  dayCountAvailableForBooking,
  timeZone,
  onFetchTimeSlots
) => {
  const endOfRangeDate = endOfRange(TODAY, dayCountAvailableForBooking, timeZone);

  // Don't fetch timeSlots for past months or too far in the future
  if (isInRange(date, TODAY, endOfRangeDate)) {
    // Use "today", if the first day of given month is in the past
    const start = isDateSameOrAfter(TODAY, date) ? TODAY : date;

    // Use endOfRangeDate, if the first day of the next month is too far in the future
    const nextMonthDate = nextMonthFn(date, timeZone);
    const end = isDateSameOrAfter(nextMonthDate, endOfRangeDate)
      ? getStartOf(endOfRangeDate, 'day', timeZone)
      : nextMonthDate;

    // Fetch time slots for given time range
    onFetchTimeSlots(listingId, start, end, timeZone);
  }
};

const handleMonthClick = (
  currentMonth,
  monthlyTimeSlots,
  fetchMonthData,
  dayCountAvailableForBooking,
  timeZone,
  listingId,
  onFetchTimeSlots
) => monthFn => {
  // Callback function after month has been updated.
  // react-dates component has next and previous months ready (but inivisible).
  // we try to populate those invisible months before user advances there.
  fetchMonthData(
    monthFn(currentMonth, timeZone, 2),
    listingId,
    dayCountAvailableForBooking,
    timeZone,
    onFetchTimeSlots
  );

  // If previous fetch for month data failed, try again.
  const monthId = monthIdString(currentMonth, timeZone);
  const currentMonthData = monthlyTimeSlots[monthId];
  if (currentMonthData && currentMonthData.fetchTimeSlotsError) {
    fetchMonthData(
      currentMonth,
      listingId,
      dayCountAvailableForBooking,
      timeZone,
      onFetchTimeSlots
    );
  }
};

// In case start or end date for the booking is missing
// focus on that input, otherwise continue with the
// default handleSubmit function.
const handleFormSubmit = (setFocusedInput, onSubmit) => e => {
  console.log('form submit');
  const { startDate } = e.bookingDates || {};
  if (!startDate) {
    e.preventDefault();
    setFocusedInput(START_DATE);
  } else {
    onSubmit(e);
  }
};

// Function that can be passed to nested components
// so that they can notify this component when the
// focused input changes.
const handleFocusedInputChange = setFocusedInput => focusedInput => {
  console.log('INPUT CHANGED');
  setFocusedInput(focusedInput);
};

// When the values of the form are updated we need to fetch
// lineItems from this Template's backend for the EstimatedTransactionMaybe
// In case you add more fields to the form, make sure you add
// the values here to the orderData object.
const handleFormSpyChange = (
  listingId,
  isOwnListing,
  fetchLineItemsInProgress,
  onFetchTransactionLineItems
) => formValues => {
  console.log('ddd', formValues.values);
  const { bookingDates, seats } = formValues.values;
  const seatNames = [];

  // Collect seat names into an array
  for (let i = 1; i <= seats; i++) {
    const seatName = formValues.values[`seatName${i}`];
    if (seatName) {
      seatNames.push(seatName);
    }
  }

  const { startDate, endDate } = bookingDates ? bookingDates : {};

  if (startDate && endDate && !fetchLineItemsInProgress) {
    onFetchTransactionLineItems({
      orderData: {
        bookingStart: startDate,
        bookingEnd: endDate,
        seats: parseInt(seats, 10),
        seatNames: { seatNames },
      },
      listingId,
      isOwnListing,
    });
  }
};

// IconArrowHead component might not be defined if exposed directly to the file.
// This component is called before IconArrowHead component in components/index.js
const PrevIcon = props => (
  <IconArrowHead {...props} direction="left" rootClassName={css.arrowIcon} />
);
const NextIcon = props => (
  <IconArrowHead {...props} direction="right" rootClassName={css.arrowIcon} />
);

const Next = props => {
  const { currentMonth, dayCountAvailableForBooking, timeZone } = props;
  const nextMonthDate = nextMonthFn(currentMonth, timeZone);

  return isDateSameOrAfter(
    nextMonthDate,
    endOfRange(TODAY, dayCountAvailableForBooking, timeZone)
  ) ? null : (
    <NextIcon />
  );
};
const Prev = props => {
  const { currentMonth, timeZone } = props;
  const prevMonthDate = prevMonthFn(currentMonth, timeZone);
  const currentMonthDate = getStartOf(TODAY, 'month', timeZone);

  return isDateSameOrAfter(prevMonthDate, currentMonthDate) ? <PrevIcon /> : null;
};

export const BookingDatesFormComponent = props => {
  const [focusedInput, setFocusedInput] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(getStartOf(TODAY, 'month', props.timeZone));

  useEffect(() => {
    // Call onMonthChanged function if it has been passed in among props.
    if (props.onMonthChanged) {
      props.onMonthChanged(monthId);
    }
  }, [currentMonth]);

  const {
    rootClassName,
    className,
    price: unitPrice,
    listingId,
    isOwnListing,
    fetchLineItemsInProgress,
    onFetchTransactionLineItems,
    onSubmit,
    timeZone,
    dayCountAvailableForBooking,
    marketplaceName,
    payoutDetailsWarning,
    ...rest
  } = props;
  const classes = classNames(rootClassName || css.root, className);

  const onFormSubmit = handleFormSubmit(setFocusedInput, onSubmit);
  const onFocusedInputChange = handleFocusedInputChange(setFocusedInput);
  const onFormSpyChange = handleFormSpyChange(
    listingId,
    isOwnListing,
    fetchLineItemsInProgress,
    onFetchTransactionLineItems
  );
  return (
    <FinalForm
      {...rest}
      unitPrice={unitPrice}
      onSubmit={onFormSubmit}
      render={fieldRenderProps => {
        const {
          endDatePlaceholder,
          startDatePlaceholder,
          formId,
          form: formApi,
          handleSubmit,
          intl,
          lineItemUnitType,
          values,
          monthlyTimeSlots,
          lineItems,
          fetchLineItemsError,
          onFetchTimeSlots,
        } = fieldRenderProps;
        const { startDate, endDate } = values && values.bookingDates ? values.bookingDates : {};
        const { seats } = values;
        // This is the place to collect breakdown estimation data.
        // Note: lineItems are calculated and fetched from this Template's backend
        // so we need to pass only booking data that is needed otherwise
        // If you have added new fields to the form that will affect to pricing,
        // you need to add the values to handleOnChange function
        const breakdownData =
          startDate && endDate
            ? {
                startDate,
                endDate,
              }
            : null;

        const showEstimatedBreakdown =
          breakdownData && lineItems && !fetchLineItemsInProgress && !fetchLineItemsError;
        const [showSeatNames, setShowSeatNames] = useState(false);
        const dateFormatOptions = {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        };

        const startOfToday = getStartOf(TODAY, 'day', timeZone);
        const tomorrow = addTime(startOfToday, 1, 'days');
        const startDatePlaceholderText =
          startDatePlaceholder || intl.formatDate(startOfToday, dateFormatOptions);
        const endDatePlaceholderText =
          endDatePlaceholder || intl.formatDate(tomorrow, dateFormatOptions);

        const onMonthClick = handleMonthClick(
          currentMonth,
          monthlyTimeSlots,
          fetchMonthData,
          dayCountAvailableForBooking,
          timeZone,
          listingId,
          onFetchTimeSlots
        );
        const isDayBlocked = isDayBlockedFn(
          monthlyTimeSlots,
          startDate,
          endDate,
          lineItemUnitType,
          dayCountAvailableForBooking,
          timeZone
        );
        const isOutsideRange = isOutsideRangeFn(
          monthlyTimeSlots,
          startDate,
          endDate,
          lineItemUnitType,
          dayCountAvailableForBooking,
          timeZone
        );
        const getSeatsArray = () => {
          const formState = formApi.getState();
          const { bookingDates } = formState.values;

          if (!bookingDates) {
            return null;
          }

          const minSeatsTimeSlot = getMinSeatsTimeSlot(
            monthlyTimeSlots,
            timeZone,
            bookingDates.startDate,
            bookingDates.endDate
          );

          // Return an array of the seat options a customer
          // can pick for the time range
          return Array(minSeatsTimeSlot.seats)
            .fill()
            .map((_, i) => i + 1);
        };
        const seatsArray = getSeatsArray();

        return (
          <Form onSubmit={handleSubmit} className={classes} enforcePagePreloadFor="CheckoutPage">
            <FormSpy subscription={{ values: true }} onChange={onFormSpyChange} />
            <FieldDateInput
              className={css.bookingDates}
              name="bookingDates"
              isDaily={lineItemUnitType === LINE_ITEM_DAY}
              dateId={`${formId}.bookingStartDate`}
              dateLabel={''}
              placeholderText={''}
              focusedInput={focusedInput}
              onFocusedInputChange={onFocusedInputChange}
              format={v => {
                const { date } = v || {};
                const formattedDate = date ? timeOfDayFromTimeZoneToLocal(date, timeZone) : date;
                return v ? { date: formattedDate } : v;
              }}
              parse={v => {
                const { date } = v || {};
                const parsedDate = date
                  ? getStartOf(timeOfDayFromLocalToTimeZone(date, timeZone), 'day', timeZone)
                  : date;
                return v ? { date: parsedDate } : v;
              }}
              useMobileMargins
              initialVisibleMonth={initialVisibleMonth(startDate || startOfToday, timeZone)}
              navNext={
                <Next
                  currentMonth={currentMonth}
                  timeZone={timeZone}
                  dayCountAvailableForBooking={dayCountAvailableForBooking}
                />
              }
              navPrev={<Prev currentMonth={currentMonth} timeZone={timeZone} />}
              onPrevMonthClick={() => {
                setCurrentMonth(prevMonth => prevMonthFn(prevMonth, timeZone));
                onMonthClick(prevMonthFn);
              }}
              onNextMonthClick={() => {
                setCurrentMonth(prevMonth => nextMonthFn(prevMonth, timeZone));
                onMonthClick(nextMonthFn);
              }}
              isDayBlocked={isDayBlocked}
              disabled={fetchLineItemsInProgress}
              onClose={event =>
                setCurrentMonth(getStartOf(event?.startDate ?? startOfToday, 'month', timeZone))
              }
              seatsArray={getSeatsArray()}
              seatsLabel={intl.formatMessage({ id: 'BookingDatesForm.seatsTitle' })}
              setShowSeatNames={setShowSeatNames}
            />
            {showSeatNames &&
              Array.from({ length: seats || 1 }).map((_, index) => (
                <Field
                  key={index}
                  name={`seatName${index + 1}`}
                  component="input"
                  placeholder={`Partecipant Name`}
                  validate={required('This field is required')}
                >
                  {({ input, meta }) => (
                    <div>
                      <input {...input} placeholder={`Seat ${index + 1} Name`} type="text" />
                      {meta.error && meta.touched && <span>{meta.error}</span>}
                    </div>
                  )}
                </Field>
              ))}

            {showEstimatedBreakdown ? (
              <div className={css.priceBreakdownContainer}>
                <H6 as="h3" className={css.bookingBreakdownTitle}>
                  <FormattedMessage id="BookingDatesForm.priceBreakdownTitle" />
                </H6>
                <hr className={css.totalDivider} />
                <EstimatedCustomerBreakdownMaybe
                  breakdownData={breakdownData}
                  lineItems={lineItems}
                  timeZone={timeZone}
                  currency={unitPrice.currency}
                  marketplaceName={marketplaceName}
                  processName={BOOKING_PROCESS_NAME}
                />
              </div>
            ) : null}
            {fetchLineItemsError ? (
              <span className={css.sideBarError}>
                <FormattedMessage id="BookingDatesForm.fetchLineItemsError" />
              </span>
            ) : null}

            <div className={css.submitButton}>
              <PrimaryButton type="submit" inProgress={fetchLineItemsInProgress}>
                <FormattedMessage id="BookingDatesForm.requestToBook" />
              </PrimaryButton>
            </div>
            <p className={css.finePrint}>
              {payoutDetailsWarning ? (
                payoutDetailsWarning
              ) : (
                <FormattedMessage
                  id={
                    isOwnListing
                      ? 'BookingDatesForm.ownListing'
                      : 'BookingDatesForm.youWontBeChargedInfo'
                  }
                />
              )}
            </p>
          </Form>
        );
      }}
    />
  );
};

BookingDatesFormComponent.defaultProps = {
  rootClassName: null,
  className: null,
  price: null,
  isOwnListing: false,
  startDatePlaceholder: null,
  endDatePlaceholder: null,
  lineItems: null,
  fetchLineItemsError: null,
  monthlyTimeSlots: null,
};

BookingDatesFormComponent.propTypes = {
  rootClassName: string,
  className: string,

  marketplaceName: string.isRequired,
  lineItemUnitType: propTypes.lineItemUnitType.isRequired,
  price: propTypes.money,
  isOwnListing: bool,
  monthlyTimeSlots: object,
  onFetchTimeSlots: func.isRequired,

  onFetchTransactionLineItems: func.isRequired,
  lineItems: array,
  fetchLineItemsInProgress: bool.isRequired,
  fetchLineItemsError: propTypes.error,

  // from injectIntl
  intl: intlShape.isRequired,

  // for tests
  startDatePlaceholder: string,
  endDatePlaceholder: string,
  dayCountAvailableForBooking: number.isRequired,
};

const BookingDatesForm = compose(injectIntl)(BookingDatesFormComponent);
BookingDatesForm.displayName = 'BookingDatesForm';

export default BookingDatesForm;
