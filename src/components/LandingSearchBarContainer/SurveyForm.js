import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { createResourceLocatorString } from '../../util/routes';
import { useRouteConfiguration } from '../../context/routeConfigurationContext';
import { useIntl } from 'react-intl';
import css from './SurveyForm.module.css'

const SurveyForm = ({ className, isTeamBuilding }) => {
  const routeConfiguration = useRouteConfiguration();
  const intl = useIntl();
  const searchPagePath = routeConfiguration
    ? isTeamBuilding
      ? createResourceLocatorString('teamSearchPage', routeConfiguration, {}, {})
      : createResourceLocatorString('SearchPage', routeConfiguration, {}, {})
    : '';

  const history = useHistory();
  const [joy, setJoy] = useState([]);
  const [moreThanEight, setMoreThanEight] = useState(null); // New state for more than 8 people
  const [currentStep, setCurrentStep] = useState(1);

  const handleJoyChange = value => {
    if (joy.includes(value)) {
      setJoy(joy.filter(item => item !== value)); // Remove item if already selected
    } else {
      setJoy([...joy, value]); // Add item if not selected
    }
  };

  const handleSubmit = e => {
    e.preventDefault();

    // Check if joy preferences are selected
    if (joy.length === 0) {
      alert('Please select at least one joy preference.');
      return;
    }

    let queryParts = [];

    if (joy.length) {
      const joyValues = joy.join(',');
      queryParts.push(`pub_joy=${encodeURIComponent(joyValues)}`);
    }

    if (moreThanEight !== null) {
      queryParts.push(`px=${moreThanEight}`);
    }

    let searchParams = queryParts.join('&');

    if (routeConfiguration) {
      const queryString = `?${searchParams}`;
      const searchPageUrl = `${searchPagePath}${queryString}`;
      history.push(searchPageUrl);
    } else {
      console.error('Route configuration is undefined');
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className={css.step}>
            <h2>{intl.formatMessage({ id: 'Survey.step0.title' })}</h2>
            <div className={css.cardContainer}>
              <div
                className={`${css.card} ${moreThanEight === false ? css.selected : ''}`}
                onClick={() => setMoreThanEight(false)}
              >
                {intl.formatMessage({ id: 'Survey.lessThanEight' })}
              </div>
              <div
                className={`${css.card} ${moreThanEight === true ? css.selected : ''}`}
                onClick={() => setMoreThanEight(true)}
              >
                {intl.formatMessage({ id: 'Survey.moreThanEight' })}
              </div>
            </div>
            <button onClick={() => setCurrentStep(2)} className={css.nextButton}>
              {intl.formatMessage({ id: 'Survey.next' })}
            </button>
          </div>
        );
      case 2:
        return (
          <div className={css.step}>
            <h2>{intl.formatMessage({ id: 'Survey.step1.title' })}</h2>
            <div className={css.cardContainer}>
              {[1, 2, 3, 5, 6, 7].map(option => (
                <div
                  key={option}
                  className={`${css.card} ${joy.includes(option.toString()) ? css.selected : ''}`}
                  onClick={() => handleJoyChange(option.toString())}
                >
                  {intl.formatMessage({ id: `SearchBar.selection.${option}` })}
                </div>
              ))}
            </div>
            <button onClick={handleSubmit} className={css.submitButton}>
              {intl.formatMessage({ id: 'Survey.submit' })}
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`${css.surveyForm} ${className || ''}`}>
      {renderStep()}
    </div>
  );
};

export default SurveyForm;
