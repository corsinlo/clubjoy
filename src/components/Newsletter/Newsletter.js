import React, { useState } from 'react';
import css from './Newsletter.module.css';
import { PrimaryButton } from '../Button/Button';
import { useIntl } from 'react-intl';
const Newsletter = () => {
  const [email, setEmail] = useState('');
  const intl = useIntl();

  const handleSubmit = async event => {
    event.preventDefault();
    // Code to add the email to your Breezy list or another service
  };

  return (
    <div className={css.formContainer}>
      <form onSubmit={handleSubmit} className={css.form}>
        <label htmlFor="email">
          <h3 style={{ color: 'white' }}>
            {' '}
            {intl.formatMessage({
              id: 'Newsletter.header',
            })}
          </h3>
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          className={css.inputField}
          placeholder={'clubjoy@mail.it'}
        />
        <PrimaryButton type="submit" className={css.button}>
          {intl.formatMessage({
            id: 'Newsletter.button',
          })}
        </PrimaryButton>
      </form>
    </div>
  );
};

export default Newsletter;
