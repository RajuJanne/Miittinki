const ROOMS = [];
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
  // input[type=datetime-local] gives local without timezone; convert to UTC ISO
  const d = new Date(datetimeLocal);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString();
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
      document.getElementById('refresh').click();
    } else {
      const err = await res.json().catch(() => ({}));
      result.textContent = `Virhe (${res.status}): ${err.message || res.statusText}`;
    }
  } catch (err) {
    result.textContent = 'Virhe: ' + err;
  }
});

document.getElementById('refresh').addEventListener('click', async () => {
  const room = document.getElementById('list-room').value.trim();
  const ul = document.getElementById('bookings');
  ul.innerHTML = 'Ladataan...';
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
      li.textContent = `${b.startTime} → ${b.endTime} (varannut: ${b.bookedBy}) `;
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
// auto-refresh initially
document.getElementById('refresh').click();
