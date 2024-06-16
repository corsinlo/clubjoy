import React, { useState, useEffect } from 'react';
import css from './LandingSearchBar.module.css';
import landingCover from '../../media/landingCover.jpg';
import landingCoverR from '../../media/landingCoverR.jpeg';
import landingCoverL from '../../media/landingCoverL.jpeg';
import landingEvents from '../../media/landingEvents.png';
import landingCoverMobile from '../../media/landingCoverMobile.jpg';
import landingPE from '../../media/landingPE.JPG';
import SurveyForm from './SurveyForm';
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

  const containerStyle = {
    position: 'relative',
    height: isMobile ? '700px' : '600px',
    backgroundImage: isTeamBuilding ? `url(${landingPE})` : 'none',
    backgroundColor: isTeamBuilding ? 'lightblue' : 'none',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',

  };

  return (
    <div
      className={isTeamBuilding ? css.isTeamBuildingContainer : css.landingBarContainer}
      style={containerStyle}
    >
      {!isMobile && !isTeamBuilding && (
        <>
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 40,
              bottom: 0,
              width: '50%',
              backgroundImage: `url(${landingCoverL})`,
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'left center',
              zIndex: 1,
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
              backgroundImage: `url(${landingCoverR})`,
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right center',
              zIndex: 1,
              opacity: '70%',
            }}
          ></div>
          <div
            style={{
              position: 'absolute',
              left: 100,
              right: 0,
              top: 10,
              bottom: 0,
              width: '100%',
              backgroundImage: null, //!isTeamBuilding ? null : `url(${landingEvents})`,
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right',
              opacity: '70%',
            }}
          ></div>
        </>
      )}
      {isMobile && !isTeamBuilding && (
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '18%',
            transform: 'translate(-50%, -50%)',
            width: '80%',
            maxWidth: '300px',
            height: 'auto',
          }}
        >
          <img
            src={landingCoverMobile}
            alt="Mobile Landing Cover"
            style={{
              width: '80%',
              height: '80%',
              objectFit: 'cover',
              borderRadius: '10px',
            }}
          />
        </div>
      )}
      <div style={{ position: 'relative', zIndex: 2 }}>
        {!isTeamBuilding ? (
          <>
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
            <div className={css.barContainer}>
              <LandingSearchBarForm onSearchSubmit={onSearchSubmit} isTeamBuilding={isTeamBuilding} />
            </div>
          </>
        ) : (
          <div className={css.surveyContainer}>
            <SurveyForm isTeamBuilding={isTeamBuilding} />
          </div>
        )}
      </div>
    </div>
  );
};

export default LandingSearchBarContainer;
