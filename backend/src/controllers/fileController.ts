import { Request, Response } from 'express';
import File from '../models/File';
import { UploadedFile } from 'express-fileupload';
import fs from 'fs/promises';
import path from 'path';
import { parseDocument } from '../services/documentParser';

export const uploadFiles = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.files || Object.keys(req.files).length === 0) {
            res.status(400).json({ message: 'No se subió ningún archivo' });
            return;
        }

        const files = req.files.files as UploadedFile | UploadedFile[];
        const uploadedFiles = Array.isArray(files) ? files : [files];
        const savedFiles = [];

        for (const file of uploadedFiles) {
            try {
                // Parsear el contenido del documento
                const content = await parseDocument(file);

                const fileDoc = await File.create({
                    filename: file.name,
                    originalName: file.name,
                    mimetype: file.mimetype,
                    size: file.size,
                    path: path.join(__dirname, '../../uploads', file.name),
                    content: content // Guardar el contenido parseado
                });

                savedFiles.push(fileDoc);
            } catch (error) {
                console.error(`Error al procesar archivo ${file.name}:`, error);
                continue;
            }
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

export const getFiles = async (_req: Request, res: Response): Promise<void> => {
    try {
        const files = await File.find().select('-content');
        res.json(files);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los archivos' });
    }
};

export const getFileContent = async (req: Request, res: Response): Promise<void> => {
    try {
        const file = await File.findById(req.params.id);
        if (!file) {
            res.status(404).json({ error: 'Archivo no encontrado' });
            return;
        }
        res.json({ content: file.content });
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener el contenido del archivo' });
    }
};

export const deleteFile = async (req: Request, res: Response): Promise<void> => {
    try {
        const file = await File.findByIdAndDelete(req.params.id);
        if (!file) {
            res.status(404).json({ error: 'Archivo no encontrado' });
            return;
        }
        res.json({ message: 'Archivo eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar el archivo' });
    }
}; 