// SeatFilter.js
import React from 'react';
import { bool, func } from 'prop-types';
import css from './SeatFilter.module.css';

const SeatFilter = ({ moreThan8Checked, lessThan8Checked, onMoreThan8Change, onLessThan8Change, intl }) => (
  <div className={css.fieldGroupPlain}>
    <p className={css.title}>{intl.formatMessage({ id: 'SeatFilter.title', defaultMessage: 'Select Seat Preference' })}</p>
    <ul className={css.list}>
      <li className={css.item}>
        <span className={css.checkboxWrapper}>
          <input
            type="checkbox"
            id="more-than-8"
            className={css.checkbox}
            checked={moreThan8Checked}
            onChange={onMoreThan8Change}
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
            checked={lessThan8Checked}
            onChange={onLessThan8Change}
          />
          Less than 8
        </span>
      </li>
    </ul>
  </div>
);

SeatFilter.propTypes = {
  moreThan8Checked: bool.isRequired,
  lessThan8Checked: bool.isRequired,
  onMoreThan8Change: func.isRequired,
  onLessThan8Change: func.isRequired,
};

export default SeatFilter;
