import mongoose, { Schema, Document } from 'mongoose';

export interface IFile extends Document {
    filename: string;
    originalName: string;
    mimetype: string;
    size: number;
    content: string;
    uploadDate: Date;
}

const FileSchema: Schema = new Schema({
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    mimetype: { type: String, required: true },
    size: { type: Number, required: true },
    content: { 
        type: String, 
        required: true,
        maxLength: 16777216 // 16MB para documentos grandes
    },
    uploadDate: { type: Date, default: Date.now }
});

export default mongoose.model<IFile>('File', FileSchema); 