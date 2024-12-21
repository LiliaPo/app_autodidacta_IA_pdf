import express from 'express';
import fileUpload from 'express-fileupload';
import cors from 'cors';
import path from 'path';
import { config } from './config/config';
import { connectDB } from './config/database';
import fileRoutes from './routes/fileRoutes';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(fileUpload({
    createParentPath: true,
    limits: { fileSize: config.uploadLimit },
    abortOnLimit: true
}));

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, '../../frontend/public')));

// Rutas API
app.use('/api/files', fileRoutes);

// Ruta principal - sirve index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/public/index.html'));
});

// Iniciar servidor
const startServer = async () => {
    try {
        await connectDB();
        app.listen(config.port, () => {
            console.log(`Servidor corriendo en http://localhost:${config.port}`);
        });
    } catch (error) {
        console.error('Error al iniciar el servidor:', error);
        process.exit(1);
    }
};

startServer(); 