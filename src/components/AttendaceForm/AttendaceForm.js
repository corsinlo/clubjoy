import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import css from './AttendaceForm.module.css';
import { PrimaryButton } from '../Button/Button';
import { useIntl } from 'react-intl';

const supabaseUrl = 'https://tivsrbykzsmbrkmqqwwd.supabase.co';
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY; // Ensure this is correctly set in your .env file
const supabase = createClient(supabaseUrl, supabaseKey);

const normalizeNames = names => {
  if (names.length > 0 && Array.isArray(names[0])) {
    return names.flat();
  }
  return names;
};

const AttendanceForm = ({ activity, onBack }) => {
  const [checkedNames, setCheckedNames] = useState([]);
  const intl = useIntl();
  const normalizedNames = normalizeNames(activity?.resource?.bookingData?.names ?? []);
  const names = normalizedNames.filter(name => !name.includes('day'));

  useEffect(() => {
    const fetchAttendanceRecords = async () => {
      const bookingId = activity?.resource?.bookingData?.bookingId;
      if (!bookingId) return;

      const { data, error } = await supabase
        .from('attendance')
        .select('name, checked_status')
        .eq('booking_id', bookingId);

      if (error) {
        console.error('Error fetching attendance records:', error);
        return;
      }

      const fetchedCheckedNames = data
        .filter(record => record.checked_status)
        .map(record => record.name);
      setCheckedNames(fetchedCheckedNames);
    };

    fetchAttendanceRecords();
  }, [activity?.resource?.bookingData?.bookingId]);

  const handleCheck = name => {
    setCheckedNames(prevState =>
      prevState.includes(name) ? prevState.filter(n => n !== name) : [...prevState, name]
    );
  };

  const handleSave = async () => {
    const promises = names.map(name => {
      const record = {
        booking_id: activity.resource.bookingData.bookingId,
        name,
        checked_status: checkedNames.includes(name),
      };

      return supabase.from('attendance').upsert(record); // Implicitly uses the composite primary key for conflict resolution
    });

    const results = await Promise.all(promises);

    for (const { error } of results) {
      if (error) {
        console.error('Error saving record:', error);
        // Optionally handle this error more gracefully
        return;
      }
    }
  };

  const handleDelete = async () => {
    // Your delete activity logic here
  };

  return (
    <div className={css.container}>
      <div className={css.formContent}>
        <h4 className={css.formTitle}>
          {intl.formatMessage({
            id: 'AttendanceForm.title',
          })}
        </h4>
        {names.length === 0 ? (
          <div className={css.noContainer}>
            <p>
              {' '}
              {intl.formatMessage({
                id: 'AttendanceForm.err',
              })}
            </p>
            <PrimaryButton className={css.button} onClick={onBack}>
              {intl.formatMessage({
                id: 'AttendanceForm.button.back',
              })}
            </PrimaryButton>
          </div>
        ) : (
          <>
            <div className={css.gridContainer}>
              {names.map((name, index) => (
                <React.Fragment key={index}>
                  <div className={css.gridItemName}>{name}</div>
                  <div className={css.gridItemCheckbox}>
                    <input
                      type="checkbox"
                      checked={checkedNames.includes(name)}
                      onChange={() => handleCheck(name)}
                    />
                  </div>
                </React.Fragment>
              ))}
            </div>
            <div className={css.buttonGroup}>
              <PrimaryButton className={css.button} onClick={handleSave}>
                {intl.formatMessage({
                  id: 'AttendanceForm.button.save',
                })}
              </PrimaryButton>
              <PrimaryButton className={css.button} onClick={onBack}>
                {intl.formatMessage({
                  id: 'AttendanceForm.button.back',
                })}
              </PrimaryButton>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AttendanceForm;
