import express from 'express';
import { CategoryController } from '../controllers/CategoryController.js';
import { validateCategory } from '../validators/categorySchemas.js';

const router = express.Router();

// GET /api/v1/categories - Get all categories
router.get('/', CategoryController.getAllCategories);

// GET /api/v1/categories/active - Get only active categories (MUST be before /:id)
router.get('/active', CategoryController.getActiveCategories);

// GET /api/v1/categories/:id - Get category by ID
router.get('/:id', CategoryController.getCategoryById);

// POST /api/v1/categories - Create new category
router.post('/', validateCategory, CategoryController.createCategory);

// PUT /api/v1/categories/:id - Update category
router.put('/:id', validateCategory, CategoryController.updateCategory);

// DELETE /api/v1/categories/:id - Delete category
router.delete('/:id', CategoryController.deleteCategory);

export default router;
