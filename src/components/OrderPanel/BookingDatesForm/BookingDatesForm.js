import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { array, bool, func, number, object, string } from 'prop-types';
import { compose } from 'redux';
import { Form as FinalForm, FormSpy, Field } from 'react-final-form';
import classNames from 'classnames';
import { FormattedMessage, intlShape, injectIntl } from '../../../util/reactIntl';
import { required } from '../../../util/validators';
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
import moment from 'moment';

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
  console.log('TEST', date, monthlyTimeSlots, monthlyTimeSlots[monthId]);
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
  const firstDate = getStartOf(startDate, 'day', timeZone, 1, 'days');
  if (isSameDay(firstDate, endDate, timeZone)) {
    return null;
  }

  const timeSlots = pickMonthlyTimeSlots(monthlyTimeSlots, firstDate, timeZone);
  const contains = timeSlotsContain(timeSlots, firstDate, timeZone);
  return contains ? firstBlockedBetween(monthlyTimeSlots, firstDate, endDate, timeZone) : firstDate;
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
  const previousDate = getStartOf(endDate, 'day', timeZone, -1, 'days');
  if (isSameDay(previousDate, startDate, timeZone)) {
    return null;
  }

  const timeSlots = pickMonthlyTimeSlots(monthlyTimeSlots, previousDate, timeZone);
  return timeSlotsContain(timeSlots, previousDate, timeZone)
    ? lastBlockedBetween(monthlyTimeSlots, startDate, previousDate, timeZone)
    : previousDate;
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
  const timeOfDay = timeOfDayFromLocalToTimeZone(day, timeZone);
  const dayInListingTZ = getStartOf(timeOfDay, 'day', timeZone);
  const timeSlots = pickMonthlyTimeSlots(monthlyTimeSlots, dayInListingTZ, timeZone);
  return !timeSlots.find(timeSlot => timeSlotEqualsDay(timeSlot, dayInListingTZ));
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
const handleFormSubmit = (setFocusedInput, onSubmit, timeZone) => e => {
  console.log('form submit');
  const { date } = e.bookingDates || {};
  if (!date) {
    e.preventDefault();
    setFocusedInput(START_DATE);
  } else {
    const startDate = date || new Date();
    const endDate = addTime(startDate, 1, 'days', timeZone);
    onSubmit({ ...e, bookingDates: { startDate, endDate } });
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
  onFetchTransactionLineItems,
  timeZone
) => formValues => {
  const { bookingDates, seats } = formValues.values;

  const seatNames = [];

  // Collect seat names into an array
  for (let i = 1; i <= seats; i++) {
    const seatName = formValues.values[`seatName${i}`];
    if (seatName) {
      seatNames.push(seatName);
    }
  }

  const { startDate, endDate, date } = bookingDates ? bookingDates : {};
  console.log('ddd', bookingDates);
  if (date && !fetchLineItemsInProgress) {
    onFetchTransactionLineItems({
      orderData: {
        bookingStart: date,
        bookingEnd: addTime(date, 1, 'days', timeZone),
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

  const onFormSubmit = handleFormSubmit(setFocusedInput, onSubmit, timeZone);
  const onFocusedInputChange = handleFocusedInputChange(setFocusedInput);
  const onFormSpyChange = handleFormSpyChange(
    listingId,
    isOwnListing,
    fetchLineItemsInProgress,
    onFetchTransactionLineItems,
    timeZone
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
        const { date } = values && values.bookingDates ? values.bookingDates : {};
        const startDate = date || new Date();
        const endDate = addTime(startDate, 1, 'days', timeZone);
        const { seats } = values;
        // This is the place to collect breakdown estimation data.
        // Note: lineItems are calculated and fetched from this Template's backend
        // so we need to pass only booking data that is needed otherwise
        // If you have added new fields to the form that will affect to pricing,
        // you need to add the values to handleOnChange function
        const breakdownData = date
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
        const isDayBlocked = isDayBlockedFn(monthlyTimeSlots, timeZone);
        const isOutsideRange = isOutsideRangeFn(
          monthlyTimeSlots,
          startDate,
          endDate,
          lineItemUnitType,
          dayCountAvailableForBooking,
          timeZone
        );
        const seatArrays = useMemo(() => {
          const formState = formApi.getState();
          const { bookingDates } = formState.values;

          const startDate = bookingDates?.date || new Date();
          const endDate = addTime(startDate, 1, 'days', timeZone);

          const timeSlots = pickMonthlyTimeSlots(monthlyTimeSlots, startDate, timeZone);

          const correspondTimeSlots = timeSlots.find(timeSlot =>
            moment(timeSlot.attributes.start).isSame(startDate, 'days')
          );

          // Return an array of the seat options a customer
          // can pick for the time range
          return correspondTimeSlots
            ? Array(correspondTimeSlots.attributes.seats)
                .fill()
                .map((_, i) => i + 1)
            : [];
        }, [monthlyTimeSlots, values.bookingDates]);

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
              seatsArray={seatArrays}
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
