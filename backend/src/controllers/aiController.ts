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
        const { tema, isDocument, filename } = req.body;

        if (!tema) {
            res.status(400).json({ error: 'El contenido es requerido' });
            return;
        }

        console.log('Contenido recibido:', tema.substring(0, 200) + '...');

        let prompt;
        if (isDocument) {
            prompt = `Analiza el siguiente documento y genera un resumen detallado:

            TÍTULO: ${filename}
            CONTENIDO:
            ${tema}

            Instrucciones:
            1. Lee y analiza todo el contenido proporcionado
            2. Genera un resumen estructurado y completo
            3. Incluye los puntos principales y conceptos clave
            4. Mantén el formato y la coherencia del texto

            El resumen debe incluir:
            - Una introducción clara
            - Los puntos principales del documento
            - Las conclusiones más importantes
            - Una síntesis final

            Formato requerido:
            <h3>Introducción</h3>
            [Introducción al tema]

            <h3>Puntos Principales</h3>
            [Lista de puntos principales]

            <h3>Conclusiones</h3>
            [Conclusiones principales]`;
        } else {
            // Mantener el prompt original para temas libres
            prompt = `Genera un resumen educativo detallado sobre "${tema}"...`;
        }

        const systemPrompt = isDocument ? 
            'Eres un experto en análisis y resumen de documentos. Tu tarea es crear resúmenes claros, concisos y bien estructurados.' : 
            'Eres un profesor experto que genera resúmenes educativos.';

        const resumen = await fetchGroqAPI(prompt, systemPrompt);

        console.log('Resumen generado:', resumen.substring(0, 200) + '...');

        res.json({ resumen });
    } catch (error) {
        console.error('Error completo en generarResumen:', error);
        res.status(500).json({ error: error instanceof Error ? error.message : 'Error desconocido' });
    }
};

export const generarTest = async (req: Request, res: Response): Promise<void> => {
    try {
        const { tema, isDocument, filename } = req.body;

        if (!tema) {
            res.status(400).json({ error: 'El contenido es requerido' });
            return;
        }

        let prompt;
        if (isDocument) {
            prompt = `Analiza el siguiente documento y crea un test de comprensión:

            DOCUMENTO: ${filename}
            CONTENIDO:
            ${tema}

            Crea un test de 5 preguntas que evalúe la comprensión profunda del documento.
            Las preguntas deben:
            1. Evaluar la comprensión de los conceptos clave
            2. Verificar el entendimiento de las relaciones entre ideas
            3. Comprobar la asimilación de los puntos principales
            4. Incluir diferentes niveles de dificultad cognitiva

            FORMATO EXACTO para cada pregunta:
            Pregunta 1: [Pregunta basada en el contenido]
            A) [Opción basada en el documento]
            B) [Opción basada en el documento]
            C) [Opción basada en el documento]
            D) [Opción basada en el documento]
            Respuesta: [Letra correcta]

            [Repetir el formato para las 10 preguntas]

            IMPORTANTE:
            - Todas las preguntas y respuestas deben basarse en el contenido del documento
            - Las opciones incorrectas deben ser plausibles pero claramente incorrectas
            - Cada pregunta debe tener una única respuesta correcta
            - Las preguntas deben ser claras y sin ambigüedades`;
        } else {
            // Mantener el prompt original para temas libres
            prompt = `Genera un test de 10 preguntas de opción múltiple sobre "${tema}"...`;
        }

        const systemPrompt = isDocument ?
            'Eres un experto en evaluación educativa, especializado en crear tests que evalúan la comprensión profunda de documentos académicos y técnicos.' :
            'Eres un profesor experto que genera tests educativos adaptados al nivel de dificultad requerido.';

        const test = await fetchGroqAPI(prompt, systemPrompt);
        res.json({ test });
    } catch (error) {
        console.error('Error en generarTest:', error);
        res.status(500).json({ error: error instanceof Error ? error.message : 'Error desconocido' });
    }
}; 