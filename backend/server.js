const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(express.json());

// FRONTEND_ORIGIN should be set in Render env vars (e.g. https://yourdomain.com or https://your-frontend.onrender.com)
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || '*';
app.use(cors({ origin: FRONTEND_ORIGIN }));

// Pool uses DATABASE_URL provided by Render
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // ensure SSL on production (Render provides SSL)
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Simple health route
app.get('/', (req, res) => res.json({ ok: true }));

// POST /submit -> save link
app.post('/submit', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'Missing url' });

  try {
    const { rows } = await pool.query(
      'INSERT INTO links(url) VALUES($1) RETURNING id, url, created_at',
      [url]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('DB error', err);
    res.status(500).json({ error: 'db error' });
  }
});

// GET /links -> list latest 200
app.get('/links', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT id, url, created_at FROM links ORDER BY created_at DESC LIMIT 200');
    res.json(rows);
  } catch (err) {
    console.error('DB error', err);
    res.status(500).json({ error: 'db error' });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server listening on ${port}`));
