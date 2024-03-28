import React, { useState, useEffect } from 'react';
import css from './LandingSearchBar.module.css';
import landingCover from '../../media/landingCover.jpg';
import landingCoverMobile from '../../media/landingCoverMobile.jpeg';

import LandingSearchBarForm from './LandingSearchBarForm';

const LandingSearchBarContainer = ({ onSearchSubmit }) => {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 1024 : null
  );

  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== 'undefined') {
        setIsMobile(window.innerWidth < 1024);
      }
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', handleResize);
      }
    };
  }, []);

  const backgroundStyle = {
    backgroundImage: `url(${isMobile ? landingCoverMobile : landingCover})`,
    backgroundSize: 'contain',
    height: isMobile ? '800px' : '700px',
  };

  return (
    <div className={css.landingBarContainer} style={backgroundStyle}>
      <div className={css.introText}>Di creativo ti rimane solo il parcheggio?</div>
      <div className={css.introText2}>
        Dal corso di ceramica alla lezione di pittura, su Club Joy
        <br /> trovi le migliori esperienze creative di Milano e dintorni
        <br />
        <br /> Il tuo nuovo hobby preferito e' distanza di un click
      </div>
      <div className={css.barContainer}>
        <LandingSearchBarForm onSearchSubmit={onSearchSubmit} />
      </div>
    </div>
  );
};

export default LandingSearchBarContainer;
