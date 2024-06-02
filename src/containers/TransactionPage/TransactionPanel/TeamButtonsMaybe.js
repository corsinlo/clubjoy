import React, { useState } from 'react';
import classNames from 'classnames';
import { createInvoice, createRefund } from '../../../util/api';
import { PrimaryButton, SecondaryButton } from '../../../components';
import css from './TransactionPanel.module.css';
import { useIntl } from 'react-intl';
import PopUp from '../../../components/PopUp/PopUp';

const TeamButtonsMaybe = props => {
  const intl = useIntl();
  const {
    className,
    rootClassName,
    customerObj,
    transactionId,
    start,
  } = props;

  const [showPopUp, setShowPopUp] = useState(false);

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
    setShowPopUp(true);
  };

  const handleClosePopUp = () => {
    setShowPopUp(false);
  };

  const handleConfirmRefund = (selectedOption) => {
    createRefund({ customerObj, transactionId, selectedOption });
  };

  const classes = classNames(rootClassName || css.actionButtons, className);

  return (
    <div className={css.actionButtonWrapper}>
      <div className={classes}>
        <PrimaryButton disabled={!isAfterFiveDays} onClick={handlePrimaryButtonClick}>
          {intl.formatMessage({ id: 'TeamButtons.button.receipt' })}
        </PrimaryButton>
        <SecondaryButton disabled={isWithinFiveDays} onClick={handleSecondaryButtonClick}>
          {intl.formatMessage({ id: 'TeamButtons.button.cancel' })}
        </SecondaryButton>
        <div className={css.cancellationPolicy}>{intl.formatMessage({ id: 'TeamButton.cancelPolicy' })}</div>
      </div>
      
      {showPopUp && (
        <PopUp
          message={intl.formatMessage({ id: 'TeamButtons.popUp.confirmMessage' })}
          onConfirm={handleConfirmRefund}
          onCancel={handleClosePopUp}
        />
      )}
    </div>
  );
};

export default TeamButtonsMaybe;
