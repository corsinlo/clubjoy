import React, { useState } from 'react';
import css from './LandingSearchBar.module.css';
// Accept props as an argument to the LandingSearchBar function
const LandingSearchBar = (props) => {
  const [location, setLocation] = useState('');
  const [joy, setJoy] = useState('');
  const [time, setTime] = useState('');
  const [keyword, setKeyword] = useState('');

  // Now you can use props.onSearchSubmit within handleSubmit
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!joy && !location && !time && !keyword) {
      alert("Please fill in at least one field.");  // ADD NATIVE VALIDATORS
      return;
    }
    // Call the passed in onSearchSubmit prop function with the search parameters
    props.onSearchSubmit({ joy, location, time, keyword });
  };

  // Rest of your component
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
          <div className={css.location}>
            <input
              type="text"
              placeholder="Keyword"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>
          <button type="submit" className={css.button}>
            Search
          </button>
        </form>
      </div>
    </div>
  );
};

export default LandingSearchBar;
