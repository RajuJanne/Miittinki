import { Router } from 'express';
import { RoomController } from '../controllers/room.controller.ts';

const router = Router();

router.get('/api/rooms', RoomController.list);
router.post('/api/rooms', RoomController.create);
router.put('/api/rooms/:id', RoomController.update);
router.delete('/api/rooms/:id', RoomController.delete);

export default router;
