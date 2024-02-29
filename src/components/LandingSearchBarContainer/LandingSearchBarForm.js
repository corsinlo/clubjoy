import React, { useState, useEffect } from 'react';
import { DateRangePicker } from 'react-dates';
import css from './LandingSearchBar.module.css';
// import 'react-dates/lib/css/_datepicker.css';
import { useHistory } from 'react-router-dom';
import { createResourceLocatorString } from '../../util/routes';
import { useRouteConfiguration } from '../../context/routeConfigurationContext';
import landingCover from '../../media/landingCover.jpg';
import IconSearch from '../IconSearch/IconSearch';
import { useIntl } from 'react-intl';

const LandingSearchBarForm = ({ onSearchSubmit }) => {
  const routeConfiguration = useRouteConfiguration();
  const intl = useIntl();
  const searchPagePath = routeConfiguration
    ? createResourceLocatorString('SearchPage', routeConfiguration, {}, {})
    : '';
  const [location, setLocation] = useState('');
  const [bounds, setBounds] = useState(null); // Update for dynamic bounds
  const [joy, setJoy] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [focusedInput, setFocusedInput] = useState(null);
  const history = useHistory();

  const [isPickerVisible, setIsPickerVisible] = useState(false);

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
      setBounds(bounds); // Update bounds state

      // Update location state with the name of the selected place
      setLocation(place.name); // This line is new
    });
  };
  const handleSubmit = e => {
    e.preventDefault();

    /* Check if bounds are set
    if (!bounds) {
      alert('Please select a location from the dropdown.');
      return;
    }
    */

    // Check if at least one of bounds, startDate, endDate, or joy is set
    if (!bounds && !startDate && !endDate && !joy) {
      alert('Please select a location, date range, or joy filter.');
      return;
    }
    // Initialize an array to collect query parts
    let queryParts = [];

    // Format bounds as "latNE,lngNE,latSW,lngSW" and add to query if bounds are present
    if (bounds) {
      const formattedBounds = `${bounds.ne.lat},${bounds.ne.lng},${bounds.sw.lat},${bounds.sw.lng}`;
      queryParts.push(`bounds=${encodeURIComponent(formattedBounds)}`);
    }

    // Format dates and add to query if both dates are present
    if (startDate && endDate) {
      const startDateFormatted = startDate.format('YYYY-MM-DD');
      const endDateFormatted = endDate.format('YYYY-MM-DD');
      queryParts.push(`dates=${startDateFormatted},${endDateFormatted}`);
    }

    // Add joy to query if it has a value
    if (joy) {
      queryParts.push(`pub_joy=${joy}`);
    }

    // Join the query parts with "&"
    let searchParams = queryParts.join('&');

    // Navigate to the search page with the constructed query
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
      <select className={css.fieldSearch} value={joy} onChange={e => setJoy(e.target.value)}>
        <option value="">
          {intl.formatMessage({
            id: 'SearchBar.selection',
          })}
        </option>
        <option value="1">
          {' '}
          {intl.formatMessage({
            id: 'SearchBar.selection.1',
          })}
        </option>
        <option value="2">
          {intl.formatMessage({
            id: 'SearchBar.selection.2',
          })}
        </option>
        <option value="3">
          {intl.formatMessage({
            id: 'SearchBar.selection.3',
          })}
        </option>
        <option value="4">
          {intl.formatMessage({
            id: 'SearchBar.selection.4',
          })}
        </option>
      </select>

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
        {/*<IconSearch rootClassName={css.searchIcon} />*/}
      </button>
    </form>
  );
};

export default LandingSearchBarForm;
