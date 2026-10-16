const apiBase = '/api';

async function fetchRooms() {
  const res = await fetch(apiBase + '/rooms');
  return res.json();
}

async function fetchBookings() {
  const res = await fetch(apiBase + '/bookings');
  return res.json();
}

function renderRooms(rooms) {
  const list = document.getElementById('rooms-list');
  const sel = document.getElementById('room-select');
  list.innerHTML = '';
  sel.innerHTML = '';
  rooms.forEach(r => {
    const div = document.createElement('div');
    div.className = 'room';
    div.innerHTML = `<strong>${r.name}</strong> — capacity: ${r.capacity} — $${r.price}/night`;
    list.appendChild(div);

    const opt = document.createElement('option');
    opt.value = r.id;
    opt.textContent = r.name + ' ($' + r.price + ')';
    sel.appendChild(opt);
  });
}

function renderBookings(bookings) {
  const list = document.getElementById('bookings-list');
  list.innerHTML = '';
  bookings.forEach(b => {
    const div = document.createElement('div');
    div.className = 'booking';
    div.innerHTML = `#${b.id} <strong>${b.room_name}</strong> — ${b.guest_name} (${b.check_in} → ${b.check_out}) <button data-id="${b.id}" class="cancel">Cancel</button>`;
    list.appendChild(div);
  });
}

async function refresh() {
  const rooms = await fetchRooms();
  renderRooms(rooms);
  const bookings = await fetchBookings();
  renderBookings(bookings);
}

document.getElementById('booking-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const room_id = document.getElementById('room-select').value;
  const guest_name = document.getElementById('guest-name').value;
  const check_in = document.getElementById('check-in').value;
  const check_out = document.getElementById('check-out').value;
  const res = await fetch('/api/bookings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ room_id: Number(room_id), guest_name, check_in, check_out })
  });
  const json = await res.json();
  const result = document.getElementById('booking-result');
  if (res.ok) {
    result.textContent = 'Booking successful! ID: ' + json.id;
    document.getElementById('booking-form').reset();
    refresh();
  } else {
    result.textContent = 'Error: ' + (json.error || 'Unknown');
  }
});

document.getElementById('bookings-list').addEventListener('click', async (e) => {
  if (e.target.classList.contains('cancel')) {
    const id = e.target.dataset.id;
    const res = await fetch('/api/bookings/' + id, { method: 'DELETE' });
    if (res.ok) refresh();
  }
});

refresh();
