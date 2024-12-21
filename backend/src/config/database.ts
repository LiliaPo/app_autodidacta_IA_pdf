import mongoose from 'mongoose';
import { config } from './config';

export const connectDB = async (): Promise<void> => {
    try {
        const conn = await mongoose.connect(config.mongoURI);
        console.log(`MongoDB conectado: ${conn.connection.host}`);
        
        // Verificar la conexión
        mongoose.connection.on('error', err => {
            console.error('Error de MongoDB:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB desconectado');
        });

    } catch (error) {
        console.error('Error al conectar a MongoDB:', error);
        process.exit(1);
    }
}; 