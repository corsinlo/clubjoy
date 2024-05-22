import React from 'react';
import classNames from 'classnames';
import { createInvoice } from '../../../util/api';
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

  } = props;



  const handlePrimaryButtonClick = () => {
    createInvoice({ customerObj, transactionId });
  };

  const classes = classNames(rootClassName || css.actionButtons, className);

  return (
    <div className={css.actionButtonWrapper}>
      <div className={classes}>
        <PrimaryButton
          onClick={handlePrimaryButtonClick}
        >
          {intl.formatMessage({ id: 'TeamButtons.button.receipt' })}
        </PrimaryButton>
        <SecondaryButton
        >
         {intl.formatMessage({ id: 'TeamButtons.button.cancel' })}
        </SecondaryButton>
      </div>
    </div>
  )
};

export default TeamButtonsMaybe;
