import { Router } from 'express';
import { uploadFiles, getFiles, getFileContent, deleteFile } from '../controllers/fileController';

const router = Router();

router.post('/upload', uploadFiles);
router.get('/', getFiles);
router.get('/:id/content', getFileContent);
router.delete('/:id', deleteFile);

export default router; 