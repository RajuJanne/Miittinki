import { Booking } from '../models/booking.model.ts';
import { sharedBookingRepository } from '../repositories/shared.repository.ts';
import { CreateBookingDto } from '../dtos/create-booking.dto.ts';
import { UpdateBookingDto } from '../dtos/update-booking.dto.ts';
import { v4 as uuidv4 } from 'uuid';
import { parseIsoToDate, isStartBeforeEnd, isInPast, overlaps } from '../utils/time.utils.ts';
import { BusinessError } from '../errors/business-error.ts';

export class BookingService {
  constructor(private repo = sharedBookingRepository) {}

  createBooking(dto: CreateBookingDto): Booking {
    const start = parseIsoToDate(dto.startTime);
    const end = parseIsoToDate(dto.endTime);
    if (!start || !end) throw new BusinessError('Invalid date format', 400);
    if (!isStartBeforeEnd(start, end)) throw new BusinessError('startTime must be before endTime', 400);
    if (isInPast(start)) throw new BusinessError('startTime cannot be in the past', 400);

    // overlap check
    const roomBookings = this.repo.findByRoom(dto.roomId);
    for (const b of roomBookings) {
      if (overlaps(start, end, b.startTime, b.endTime)) {
        throw new BusinessError('Overlap with existing booking', 409);
      }
    }

    const now = new Date();
    const booking: Booking = {
      id: uuidv4(),
      roomId: dto.roomId,
      startTime: start,
      endTime: end,
      bookedBy: dto.bookedBy,
      createdAt: now,
      updatedAt: now,
    };
    return this.repo.create(booking);
  }

  updateBooking(id: string, dto: UpdateBookingDto): Booking {
    const existing = this.repo.findById(id);
    if (!existing) throw new BusinessError('Booking not found', 404);
    if (existing.bookedBy !== dto.bookedBy) throw new BusinessError('Booker does not match', 403);

    const start = parseIsoToDate(dto.startTime);
    const end = parseIsoToDate(dto.endTime);
    if (!start || !end) throw new BusinessError('Invalid date format', 400);
    if (!isStartBeforeEnd(start, end)) throw new BusinessError('startTime must be before endTime', 400);
    if (isInPast(start)) throw new BusinessError('startTime cannot be in the past', 400);

    // overlap check excluding the booking itself
    const roomBookings = this.repo.findByRoom(existing.roomId);
    for (const b of roomBookings) {
      if (b.id === id) continue;
      if (overlaps(start, end, b.startTime, b.endTime)) {
        throw new BusinessError('Overlap with existing booking', 409);
      }
    }

    const updated = this.repo.update(id, { startTime: start, endTime: end });
    if (!updated) throw new BusinessError('Booking not found', 404);
    return updated;
  }

  deleteBooking(id: string, bookedBy: string): void {
    const existing = this.repo.findById(id);
    if (!existing) throw new BusinessError('Booking not found', 404);
    if (existing.bookedBy !== bookedBy) throw new BusinessError('Booker does not match', 403);
    this.repo.delete(id);
  }

  getBookingsByRoom(roomId: string) {
    return this.repo.findByRoom(roomId).map(b => ({
      ...b
    }));
  }
}
