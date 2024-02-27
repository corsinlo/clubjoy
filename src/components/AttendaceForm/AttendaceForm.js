import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import css from './AttendaceForm.module.css';
import { PrimaryButton } from '../Button/Button';
const supabaseUrl = 'https://tivsrbykzsmbrkmqqwwd.supabase.co';
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY; // Ensure this is correctly set in your .env file
const supabase = createClient(supabaseUrl, supabaseKey);

const AttendanceForm = ({ activity, onBack }) => {
  const [checkedNames, setCheckedNames] = useState([]);

  // Extract names from activity, fallback to an empty array if not available
  const names = activity?.resource?.bookingData?.names.filter(name => !name.includes('day')) ?? [];

  useEffect(() => {
    const fetchAttendanceRecords = async () => {
      // Assuming the ID you need is activity.resource.bookingData.bookingId
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

      // Log the fetched data to see what's being returned
      console.log('Fetched attendance records:', data);

      // Update state with fetched records
      const fetchedCheckedNames = data
        .filter(record => record.checked_status)
        .map(record => record.name);
      setCheckedNames(fetchedCheckedNames);
    };

    fetchAttendanceRecords();
    // Ensure to update this dependency array to reflect the correct path to the ID
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
      console.log('record is ', record);
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

    console.log('All records saved/updated successfully.');
  };

  const handleDelete = async () => {
    // Your delete activity logic here
  };

  return (
    <div className={css.container}>
      <h2>Form Presenze</h2>
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
        <PrimaryButton onClick={handleSave}>Salva</PrimaryButton>
        {/*<PrimaryButton onClick={handleDelete}>Delete Activity</PrimaryButton>*/}
        <PrimaryButton onClick={onBack}>Indietro</PrimaryButton>
      </div>
    </div>
  );
};

export default AttendanceForm;
