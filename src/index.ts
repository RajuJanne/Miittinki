import express from 'express';
import bookingRoutes from './routes/booking.routes.ts';
import roomRoutes from './routes/room.routes.ts';
import { RoomService } from './services/room.service.ts';

const app = express();
app.use(express.json());

// Palvele staattisia tiedostoja public-kansiosta
app.use(express.static('public'));

app.use('/', bookingRoutes);
app.use('/', roomRoutes);

// Luo oletushuoneet käynnistyksessä (jos eivät vielä ole olemassa)
const roomService = new RoomService();
const defaultRooms = ['A101', 'A102', 'B201', 'B202'];
for (const r of defaultRooms) {
  try {
    roomService.createRoom(r);
  } catch (err) {
    // jos jo olemassa tai muu business-virhe, ohitetaan
  }
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running on port ${PORT}`);
});
