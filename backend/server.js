// server.js
require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const app = express();
const port = process.env.PORT || 8000;

// Конфигурация PostgreSQL
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'measurements_db',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
});

// Middleware
app.use(express.json());

// Проверка подключения к БД
pool.connect((err, client, release) => {
  if (err) {
    return console.error('Ошибка подключения к PostgreSQL:', err.stack);
  }
  console.log('Успешное подключение к PostgreSQL');
  
  // Создание таблицы (если не существует)
  client.query(`
    CREATE TABLE IF NOT EXISTS measurements (
      id SERIAL PRIMARY KEY,
      device_id INTEGER NOT NULL,
      metric_name VARCHAR(50) NOT NULL,
      value INTEGER NOT NULL,
      timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    release();
    if (err) {
      return console.error('Ошибка создания таблицы:', err.stack);
    }
    console.log('Таблица measurements готова');
  });
});

// 1. Список устройств
app.get('/devices', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT DISTINCT device_id FROM measurements'
    );
    res.json(result.rows.map(row => row.device_id));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// 2. Список измерений
app.get('/metrics', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT DISTINCT metric_name FROM measurements'
    );
    res.json(result.rows.map(row => row.metric_name));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// 3. Получение данных по устройству и измерению
app.get('/data/:device_id/:metric_name', async (req, res) => {
  const { device_id, metric_name } = req.params;
  
  try {
    const result = await pool.query(
      `SELECT device_id, metric_name, value, timestamp 
       FROM measurements 
       WHERE device_id = $1 AND metric_name = $2
       ORDER BY timestamp DESC
       LIMIT 100`,
      [device_id, metric_name]
    );
    
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// 4. Добавление измерения
app.post('/add', async (req, res) => {
  const { device_id, metric_name, value, timestamp } = req.body;
  
  // Валидация
  if (!device_id || !metric_name || value === undefined) {
    return res.status(400).json({ error: 'Неверные параметры запроса' });
  }
  
  try {
    await pool.query(
      `INSERT INTO measurements (device_id, metric_name, value, timestamp)
       VALUES ($1, $2, $3, $4)`,
      [device_id, metric_name, value, timestamp || new Date()]
    );
    
    res.json({ status: 'success' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка базы данных' });
  }
});

// Запуск сервера
app.listen(port, () => {
  console.log(`Сервер запущен на порту ${port}`);
});