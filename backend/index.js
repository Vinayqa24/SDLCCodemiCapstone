const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const Database = require('better-sqlite3');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const dbPath = path.join(__dirname, 'data.sqlite');
const db = new Database(dbPath);

// Initialize schema
db.prepare(`CREATE TABLE IF NOT EXISTS rooms (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  capacity INTEGER NOT NULL,
  price REAL NOT NULL
)`).run();

db.prepare(`CREATE TABLE IF NOT EXISTS bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  room_id INTEGER NOT NULL,
  guest_name TEXT NOT NULL,
  check_in TEXT NOT NULL,
  check_out TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY(room_id) REFERENCES rooms(id)
)`).run();

// Helpers
function isAvailable(roomId, checkIn, checkOut) {
  const stmt = db.prepare(`SELECT COUNT(*) as cnt FROM bookings WHERE room_id = ? AND NOT (check_out <= ? OR check_in >= ?)`);
  const r = stmt.get(roomId, checkIn, checkOut);
  return r.cnt === 0;
}

app.get('/api/rooms', (req, res) => {
  const rows = db.prepare('SELECT * FROM rooms').all();
  res.json(rows);
});

app.get('/api/bookings', (req, res) => {
  const rows = db.prepare(`SELECT b.*, r.name as room_name FROM bookings b JOIN rooms r ON b.room_id = r.id ORDER BY b.created_at DESC`).all();
  res.json(rows);
});

app.post('/api/bookings', (req, res) => {
  const { room_id, guest_name, check_in, check_out } = req.body;
  if (!room_id || !guest_name || !check_in || !check_out) {
    return res.status(400).json({ error: 'Missing fields' });
  }
  if (!isAvailable(room_id, check_in, check_out)) {
    return res.status(400).json({ error: 'Room not available for selected dates' });
  }
  const stmt = db.prepare('INSERT INTO bookings (room_id, guest_name, check_in, check_out) VALUES (?, ?, ?, ?)');
  const info = stmt.run(room_id, guest_name, check_in, check_out);
  const booking = db.prepare('SELECT b.*, r.name as room_name FROM bookings b JOIN rooms r ON b.room_id = r.id WHERE b.id = ?').get(info.lastInsertRowid);
  res.json(booking);
});

app.delete('/api/bookings/:id', (req, res) => {
  const id = req.params.id;
  const stmt = db.prepare('DELETE FROM bookings WHERE id = ?');
  const info = stmt.run(id);
  if (info.changes === 0) return res.status(404).json({ error: 'Not found' });
  res.json({ success: true });
});

// Simple health
app.get('/api/health', (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend listening on ${PORT}`));
