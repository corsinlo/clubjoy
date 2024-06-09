import React, { useState } from 'react';
import PropTypes from 'prop-types';
import css from './PopUp.module.css';
import { useIntl } from 'react-intl';
import { PrimaryButton, SecondaryButton } from '../Button/Button';

const PopUp = ({ message, onConfirm, onCancel, showForm }) => {
  const intl = useIntl();
  const [selectedOption, setSelectedOption] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [vat, setVat] = useState('');
  const [receiver, setReceiver] = useState('');
  const [sr, setSR] = useState('');
  const [fiscalCode, setFiscalCode] = useState('');

  const handleOptionChange = (event) => {
    setSelectedOption(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setConfirmed(true);
    onConfirm({ selectedOption, receiver, email, address, code, vat, sr, fiscalCode });
  };

  return (
    <div className={css.popUpOverlay}>
      <div className={css.popUpContent}>
        {confirmed ? (
          <div>
            <p>{intl.formatMessage({ id: 'Event.PopUp.cancel.confirmation' })}</p>
            <PrimaryButton onClick={onCancel} className={css.closeButton}>{intl.formatMessage({ id: 'Event.PopUp.cancel.return' })}</PrimaryButton>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={css.popUpForm}>
            <p>{message}</p>
            {showForm && (
              <>
                <div>
                  <label>
                    {intl.formatMessage({ id: 'Event.PopUp.form.receiver' })}
                    <input
                      type="text"
                      value={receiver}
                      onChange={(e) => setReceiver(e.target.value)}
                      required
                    />
                  </label>
                </div>
                <div>
                  <label>
                    {intl.formatMessage({ id: 'Event.PopUp.form.address' })}
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      required
                    />
                  </label>
                </div>
                <div>
                  <label>
                    {intl.formatMessage({ id: 'Event.PopUp.form.fiscalCode' })}
                    <input
                      type="text"
                      value={fiscalCode}
                      onChange={(e) => setFiscalCode(e.target.value)}
                      required
                    />
                  </label>
                </div>
                <div>
                  <label>
                    {intl.formatMessage({ id: 'Event.PopUp.form.socialReason' })}
                    <input
                      type="text"
                      value={sr}
                      onChange={(e) => setSR(e.target.value)}
                      required
                    />
                  </label>
                </div>
                <div>
                  <label>
                    {intl.formatMessage({ id: 'Event.PopUp.form.code' })}
                    <input
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      required
                    />
                  </label>
                </div>
                <div>
                  <label>
                    {intl.formatMessage({ id: 'Event.PopUp.form.email' })}
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </label>
                </div>
              </>
            )}
            {!showForm && (
              <div>
                <label>
                  {intl.formatMessage({ id: 'Event.PopUp.selectOption' })}
                  <select value={selectedOption} onChange={handleOptionChange}>
                    <option value="" disabled>
                      {intl.formatMessage({ id: 'Event.PopUp.selectPlaceholder' })}
                    </option>
                    <option value="option1">{intl.formatMessage({ id: 'Event.PopUp.option1' })}</option>
                    <option value="option2">{intl.formatMessage({ id: 'Event.PopUp.option2' })}</option>
                    <option value="option3">{intl.formatMessage({ id: 'Event.PopUp.option3' })}</option>
                    <option value="option4">{intl.formatMessage({ id: 'Event.PopUp.option4' })}</option>
                  </select>
                </label>
              </div>
            )}
            <div className={css.popUpActions}>
              <PrimaryButton type="submit">{intl.formatMessage({ id: 'Event.PopUp.confirm' })}</PrimaryButton>
              <SecondaryButton type="button" onClick={onCancel}>{intl.formatMessage({ id: 'Event.PopUp.cancel' })}</SecondaryButton>
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
  showForm: PropTypes.bool,
};

PopUp.defaultProps = {
  showForm: false,
};

export default PopUp;

