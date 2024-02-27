/**
 * Provides a date picker for Final Forms (using https://github.com/airbnb/react-dates)
 *
 * NOTE: If you are using this component inside BookingDatesForm,
 * you should convert value.date to start date and end date before submitting it to API
 */
import React, { Component } from 'react';
import { bool, func, object, string } from 'prop-types';
import { isInclusivelyAfterDay, isInclusivelyBeforeDay } from 'react-dates';
import { Field } from 'react-final-form';
import classNames from 'classnames';
import moment from 'moment';

import { useConfiguration } from '../../context/configurationContext';
import { ValidationError } from '../../components';

import DateInput from './DateInput';
import css from './FieldDateInput.module.css';

const MAX_MOBILE_SCREEN_WIDTH = 768;

const handleChange = (parentOnChange, inputOnChange) => value => {
  // If "onChange" callback is passed through the props,
  // it can notify the parent when the content of the input has changed.
  if (parentOnChange) {
    parentOnChange(value);
  }
  // Notify Final Form that the input has changed.
  inputOnChange(value);
};

class FieldDateInputComponent extends Component {
  componentDidUpdate(prevProps) {
    // Update focusedInput in case a new value for it is
    // passed in the props. This may occur if the focus
    // is manually set to the date picker.
    if (this.props.focusedInput && this.props.focusedInput !== prevProps.focusedInput) {
      this.setState({ focusedInput: this.props.focusedInput });
    }
  }

  handleBlur(focusedInput) {
    this.setState({ focusedInput: null });
    this.props.input.onBlur(focusedInput);
    // Notify the containing component that the focused
    // input has changed.
    if (this.props.onFocusedInputChange) {
      this.props.onFocusedInputChange(null);
    }
  }

  handleFocus(focusedInput) {
    this.setState({ focusedInput });
    this.props.input.onFocus(focusedInput);
  }
  componentDidMount() {
    this.handleSeatsArrayUpdate();
  }

  componentDidUpdate(prevProps) {
    // Check if seatsArray has changed
    if (this.props.seatsArray !== prevProps.seatsArray) {
      this.handleSeatsArrayUpdate();
    }
  }

  handleSeatsArrayUpdate() {
    // Check if seatsArray exists and its length is greater than 1
    if (this.props.seatsArray?.length > 1) {
      // If setShowSeatNames function is passed as prop, call it
      if (typeof this.props.setShowSeatNames === 'function') {
        this.props.setShowSeatNames(true);
      }
    }
  }
  render() {
    const {
      className,
      rootClassName,
      id,
      label,
      showLabelAsDisabled,
      input,
      focusedInput,
      onFocusedInputChange,
      meta,
      useMobileMargins,
      showErrorMessage,
      onChange: parentOnChange,
      seatsArray,
      seatsLabel,
      setShowSeatNames,
      ...rest
    } = this.props;

    if (label && !id) {
      throw new Error('id required when a label is given');
    }

    const { touched, invalid, error } = meta;
    const value = input.value;

    // If startDate is valid label changes color and bottom border changes color too
    const dateIsValid = value && value.date instanceof Date;
    // Error message and input error styles are only shown if the
    // field has been touched and the validation has failed.
    const hasError = touched && invalid && error;

    const inputClasses = classNames({
      [css.pickerSuccess]: dateIsValid,
      [css.pickerError]: hasError,
    });

    const { onBlur, onFocus, onChange: inputOnChange, type, checked, ...restOfInput } = input;
    const inputProps = {
      onBlur: input.onBlur,
      onFocus: input.onFocus,
      onChange: handleChange(parentOnChange, inputOnChange),
      useMobileMargins,
      id,
      readOnly: typeof window !== 'undefined' && window.innerWidth < MAX_MOBILE_SCREEN_WIDTH,
      ...restOfInput,
      ...rest,
    };
    const classes = classNames(rootClassName || css.fieldRoot, className);
    const errorClasses = classNames({ [css.mobileMargins]: useMobileMargins });
    const seatsSelectionMaybe =
      seatsArray?.length > 1 ? (
        <FieldSelect name="seats" id="seats" label={seatsLabel}>
          {seatsArray.map(s => (
            <option value={s} key={s}>
              {s}
            </option>
          ))}
        </FieldSelect>
      ) : null;

    return (
      <div className={classes}>
        {label ? (
          <label
            className={classNames({
              [css.mobileMargins]: useMobileMargins,
              [css.labelDisabled]: showLabelAsDisabled,
            })}
            htmlFor={id}
          >
            {label}
          </label>
        ) : null}
        <DateInput className={inputClasses} {...inputProps} />
        {showErrorMessage ? <ValidationError className={errorClasses} fieldMeta={meta} /> : null}
        {seatsSelectionMaybe}
      </div>
    );
  }
}

FieldDateInputComponent.defaultProps = {
  className: null,
  rootClassName: null,
  useMobileMargins: false,
  showErrorMessage: true,
  id: null,
  label: null,
  showLabelAsDisabled: false,
  placeholderText: null,
  onChange: null,
};

FieldDateInputComponent.propTypes = {
  className: string,
  rootClassName: string,
  useMobileMargins: bool,
  showErrorMessage: bool,
  id: string,
  label: string,
  showLabelAsDisabled: bool,
  placeholderText: string,
  input: object.isRequired,
  meta: object.isRequired,
  onChange: func,
};

const FieldDateInput = props => {
  const config = useConfiguration();
  const { isOutsideRange, firstDayOfWeek, ...rest } = props;

  // Outside range -><- today ... today+available days -1 -><- outside range
  const defaultIsOutSideRange = day => {
    const endOfRange = config.stripe?.dayCountAvailableForBooking - 1;
    return (
      !isInclusivelyAfterDay(day, moment()) ||
      !isInclusivelyBeforeDay(day, moment().add(endOfRange, 'days'))
    );
  };
  const defaultFirstDayOfWeek = config.localization.firstDayOfWeek;
  return (
    <Field
      component={FieldDateInputComponent}
      isOutsideRange={isOutsideRange || defaultIsOutSideRange}
      firstDayOfWeek={firstDayOfWeek || defaultFirstDayOfWeek}
      {...rest}
    />
  );
};

export { DateInput };
export default FieldDateInput;
