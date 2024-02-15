import React, { useState } from 'react';
import css from './LandingSearchBar.module.css';

const LandingSearchBar = () => {
  const [location, setLocation] = useState('');
  const [joy, setJoy] = useState('');
  const [time, setTime] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!joy && !location && !time) {
      alert("Please fill in at least one field.");  // ADD NATIVE VALIDATORS
      return;
    }
  };

  return (
    <div className={css.landingBarContainer}>
      <div className={css.bar}>
        <form onSubmit={handleSubmit}>
          <div className={css.joy}>
            <select value={location} onChange={(e) => setJoy(e.target.value)}>
              <option value="">Search for joys...</option>
              <option value="location1">Location 1</option>
              <option value="location2">Location 2</option>
              <option value="location3">Location 3</option>
            </select>
          </div>
          <div className={css.time}>
            <input
              type="text"
              placeholder="  Add dates"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>
          <div className={css.location}>
            <input
              type="text"
              placeholder="  When is 'me' time?"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          <div className={css.button}>
            Search
          </div>
        </form>
      </div>
    </div>
  );
};

export default LandingSearchBar;
