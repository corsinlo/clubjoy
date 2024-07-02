import React from 'react';
import { bool, func } from 'prop-types';
import css from './SeatFilter.module.css';

const SeatFilter = ({ px, onPxChange, intl }) => (
  <div className={css.fieldGroupPlain}>
    <p className={css.title}>
      {intl.formatMessage({ id: 'SeatFilter.title', defaultMessage: 'Select Seat Preference' })}
    </p>
    <ul className={css.list}>
      <li className={css.item}>
        <span className={css.checkboxWrapper}>
          <input
            type="checkbox"
            id="more-than-8"
            className={css.checkbox}
            checked={px === true}
            onChange={() => onPxChange(true)}
          />
          More than 8
        </span>
      </li>
      <li className={css.item}>
        <span className={css.checkboxWrapper}>
          <input
            type="checkbox"
            id="less-than-8"
            className={css.checkbox}
            checked={px === false}
            onChange={() => onPxChange(false)}
          />
          Less than 8
        </span>
      </li>
    </ul>
  </div>
);

SeatFilter.propTypes = {
  px: bool,
  onPxChange: func.isRequired,
  intl: func.isRequired,
};

export default SeatFilter;


