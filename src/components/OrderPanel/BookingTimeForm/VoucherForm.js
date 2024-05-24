import React, { Component } from 'react';
import { func, number, object, string } from 'prop-types';
import classNames from 'classnames';
import * as validators from '../../../util/validators';

import {
  getStartOf,
} from '../../../util/dates';
import { propTypes } from '../../../util/types';
import { checkCoupon } from '../../../util/api';
import {
  FieldTextInput,
  PrimaryButton,
} from '../..';
import css from './FieldDateAndTimeInput.module.css';

class VoucherForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentMonth: getStartOf(new Date(), 'month', props.timeZone),
      voucherCode: '',
      validSeatsInput: false,
    };
  }

  handleVoucherChange = event => {
    this.setState({ voucherCode: event.target.value });
  };

  handleVoucherSubmit = () => {
    const requestBody = {
      code: this.state.voucherCode,
    };
    checkCoupon(requestBody)
      .then(response => {
        this.props.form.batch(() => {
          this.props.form.change('voucherFee', response);
        });
        this.setState({ voucherCode: '' });
      })
      .catch(error => {
        console.error('Error checking voucher:', error);
        this.setState({ voucherCode: '' });
      });
  };

  render() {
    const {
      rootClassName,
      className,
      formId,
      form,
      values,
      intl,
      voucher,
    } = this.props;

    const voucherInsertion = (
      <div className={css.fieldTextInput}>
        <div className={css.priceBreakdownContainer}>
          <p>{intl.formatMessage({ id: 'BookingTimeForm.coupon.title' })}</p>
          <hr className={css.totalDivider} />
          <input
            type="text"
            placeholder={intl.formatMessage({ id: 'BookingTimeForm.coupon.placeholder' })}
            value={this.state.voucherCode}
            onChange={this.handleVoucherChange}
          />
          <PrimaryButton type="button" onClick={this.handleVoucherSubmit} style={{ width: '100%' }}>
            {intl.formatMessage({ id: 'BookingTimeForm.coupon.button' })}
          </PrimaryButton>
        </div>
      </div>
    );

    return (
      <div className={classNames(rootClassName || css.root, className)}>
        {voucherInsertion}
      </div>
    );
  }
}

/*
VoucherForm.propTypes = {
  rootClassName: string,
  className: string,
  formId: string.isRequired,
  startDateInputProps: object.isRequired,
  voucher: string,
  values: object.isRequired,
  monthlyTimeSlots: object,
  publicData: object.isRequired,
  timeZone: string.isRequired,
  dayCountAvailableForBooking: number.isRequired,
  seatsLabel: string.isRequired,
  form: object.isRequired,
};
*/

export default VoucherForm;
