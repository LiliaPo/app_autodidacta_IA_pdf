import { Router, RequestHandler } from 'express';
import { uploadFiles } from '../controllers/fileController';

// Crear instancia del router
const router: Router = Router();

/**
 * @route   POST /api/files/upload
 * @desc    Sube uno o varios archivos al servidor
 * @access  Public
 */
router.post('/upload', uploadFiles as RequestHandler);

export default router; 