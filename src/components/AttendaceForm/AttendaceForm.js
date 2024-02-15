import React, { useState } from 'react';




const AttendanceForm = ({activity}) => {
    const [names, setNames] = useState(['John Doe', 'Jane Doe', 'Alice', 'Bob']);
    const [checkedNames, setCheckedNames] = useState([]);

    const handleCheck = (name) => {
        setCheckedNames(prevState => {
            if(prevState.includes(name)) {
                return prevState.filter(n => n !== name);
            } else {
                return [...prevState, name];
            }
        });
    };

    const handleSave = () => {
        console.log('Save button clicked');
    };

    const handleDelete = () => {
        console.log('Delete activity button clicked');
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
            <button onClick={handleDelete}>Delete activity</button>
        </div>
    );
};

export default AttendanceForm;
