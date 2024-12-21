import { Request } from 'express';
import { UploadedFile } from 'express-fileupload';

export interface FileRequest extends Request {
    files?: {
        [key: string]: UploadedFile | UploadedFile[];
    };
}

export interface IFile {
    filename: string;
    originalName: string;
    mimetype: string;
    size: number;
    path: string;
    uploadDate?: Date;
} 