import { UploadedFile } from 'express-fileupload';
import * as fs from 'fs/promises';
import * as path from 'path';

const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const xlsx = require('xlsx');

async function extractPdfText(buffer: Buffer): Promise<string> {
    const options = {
        // Opciones personalizadas para pdf-parse
        pagerender: function(pageData: any) {
            // Extraer texto de la página
            const renderOptions = {
                normalizeWhitespace: true,
                disableCombineTextItems: false
            };
            return pageData.getTextContent(renderOptions)
                .then(function(textContent: any) {
                    let lastY: number | null = null;
                    let text = '';
                    
                    for (const item of textContent.items) {
                        if (lastY !== item.transform[5]) {
                            text += '\n';
                        }
                        text += item.str;
                        lastY = item.transform[5];
                    }
                    return text;
                });
        }
    };

    try {
        const data = await pdfParse(buffer, options);
        if (!data || typeof data.text !== 'string') {
            throw new Error('No se pudo extraer texto del PDF');
        }

        return data.text;
    } catch (error) {
        console.error('Error detallado al extraer texto del PDF:', error);
        throw new Error('Error al extraer texto del PDF');
    }
}

function cleanText(text: string): string {
    return text
        .split('\n')
        .map(line => line.trim())
        .filter(Boolean)
        .join('\n')
        .replace(/\n{3,}/g, '\n\n')
        .replace(/[^\x20-\x7E\n]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

export async function parseDocument(file: UploadedFile): Promise<string> {
    const mimeType = file.mimetype;
    
    try {
        if (mimeType === 'application/pdf') {
            const buffer = Buffer.isBuffer(file.data) ? file.data : Buffer.from(file.data);
            const rawText = await extractPdfText(buffer);
            const cleanedText = cleanText(rawText);

            if (!cleanedText) {
                throw new Error('No se pudo extraer texto del PDF');
            }

            console.log('Texto extraído:', cleanedText.substring(0, 200));
            return cleanedText;
        }

        // Para otros tipos de archivo...
        const tempDir = path.join(__dirname, '../../../temp');
        await fs.mkdir(tempDir, { recursive: true });
        const tempPath = path.join(tempDir, file.name);
        
        try {
            await fs.writeFile(tempPath, file.data);
            let text = '';

            switch (mimeType) {
                case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
                case 'application/msword':
                    const { value } = await mammoth.extractRawText({ path: tempPath });
                    text = value;
                    break;

                case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
                case 'application/vnd.ms-excel':
                    const workbook = xlsx.readFile(tempPath);
                    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
                    text = xlsx.utils.sheet_to_txt(worksheet);
                    break;

                case 'text/plain':
                    text = await fs.readFile(tempPath, 'utf-8');
                    break;

                default:
                    throw new Error(`Formato de archivo no soportado: ${mimeType}`);
            }

            return cleanText(text);

        } finally {
            try {
                await fs.unlink(tempPath);
            } catch (error) {
                console.error('Error al eliminar archivo temporal:', error);
            }
        }
    } catch (error) {
        console.error('Error al parsear documento:', error);
        throw new Error('Error al procesar el documento');
    }
} 