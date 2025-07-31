import axios from 'axios';

const API_URL = 'http://localhost:3005';

export const getMeasurementTypes = async () => {
  try {
    const response = await axios.get(`${API_URL}/measurement/measurementTypes`);
    return response.data;
  } catch (error) {
    console.error('Error fetching measurement types:', error);
    return [];
  }
};

export const getMeasurementData = async (measurementType) => {
  try {
    const response = await axios.get(`${API_URL}/measurement/getData`, {
      params: { measurement: measurementType }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching measurement data:', error);
    return [];
  }
};