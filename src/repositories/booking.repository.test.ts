import { BookingRepository } from '../repositories/booking.repository';
import { Booking } from '../models/booking.model';

describe('BookingRepository', () => {
  let repository: BookingRepository;

  beforeEach(() => {
    repository = new BookingRepository();
  });

  describe('create', () => {
    it('should create and store a booking', () => {
      const booking: Booking = {
        id: '1',
        roomId: 'A101',
        startTime: new Date('2026-02-15T09:00:00Z'),
        endTime: new Date('2026-02-15T10:00:00Z'),
        bookedBy: 'user1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = repository.create(booking);
      expect(result).toEqual(booking);
      expect(repository.findById('1')).toEqual(booking);
    });
  });

  describe('findById', () => {
    it('should find a booking by id', () => {
      const booking: Booking = {
        id: '1',
        roomId: 'A101',
        startTime: new Date('2026-02-15T09:00:00Z'),
        endTime: new Date('2026-02-15T10:00:00Z'),
        bookedBy: 'user1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      repository.create(booking);
      const found = repository.findById('1');
      expect(found).toEqual(booking);
    });

    it('should return null when booking not found', () => {
      const found = repository.findById('non-existent');
      expect(found).toBeNull();
    });
  });

  describe('findByRoom', () => {
    it('should return all bookings for a room', () => {
      const booking1: Booking = {
        id: '1',
        roomId: 'A101',
        startTime: new Date('2026-02-15T09:00:00Z'),
        endTime: new Date('2026-02-15T10:00:00Z'),
        bookedBy: 'user1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const booking2: Booking = {
        id: '2',
        roomId: 'A101',
        startTime: new Date('2026-02-15T11:00:00Z'),
        endTime: new Date('2026-02-15T12:00:00Z'),
        bookedBy: 'user2',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      repository.create(booking1);
      repository.create(booking2);

      const found = repository.findByRoom('A101');
      expect(found).toHaveLength(2);
      expect(found[0].id).toBe('1');
      expect(found[1].id).toBe('2');
    });

    it('should return empty array when room has no bookings', () => {
      const found = repository.findByRoom('A101');
      expect(found).toEqual([]);
    });

    it('should return only bookings for the specified room', () => {
      const booking1: Booking = {
        id: '1',
        roomId: 'A101',
        startTime: new Date('2026-02-15T09:00:00Z'),
        endTime: new Date('2026-02-15T10:00:00Z'),
        bookedBy: 'user1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const booking2: Booking = {
        id: '2',
        roomId: 'A102',
        startTime: new Date('2026-02-15T09:00:00Z'),
        endTime: new Date('2026-02-15T10:00:00Z'),
        bookedBy: 'user2',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      repository.create(booking1);
      repository.create(booking2);

      const foundA101 = repository.findByRoom('A101');
      expect(foundA101).toHaveLength(1);
      expect(foundA101[0].roomId).toBe('A101');
    });
  });

  describe('update', () => {
    it('should update a booking', () => {
      const booking: Booking = {
        id: '1',
        roomId: 'A101',
        startTime: new Date('2026-02-15T09:00:00Z'),
        endTime: new Date('2026-02-15T10:00:00Z'),
        bookedBy: 'user1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      repository.create(booking);

      const newStart = new Date('2026-02-15T10:00:00Z');
      const newEnd = new Date('2026-02-15T11:00:00Z');
      const updated = repository.update('1', {
        startTime: newStart,
        endTime: newEnd,
      });

      expect(updated).not.toBeNull();
      expect(updated!.startTime.getTime()).toBe(newStart.getTime());
      expect(updated!.endTime.getTime()).toBe(newEnd.getTime());
    });

    it('should return null when booking not found', () => {
      const updated = repository.update('non-existent', {
        startTime: new Date(),
      });

      expect(updated).toBeNull();
    });

    it('should update updatedAt timestamp', () => {
      const booking: Booking = {
        id: '1',
        roomId: 'A101',
        startTime: new Date('2026-02-15T09:00:00Z'),
        endTime: new Date('2026-02-15T10:00:00Z'),
        bookedBy: 'user1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      repository.create(booking);
      const beforeUpdate = new Date();

      const updated = repository.update('1', { bookedBy: 'user2' });

      expect(updated!.updatedAt.getTime()).toBeGreaterThanOrEqual(beforeUpdate.getTime());
    });
  });

  describe('delete', () => {
    it('should delete a booking', () => {
      const booking: Booking = {
        id: '1',
        roomId: 'A101',
        startTime: new Date('2026-02-15T09:00:00Z'),
        endTime: new Date('2026-02-15T10:00:00Z'),
        bookedBy: 'user1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      repository.create(booking);
      repository.delete('1');

      expect(repository.findById('1')).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return all bookings', () => {
      const booking1: Booking = {
        id: '1',
        roomId: 'A101',
        startTime: new Date('2026-02-15T09:00:00Z'),
        endTime: new Date('2026-02-15T10:00:00Z'),
        bookedBy: 'user1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const booking2: Booking = {
        id: '2',
        roomId: 'A102',
        startTime: new Date('2026-02-15T09:00:00Z'),
        endTime: new Date('2026-02-15T10:00:00Z'),
        bookedBy: 'user2',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      repository.create(booking1);
      repository.create(booking2);

      const all = repository.findAll();
      expect(all).toHaveLength(2);
    });

    it('should return empty array when no bookings', () => {
      const all = repository.findAll();
      expect(all).toEqual([]);
    });
  });
});
