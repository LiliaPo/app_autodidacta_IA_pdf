import { Request, Response } from 'express';
import File from '../models/File';
import { UploadedFile } from 'express-fileupload';
import * as fs from 'fs/promises';
import * as path from 'path';
import { parseDocument } from '../services/documentParser';
import mongoose from 'mongoose';

// Asegurar que existe el directorio de uploads
const uploadDir = path.join(__dirname, '../../../uploads');
fs.mkdir(uploadDir, { recursive: true }).catch(console.error);

export const uploadFiles = async (req: Request, res: Response): Promise<void> => {
    try {
        console.log('Iniciando subida de archivos...');
        
        if (!mongoose.connection.readyState) {
            console.error('MongoDB no está conectado');
            res.status(500).json({ message: 'Error de conexión a la base de datos' });
            return;
        }

        if (!req.files || Object.keys(req.files).length === 0) {
            console.log('No se encontraron archivos');
            res.status(400).json({ message: 'No se subió ningún archivo' });
            return;
        }

        const files = req.files.files as UploadedFile | UploadedFile[];
        const uploadedFiles = Array.isArray(files) ? files : [files];
        console.log(`Procesando ${uploadedFiles.length} archivos`);
        
        const savedFiles = [];

        for (const file of uploadedFiles) {
            try {
                console.log(`Procesando archivo: ${file.name} (${file.mimetype})`);

                // Verificar tipo de archivo
                const allowedTypes = [
                    'application/pdf',
                    'application/msword',
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    'text/plain'
                ];

                if (!allowedTypes.includes(file.mimetype)) {
                    console.error(`Tipo de archivo no permitido: ${file.mimetype}`);
                    continue;
                }

                console.log('Parseando documento...');
                const content = await parseDocument(file);
                console.log('Documento parseado correctamente');

                console.log('Guardando en MongoDB...');
                const fileDoc = await File.create({
                    filename: file.name,
                    originalName: file.name,
                    mimetype: file.mimetype,
                    size: file.size,
                    content: content
                });

                savedFiles.push(fileDoc);
                console.log(`Archivo ${file.name} guardado exitosamente en MongoDB (ID: ${fileDoc._id})`);

            } catch (error) {
                console.error('Error detallado al procesar archivo:', {
                    archivo: file.name,
                    error: error instanceof Error ? error.stack : error
                });
                continue;
            }
        }

        if (savedFiles.length === 0) {
            console.log('No se pudo procesar ningún archivo');
            res.status(400).json({
                message: 'Ningún archivo pudo ser procesado',
                error: 'Verifica el formato y tamaño de los archivos'
            });
            return;
        }

        console.log(`${savedFiles.length} archivos guardados exitosamente`);
        res.json({
            message: 'Archivos subidos correctamente',
            files: savedFiles
        });
    } catch (error) {
        console.error('Error completo al subir archivos:', error);
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