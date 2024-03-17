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

const LandingSearchBarForm = ({ onSearchSubmit, className }) => {
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
  const closeDropdown = () => setIsDropdownOpen(false);

  // Removed useEffect for Google Maps Autocomplete

  const fetchLocationBounds = async inputLocation => {
    if (!inputLocation) return; // Don't fetch if input is empty

    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      inputLocation
    )}&key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data.results.length > 0) {
        const { geometry } = data.results[0];
        const bounds = {
          ne: {
            _sdkType: 'LatLng',
            lat: geometry.viewport.northeast.lat,
            lng: geometry.viewport.northeast.lng,
          },
          sw: {
            _sdkType: 'LatLng',
            lat: geometry.viewport.southwest.lat,
            lng: geometry.viewport.southwest.lng,
          },
          _sdkType: 'LatLngBounds',
        };
        setLocation(inputLocation); // Update location with the user input
        setBounds(bounds); // Update bounds based on the best match
      } else {
        console.log('No results found');
        setBounds(null); // Clear bounds if no results
      }
    } catch (error) {
      console.error('Failed to fetch location data:', error);
    }
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
    <form onSubmit={handleSubmit} className={`${css.form} ${className || ''}`}>
      <button type="button" onClick={toggleDropdown} className={css.fieldSearch}>
        {intl.formatMessage({ id: 'SearchBar.selection' })}
      </button>
      {isDropdownOpen && (
        <div className={css.dropdownContent}>
          {[1, 2, 3, 4, 5, 6].map(option => (
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
          <button type="button" onClick={closeDropdown} className={css.closeButton}>
            {intl.formatMessage({ id: 'SearchBar.close' })}
          </button>
        </div>
      )}

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
        onChange={e => {
          const newLocation = e.target.value;
          setLocation(newLocation); // Update location with user input for immediate feedback
          fetchLocationBounds(newLocation); // Fetch bounds for new location
        }}
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
