import { RoomRepository } from './room.repository.ts';
import { BookingRepository } from './booking.repository.ts';

// Jaettu repository-instanssi kaikkien service-instanssien välillä
export const sharedRoomRepository = new RoomRepository();
export const sharedBookingRepository = new BookingRepository();
