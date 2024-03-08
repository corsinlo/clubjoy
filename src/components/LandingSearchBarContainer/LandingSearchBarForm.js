import React, { useState, useEffect } from 'react';
import { DateRangePicker } from 'react-dates';
import css from './LandingSearchBar.module.css';
import { useHistory } from 'react-router-dom';
import { createResourceLocatorString } from '../../util/routes';
import { useRouteConfiguration } from '../../context/routeConfigurationContext';
import { useIntl } from 'react-intl';

function useWindowSize() {
  const [windowSize, setWindowSize] = useState({ width: undefined });

  useEffect(() => {
    function handleResize() {
      setWindowSize({ width: window.innerWidth });
    }

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
}

const LandingSearchBarForm = ({ onSearchSubmit }) => {
  const routeConfiguration = useRouteConfiguration();
  const intl = useIntl();
  const searchPagePath = routeConfiguration
    ? createResourceLocatorString('SearchPage', routeConfiguration, {}, {})
    : '';
  const [location, setLocation] = useState('');
  const [bounds, setBounds] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [focusedInput, setFocusedInput] = useState(null);
  const history = useHistory();
  const [joy, setJoy] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isPickerVisible, setIsPickerVisible] = useState(false);
  const { width } = useWindowSize();
  const isSmallScreen = width < 1024;

  useEffect(() => {
    if (window.google && window.google.maps) {
      initAutocomplete();
    }
  }, []);

  const initAutocomplete = () => {
    const autocomplete = new window.google.maps.places.Autocomplete(
      document.getElementById('location-input'),
      { types: ['geocode'] }
    );
    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (!place.geometry) {
        console.log('Returned place contains no geometry');
        return;
      }
      const bounds = {
        ne: {
          _sdkType: 'LatLng',
          lat: place.geometry.viewport.getNorthEast().lat(),
          lng: place.geometry.viewport.getNorthEast().lng(),
        },
        sw: {
          _sdkType: 'LatLng',
          lat: place.geometry.viewport.getSouthWest().lat(),
          lng: place.geometry.viewport.getSouthWest().lng(),
        },
        _sdkType: 'LatLngBounds',
      };
      setBounds(bounds);
      setLocation(place.name);
    });
  };

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  const handleJoyChange = value => {
    if (joy.includes(value)) {
      setJoy(joy.filter(item => item !== value)); // Remove item if already selected
    } else {
      setJoy([...joy, value]); // Add item if not selected
    }
  };

  const handleSubmit = e => {
    e.preventDefault();

    // Check if at least one of bounds, startDate, endDate, or joy is set
    if (!location && !bounds && !startDate && !endDate && joy.length === 0) {
      alert('Please select a location, date range, or joy filter.');
      return;
    }
    let queryParts = [];

    if (joy.length) {
      const joyValues = joy.join(',');
      queryParts.push(`pub_joy=${encodeURIComponent(joyValues)}`);
    }

    if (bounds) {
      const formattedBounds = `${bounds.ne.lat},${bounds.ne.lng},${bounds.sw.lat},${bounds.sw.lng}`;
      queryParts.push(`bounds=${encodeURIComponent(formattedBounds)}`);
    }

    if (startDate && endDate) {
      const startDateFormatted = startDate.format('YYYY-MM-DD');
      const endDateFormatted = endDate.format('YYYY-MM-DD');
      queryParts.push(`dates=${startDateFormatted},${endDateFormatted}`);
    }

    let searchParams = queryParts.join('&');

    if (routeConfiguration) {
      const queryString = `?${searchParams}`;
      const searchPageUrl = `${searchPagePath}${queryString}`;
      history.push(searchPageUrl);
    } else {
      console.error('Route configuration is undefined');
    }
  };

  return (
    <form onSubmit={handleSubmit} className={css.form}>
      <div className={css.dropdownWrapper}>
        <button type="button" onClick={toggleDropdown} className={css.fieldSearch}>
          {intl.formatMessage({ id: 'SearchBar.selection' })}
        </button>
        {isDropdownOpen && (
          <div className={css.dropdownContent}>
            {[1, 2, 3, 4, 5].map(option => (
              <label key={option} className={css.dropdownLabel}>
                <input
                  type="checkbox"
                  value={option}
                  checked={joy.includes(option.toString())}
                  onChange={() => handleJoyChange(option.toString())}
                />
                {intl.formatMessage({ id: `SearchBar.selection.${option}` })}
              </label>
            ))}
          </div>
        )}
      </div>
      {!isPickerVisible && (
        <input
          onClick={() => setIsPickerVisible(true)}
          placeholder={intl.formatMessage({
            id: 'SearchBar.time',
          })}
          className={css.fieldSearch}
        />
      )}
      {isPickerVisible && (
        <div className={css.dateWrapper}>
          <DateRangePicker
            startDate={startDate}
            startDateId="your_unique_start_date_id"
            endDate={endDate}
            endDateId="your_unique_end_date_id"
            onDatesChange={({ startDate, endDate }) => {
              setStartDate(startDate);
              setEndDate(endDate);
            }}
            focusedInput={focusedInput}
            onFocusChange={focusedInput => setFocusedInput(focusedInput)}
            isOutsideRange={() => false}
            startDatePlaceholderText={intl.formatMessage({
              id: 'SearchBar.time.from',
            })}
            endDatePlaceholderText={intl.formatMessage({
              id: 'SearchBar.time.to',
            })}
            orientation="horizontal"
            navPosition={'navPositionTop'}
            numberOfMonths={isSmallScreen ? 1 : 2}
            autoFocus={isSmallScreen}
            noBorder={isSmallScreen}
          />
        </div>
      )}
      <input
        id="location-input"
        type="text"
        placeholder={intl.formatMessage({
          id: 'SearchBar.location',
        })}
        value={location}
        onChange={e => setLocation(e.target.value)}
        className={css.fieldSearch}
      />
      <button type="submit" className={css.button}>
        {intl.formatMessage({
          id: 'SearchBar.time.button',
        })}
      </button>
    </form>
  );
};

export default LandingSearchBarForm;
