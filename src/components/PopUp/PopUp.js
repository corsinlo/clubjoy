import React, { useState } from 'react';
import PropTypes from 'prop-types';
import css from './PopUp.module.css';
import { useIntl } from 'react-intl';

const PopUp = ({ message, onConfirm, onCancel }) => {
  const intl = useIntl();
  const [selectedOption, setSelectedOption] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  const handleOptionChange = (event) => {
    setSelectedOption(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setConfirmed(true);
    onConfirm(selectedOption);
  };

  return (
    <div className={css.popUpOverlay}>
      <div className={css.popUpContent}>
        {confirmed ? (
          <div>
            <p>{intl.formatMessage({ id: 'ConfirmationPopUp.seeYou' })}</p>
            <button onClick={onCancel} className={css.closeButton}>X</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <p>{message}</p>
            <div>
              <label>
                {intl.formatMessage({ id: 'ConfirmationPopUp.selectOption' })}
                <select value={selectedOption} onChange={handleOptionChange}>
                  <option value="" disabled>
                    {intl.formatMessage({ id: 'ConfirmationPopUp.selectPlaceholder' })}
                  </option>
                  <option value="option1">{intl.formatMessage({ id: 'ConfirmationPopUp.option1' })}</option>
                  <option value="option2">{intl.formatMessage({ id: 'ConfirmationPopUp.option2' })}</option>
                </select>
              </label>
            </div>
            <div className={css.popUpActions}>
              <button type="submit">{intl.formatMessage({ id: 'ConfirmationPopUp.confirm' })}</button>
              <button type="button" onClick={onCancel}>{intl.formatMessage({ id: 'ConfirmationPopUp.cancel' })}</button>
            </div>
          </form>
        )}
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
