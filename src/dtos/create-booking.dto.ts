export interface CreateBookingDto {
  roomId: string;
  startTime: string; // ISO
  endTime: string; // ISO
  bookedBy: string;
}
