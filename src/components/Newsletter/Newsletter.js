import React, { useState } from 'react';
import css from './Newsletter.module.css';
import * as validators from '../../util/validators';
import { PrimaryButton } from '../Button/Button';
import { useIntl } from 'react-intl';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tivsrbykzsmbrkmqqwwd.supabase.co';
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY; // Ensure this is correctly set in your .env file
const supabase = createClient(supabaseUrl, supabaseKey);

const Newsletter = () => {
  const [email, setEmail] = useState('');
  const intl = useIntl();

  const handleSubmit = async event => {
    event.preventDefault();

    const contactData = {
      email: email,
      listId: 4,
    };

    try {
      // Insert the email into the Supabase 'newsletter' table
      const { data, error } = await supabase
        .from('newsletter')
        .insert([{ email: email }])
        .select();

      const response = await fetch('/api/add-contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactData),
      });

      // Check the response from your backend
      if (!response.ok) {
        const errorInfo = await response.json();
        throw new Error(errorInfo.message || 'Failed to add contact to the list');
      }
      setEmail(''); // Clear the email input field
      console.log('Contact added successfully.');
    } catch (error) {
      console.error('Error adding contact:', error.message);
    }
  };

  const required = value => (value ? undefined : 'Required');

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
