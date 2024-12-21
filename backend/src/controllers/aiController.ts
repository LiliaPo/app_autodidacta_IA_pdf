import { Request, Response } from 'express';

interface GroqResponse {
    choices: Array<{
        message: {
            content: string;
        };
    }>;
}

interface GroqError {
    error: {
        message: string;
        type: string;
    };
}

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

if (!GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY no está definida en las variables de entorno');
}

const fetchGroqAPI = async (prompt: string, systemPrompt: string): Promise<string> => {
    try {
        const response = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'mixtral-8x7b-32768',
                messages: [
                    {
                        role: 'system',
                        content: systemPrompt
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 2048
            })
        });

        if (!response.ok) {
            const error = await response.json() as GroqError;
            throw new Error(`Error en la API de Groq: ${error.error.message}`);
        }

        const data = await response.json() as GroqResponse;
        return data.choices[0].message.content;
    } catch (error) {
        console.error('Error en fetchGroqAPI:', error);
        throw error;
    }
};

export const generarResumen = async (req: Request, res: Response): Promise<void> => {
    try {
        const { tema } = req.body;

        if (!tema) {
            res.status(400).json({ error: 'El tema es requerido' });
            return;
        }

        const prompt = `Genera un resumen educativo detallado sobre "${tema}". 
        El resumen debe ser estructurado, informativo y fácil de entender.
        Incluye:
        - Una introducción general
        - Conceptos principales
        - Ejemplos relevantes
        - Datos importantes
        Usa formato HTML con etiquetas h3, h4, p, ul, li para estructurar el contenido.`;

        const systemPrompt = 'Eres un profesor experto que genera resúmenes educativos detallados y bien estructurados.';
        const resumen = await fetchGroqAPI(prompt, systemPrompt);

        res.json({ resumen });
    } catch (error) {
        console.error('Error en generarResumen:', error);
        res.status(500).json({ 
            error: error instanceof Error ? error.message : 'Error desconocido',
            tipo: 'resumen'
        });
    }
};

export const generarTest = async (req: Request, res: Response): Promise<void> => {
    try {
        const { tema, dificultad } = req.body;

        if (!tema || !dificultad) {
            res.status(400).json({ error: 'El tema y la dificultad son requeridos' });
            return;
        }

        const prompt = `Genera un test de opción múltiple sobre "${tema}" con dificultad "${dificultad}".
        Si la dificultad es "fácil": preguntas básicas y directas.
        Si es "medio": preguntas que requieran algo de análisis.
        Si es "difícil": preguntas que requieran pensamiento crítico y conocimiento profundo.
        
        Genera 5 preguntas siguiendo este formato exacto:
        Pregunta 1: [pregunta]
        A) [opción]
        B) [opción]
        C) [opción]
        D) [opción]
        Respuesta: [letra correcta]
        
        [Repetir para las 5 preguntas]`;

        const systemPrompt = 'Eres un profesor experto que genera tests educativos adaptados al nivel de dificultad requerido.';
        const test = await fetchGroqAPI(prompt, systemPrompt);

        res.json({ test });
    } catch (error) {
        console.error('Error en generarTest:', error);
        res.status(500).json({ 
            error: error instanceof Error ? error.message : 'Error desconocido',
            tipo: 'test'
        });
    }
}; 