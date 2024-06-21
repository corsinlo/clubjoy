import React, { useState, useEffect } from 'react';
import css from './LandingSearchBar.module.css';
import landingCover from '../../media/landingCover.jpg';
import landingCoverR from '../../media/landingCoverR.jpeg';
import landingCoverL from '../../media/landingCoverL.jpeg';
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
        setIsMobile(window.innerWidth < 1025);
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
    backgroundColor: isTeamBuilding ? 'white' : 'none',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right',
  };

  const containerStyle2 = {
    position: 'relative',
    height: isMobile ? '700px' : '600px',
    backgroundColor: isTeamBuilding ? 'white' : 'none',
    backgroundImage: isTeamBuilding ? `url(${landingPE})` : 'none',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right',
  };

  return (
    <div
      className={isTeamBuilding ? css.isTeamBuildingContainer : css.landingBarContainer}
      style={containerStyle}
    >
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
      <>
        {!isTeamBuilding ? (
          <div className={css.surveyContainer}>
          {!isMobile && <div className={css.emptyDiv}>
            <h1 className={css.emptyText}>Scopri le migliori esperienze creative<br />  per il tuo gruppo,<br /> in pochi click
            </h1>
          </div>}
          <div className={css.surveyForm} style={containerStyle2}>
            <SurveyForm />
          </div>
          </div>
        ) : (
          <div className={css.surveyContainer}>
            {!isMobile && <div className={css.emptyDiv}>
              <h1 className={css.emptyText}>Scopri le migliori esperienze creative<br />  per il tuo gruppo,<br /> in pochi click
              </h1>

            </div>}
            <div className={css.surveyForm} style={containerStyle2}>
              <SurveyForm isTeamBuilding={isTeamBuilding} />
            </div>
          </div>
        )}
      </>
    </div>
  );
};

export default LandingSearchBarContainer;
