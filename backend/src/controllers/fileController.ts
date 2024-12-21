import { Response } from 'express';
import path from 'path';
import { FileRequest } from '../types';
import File from '../models/File';
import { config } from '../config/config';
import { UploadedFile } from 'express-fileupload';

export const uploadFiles = async (req: FileRequest, res: Response): Promise<void> => {
    try {
        if (!req.files || Object.keys(req.files).length === 0) {
            res.status(400).json({ message: 'No se subió ningún archivo' });
            return;
        }

        const files = req.files.files as UploadedFile | UploadedFile[];
        const uploadedFiles = Array.isArray(files) ? files : [files];
        const savedFiles = [];

        for (const file of uploadedFiles) {
            if (!config.allowedMimeTypes.includes(file.mimetype)) continue;

            const uploadPath = path.join(config.uploadPath, file.name);
            await file.mv(uploadPath);

            const fileDoc = await File.create({
                filename: file.name,
                originalName: file.name,
                mimetype: file.mimetype,
                size: file.size,
                path: uploadPath
            });

            savedFiles.push(fileDoc);
        }

        res.json({
            message: 'Archivos subidos correctamente',
            files: savedFiles
        });
    } catch (error) {
        console.error('Error al subir archivos:', error);
        res.status(500).json({
            message: 'Error al subir archivos',
            error: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
}; 