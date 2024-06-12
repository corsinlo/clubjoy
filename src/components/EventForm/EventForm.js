import React, { useState } from 'react';
import css from './EventForm.module.css';
import { PrimaryButton } from '../Button/Button';
import { useIntl } from 'react-intl';
import { createClient } from '@supabase/supabase-js';
import { inquiryEvent } from '../../util/api';

const supabaseUrl = 'https://tivsrbykzsmbrkmqqwwd.supabase.co';
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const EventForm = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [privateEvent, setPrivateEvent] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [lastname, setLastname] = useState('');
  const intl = useIntl();

  const handleSubmit = async event => {
    event.preventDefault();
  
    const contactData = {
      email: email,
      name: name,
      company: company,
      privateEvent: privateEvent,
    };
  
    try {
      const response = await inquiryEvent(contactData);
  
      if (!response.ok) {
        const errorInfo = await response.json();
        throw new Error(errorInfo.message || 'Failed to plan event');
      }
  
      setEmail('');
      setName('');
      setCompany('');
      setEvent('');
    } catch (error) {
      console.error('Error creating event:', error.message);
    }
  };
  
  return (
    <div className={css.formContainer}>
    <form onSubmit={handleSubmit} className={css.form}>
      <p style={{ color: 'white', textAlign: 'center' }}>
        {intl.formatMessage({ id: 'EventForm.header' })}
      </p>
      <div className={css.nameRow}>
        <input
          id="name"
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          required
          className={css.nameInput}
          placeholder={'Nome'}
        />
        <input
          id="company"
          type="text"
          value={company}
          onChange={e => setCompany(e.target.value)}
          required
          className={css.nameInput}
          placeholder={'Azienda'}
        />
      </div>
      <input
        id="email"
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
        className={css.inputField}
        placeholder={'Email'}
      />
       <input
        id="event"
        type="event"
        value={privateEvent}
        onChange={e => setPrivateEvent(e.target.value)}
        required
        className={css.inputField}
        placeholder={'Descrizione Evento che Vorresti :)'}
      />
      <PrimaryButton type="submit" className={css.button}>
        {intl.formatMessage({ id: 'Newsletter.button' })}
      </PrimaryButton>
    </form>
  </div>
  )
}

export default EventForm;
