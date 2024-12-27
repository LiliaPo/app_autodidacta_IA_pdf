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
        if (!req.files || Object.keys(req.files).length === 0) {
            res.status(400).json({ message: 'No se subió ningún archivo' });
            return;
        }

        const files = req.files.files as UploadedFile | UploadedFile[];
        const uploadedFiles = Array.isArray(files) ? files : [files];
        const savedFiles = [];

        for (const file of uploadedFiles) {
            try {
                console.log('Procesando archivo:', {
                    nombre: file.name,
                    tipo: file.mimetype,
                    tamaño: file.size
                });

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

                // Parsear el contenido del documento
                console.log('Iniciando parseo del documento');
                const content = await parseDocument(file);

                // Verificar que el contenido no esté vacío
                if (!content || content.trim().length === 0) {
                    console.error('El documento está vacío o no se pudo extraer contenido');
                    continue;
                }

                console.log('Contenido extraído:', {
                    longitud: content.length,
                    muestra: content.substring(0, 200)
                });

                // Guardar en MongoDB
                const fileDoc = await File.create({
                    filename: file.name,
                    originalName: file.name,
                    mimetype: file.mimetype,
                    size: file.size,
                    content: content
                });

                savedFiles.push(fileDoc);
                console.log('Archivo guardado exitosamente:', {
                    id: fileDoc._id,
                    nombre: file.name,
                    contenidoLength: content.length
                });

            } catch (error) {
                console.error('Error al procesar archivo:', {
                    archivo: file.name,
                    error: error instanceof Error ? error.stack : error
                });
                continue;
            }
        }

        if (savedFiles.length === 0) {
            res.status(400).json({
                message: 'Ningún archivo pudo ser procesado',
                error: 'Verifica que los archivos tengan contenido válido'
            });
            return;
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

        // Verificar que tenemos contenido
        if (!file.content) {
            res.status(500).json({ error: 'El archivo no tiene contenido' });
            return;
        }

        // Log para depuración
        console.log('Contenido del archivo recuperado:', {
            id: file._id,
            filename: file.filename,
            contentLength: file.content.length,
            firstLines: file.content.substring(0, 200)
        });

        res.json({ 
            content: file.content,
            metadata: {
                filename: file.filename,
                mimetype: file.mimetype,
                size: file.size
            }
        });
    } catch (error) {
        console.error('Error al obtener contenido del archivo:', error);
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