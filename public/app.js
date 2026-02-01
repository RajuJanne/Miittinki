const ROOMS = [];

// Generoidaan ja tallennetaan bookedBy session ID
function getSessionId() {
  let sessionId = localStorage.getItem('sessionId');
  if (!sessionId) {
    sessionId = 'session-' + Math.random().toString(36).substr(2, 4);
    localStorage.setItem('sessionId', sessionId);
  }
  return sessionId;
}

async function fetchRooms() {
  try {
    const res = await fetch('/api/rooms');
    if (!res.ok) return [];
    return await res.json();
  } catch (err) {
    return [];
  }
}

async function postJson(url, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res;
}

async function putJson(url, body) {
  const res = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res;
}

async function deleteJson(url, body) {
  const res = await fetch(url, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res;
}

function toIsoLocal(datetimeLocal) {
  if (!datetimeLocal) return null;
  // datetimeLocal on paikallinen aika "2026-02-02T10:30"
  // new Date() tulkitsee sen paikalliseksi ajaksi
  const d = new Date(datetimeLocal);
  // toISOString() konvertoi UTC ISO -muotoon (vähentää timezone offsetin)
  return d.toISOString();
}

function formatLocalTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${day}.${month}.${year} ${hours}:${minutes}`;
}

function fromIsoToLocal(iso) {
  if (!iso) return '';
  // iso on UTC (esim "2026-02-15T10:00:00Z")
  const d = new Date(iso);
  // Muunna paikalliseen aikaan käyttämällä getHours, getMinutes jne.
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

document.getElementById('create-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const f = e.target;
  const roomId = f.roomId.value.trim();
  const startTime = toIsoLocal(f.startTime.value);
  const endTime = toIsoLocal(f.endTime.value);
  const bookedBy = f.bookedBy.value.trim();

  const result = document.getElementById('create-result');
  result.textContent = '';

  try {
    const res = await postJson('/api/bookings', { roomId, startTime, endTime, bookedBy });
    if (res.status === 201) {
      const body = await res.json();
      result.textContent = 'Varattu: ' + body.id;
      document.getElementById('create-form').reset();
      document.getElementById('create-form').querySelector('input[name="bookedBy"]').value = getSessionId();
      document.getElementById('refresh').click();
    } else {
      const err = await res.json().catch(() => ({}));
      result.textContent = `Virhe (${res.status}): ${err.message || res.statusText}`;
    }
  } catch (err) {
    result.textContent = 'Virhe: ' + err;
  }
});

// Muokkaus-formin käsittelijä
document.getElementById('edit-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const f = e.target;
  const bookingId = f.querySelector('input[name="bookingId"]').value;
  const startTime = toIsoLocal(f.startTime.value);
  const endTime = toIsoLocal(f.endTime.value);
  const bookedBy = f.bookedBy.value.trim();

  const result = document.getElementById('edit-result');
  result.textContent = '';

  try {
    const res = await putJson(`/api/bookings/${bookingId}`, { startTime, endTime, bookedBy });
    if (res.status === 200) {
      result.textContent = 'Varaus päivitetty';
      document.getElementById('edit').hidden = true;
      document.getElementById('refresh').click();
    } else {
      const err = await res.json().catch(() => ({}));
      result.textContent = `Virhe (${res.status}): ${err.message || res.statusText}`;
    }
  } catch (err) {
    result.textContent = 'Virhe: ' + err;
  }
});

// Peruuta-nappula muokkaus-formille
document.getElementById('edit-cancel').addEventListener('click', () => {
  document.getElementById('edit').hidden = true;
});

document.getElementById('refresh').addEventListener('click', async () => {
  const room = document.getElementById('list-room').value.trim();
  const ul = document.getElementById('bookings');
  ul.innerHTML = 'Ladataan...';
  const sessionId = getSessionId();
  try {
    const res = await fetch(`/api/rooms/${encodeURIComponent(room)}/bookings`);
    if (!res.ok) {
      ul.innerHTML = `Virhe: ${res.status}`;
      return;
    }
    const bookings = await res.json();
    ul.innerHTML = '';
    if (!bookings.length) {
      ul.innerHTML = '<li>Ei varauksia</li>';
      return;
    }
    for (const b of bookings) {
      const li = document.createElement('li');
      li.textContent = `${formatLocalTime(b.startTime)} → ${formatLocalTime(b.endTime)} (varannut: ${b.bookedBy}) `;
      
      // Muokkaa-nappula vain omille varauksille
      if (b.bookedBy === sessionId) {
        const edit = document.createElement('button');
        edit.textContent = 'Muokkaa';
        edit.addEventListener('click', () => {
          // Näytä muokkaus-formi ja täytä se
          document.getElementById('edit').hidden = false;
          document.querySelector('#edit-form input[name="bookingId"]').value = b.id;
          document.querySelector('#edit-form input[name="roomId"]').value = b.roomId;
          document.querySelector('#edit-form input[name="startTime"]').value = fromIsoToLocal(b.startTime);
          document.querySelector('#edit-form input[name="endTime"]').value = fromIsoToLocal(b.endTime);
          document.querySelector('#edit-form input[name="bookedBy"]').value = b.bookedBy;
          document.getElementById('edit-result').textContent = '';
          // Scroll to edit form
          document.getElementById('edit').scrollIntoView({ behavior: 'smooth' });
        });
        li.appendChild(edit);
      }
      
      const del = document.createElement('button');
      del.textContent = 'Peruuta';
      del.addEventListener('click', async () => {
        const ok = confirm('Haluatko poistaa varauksen?');
        if (!ok) return;
        const res = await deleteJson(`/api/bookings/${b.id}`, { bookedBy: b.bookedBy });
        if (res.status === 204) {
          li.remove();
        } else {
          const err = await res.json().catch(() => ({}));
          alert('Virhe: ' + (err.message || res.status));
        }
      });
      li.appendChild(del);
      ul.appendChild(li);
    }
  } catch (err) {
    ul.innerHTML = 'Virhe: ' + err;
  }
});

async function renderRooms() {
  const container = document.getElementById('rooms-list');
  container.innerHTML = 'Ladataan...';
  const rooms = await fetchRooms();
  container.innerHTML = '';
  if (!rooms || !rooms.length) {
    container.innerHTML = '<p>Ei huoneita saatavilla</p>';
    return;
  }
  for (const r of rooms) {
    const btn = document.createElement('button');
    btn.classList.add('room-btn');
    btn.textContent = r.name;
    btn.addEventListener('click', () => {
      // Poista active-luokka kaikista nappuloista
      document.querySelectorAll('.room-btn').forEach(b => b.classList.remove('active'));
      // Lisää active-luokka klikatulle nappulalle
      btn.classList.add('active');
      // Päivitä varausten näyttö
      document.getElementById('list-room').value = r.name;
      document.getElementById('selected-room-title').textContent = `Huoneen "${r.name}" varaukset`;
      // Päivitä varauksen luonnin roomId-kenttä
      document.querySelector('#create-form input[name="roomId"]').value = r.name;
      document.getElementById('refresh').click();
    });
    container.appendChild(btn);
  }
}

renderRooms();
// Initialisoi session ID ja bookedBy kenttä
const sessionId = getSessionId();
document.getElementById('create-form').querySelector('input[name="bookedBy"]').value = sessionId;
// auto-refresh initially
document.getElementById('refresh').click();
