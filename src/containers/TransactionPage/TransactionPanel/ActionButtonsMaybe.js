import React from 'react';
import classNames from 'classnames';

import { PrimaryButton, SecondaryButton } from '../../../components';
import { createClient } from '@supabase/supabase-js';
import css from './TransactionPanel.module.css';

const supabaseUrl = 'https://tivsrbykzsmbrkmqqwwd.supabase.co';
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY; // Ensure this is correctly set in your .env file
const supabase = createClient(supabaseUrl, supabaseKey);

const ActionButtonsMaybe = props => {
  const {
    className,
    rootClassName,
    showButtons,
    primaryButtonProps,
    secondaryButtonProps,
    isListingDeleted,
    isProvider,
    customerObj,
  } = props;

  if (isListingDeleted && isProvider) {
    return null;
  }

  const buttonsDisabled = primaryButtonProps?.inProgress || secondaryButtonProps?.inProgress;

  const insertBooking = async obj => {
    const { eventgeoLocation = { lat: null, lng: null }, ...rest } = obj;
    const { lat, lng } = eventgeoLocation;

    const newObj = {
      ...rest,
      latitude: lat,
      longitude: lng,
    };

    const { data, error } = await supabase.from('bookings').insert([newObj]); // Note: We're passing newObj here

    if (error) {
      console.error('Error inserting booking into Supabase:', error);
    } else {
      console.log('Inserted booking into Supabase', data);
    }
  };

  const handlePrimaryButtonClick = () => {
    if (isProvider) {
      insertBooking(customerObj);
    }
    if (primaryButtonProps?.onAction) {
      primaryButtonProps.onAction();
    }
  };

  const primaryButton = primaryButtonProps ? (
    <PrimaryButton
      inProgress={primaryButtonProps.inProgress}
      disabled={buttonsDisabled}
      onClick={handlePrimaryButtonClick}
    >
      {primaryButtonProps.buttonText}
    </PrimaryButton>
  ) : null;
  const primaryErrorMessage = primaryButtonProps?.error ? (
    <p className={css.actionError}>{primaryButtonProps?.errorText}</p>
  ) : null;

  const secondaryButton = secondaryButtonProps ? (
    <SecondaryButton
      inProgress={secondaryButtonProps?.inProgress}
      disabled={buttonsDisabled}
      onClick={secondaryButtonProps.onAction}
    >
      {secondaryButtonProps.buttonText}
    </SecondaryButton>
  ) : null;
  const secondaryErrorMessage = secondaryButtonProps?.error ? (
    <p className={css.actionError}>{secondaryButtonProps?.errorText}</p>
  ) : null;

  const classes = classNames(rootClassName || css.actionButtons, className);

  return showButtons ? (
    <div className={classes}>
      <div className={css.actionErrors}>
        {primaryErrorMessage}
        {secondaryErrorMessage}
      </div>
      <div className={css.actionButtonWrapper}>
        {secondaryButton}
        {primaryButton}
      </div>
    </div>
  ) : null;
};

export default ActionButtonsMaybe;
