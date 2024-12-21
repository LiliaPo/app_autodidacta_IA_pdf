import express from 'express';
import fileUpload from 'express-fileupload';
import cors from 'cors';
import path from 'path';
import { config } from './config/config';
import { connectDB } from './config/database';
import fileRoutes from './routes/fileRoutes';
import { generarResumen, generarTest } from './controllers/aiController';

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: path.join(__dirname, '../../temp'),
    createParentPath: true,
    limits: { 
        fileSize: 50 * 1024 * 1024  // 50MB
    },
    debug: true
}));

// Rutas API
app.use('/api/files', fileRoutes);

// Rutas específicas para resumen y test
app.post('/api/resumen', async (req, res) => {
    try {
        await generarResumen(req, res);
    } catch (error) {
        console.error('Error en ruta /api/resumen:', error);
        res.status(500).json({ 
            error: error instanceof Error ? error.message : 'Error interno del servidor',
            tipo: 'resumen'
        });
    }
});

app.post('/api/test', async (req, res) => {
    try {
        await generarTest(req, res);
    } catch (error) {
        console.error('Error en ruta /api/test:', error);
        res.status(500).json({ 
            error: error instanceof Error ? error.message : 'Error interno del servidor',
            tipo: 'test'
        });
    }
});

// Servir archivos estáticos - DESPUÉS de las rutas API
app.use(express.static(path.join(__dirname, '../../frontend/public')));

// Ruta principal - ÚLTIMA ruta
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