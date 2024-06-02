import React from 'react';
import PropTypes from 'prop-types';
import css from './PopUp.module.css';
import { useIntl } from 'react-intl';

const PopUp = ({ message, onConfirm, onCancel }) => {
const intl = useIntl(); 
  return (
    <div className={css.popUpOverlay}>
      <div className={css.popUpContent}>
        <p>{message}</p>
        <div className={css.popUpActions}>
          <button onClick={onConfirm}>{intl.formatMessage({ id: 'ConfirmationPopUp.confirm' })}</button>
          <button onClick={onCancel}>{intl.formatMessage({ id: 'ConfirmationPopUp.cancel' })}</button>
        </div>
      </div>
    </div>
  );
};

PopUp.propTypes = {
  message: PropTypes.string.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default PopUp;
