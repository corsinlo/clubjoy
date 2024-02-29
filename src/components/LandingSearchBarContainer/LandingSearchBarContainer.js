import React from 'react';
import css from './LandingSearchBar.module.css';
import landingCover from '../../media/landingCover.jpg';
import LandingSearchBarForm from './LandingSearchBarForm';

const LandingSearchBarContainer = ({ onSearchSubmit }) => {
  return (
    <div className={css.landingBarContainer} style={{ backgroundImage: `url(${landingCover})` }}>
      <div className={css.introText}>Di creativo ti rimane solo il parcheggio?</div>
      <div className={css.introText2}>Scopri il tuo nuovo hobby con Club joy</div>
      <LandingSearchBarForm onSearchSubmit={onSearchSubmit} />
    </div>
  );
};

export default LandingSearchBarContainer;
