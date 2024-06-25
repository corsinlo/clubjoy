import React, { useState, useEffect } from 'react';
import { injectIntl, intlShape } from '../../../util/reactIntl';
import css from './SeatFilter.module.css';

const SeatFilterComponent = ({ intl, clearTriggered }) => {
    console.log('sdscdcfdcfd')
    console.log('sssss', clearTriggered)
  const [selectedOption, setSelectedOption] = useState(null);

  const handleSelection = value => {
    setSelectedOption(prev => (prev === value ? null : value));
  };

  useEffect(() => {
    if (clearTriggered) {
      setSelectedOption(null);
    }
  }, [clearTriggered]);

  return (
    <>
      <p className={css.title}>{intl.formatMessage({ id: 'SeatFilter.title', defaultMessage: 'Select Seat Preference' })}</p>
      <div>
        <label className={css.label}>
          <input
            type="checkbox"
            className={css.checkbox}
            checked={selectedOption === false}
            onChange={() => handleSelection(false)}
          />
          {intl.formatMessage({ id: 'SeatFilter.lessThanEight', defaultMessage: 'Less than 8' })}
        </label>
        <label className={css.label}>
          <input
            type="checkbox"
            className={css.checkbox}
            checked={selectedOption === true}
            onChange={() => handleSelection(true)}
          />
          {intl.formatMessage({ id: 'SeatFilter.moreThanEight', defaultMessage: 'More than 8' })}
        </label>
      </div>
    </>
  );
};

SeatFilterComponent.propTypes = {
  intl: intlShape.isRequired,
};

const SeatFilter = injectIntl(SeatFilterComponent);

export default SeatFilter;
