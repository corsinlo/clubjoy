import React from 'react';
import classNames from 'classnames';
import { createInvoice, createRefund } from '../../../util/api';
import { PrimaryButton, SecondaryButton } from '../../../components';
import css from './TransactionPanel.module.css';
import { useIntl } from 'react-intl';

const TeamButtonsMaybe = props => {
  const intl = useIntl();
  const {
    className,
    rootClassName,
    customerObj,
    transactionId,
    start,
  } = props;

  const startDate = new Date(start);
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  const timeDiff = startDate - currentDate;
  const daysDiff = timeDiff / (1000 * 60 * 60 * 24);

  const isWithinFiveDays = daysDiff >= 0 && daysDiff <= 5;
  const isAfterFiveDays = daysDiff < -5;

  const handlePrimaryButtonClick = () => {
    createInvoice({ customerObj, transactionId });
  };

  const handleSecondaryButtonClick = () => {
    createRefund({ customerObj, transactionId });
  };

  const classes = classNames(rootClassName || css.actionButtons, className);

  return (
    <div className={css.actionButtonWrapper}>
      <div className={classes}>
        <PrimaryButton disabled={!isAfterFiveDays} onClick={handlePrimaryButtonClick}>
          {intl.formatMessage({ id: 'TeamButtons.button.receipt' })}
        </PrimaryButton>
        <SecondaryButton disabled={isWithinFiveDays} onClick={handleSecondaryButtonClick} style={{marginTop: '5px'}}> 
          {intl.formatMessage({ id: 'TeamButtons.button.cancel' })}
        </SecondaryButton>
      </div>
    </div>
  );
};

export default TeamButtonsMaybe;
