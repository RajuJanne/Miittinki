import { BookingService } from '../services/booking.service';
import { BookingRepository } from '../repositories/booking.repository';
import { BusinessError } from '../errors/business-error';

describe('BookingService', () => {
  let service: BookingService;
  let repository: BookingRepository;

  beforeEach(() => {
    repository = new BookingRepository();
    service = new BookingService(repository);
  });

  describe('createBooking', () => {
    it('should create a booking successfully', () => {
      const futureDate = new Date();
      futureDate.setHours(futureDate.getHours() + 2);
      const endDate = new Date(futureDate);
      endDate.setHours(endDate.getHours() + 1);

      const booking = service.createBooking({
        roomId: 'A101',
        startTime: futureDate.toISOString(),
        endTime: endDate.toISOString(),
        bookedBy: 'user1',
      });

      expect(booking).toBeDefined();
      expect(booking.id).toBeDefined();
      expect(booking.roomId).toBe('A101');
      expect(booking.bookedBy).toBe('user1');
    });

    it('should throw error when startTime is in the past', () => {
      const pastDate = new Date();
      pastDate.setHours(pastDate.getHours() - 1);
      const futureDate = new Date();
      futureDate.setHours(futureDate.getHours() + 1);

      expect(() => {
        service.createBooking({
          roomId: 'A101',
          startTime: pastDate.toISOString(),
          endTime: futureDate.toISOString(),
          bookedBy: 'user1',
        });
      }).toThrow(BusinessError);
    });

    it('should throw error when endTime is before startTime', () => {
      const futureDate = new Date();
      futureDate.setHours(futureDate.getHours() + 2);
      const earlierDate = new Date(futureDate);
      earlierDate.setHours(earlierDate.getHours() - 1);

      expect(() => {
        service.createBooking({
          roomId: 'A101',
          startTime: futureDate.toISOString(),
          endTime: earlierDate.toISOString(),
          bookedBy: 'user1',
        });
      }).toThrow(BusinessError);
    });

    it('should throw error when dates overlap with existing booking', () => {
      const startTime = new Date();
      startTime.setHours(startTime.getHours() + 2);
      const endTime = new Date(startTime);
      endTime.setHours(endTime.getHours() + 2);

      // Create first booking
      service.createBooking({
        roomId: 'A101',
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        bookedBy: 'user1',
      });

      // Try to create overlapping booking
      const overlapStart = new Date(startTime);
      overlapStart.setMinutes(overlapStart.getMinutes() + 30);
      const overlapEnd = new Date(endTime);
      overlapEnd.setMinutes(overlapEnd.getMinutes() + 30);

      expect(() => {
        service.createBooking({
          roomId: 'A101',
          startTime: overlapStart.toISOString(),
          endTime: overlapEnd.toISOString(),
          bookedBy: 'user2',
        });
      }).toThrow(BusinessError);
    });

    it('should allow non-overlapping bookings in the same room', () => {
      const startTime1 = new Date();
      startTime1.setHours(startTime1.getHours() + 2);
      const endTime1 = new Date(startTime1);
      endTime1.setHours(endTime1.getHours() + 1);

      const startTime2 = new Date(endTime1);
      startTime2.setMinutes(startTime2.getMinutes() + 30);
      const endTime2 = new Date(startTime2);
      endTime2.setHours(endTime2.getHours() + 1);

      const booking1 = service.createBooking({
        roomId: 'A101',
        startTime: startTime1.toISOString(),
        endTime: endTime1.toISOString(),
        bookedBy: 'user1',
      });

      const booking2 = service.createBooking({
        roomId: 'A101',
        startTime: startTime2.toISOString(),
        endTime: endTime2.toISOString(),
        bookedBy: 'user2',
      });

      expect(booking1.id).not.toBe(booking2.id);
      expect(booking2.bookedBy).toBe('user2');
    });

    it('should allow overlapping bookings in different rooms', () => {
      const startTime = new Date();
      startTime.setHours(startTime.getHours() + 2);
      const endTime = new Date(startTime);
      endTime.setHours(endTime.getHours() + 2);

      const booking1 = service.createBooking({
        roomId: 'A101',
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        bookedBy: 'user1',
      });

      const booking2 = service.createBooking({
        roomId: 'A102',
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        bookedBy: 'user1',
      });

      expect(booking1.roomId).not.toBe(booking2.roomId);
      expect(booking1.id).not.toBe(booking2.id);
    });

    it('should throw error with invalid date format', () => {
      expect(() => {
        service.createBooking({
          roomId: 'A101',
          startTime: 'invalid-date',
          endTime: 'invalid-date',
          bookedBy: 'user1',
        });
      }).toThrow(BusinessError);
    });
  });

  describe('deleteBooking', () => {
    it('should delete a booking successfully', () => {
      const futureDate = new Date();
      futureDate.setHours(futureDate.getHours() + 2);
      const endDate = new Date(futureDate);
      endDate.setHours(endDate.getHours() + 1);

      const booking = service.createBooking({
        roomId: 'A101',
        startTime: futureDate.toISOString(),
        endTime: endDate.toISOString(),
        bookedBy: 'user1',
      });

      service.deleteBooking(booking.id, 'user1');

      expect(repository.findById(booking.id)).toBeNull();
    });

    it('should throw error when booking does not exist', () => {
      expect(() => {
        service.deleteBooking('non-existent-id', 'user1');
      }).toThrow(BusinessError);
    });

    it('should throw error when bookedBy does not match', () => {
      const futureDate = new Date();
      futureDate.setHours(futureDate.getHours() + 2);
      const endDate = new Date(futureDate);
      endDate.setHours(endDate.getHours() + 1);

      const booking = service.createBooking({
        roomId: 'A101',
        startTime: futureDate.toISOString(),
        endTime: endDate.toISOString(),
        bookedBy: 'user1',
      });

      expect(() => {
        service.deleteBooking(booking.id, 'user2');
      }).toThrow(BusinessError);
    });
  });

  describe('getBookingsByRoom', () => {
    it('should return empty array when room has no bookings', () => {
      const bookings = service.getBookingsByRoom('A101');
      expect(bookings).toEqual([]);
    });

    it('should return all bookings for a room', () => {
      const futureDate = new Date();
      futureDate.setHours(futureDate.getHours() + 2);
      const endDate = new Date(futureDate);
      endDate.setHours(endDate.getHours() + 1);

      const startTime2 = new Date(endDate);
      startTime2.setMinutes(startTime2.getMinutes() + 30);
      const endTime2 = new Date(startTime2);
      endTime2.setHours(endTime2.getHours() + 1);

      service.createBooking({
        roomId: 'A101',
        startTime: futureDate.toISOString(),
        endTime: endDate.toISOString(),
        bookedBy: 'user1',
      });

      service.createBooking({
        roomId: 'A101',
        startTime: startTime2.toISOString(),
        endTime: endTime2.toISOString(),
        bookedBy: 'user2',
      });

      const bookings = service.getBookingsByRoom('A101');
      expect(bookings).toHaveLength(2);
      expect(bookings.every(b => b.roomId === 'A101')).toBe(true);
    });

    it('should return only bookings for the specified room', () => {
      const futureDate = new Date();
      futureDate.setHours(futureDate.getHours() + 2);
      const endDate = new Date(futureDate);
      endDate.setHours(endDate.getHours() + 1);

      service.createBooking({
        roomId: 'A101',
        startTime: futureDate.toISOString(),
        endTime: endDate.toISOString(),
        bookedBy: 'user1',
      });

      service.createBooking({
        roomId: 'A102',
        startTime: futureDate.toISOString(),
        endTime: endDate.toISOString(),
        bookedBy: 'user1',
      });

      const bookingsA101 = service.getBookingsByRoom('A101');
      expect(bookingsA101).toHaveLength(1);
      expect(bookingsA101[0].roomId).toBe('A101');
    });
  });

  describe('updateBooking', () => {
    it('should update a booking successfully', () => {
      const futureDate = new Date();
      futureDate.setHours(futureDate.getHours() + 2);
      const endDate = new Date(futureDate);
      endDate.setHours(endDate.getHours() + 1);

      const booking = service.createBooking({
        roomId: 'A101',
        startTime: futureDate.toISOString(),
        endTime: endDate.toISOString(),
        bookedBy: 'user1',
      });

      const newStartTime = new Date(futureDate);
      newStartTime.setMinutes(newStartTime.getMinutes() + 30);
      const newEndTime = new Date(newStartTime);
      newEndTime.setHours(newEndTime.getHours() + 1);

      const updated = service.updateBooking(booking.id, {
        startTime: newStartTime.toISOString(),
        endTime: newEndTime.toISOString(),
        bookedBy: 'user1',
      });

      expect(updated.startTime.getTime()).toBe(newStartTime.getTime());
      expect(updated.endTime.getTime()).toBe(newEndTime.getTime());
    });

    it('should throw error when booking does not exist', () => {
      const futureDate = new Date();
      futureDate.setHours(futureDate.getHours() + 2);
      const endDate = new Date(futureDate);
      endDate.setHours(endDate.getHours() + 1);

      expect(() => {
        service.updateBooking('non-existent-id', {
          startTime: futureDate.toISOString(),
          endTime: endDate.toISOString(),
          bookedBy: 'user1',
        });
      }).toThrow(BusinessError);
    });

    it('should throw error when bookedBy does not match', () => {
      const futureDate = new Date();
      futureDate.setHours(futureDate.getHours() + 2);
      const endDate = new Date(futureDate);
      endDate.setHours(endDate.getHours() + 1);

      const booking = service.createBooking({
        roomId: 'A101',
        startTime: futureDate.toISOString(),
        endTime: endDate.toISOString(),
        bookedBy: 'user1',
      });

      expect(() => {
        service.updateBooking(booking.id, {
          startTime: futureDate.toISOString(),
          endTime: endDate.toISOString(),
          bookedBy: 'user2',
        });
      }).toThrow(BusinessError);
    });

    it('should throw error when update creates overlap', () => {
      const futureDate = new Date();
      futureDate.setHours(futureDate.getHours() + 2);
      const endDate = new Date(futureDate);
      endDate.setHours(endDate.getHours() + 1);

      const startTime2 = new Date(endDate);
      startTime2.setMinutes(startTime2.getMinutes() + 30);
      const endTime2 = new Date(startTime2);
      endTime2.setHours(endTime2.getHours() + 1);

      service.createBooking({
        roomId: 'A101',
        startTime: futureDate.toISOString(),
        endTime: endDate.toISOString(),
        bookedBy: 'user1',
      });

      const booking2 = service.createBooking({
        roomId: 'A101',
        startTime: startTime2.toISOString(),
        endTime: endTime2.toISOString(),
        bookedBy: 'user2',
      });

      // Try to update booking2 to overlap with booking1
      expect(() => {
        service.updateBooking(booking2.id, {
          startTime: futureDate.toISOString(),
          endTime: endDate.toISOString(),
          bookedBy: 'user2',
        });
      }).toThrow(BusinessError);
    });
  });
});
