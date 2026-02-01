import { Booking } from '../models/booking.model.ts';

export class BookingRepository {
  private bookings: Map<string, Booking> = new Map();

  create(booking: Booking) {
    this.bookings.set(booking.id, booking);
    return booking;
  }

  update(id: string, patch: Partial<Booking>) {
    const existing = this.bookings.get(id);
    if (!existing) return null;
    const updated: Booking = { ...existing, ...patch, updatedAt: new Date() } as Booking;
    this.bookings.set(id, updated);
    return updated;
  }

  delete(id: string) {
    return this.bookings.delete(id);
  }

  findById(id: string) {
    return this.bookings.get(id) || null;
  }

  findByRoom(roomId: string) {
    const arr: Booking[] = [];
    for (const b of this.bookings.values()) {
      if (b.roomId === roomId) arr.push(b);
    }
    return arr;
  }

  findAll() {
    return Array.from(this.bookings.values());
  }
}
