import React, { useState, useEffect } from 'react';
import MeasurementSelector from './components/MeasurementSelector';
import MeasurementChart from './components/MeasurementChart';
import { getMeasurementTypes, getMeasurementData } from './api';

function App() {
  const [measurementTypes, setMeasurementTypes] = useState([]);
  const [selectedMeasurement, setSelectedMeasurement] = useState('');
  const [measurementData, setMeasurementData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Загрузка типов измерений
  useEffect(() => {
    const fetchTypes = async () => {
      const types = await getMeasurementTypes();
      setMeasurementTypes(types);
      if (types.length > 0) {
        setSelectedMeasurement(types[0]);
      }
    };
    fetchTypes();
  }, []);

  // Загрузка данных при изменении выбранного измерения
  useEffect(() => {
    if (selectedMeasurement) {
      setLoading(true);
      const fetchData = async () => {
        const data = await getMeasurementData(selectedMeasurement);
        setMeasurementData(data);
        setLoading(false);
      };
      fetchData();
    }
  }, [selectedMeasurement]);

  return (
    <div style={{ 
      maxWidth: 1200, 
      margin: '0 auto', 
      padding: 20,
      fontFamily: 'Arial, sans-serif'
    }}>
      <header>
        <h1 style={{ textAlign: 'center' }}>Система мониторинга измерений</h1>
      </header>
      
      <main>
        <MeasurementSelector
          measurements={measurementTypes}
          selectedMeasurement={selectedMeasurement}
          onChange={setSelectedMeasurement}
        />
        
        {loading ? (
          <div style={{ 
            textAlign: 'center', 
            padding: 40, 
            color: '#0d6efd',
            fontSize: 18
          }}>
            Загрузка данных...
          </div>
        ) : (
          <MeasurementChart data={measurementData} />
        )}
      </main>
    </div>
  );
}

export default App;