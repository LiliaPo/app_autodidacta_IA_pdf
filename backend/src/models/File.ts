import mongoose, { Document, Schema } from 'mongoose';
import { IFile } from '../types';

export interface IFileDocument extends IFile, Document {}

const FileSchema = new Schema<IFileDocument>({
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    mimetype: { type: String, required: true },
    size: { type: Number, required: true },
    path: { type: String, required: true },
    uploadDate: { type: Date, default: Date.now }
});

export default mongoose.model<IFileDocument>('File', FileSchema); 