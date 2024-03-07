import React, { useState } from 'react';
import { bool, node } from 'prop-types';
import { compose } from 'redux';
import { Form as FinalForm } from 'react-final-form';
import arrayMutators from 'final-form-arrays';
import classNames from 'classnames';
import { useIntl } from 'react-intl';
import { FormattedMessage, injectIntl, intlShape } from '../../../util/reactIntl';
import * as validators from '../../../util/validators';
import { Form, PrimaryButton, FieldTextInput } from '../../../components';

import css from './BSignupForm.module.css';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = 'https://tivsrbykzsmbrkmqqwwd.supabase.co';
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY; // Ensure this is correctly set in your .env file
const supabase = createClient(supabaseUrl, supabaseKey);

const BSignupFormComponent = props => {
  const intl = useIntl();
  const [token, setToken] = useState(false); // Initialize token state to false
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    website: '',
    businessType: '',
  });

  // Handle changes in form fields
  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleFormSubmit = async values => {
    // 'values' contains the form data
    try {
      const { data, error } = await supabase.from('providers').insert([
        {
          name: formData.name,
          email: formData.email,
          address: formData.address,
          website: formData.website, // Optional field handling
          city: formData.businessType,
          status: 'pending',
        },
      ]);

      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          subject: 'business',
          message: 'Registrazione Nuovo Business',
        }),
      });

      const emailData = await response.json();
      if (!response.ok) {
        throw new Error(emailData.error || 'Failed to send email');
      }

      setIsSubmitted(true); // Indicate success to the user
    } catch (error) {
      console.error('Error:', error.message);
      // Handle submission or email errors (e.g., show an error message)
    }
  };

  // Example of a simple required field validator
  const required = value => (value ? undefined : 'Required');

  return (
    <FinalForm
      {...props}
      mutators={{ ...arrayMutators }}
      onSubmit={handleFormSubmit}
      render={fieldRenderProps => {
        const { handleSubmit, termsAndConditions } = fieldRenderProps;

        return (
          <div>
            {isSubmitted ? (
              <div className={css.successMessage}>
                {' '}
                {/* Use the class defined above */}
                <div className={css.successContent}>
                  {' '}
                  {/* Additional styling for content */}
                  <h3>
                    {intl.formatMessage({
                      id: 'BusinessForm.successMessage',
                    })}
                  </h3>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
                <div>
                  <h3 style={{ margin: '20px 0' }}>
                    {intl.formatMessage({
                      id: 'BusinessForm.intro',
                    })}
                  </h3>
                  <div style={{ margin: '20px 0' }}>
                    {intl.formatMessage({
                      id: 'BusinessForm.intro2',
                    })}
                  </div>
                  <label>
                    {intl.formatMessage({
                      id: 'BusinessForm.name',
                    })}
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder={intl.formatMessage({
                        id: 'BusinessForm.name.placeholder',
                      })}
                    />
                  </label>
                </div>
                <div>
                  <label>
                    {intl.formatMessage({
                      id: 'BusinessForm.email',
                    })}
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder={intl.formatMessage({
                        id: 'BusinessForm.email.placeholder',
                      })}
                      required
                    />
                  </label>
                </div>
                <div>
                  <label>
                    {intl.formatMessage({
                      id: 'BusinessForm.city',
                    })}
                    <input
                      type="text"
                      name="businessType"
                      value={formData.businessType}
                      onChange={handleChange}
                      required
                      placeholder={intl.formatMessage({
                        id: 'BusinessForm.city.placeholder',
                      })}
                    />
                  </label>
                </div>
                <div>
                  <label>
                    {intl.formatMessage({
                      id: 'BusinessForm.address',
                    })}
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      required
                      placeholder={intl.formatMessage({
                        id: 'BusinessForm.address.placeholder',
                      })}
                    />
                  </label>
                </div>
                <div>
                  <label>
                    {intl.formatMessage({
                      id: 'BusinessForm.social',
                    })}
                    <input
                      type="text"
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                      required
                      placeholder={intl.formatMessage({
                        id: 'BusinessForm.social.placeholder',
                      })}
                    />
                  </label>
                </div>
                <div className={css.bottomWrapper}>
                  {termsAndConditions}
                  <PrimaryButton type="submit">
                    {intl.formatMessage({
                      id: 'BusinessForm.type.button',
                    })}
                  </PrimaryButton>
                </div>
              </form>
            )}
          </div>
        );
      }}
    />
  );
};

BSignupFormComponent.defaultProps = { inProgress: false };

BSignupFormComponent.propTypes = {
  inProgress: bool,
  termsAndConditions: node.isRequired,

  // from injectIntl
  intl: intlShape.isRequired,
};

const BSignupForm = compose(injectIntl)(BSignupFormComponent);
BSignupForm.displayName = 'bSignupForm';

export default BSignupForm;
