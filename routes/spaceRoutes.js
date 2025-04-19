import express from 'express';
import {
  getSpaces,
  getSpace,
  createSpace,
  updateSpace,
  deleteSpace
} from '../controllers/spaceController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router
  .route('/')
  .get(getSpaces)
  .post(protect, authorize('admin'), createSpace);

router
  .route('/:id')
  .get(getSpace)
  .put(protect, authorize('admin'), updateSpace)
  .delete(protect, authorize('admin'), deleteSpace);

export default router;