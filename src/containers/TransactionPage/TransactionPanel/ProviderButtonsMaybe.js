import React, { useState, useRef } from 'react';
import classNames from 'classnames';
import { createInvoice, createRefund } from '../../../util/api';
import { PrimaryButton, SecondaryButton } from '../../../components';
import css from './TransactionPanel.module.css';
import { useIntl } from 'react-intl';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tivsrbykzsmbrkmqqwwd.supabase.co';
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const ProviderButtonsMaybe = props => {
  const intl = useIntl();
  const {
    className,
    rootClassName,
    customerObj,
    transactionId,
    start,
  } = props;

  const [showPopUp, setShowPopUp] = useState(false);
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);  // Create a reference for the file input

  const startDate = new Date(start);
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  const timeDiff = startDate - currentDate;
  const daysDiff = timeDiff / (1000 * 60 * 60 * 24);

  const isWithinFiveDays = daysDiff >= 0 && daysDiff <= 5;
  const isAfterFiveDays = daysDiff < -5;

  const handlePrimaryButtonClick = async () => {
    if (file) {
      const fileExtension = file.name.split('.').pop();
      const newFileName = `${props.customerObj.bookingid}`;
      
      const { data, error } = await supabase.storage.from('invoices').upload(`public/${newFileName}`, file);
      if (error) {
        console.error('Error uploading file:', error);
      } else {
        console.log('File uploaded successfully:', data);
        setShowPopUp(true);  // Show the pop-up on successful upload
      }
    } else {
      // Trigger the file input click if no file is selected yet
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
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
        <input
          type="file"
          onChange={handleFileChange}
          ref={fileInputRef}  // Attach the ref to the input element
          style={{ display: 'none' }}  // Hide the input element
        />
        <PrimaryButton onClick={handlePrimaryButtonClick}>
          {intl.formatMessage({ id: 'providerButtons.button.upload.receipt' })}
        </PrimaryButton>
      </div>
      
      {showPopUp && (
        {

    }
      )}
    </div>
  );
};

export default ProviderButtonsMaybe;
