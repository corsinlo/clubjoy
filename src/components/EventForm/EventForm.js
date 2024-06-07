import React, { useState } from 'react';
import css from './EventForm.module.css';
import { PrimaryButton } from '../Button/Button';
import { useIntl } from 'react-intl';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tivsrbykzsmbrkmqqwwd.supabase.co';
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const EventForm = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [event, setEvent] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [lastname, setLastname] = useState('');
  const intl = useIntl();

  const handleSubmit = async event => {
    event.preventDefault();

    const contactData = {
      email: email,
      firstName: name,
      lastName: lastname,
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
      setErrorMessage(error.message);
    }
  };

  const heartStyle = {
    color: 'red',
    margin: '2px',
  };

  return (
    <div className={css.formContainer}>
    <form onSubmit={handleSubmit} className={css.form}>
      <p style={{ color: 'white', textAlign: 'center' }}>
        {intl.formatMessage({ id: 'EventForm.header' })}
      </p>
      {errorMessage && <div className={css.alert}>{errorMessage}</div>}
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
  )
  /*
  return (
    <div className={css.formContainer}>
      <form onSubmit={handleSubmit} className={css.form}>
        <p style={{ color: 'white', textAlign: 'center' }}>
          {intl.formatMessage({ id: 'Newsletter.header' })}
          <span role="img" aria-label="heart emoji" style={heartStyle}>
            ❤️
          </span>
        </p>
        {errorMessage && <div className={css.alert}>{errorMessage}</div>}
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
  */
};

export default EventForm;
