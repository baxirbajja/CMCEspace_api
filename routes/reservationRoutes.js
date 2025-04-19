import express from 'express';
import {
  getReservations,
  getReservation,
  createReservation,
  updateReservationStatus,
  deleteReservation,
  getReservationHistory
} from '../controllers/reservationController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router
  .route('/')
  .get(protect, authorize('admin'), getReservations)
  .post(createReservation);

router
  .route('/:id')
  .get(protect, authorize('admin'), getReservation)
  .delete(protect, authorize('admin'), deleteReservation);

router
  .route('/:id/status')
  .put(protect, authorize('admin'), updateReservationStatus);

router
  .route('/history/:year/:month')
  .get(protect, authorize('admin'), getReservationHistory);

export default router;