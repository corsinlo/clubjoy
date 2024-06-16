import React, { useState } from 'react';
import css from './SurveyForm.module.css';
import { useHistory } from 'react-router-dom';
import { createResourceLocatorString } from '../../util/routes';
import { useRouteConfiguration } from '../../context/routeConfigurationContext';
import { useIntl } from 'react-intl';

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

  // Define the emoji sets
  const emojiSets = {
    1: '🎨', // Option 1 emoji
    2: '🖌️', // Option 2 emoji
    3: '🧵', // Option 3 emoji
    5: '🎭', // Option 5 emoji
    6: '🎸', // Option 6 emoji
    7: '🖋️', // Option 7 emoji
  };

  // Define the emoji sets for more than 8 or less than 8
  const moreThanEightEmojiSets = {
    true: '👥', // More than 8
    false: '👤', // Less than 8
  };

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
                <span className={css.emoji}>{moreThanEightEmojiSets[false]}</span>
                {intl.formatMessage({ id: 'Survey.lessThanEight' })}
              </div>
              <div
                className={`${css.card} ${moreThanEight === true ? css.selected : ''}`}
                onClick={() => setMoreThanEight(true)}
              >
                <span className={css.emoji}>{moreThanEightEmojiSets[true]}</span>
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
                  <span className={css.emoji}>{emojiSets[option]}</span>
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
