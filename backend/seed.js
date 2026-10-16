const Database = require('better-sqlite3');
const path = require('path');
const dbPath = path.join(__dirname, 'data.sqlite');
const db = new Database(dbPath);

// Insert sample rooms if none exist
const count = db.prepare('SELECT COUNT(*) as cnt FROM rooms').get().cnt;
if (count === 0) {
  const insert = db.prepare('INSERT INTO rooms (name, capacity, price) VALUES (?, ?, ?)');
  insert.run('Standard Room', 2, 50.0);
  insert.run('Deluxe Room', 3, 80.0);
  insert.run('Suite', 5, 150.0);
  console.log('Seeded rooms');
} else {
  console.log('Rooms already present');
}

// Add a demo booking
const bcount = db.prepare('SELECT COUNT(*) as cnt FROM bookings').get().cnt;
if (bcount === 0) {
  const insertB = db.prepare('INSERT INTO bookings (room_id, guest_name, check_in, check_out) VALUES (?, ?, ?, ?)');
  insertB.run(1, 'Demo Guest', '2026-11-01', '2026-11-03');
  console.log('Seeded a demo booking');
} else {
  console.log('Bookings already present');
}
