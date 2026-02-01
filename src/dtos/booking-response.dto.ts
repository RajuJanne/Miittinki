export interface BookingResponseDto {
  id: string;
  roomId: string;
  startTime: string; // ISO
  endTime: string; // ISO
  bookedBy: string;
}
