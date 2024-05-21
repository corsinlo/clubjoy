import React from 'react';
import classNames from 'classnames';
import { createInvoice } from '../../../util/api';
import { PrimaryButton, SecondaryButton } from '../../../components';
import css from './TransactionPanel.module.css';

const TeamButtonsMaybe = props => {
  const {
    className,
    rootClassName,
    customerObj,
    transactionId,

  } = props;



  const handlePrimaryButtonClick = () => {
  
    createInvoice({ customerObj, transactionId });

  };

  const primaryButton =()=> (
    <PrimaryButton
      onClick={handlePrimaryButtonClick}
    >
    s
    </PrimaryButton>)



  const secondaryButton =()=> (
    <SecondaryButton
    >
      {'secondaryButtonProps.buttonText'}
    </SecondaryButton>
  )


  const classes = classNames(rootClassName || css.actionButtons, className);

  return (
<>
<PrimaryButton
      onClick={handlePrimaryButtonClick}
    >
    s
    </PrimaryButton>
<SecondaryButton
    >
      {'secondaryButtonProps.buttonText'}
    </SecondaryButton>
</>
  ) 
};

export default TeamButtonsMaybe;
