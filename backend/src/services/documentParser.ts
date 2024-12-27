import { UploadedFile } from 'express-fileupload';
import * as fs from 'fs/promises';
import * as path from 'path';

const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const xlsx = require('xlsx');

async function extractPdfText(file: UploadedFile): Promise<string> {
    try {
        // Opciones para PDFs protegidos
        const options = {
            password: '', // Para PDFs con contraseña
            userPassword: '', // Para PDFs protegidos con contraseña de usuario
            ownerPassword: '', // Para PDFs protegidos con contraseña de propietario
            // Opciones para mejorar la extracción
            max: 0, // Sin límite de páginas
            version: 'v2.0.550', // Versión más reciente
            disableCombineTextItems: true, // Para PDFs no editables
            throwOnEmpty: true // Para detectar si no se puede extraer texto
        };

        console.log('Intentando leer PDF:', {
            nombre: file.name,
            tamaño: file.size,
            protegido: file.data[0] === 0x25 // Verifica si es un PDF válido
        });

        const data = await pdfParse(file.data, options);
        
        if (!data.text || data.text.trim().length === 0) {
            throw new Error('PDF protegido o no se puede extraer texto');
        }

        return data.text;
    } catch (error) {
        console.error('Error al procesar PDF:', error);
        throw new Error('El PDF está protegido o no se puede extraer su contenido');
    }
}

export async function parseDocument(file: UploadedFile): Promise<string> {
    try {
        switch (file.mimetype) {
            case 'application/pdf':
                return await extractPdfText(file);

            case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
            case 'application/msword': {
                const { value } = await mammoth.extractRawText({ 
                    path: file.tempFilePath 
                });
                return value;
            }

            case 'text/plain':
                return file.data.toString('utf-8');

            default:
                throw new Error(`Formato de archivo no soportado: ${file.mimetype}`);
        }
    } catch (error) {
        console.error('Error al parsear documento:', 
            error instanceof Error ? error.message : 'Error desconocido'
        );
        throw new Error('Error al procesar el documento');
    }
} 