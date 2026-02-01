import { Request, Response } from 'express';
import { BookingService } from '../services/booking.service.ts';
import { CreateBookingDto } from '../dtos/create-booking.dto.ts';
import { UpdateBookingDto } from '../dtos/update-booking.dto.ts';
import { BookingResponseDto } from '../dtos/booking-response.dto.ts';
import { BusinessError } from '../errors/business-error.ts';

const service = new BookingService();

function toResponseDto(b: any): BookingResponseDto {
  return {
    id: b.id,
    roomId: b.roomId,
    startTime: b.startTime.toISOString(),
    endTime: b.endTime.toISOString(),
    bookedBy: b.bookedBy,
  };
}

export class BookingController {
  static create(req: Request, res: Response) {
    try {
      const dto = req.body as CreateBookingDto;
      const created = service.createBooking(dto);
      res.status(201).json(toResponseDto(created));
    } catch (err: any) {
      if (err instanceof BusinessError) return res.status(err.status).json({ message: err.message });
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  static update(req: Request, res: Response) {
    try {
      const id = String(req.params.id || '');
      const body = req.body as UpdateBookingDto;
      const dto: UpdateBookingDto = {
        startTime: body.startTime,
        endTime: body.endTime,
        bookedBy: String(body.bookedBy || ''),
      };
      const updated = service.updateBooking(id, dto);
      res.status(200).json(toResponseDto(updated));
    } catch (err: any) {
      if (err instanceof BusinessError) return res.status(err.status).json({ message: err.message });
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  static delete(req: Request, res: Response) {
    try {
      const id = String(req.params.id || '');
      const bookedBy = String((req.body && (req.body as any).bookedBy) || '');
      service.deleteBooking(id, bookedBy);
      res.status(204).send();
    } catch (err: any) {
      if (err instanceof BusinessError) return res.status(err.status).json({ message: err.message });
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  static listByRoom(req: Request, res: Response) {
    try {
      const roomId = String(req.params.roomId || '');
      const bookings = service.getBookingsByRoom(roomId).map(toResponseDto);
      res.status(200).json(bookings);
    } catch (err: any) {
      if (err instanceof BusinessError) return res.status(err.status).json({ message: err.message });
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}
