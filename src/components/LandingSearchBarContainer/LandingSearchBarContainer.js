import React, { useState, useEffect } from 'react';
import css from './LandingSearchBar.module.css';
import landingCover from '../../media/landingCover.jpg';
import landingCoverR from '../../media/landingCoverR.jpeg';
import landingCoverL from '../../media/landingCoverL.jpeg';
import landingCoverMobile from '../../media/landingCoverMobile.jpg';

import LandingSearchBarForm from './LandingSearchBarForm';
import { useLocation } from 'react-router-dom';

const LandingSearchBarContainer = ({ onSearchSubmit }) => {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 1024 : null
  );
  const location = useLocation();
  const isTeamBuilding = location.pathname === '/p/teambuilding';
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
              top: 40,
              bottom: 0,
              width: '50%',
              backgroundImage: !isTeamBuilding ? `url(${landingCoverL})` : null,
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'left center',
              zIndex: 1, // Ensure background is below text
              opacity: '70%',
            }}
          ></div>
          <div
            style={{
              position: 'absolute',
              right: 0,
              top: 0,
              bottom: 0,
              width: '50%',
              backgroundImage: !isTeamBuilding ? `url(${landingCoverR})` : null,
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right center',
              zIndex: 1, // Ensure background is below text
              opacity: '70%',
            }}
          ></div>
        </>
      )}
      {isMobile && (
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '18%',
            transform: 'translate(-50%, -50%)',
            width: '80%', // Adjust width as needed
            maxWidth: '300px', // Maximum width of the image
            height: 'auto', // Height will adjust automatically to maintain aspect ratio
          }}
        >
          <img
            src={landingCoverMobile}
            alt="Mobile Landing Cover"
            style={{
              width: '80%',
              height: '80%',
              objectFit: 'cover', // Maintain aspect ratio and cover entire div
              borderRadius: '10px', // Optional: Add border-radius for rounded corners
            }}
          />
          {/* Bottom Image */}
          {/*<div
            style={{
              position: 'absolute',
              left: 0,
              bottom: -40,
              width: '100%',
              height: '30%',
              backgroundImage: `url(${landingCoverMobile})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center bottom',
              zIndex: 1,
              opacity: '70%',
            }}
          ></div>*/}
        </div>
      )}
      {/* Wrap intro texts and form in a div with higher z-index */}
      <div style={{ position: 'relative', zIndex: 2 }}>
        {!isTeamBuilding ? (
          <div className={css.container}>
            <div className={css.introText}>Di creativo ti rimane solo il parcheggio?</div>
            <div className={css.introText2}>
              Dal corso di ceramica alla lezione di pittura, su Club Joy{isMobile && <br />}
              trovi le migliori esperienze creative di Milano e dintorni {!isMobile && <br />}
              {!isMobile && <br />}
              {isMobile && <br />}
              {isMobile && <br />}Il tuo nuovo hobby preferito è a distanza di un click
            </div>
            </div>
        ) : (
          <div className={css.container}>
            <div className={css.introText}>Ancora a fare gli Happy Hour aziendali?</div>
            <div className={css.introText2}>
              Su Club Joy {isMobile && <br />}
              le migliori esperienze creative di Milano e dintorni, anche per la tua azienda.{' '}
              {!isMobile && <br />}
              {!isMobile && <br />}
              {isMobile && <br />}
            </div>
            </div>
        )}
        <div className={css.barContainer}>
          <LandingSearchBarForm onSearchSubmit={onSearchSubmit} isTeamBuilding={isTeamBuilding} />
        </div>
      </div>
    </div>
  );
};

export default LandingSearchBarContainer;
