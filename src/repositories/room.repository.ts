import { Room } from '../models/room.model.ts';

export class RoomRepository {
  private rooms: Map<string, Room> = new Map();

  create(room: Room) {
    this.rooms.set(room.id, room);
    return room;
  }

  update(id: string, patch: Partial<Room>) {
    const existing = this.rooms.get(id);
    if (!existing) return null;
    const updated: Room = { ...existing, ...patch, updatedAt: new Date() } as Room;
    this.rooms.set(id, updated);
    return updated;
  }

  delete(id: string) {
    return this.rooms.delete(id);
  }

  findById(id: string) {
    return this.rooms.get(id) || null;
  }

  findByName(name: string) {
    for (const r of this.rooms.values()) {
      if (r.name === name) return r;
    }
    return null;
  }

  findAll() {
    return Array.from(this.rooms.values());
  }
}
