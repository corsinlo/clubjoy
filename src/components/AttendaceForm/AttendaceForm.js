import React, { useState } from 'react';

const AttendanceForm = ({ activity, onBack }) => {
    // Use activity.resource.bookingData.names if available, else fallback to an empty array
    const names = activity && activity.resource && activity.resource.bookingData && activity.resource.bookingData.names
        ? activity.resource.bookingData.names
        : [];
    const [checkedNames, setCheckedNames] = useState([]);

    const handleCheck = (name) => {
        setCheckedNames(prevState => {
            if (prevState.includes(name)) {
                return prevState.filter(n => n !== name);
            } else {
                return [...prevState, name];
            }
        });
    };

    const handleSave = () => {
        console.log('Save button clicked');
        // Implementation for saving checked names or any other logic
    };

    const handleDelete = () => {
        console.log('Delete activity button clicked');
        // Implementation for deleting an activity or any other logic
    };

    return (
        <div>
            {names.map((name, index) => (
                <div key={index}>
                    <input 
                        type="checkbox"
                        checked={checkedNames.includes(name)}
                        onChange={() => handleCheck(name)}
                    />
                    <label>{name}</label>
                </div>
            ))}
            <button onClick={handleSave}>Save</button>
            <button onClick={handleDelete}>Delete Activity</button>
            <button onClick={onBack}>Back to Calendar</button> {/* Back button */}
        </div>
    );
};

export default AttendanceForm;
