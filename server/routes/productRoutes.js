import express from 'express';
import {
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    seedProducts,
} from '../controllers/productController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/:id', getProduct);

// Admin routes
router.post('/', createProduct); // TODO: Add protect, adminOnly for production
router.put('/:id', updateProduct); // TODO: Add protect, adminOnly for production
router.delete('/:id', deleteProduct); // TODO: Add protect, adminOnly for production

// Seed route (for initial data population)
router.post('/seed', seedProducts);

export default router;
