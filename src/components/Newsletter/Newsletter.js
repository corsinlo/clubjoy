import React, { useState } from 'react';
import css from './Newsletter.module.css';
import { PrimaryButton } from '../Button/Button';
import { useIntl } from 'react-intl';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tivsrbykzsmbrkmqqwwd.supabase.co';
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [lastname, setLastname] = useState('');
  const intl = useIntl();

  const handleSubmit = async event => {
    event.preventDefault();

    const contactData = {
      email: email,
      name: name,
      lastname: lastname,
      isNewsLetter: true,
    };

    try {
      const { data, error } = await supabase
        .from('newsletter')
        .insert([{ email: email, firstName: name, lastName: lastname }])
        .select();

      const response = await fetch('/api/add-contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactData),
      });

      if (!response.ok) {
        const errorInfo = await response.json();
        throw new Error(errorInfo.message || 'Failed to add contact to the list');
      }

      setEmail('');
      setName('');
      setLastname('');
    } catch (error) {
      console.error('Error adding contact:', error.message);
    }
  };

  return (
    <div className={css.formContainer}>
      <form onSubmit={handleSubmit} className={css.form}>
        <h3 style={{ color: 'white' }}>{intl.formatMessage({ id: 'Newsletter.header' })}</h3>
        <div className={css.nameRow}>
          <input
            id="name"
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            className={css.nameInput}
            placeholder={'Mario'}
          />
          <input
            id="lastname"
            type="text"
            value={lastname}
            onChange={e => setLastname(e.target.value)}
            required
            className={css.nameInput}
            placeholder={'Rossi'}
          />
        </div>
        <input
          id="email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          className={css.inputField}
          placeholder={'ciao@clubjoy.it'}
        />
        <PrimaryButton type="submit" className={css.button}>
          {intl.formatMessage({ id: 'Newsletter.button' })}
        </PrimaryButton>
      </form>
    </div>
  );
};

export default Newsletter;
