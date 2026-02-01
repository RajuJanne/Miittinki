import { Router } from 'express';
import { BookingController } from '../controllers/booking.controller.ts';

const router = Router();

router.post('/api/bookings', BookingController.create);
router.put('/api/bookings/:id', BookingController.update);
router.delete('/api/bookings/:id', BookingController.delete);
router.get('/api/rooms/:roomId/bookings', BookingController.listByRoom);

export default router;
