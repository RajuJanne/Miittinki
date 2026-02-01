import { Room } from '../models/room.model.ts';
import { RoomRepository } from '../repositories/room.repository.ts';
import { v4 as uuidv4 } from 'uuid';
import { BusinessError } from '../errors/business-error.ts';

export class RoomService {
  constructor(private repo = new RoomRepository()) {}

  createRoom(name: string): Room {
    if (!name || !name.trim()) throw new BusinessError('Room name required', 400);
    const existing = this.repo.findByName(name.trim());
    if (existing) throw new BusinessError('Room already exists', 409);
    const now = new Date();
    const room: Room = { id: uuidv4(), name: name.trim(), createdAt: now, updatedAt: now };
    return this.repo.create(room);
  }

  updateRoom(id: string, name: string): Room {
    const existing = this.repo.findById(id);
    if (!existing) throw new BusinessError('Room not found', 404);
    if (!name || !name.trim()) throw new BusinessError('Room name required', 400);
    const conflict = this.repo.findByName(name.trim());
    if (conflict && conflict.id !== id) throw new BusinessError('Room name already used', 409);
    return this.repo.update(id, { name: name.trim() }) as Room;
  }

  deleteRoom(id: string): void {
    const existing = this.repo.findById(id);
    if (!existing) throw new BusinessError('Room not found', 404);
    this.repo.delete(id);
  }

  getRooms(): Room[] {
    return this.repo.findAll();
  }
}
