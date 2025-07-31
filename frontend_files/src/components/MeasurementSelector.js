import React from 'react';

const MeasurementSelector = ({ measurements, selectedMeasurement, onChange }) => {
  return (
    <div style={{ margin: '20px 0', padding: 15, background: '#f8f9fa', borderRadius: 8 }}>
      <label htmlFor="measurement-select" style={{ marginRight: 10 }}>
        Выберите измерение:
      </label>
      <select 
        id="measurement-select"
        value={selectedMeasurement || ''}
        onChange={(e) => onChange(e.target.value)}
        style={{
          padding: '8px 12px',
          borderRadius: 4,
          border: '1px solid #ced4da',
          fontSize: 16
        }}
      >
        <option value="" disabled>-- Выберите тип --</option>
        {measurements.map((type) => (
          <option key={type} value={type}>
            {type}
          </option>
        ))}
      </select>
    </div>
  );
};

export default MeasurementSelector;