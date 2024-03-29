import React, { useState, useEffect } from 'react';
import css from './LandingSearchBar.module.css';
import landingCover from '../../media/landingCover.jpg';
import landingCoverR from '../../media/landingCoverR.jpeg';
import landingCoverL from '../../media/landingCoverL.jpeg';
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

  return (
    <div
      className={css.landingBarContainer}
      style={{ position: 'relative', height: isMobile ? '800px' : '700px' }}
    >
      {!isMobile && (
        <>
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: '50%',
              backgroundImage: `url(${landingCoverL})`,
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'left center',
              zIndex: 1, // Ensure background is below text
              opacity: '50%',
            }}
          ></div>
          <div
            style={{
              position: 'absolute',
              right: 0,
              top: 0,
              bottom: 0,
              width: '50%',
              backgroundImage: `url(${landingCoverR})`,
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right center',
              zIndex: 1, // Ensure background is below text
              opacity: '50%',
            }}
          ></div>
        </>
      )}
      {isMobile && (
        <>
          {/* Top Image */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: -200,
              width: '100%',
              height: '50%',
              backgroundImage: `url(${landingCoverMobile})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center top',
              opacity: '50%',
            }}
          ></div>

          {/* Bottom Image */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              bottom: -200,
              width: '100%',
              height: '50%',
              backgroundImage: `url(${landingCoverMobile})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center bottom',
              zIndex: 1,
              opacity: '50%',
            }}
          ></div>
        </>
      )}
      {/* Wrap intro texts and form in a div with higher z-index */}
      <div style={{ position: 'relative', zIndex: 2 }}>
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
    </div>
  );
};

export default LandingSearchBarContainer;
