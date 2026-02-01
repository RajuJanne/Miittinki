import { Request, Response } from 'express';
import { RoomService } from '../services/room.service.ts';
import { BusinessError } from '../errors/business-error.ts';

const service = new RoomService();

export class RoomController {
  static list(req: Request, res: Response) {
    try {
      const rooms = service.getRooms().map(r => ({ id: r.id, name: r.name }));
      res.status(200).json(rooms);
    } catch (err: any) {
      if (err instanceof BusinessError) return res.status(err.status).json({ message: err.message });
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  static create(req: Request, res: Response) {
    try {
      const { name } = req.body || {};
      const room = service.createRoom(String(name || ''));
      res.status(201).json({ id: room.id, name: room.name });
    } catch (err: any) {
      if (err instanceof BusinessError) return res.status(err.status).json({ message: err.message });
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  static update(req: Request, res: Response) {
    try {
      const id = String(req.params.id || '');
      const { name } = req.body || {};
      const room = service.updateRoom(id, String(name || ''));
      res.status(200).json({ id: room.id, name: room.name });
    } catch (err: any) {
      if (err instanceof BusinessError) return res.status(err.status).json({ message: err.message });
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  static delete(req: Request, res: Response) {
    try {
      const id = String(req.params.id || '');
      service.deleteRoom(id);
      res.status(204).send();
    } catch (err: any) {
      if (err instanceof BusinessError) return res.status(err.status).json({ message: err.message });
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}
