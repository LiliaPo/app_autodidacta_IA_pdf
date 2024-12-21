import { UploadedFile } from 'express-fileupload';
import * as fs from 'fs/promises';
import * as path from 'path';

const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const xlsx = require('xlsx');

async function extractPdfText(file: UploadedFile): Promise<string> {
    try {
        const data = await pdfParse(file.tempFilePath);
        
        if (!data || !data.text) {
            throw new Error('No se pudo extraer texto del PDF');
        }

        return data.text;
    } catch (error) {
        console.error('Error al extraer texto del PDF:', error);
        throw new Error('Error al procesar el PDF');
    }
}

export async function parseDocument(file: UploadedFile): Promise<string> {
    try {
        switch (file.mimetype) {
            case 'application/pdf':
                return await extractPdfText(file);

            case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
            case 'application/msword':
                const { value } = await mammoth.extractRawText({ 
                    path: file.tempFilePath 
                });
                return value;

            case 'text/plain':
                return file.data.toString('utf-8');

            default:
                throw new Error(`Formato de archivo no soportado: ${file.mimetype}`);
        }
    } catch (error) {
        console.error('Error al parsear documento:', error);
        throw new Error('Error al procesar el documento');
    }
} 