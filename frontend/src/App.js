import React, { useState, useEffect } from 'react';
import { 
  Container, 
  TextField, 
  Button, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  Autocomplete,
  CircularProgress
} from '@mui/material';
import axios from 'axios';

// Укажите здесь адрес вашего бэкенда
const API_URL = 'http://158.160.163.158:8000';

function App() {
  const [devices, setDevices] = useState([]);
  const [metrics, setMetrics] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [selectedMetric, setSelectedMetric] = useState(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Загрузка списка устройств
    axios.get(`${API_URL}/devices`)
      .then(response => setDevices(response.data.map(id => ({ id }))))
      .catch(err => console.error('Ошибка загрузки устройств:', err));
    
    // Загрузка списка измерений
    axios.get(`${API_URL}/metrics`)
      .then(response => setMetrics(response.data.map(name => ({ name }))))
      .catch(err => console.error('Ошибка загрузки измерений:', err));
  }, []);

  const fetchData = () => {
    if (!selectedDevice || !selectedMetric) {
      setError('Выберите устройство и измерение');
      return;
    }

    setLoading(true);
    setError('');
    
    axios.get(`${API_URL}/data/${selectedDevice.id}/${selectedMetric.name}`)
      .then(response => {
        setData(response.data);
        setLoading(false);
      })
      .catch(err => {
        setError('Ошибка загрузки данных');
        setLoading(false);
        console.error('Ошибка получения данных:', err);
      });
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <h1>Мониторинг устройств</h1>
      
      <div style={{ display: 'flex', gap: 20, marginBottom: 20, alignItems: 'center' }}>
        <Autocomplete
          options={devices}
          getOptionLabel={(option) => option.id.toString()}
          style={{ width: 250 }}
          renderInput={(params) => <TextField {...params} label="Устройство" />}
          onChange={(_, value) => setSelectedDevice(value)}
        />
        
        <Autocomplete
          options={metrics}
          getOptionLabel={(option) => option.name}
          style={{ width: 250 }}
          renderInput={(params) => <TextField {...params} label="Измерение" />}
          onChange={(_, value) => setSelectedMetric(value)}
        />
        
        <Button 
          variant="contained" 
          color="primary" 
          onClick={fetchData}
          disabled={loading}
          style={{ height: 56 }}
        >
          {loading ? <CircularProgress size={24} /> : 'Обновить'}
        </Button>
      </div>

      {error && <div style={{ color: 'red', marginBottom: 20 }}>{error}</div>}

      {data.length > 0 ? (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Устройство</TableCell>
                <TableCell>Измерение</TableCell>
                <TableCell align="right">Значение</TableCell>
                <TableCell>Время</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>{row.device_id}</TableCell>
                  <TableCell>{row.metric_name}</TableCell>
                  <TableCell align="right">{row.value}</TableCell>
                  <TableCell>
                    {new Date(row.timestamp).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          {loading ? 'Загрузка данных...' : 'Нет данных для отображения'}
        </Paper>
      )}
    </Container>
  );
}

export default App;