import express from 'express';
import {
  getMonthlyStats,
  getDetailedReservations,
  getSpaceUsageStats
} from '../controllers/reportController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Toutes les routes de rapports nécessitent une authentification et des privilèges d'administrateur
router.use(protect, authorize('admin'));

// Routes pour les statistiques
router.get('/monthly', getMonthlyStats);
router.get('/detailed', getDetailedReservations);
router.get('/spaces', getSpaceUsageStats);

export default router;