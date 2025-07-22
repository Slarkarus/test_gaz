// server.js
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const port = 8000;

// Создаем и подключаем базу данных в памяти
const db = new sqlite3.Database(':memory:'); // Можно заменить на файл './measurements.db'

// Middleware
app.use(express.json());

// Инициализация базы данных
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS measurements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      device_id INTEGER NOT NULL,
      metric_name TEXT NOT NULL,
      value INTEGER NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // Для тестирования добавим начальные данные
  db.run(`
    INSERT INTO measurements (device_id, metric_name, value)
    VALUES (1, 'temperature', 25), (2, 'humidity', 60)
  `);
});

// 1. Список устройств
app.get('/devices', (req, res) => {
  db.all('SELECT DISTINCT device_id FROM measurements', (err, rows) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Database error' });
    } else {
      res.json(rows.map(row => row.device_id));
    }
  });
});

// 2. Список измерений
app.get('/metrics', (req, res) => {
  db.all('SELECT DISTINCT metric_name FROM measurements', (err, rows) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Database error' });
    } else {
      res.json(rows.map(row => row.metric_name));
    }
  });
});

// 3. Получение данных по устройству и измерению
app.get('/data/:device_id/:metric_name', (req, res) => {
  const { device_id, metric_name } = req.params;
  
  db.all(
    `SELECT device_id, metric_name, value, timestamp 
     FROM measurements 
     WHERE device_id = ? AND metric_name = ?
     ORDER BY timestamp DESC
     LIMIT 100`,
    [device_id, metric_name],
    (err, rows) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
      } else {
        res.json(rows);
      }
    }
  );
});

// 4. Добавление измерения
app.post('/add', (req, res) => {
  const { device_id, metric_name, value, timestamp } = req.body;
  
  // Валидация
  if (!device_id || !metric_name || value === undefined) {
    return res.status(400).json({ error: 'Invalid request parameters' });
  }
  
  db.run(
    `INSERT INTO measurements (device_id, metric_name, value, timestamp)
     VALUES (?, ?, ?, ?)`,
    [device_id, metric_name, value, timestamp || new Date().toISOString()],
    function(err) {
      if (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
      } else {
        res.json({ status: 'success' });
      }
    }
  );
});

// Запуск сервера
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});