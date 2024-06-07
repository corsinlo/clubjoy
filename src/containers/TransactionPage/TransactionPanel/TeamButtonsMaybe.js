import React, { useState, useEffect } from 'react';
import classNames from 'classnames';
import { createInvoice, createRefund } from '../../../util/api';
import { PrimaryButton, SecondaryButton } from '../../../components';
import css from './TransactionPanel.module.css';
import { useIntl } from 'react-intl';
import PopUp from '../../../components/PopUp/PopUp';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tivsrbykzsmbrkmqqwwd.supabase.co';
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const TeamButtonsMaybe = props => {
  const intl = useIntl();
  const [fileExists, setFileExists] = useState(false);
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

  useEffect(() => {
    const checkFileExists = async () => {
      const { data, error } = await supabase
        .storage
        .from('invoices')
        .list('public', {
          search: `${customerObj.bookingid}`
        });

      if (error) {
        console.error('Error checking file:', error);
      } else {
        const exists = data.length > 0;
        setFileExists(exists);
      }
    };

    checkFileExists();
  }, [customerObj.bookingid]);

  const handlePrimaryButtonClick = async () => {
    if (fileExists) {
      const { data, error } = await supabase
        .storage
        .from('invoices')
        .download(`public/${customerObj.bookingid}`);
        
      if (error) {
        console.error('Error downloading file:', error);
      } else {
        const url = URL.createObjectURL(data);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${customerObj.bookingid}`);
        document.body.appendChild(link);
        link.click();
      }
    } else  {
    createInvoice({ customerObj, transactionId });
    }
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
        <PrimaryButton   onClick={handlePrimaryButtonClick}>
          {fileExists 
            ? intl.formatMessage({ id: 'TeamButtons.button.receipt.download' })
            : intl.formatMessage({ id: 'TeamButtons.button.receipt' })
          }
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
